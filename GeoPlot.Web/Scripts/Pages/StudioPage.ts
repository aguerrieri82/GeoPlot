namespace WebApp.GeoPlot {

    type TData = IInfectionData;

    export type StudioData = ISerieStudioData | ISerieStateStudioData;

    export interface IStudioData {
        version: number;
    }

    export interface ISerieStudioData extends IStudioData {
        type: "serie";
        serie: IDayAreaSerieSource;
        title: string;
        values?: IFunctionPoint[];
        color?: string;
    }

    export interface ISerieStateStudioData extends IStudioData {
        type: "serieState";
        state: IStudioSerieState;
    }

    /****************************************/
    /* ParameterViewModel
    /****************************************/

    interface IParameterConfig {
        value: KnockoutObservable<number>;
        name: string;
    }

    /****************************************/

    export class ParameterViewModel {

        constructor(config: IParameterConfig) {
            this.value = config.value;
            this.name = config.name;
        }

        name: string;
        min = ko.observable<number>();
        max = ko.observable<number>();
        step = ko.observable<number>();
        isSelected = ko.observable<boolean>(true);
        value: KnockoutObservable<number>;
    }

    /****************************************/
    /* Page
    /****************************************/

    interface IPageState {
        version: number;
        graphState?: Desmos.IGraphState;
        projects?: IStudioProjectState[];
        vars?: IDictionary<number>;
    }

    /****************************************/

    export interface IStudioViewModel {
        data: IDayAreaDataSet<TData>;
        geo: IGeoAreaSet;
    }

    /****************************************/


    export class StudioPage {

        private _graphCtx: GraphContext;
        private _projectId: Guid;

        constructor(projectId: Guid) {

            this._projectId = projectId;

            this._graphCtx = new GraphContext();
            this._graphCtx.calculator = Desmos.GraphingCalculator(document.getElementById("calculator"), {
                //xAxisArrowMode: Desmos.AxisArrowModes.BOTH,
                pasteGraphLink: false,
                pasteTableData: false,
                expressionsCollapsed: true,
                //lockViewport: false,
                restrictedFunctions: true,
                //restrictGridToFirstQuadrant: true,
                administerSecretFolders: true,
                authorIDE: true,
                advancedStyling: true
            });

            this._graphCtx.calculator.controller.listModel.onSelectionChanged = item => this.onGraphSelectionChanged(item);

            const actions: ActionView[] = [];
            actions.push(apply(new ActionView(), action => {
                action.text = $string("$(new-project)"),
                    action.icon = "create_new_folder";
                action.execute = () => this.newProject();
            }));
            actions.push(apply(new ActionView(), action => {
                action.text = $string("$(save)"),
                    action.icon = "save";
                action.execute = () => this.saveState();
            }));
            actions.push(apply(new ActionView(), action => {
                action.text = $string("$(import)"),
                    action.icon = "import_export";
                action.execute = () => this.import();
            }));
            actions.push(apply(new ActionView(), action => {
                action.text = $string("$(share) Studio"),
                    action.icon = "share";
                action.execute = () => this.share();
            }));
            actions.push(apply(new ActionView(), action => {
                action.text = $string("$(options)"),
                    action.icon = "settings";
                action.execute = () => this.showOptions();
            }));

            const root = new TreeNode<any>();
            root.actions(actions);
            this.items.setRoot(root);

            document.body.addEventListener("paste", async ev => {
                if ((<HTMLElement>ev.target).tagName == "INPUT")
                    return;
                if (await this.onPaste(ev.clipboardData))
                    ev.preventDefault();
            });

            M.Modal.init(document.getElementById("options"), {
                onCloseEnd: () => this.updateOptions()
            });


            setTimeout(() => this.init());
        }

        /****************************************/

        protected onGraphSelectionChanged(item: { id: string, folderId?: string }) {
            if (!item || !item.folderId)
                return;
            const folderGuid = item.folderId.split("/")[0];
            const treeItem = this._graphCtx.treeItems[folderGuid];
            if (!treeItem)
                return;
            treeItem.node.select(true);
        }

        /****************************************/

        protected updateOptions() {
            const maxX = parseInt(<any>this.maxX());
            const maxY = parseInt(<any>this.maxY());
            this._graphCtx.calculator.setMathBounds({
                bottom: -maxY / 10,
                left: -maxX / 10,
                right: maxX,
                top: maxY
            });
        }

        /****************************************/

        async share() {
            const projectId = StringUtils.uuidv4();
            await Api.saveState(projectId, this.getState());
            const url = Uri.absolute("~/" + $language.split("-")[0] + "/Studio/" + projectId);
            await DomUtils.copyText(url);
            M.toast({ html: $string("$(msg-shared)") });
        }

        /****************************************/

        showOptions() {
            const bounds = this._graphCtx.calculator.graphpaperBounds;
            this.maxX(Math.round(bounds.mathCoordinates.width));
            this.maxY(Math.round(bounds.mathCoordinates.height));
            const dialog = M.Modal.getInstance(document.getElementById("options"));
            dialog.open();
        }

        /****************************************/

        getSelectedProject(): StudioProject {
            if (!this.items.selectedNode())
                return;

            const value = this.items.selectedNode().value();

            if (value.itemType == "project")
                return <StudioProject>value;

            if (value.itemType == "serie")
                return (<StudioSerie>value).parent;

            if (value.itemType == "regression")
                return (<StudioSerieRegression>value).parent.parent;
        }

        /****************************************/

        newProject(): StudioProject {
            const proj = this.addProject({ name: "Project " + (this.projects.count() + 1) });
            proj.node.isSelected(true);
            return proj;
        }

        /****************************************/

        addProject(config?: IStudioProjectConfig, updateGraph = true): StudioProject {
            const project = new StudioProject(config);
            const node = new TreeNode(project);
            this.items.root().addNode(node);
            project.attachNode(node);
            project.attachGraph(this._graphCtx);
            if (updateGraph)
                project.updateGraph();
            return project;
        }

        /****************************************/

        getState(): IPageState {

            const result: IPageState = { version: 2 };
            result.graphState = this._graphCtx.calculator.getState();
            result.vars = this._graphCtx.vars;
            result.projects = this.projects.select(a => a.getState()).toArray();
            return result;
        }

        /****************************************/

        setState(value: IPageState) {

            if (!value)
                return;

            if (value.graphState) {
                value.graphState.expressions.list = [];
                this._graphCtx.calculator.setState(value.graphState);
            }

            if (value.projects != undefined) {
                this.projects.toArray().forEach(a => a.remove());
                value.projects.forEach(a => {
                    const proj = this.addProject(null, false);
                    proj.setState(a);
                });
            }
        }

        /****************************************/

        async loadState() {
            if (this._projectId) {
                let result = await Api.loadState<IPageState>(this._projectId);
                this.setState(result);
            }
            else {
                const json = localStorage.getItem("studio");
                if (json)
                    this.setState(JSON.parse(json));
            }
        }

        /****************************************/

        async saveState() {

            if (this._projectId) {
                await Api.saveState(this._projectId, this.getState());
                M.toast({ html: $string("$(msg-saved)") });
            }
            else {
                localStorage.setItem("studio", JSON.stringify(this.getState()));
                M.toast({ html: $string("$(msg-saved-device)") });
            }
        }

        /****************************************/

        protected demo() {
            const proj = this.addProject({ name: "Project 1" });
            this.addProject({ name: "Project 2" });
            this.addProject({ name: "Project 3" });

            proj.addSerie({
                name: "Serie 1"
            });
        }

        /****************************************/

        protected async onPaste(data: DataTransfer): Promise<boolean> {

            const text = data.getData("text/plain").toString();
            if (text)
                return await this.importText(text);
            return false;
        }

        /****************************************/

        async import() {
            //var text = await (await fetch("https://raw.githubusercontent.com/datasets/covid-19/master/data/countries-aggregated.csv")).text();
            let project = this.getSelectedProject();
            const data = await this.dataImport.show();
            this.addImportedData(data, project);
            return true;
        }
        /****************************************/

        async importText(text: string): Promise<boolean> {

            let project = this.getSelectedProject();
            if (!project && !this.projects.any())
                project = this.newProject();

            if (!project) {
                M.toast({ html: $string("$(msg-select-project)") });
                return false;
            }

            const serie = StudioSerie.fromText(text);
            if (serie) {
                project.addSerie(serie);
                project.node.isExpanded(true);
                serie.node.isExpanded(true);
                serie.zoom();
                const reg = serie.addRegression(null, false);
                reg.updateGraph();
                reg.node.isSelected(true);
                return true;
            }

            try {

                if (await this.dataImport.importText(text))
                    await this.import();
            }
            catch (e) {
                console.error(e);
            }

            M.toast({ html: $string("$(msg-format-not-reconized)") });

            return false;
        }

        /****************************************/

        protected addImportedData(data: IDataImportSerieSource[], project: StudioProject) {

            if (data.length == 1) {
                if (this.items.selectedNode() && this.items.selectedNode().value() instanceof StudioSerie) {
                    if (confirm($string("$(msg-replace-serie)"))) {
                        const serie = <StudioSerie>this.items.selectedNode().value();
                        serie.source = data[0];
                        serie.importValues(data[0].serie.values);
                        serie.updateGraph(true);
                        return true;
                    }
                }
            }

            project.node.isExpanded(true);

            for (let item of data) {

                const serie = new StudioSerie({
                    name: item.serie.name,
                    values: item.serie.values,
                    source: item
                });

                project.addSerie(serie);
                serie.node.isExpanded(true);

                const reg = serie.addRegression(null, false);
                reg.updateGraph();
                reg.node.isSelected(true);
            }
        }


        /****************************************/

        get projects(): Linq<StudioProject> {

            function* items(this: StudioPage) {
                for (let node of this.items.root().nodes())
                    yield (<StudioProject>node.value());
            }

            return linq(items.apply(this));
        }

        /****************************************/

        async init() {
            this.loadState();
        }

        /****************************************/

        items = new TreeView<ITreeItem>();

        maxX = ko.observable<number>();

        maxY = ko.observable<number>();

        dataImport = new DataImportControl();
    }
}

