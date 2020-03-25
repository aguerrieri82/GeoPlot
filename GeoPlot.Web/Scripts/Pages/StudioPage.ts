namespace WebApp {

    type TData = IInfectionData;

    function setExpression(calc: Desmos.IGraphingCalculator, value: Desmos.Expression) {

        var state = calc.getState();
        var curExp = <Desmos.IFolderExpression>linq(state.expressions.list).first(a => a.id == value.id);
        if (!curExp)
            state.expressions.list.push(value);
        else {

            for (var prop of Object.getOwnPropertyNames(value))
                curExp[prop] = value[prop];
        }
        calc.setState(state);
    }



    /****************************************/
    /* Regression
    /****************************************/

    interface IUpdateGraphContext {
        calculator: Desmos.IGraphingCalculator;
        recursive?: boolean;
        collector?: string[];
    }

    interface IGraphItem {

        updateGraph(ctx: IUpdateGraphContext);
        folderId: string;
    }

    /****************************************/
    /* Regression
    /****************************************/

    class StudioSerieRegression implements ITreeItem, IGraphItem {

        constructor() {

        }

        /****************************************/

        remove() {

        }

        /****************************************/

        attachNode(node: TreeNodeViewModel<ITreeItem>) {
            this.node = node;
        }

        /****************************************/

        updateGraph(options: IUpdateGraphContext) {

        }

        /****************************************/

        get label(): string {
            return "";
        }

        /****************************************/

        folderId: string;

        node: TreeNodeViewModel<ITreeItem>;
        readonly itemType = "regression";
        readonly icon = "show_chart";
    }

    /****************************************/
    /* Project
    /****************************************/

    interface IStudioProjectConfig {
        name?: string;
    }

    interface IStudioProjectState extends IStudioProjectConfig {
        series?: IStudioSerieState[];
    }

    /****************************************/

    class StudioProject implements ITreeItem, IGraphItem {

        protected _calculator: Desmos.IGraphingCalculator;

        constructor(config?: IStudioProjectConfig) {
            if (config)
                this.setState(config);
        }

        /****************************************/

        setState(state: IStudioProjectState) {
            if (state.name)
                this.name(state.name);

            if (state.series != undefined) {

                this.series.foreach(a => a.remove());

                state.series.forEach(a => {
                    const serie = this.addSerie(null, false);
                    serie.setState(a);
                    serie.updateGraph({ calculator: this._calculator });
                });
            }
        }

        /****************************************/

        getState(): IStudioProjectState {

            return {
                name: this.name(),
                series: this.series.select(a => a.getState()).toArray()
            }
        }

        /****************************************/

        remove() {
            this.series.foreach(a => a.remove());
            this.node.remove();
        }

        /****************************************/

        attachNode(node: TreeNodeViewModel<ITreeItem>) {
            this.node = node;
            this.node.isVisible.subscribe(value => this.updateGraph({ calculator: this._calculator, recursive: true }));
        }

        /****************************************/

        updateGraph(ctx: IUpdateGraphContext) {

            if (!ctx.calculator)
                return;
            
            this._calculator = ctx.calculator;
            if (ctx.recursive)
                this.series.foreach(a => a.updateGraph(ctx));
        }

        /****************************************/

        addSerie(configOrSerie?: IStudioSerieConfig | StudioSerie, updateGraph = true): StudioSerie {

            var serie = configOrSerie instanceof StudioSerie ? configOrSerie : new StudioSerie(configOrSerie);

            const node = new TreeNodeViewModel(serie);

            this.node.addNode(node);

            serie.attachNode(node);

            if (updateGraph)
                serie.updateGraph({ calculator: this._calculator });

            return serie;
        }

        /****************************************/

        get label(): string {
            return this.name();
        }

        /****************************************/

        get series(): Linq<StudioSerie> {

            function* items() {
                for (var node of this.node.nodes())
                    yield (<StudioSerie>node.value());
            }

            return linq(items.apply(this));
        }

        /****************************************/

        name = ko.observable<string>();

        folderId: string;
        node: TreeNodeViewModel<ITreeItem>;
        host: StudioPage;

        readonly itemType = "project";
        readonly icon = "folder";
    }

    /****************************************/
    /* Serie
    /****************************************/

    interface IFunction {

    }

    /****************************************/

    interface IDiscreteFunction extends IFunction {
        readonly values: IFunctionPoint<number>[];
    }

    /****************************************/

    interface IStudioSerieConfig {
        name?: string;
        source?: ISerieSource;
        values?: IFunctionPoint<number>[];
        color?: string;
        offsetX?: number;
    }

    /****************************************/

    interface IStudioSerieState extends IStudioSerieConfig {
        folderId?: string;
    }

    /****************************************/

    class StudioSerie implements ITreeItem, IDiscreteFunction, IGraphItem {

        protected _calculator: Desmos.IGraphingCalculator;

        constructor(config?: IStudioSerieConfig) {
            if (config) {
                this.setState(config);
            }
        }

        /****************************************/

        static fromText(text: string): StudioSerie {
            try {
                let obj = <IStudioData>JSON.parse(text);
                if (obj && obj.type == "serie")
                    return new StudioSerie({
                        name: obj.title,
                        values: obj.values,
                        source: obj.serie
                    });
            }
            catch{
            }
        }

        /****************************************/

        setState(state: IStudioSerieState) {
            if (state.name)
                this.name(state.name);
            if (state.color)
                this.color(state.color);
            if (state.offsetX != undefined)
                this.offsetX(state.offsetX);
            if (state.source)
                this.source = state.source;
            if (state.values != undefined)
                this.values = state.values;
            if (state.folderId != undefined)
                this.folderId = state.folderId;

            this.updateGraph({ calculator: this._calculator });
        }

        /****************************************/

        getState(): IStudioSerieState {
            return {
                color: this.color(),
                name: this.name(),
                offsetX: this.offsetX(),
                source: this.source,
                values: this.values,
                folderId: this.folderId
            }
        }

        /****************************************/

        remove() {
            if (this._calculator)
                this._calculator.removeExpression({ id: this.folderId });
            this.node.remove();
        }

        /****************************************/

        attachNode(node: TreeNodeViewModel<ITreeItem>) {
            this.node = node;
            this.node.isVisible.subscribe(value => this.updateGraph({ calculator: this._calculator, recursive: true }));
        }

        /****************************************/

        updateGraph(ctx: IUpdateGraphContext) {

            if (!ctx.calculator)
                return;

            this._calculator = ctx.calculator;

            if (!this.folderId)
                this.folderId = StringUtils.uuidv4();

            setExpression(ctx.calculator, { type: "folder", id: this.folderId, hidden: !this.node.isVisible() || !this.project.node.isVisible(), title: this.project.name() + " - " + this.name() });
        }

        /****************************************/

        get label(): string {
            return this.name();
        }

        /****************************************/

        get project(): StudioProject {
            return <StudioProject>this.node.value();
        }

        /****************************************/

        name = ko.observable<string>();
        color = ko.observable<string>();
        offsetX = ko.observable<number>(0);
        source: ISerieSource;
        values: IFunctionPoint<number>[];
        folderId: string;
        node: TreeNodeViewModel<ITreeItem>;
        readonly itemType = "serie";
        readonly icon = "insert_chart";
    }

    /****************************************/
    /* TreeViewModel
    /****************************************/

    interface ITreeItem {

        attachNode(node: TreeNodeViewModel<ITreeItem>);
        remove(): void;

        readonly itemType: string;
        readonly label: string;
        readonly icon: string;
        readonly node: TreeNodeViewModel<ITreeItem>;
    }


    /****************************************/

    class ActionViewModel {
        execute() {

        }

        /****************************************/

        text: string;
        icon: string;
    }

    /****************************************/

    class TreeNodeViewModel<T> {

        protected _treeView: TreeViewModel<T>;
        protected _parentNode: TreeNodeViewModel<T>;

        constructor(value?: T) {

            this.value(value);
            this.isSelected.subscribe(a => {

                if (a)
                    this._treeView.select(this);
            });
        }

        /****************************************/

        remove() {

            if (this._parentNode)
                this._parentNode.nodes.remove(this);

            if (this._treeView.selectedNode == this)
                this._treeView.select(null);
        }

        /****************************************/

        addNode(node: TreeNodeViewModel<T>) {
            node.attach(this._treeView, this);
            this.nodes.push(node);
        }

        /****************************************/

        attach(treeView: TreeViewModel<T>, parent?: TreeNodeViewModel<T>) {
            this._treeView = treeView;
            this._parentNode = parent;
            for (let childNode of this.nodes())
                childNode.attach(treeView);
        }

        /****************************************/

        get parentNode(): TreeNodeViewModel<T> {
            return this._parentNode;
        }

        /****************************************/

        toggleVisible() {
            this.isVisible(!this.isVisible());
        }

        /****************************************/

        toggleSelection() {
            this.isSelected(!this.isSelected());
        }

        /****************************************/

        expandCollapse() {
            this.isExpanded(!this.isExpanded());
        }

        /****************************************/

        nodes = ko.observableArray<TreeNodeViewModel<T>>();
        value = ko.observable<T>();
        isSelected = ko.observable(false);
        isVisible = ko.observable(true);
        isExpanded = ko.observable(false);
        actions = ko.observableArray<ActionViewModel>();
    }

    /****************************************/

    export class TreeViewModel<T> {

        private _selectedNode: TreeNodeViewModel<T>;

        /****************************************/

        select(node: TreeNodeViewModel<T>) {

            if (this._selectedNode == node)
                return;

            if (this._selectedNode)
                this._selectedNode.isSelected(false);

            this._selectedNode = node;

            if (this._selectedNode)
                this._selectedNode.isSelected(true);
        }

        get selectedNode(): TreeNodeViewModel<T> {
            return this._selectedNode;
        }

        /****************************************/

        setRoot(node: TreeNodeViewModel<T>) {
            node.attach(this);
            this.root(node);
        }

        /****************************************/

        root = ko.observable<TreeNodeViewModel<T>>();
    }

    /****************************************/
    /* Page
    /****************************************/

    interface IPageState {
        version: number;
        graphState?: Desmos.IGraphState;
        projects?: IStudioProjectState[];
    }

    /****************************************/

    interface IStudioViewModel {
        data: IDayAreaDataSet<TData>;
        geo: IGeoAreaSet;
    }

    /****************************************/


    export class StudioPage {

        private readonly _calculator: Desmos.IGraphingCalculator;
        private readonly _data: IDayAreaDataSet<TData>;
        private readonly _dataSet = InfectionDataSet;
        private readonly _geo: IGeoAreaSet;
        private readonly _serieCalculator: IndicatorCalculator<TData>;

        constructor(model: IStudioViewModel) {

            this._data = model.data;
            this._geo = model.geo;
            this._serieCalculator = new IndicatorCalculator(this._data, this._dataSet, this._geo);

            this._calculator = Desmos.GraphingCalculator(document.getElementById("calculator"), {
                xAxisArrowMode: Desmos.AxisArrowModes.BOTH,
                pasteGraphLink: true,
                restrictedFunctions: true,
                restrictGridToFirstQuadrant: true,
                administerSecretFolders: true,
                authorIDE: true,
                advancedStyling: true
            });

            this.items.setRoot(new TreeNodeViewModel());

            //window.addEventListener("beforeunload", () => this.saveState());

            document.body.addEventListener("paste", ev => {
                ev.preventDefault();
                this.onPaste(ev.clipboardData);
            });
            document.body.addEventListener("keydown", ev => {
                this.onKeyDown(ev);
            });

            setTimeout(() => this.init());
        }

        /****************************************/

        removeSelected() {

            if (!this.items.selectedNode)
                return;
            const value = this.items.selectedNode.value();
            value.remove();
        }

        /****************************************/

        getSelectedProject(): StudioProject {
            if (!this.items.selectedNode)
                return;
            const value = this.items.selectedNode.value();
            if (value.itemType == "project")
                return <StudioProject>value;
            if (value.itemType == "serie")
                return (<StudioSerie>value).project;
        }

        /****************************************/

        newProject(): StudioProject {
            let proj = this.addProject({ name: "Project " + (this.projects.count() + 1) });
            proj.node.isSelected(true);
            return proj;
        }

        /****************************************/

        addProject(config?: IStudioProjectConfig): StudioProject {
            const project = new StudioProject(config);
            const node = new TreeNodeViewModel(project);
            this.items.root().addNode(node);
            project.attachNode(node);
            project.updateGraph({ calculator: this._calculator });
            return project;
        }

        /****************************************/

        getState(): IPageState {

            let result: IPageState = { version: 2 };
            result.graphState = this._calculator.getState();
            result.projects = this.projects.select(a => a.getState()).toArray();
            return result;
        }

        /****************************************/

        setState(value: IPageState) {

            if (!value)
                return;

            if (value.graphState)
                this._calculator.setState(value.graphState);

            if (value.projects != undefined) {
                this.projects.toArray().forEach(a => a.remove());
                value.projects.forEach(a => {
                    const proj = this.addProject()
                    proj.setState(a);
                });
            }
        }


        /****************************************/

        loadState() {
            let json = localStorage.getItem("studio");
            if (json)
                this.setState(JSON.parse(json));
        }


        /****************************************/

        saveState() {
            localStorage.setItem("studio", JSON.stringify(this.getState()));
            M.toast({ html: "Studio salvato" });
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

        protected onKeyDown(ev: KeyboardEvent) {
            if (ev.keyCode == 46) {
                ev.preventDefault();
                this.removeSelected();
            }
        }

        /****************************************/

        protected onPaste(data: DataTransfer) {

            let project = this.getSelectedProject();
            if (!project && !this.projects.any())
                project = this.newProject();

            if (project) {
                let text = data.getData("text/plain").toString();
                if (text) {
                    let serie = StudioSerie.fromText(text);
                    if (serie) {
                        project.addSerie(serie);
                        project.node.isExpanded(true);
                        serie.node.isSelected(true);
                    }
                }
            }

        }

        /****************************************/

        get projects(): Linq<StudioProject> {

            function* items(this: StudioPage) {
                for (var node of this.items.root().nodes())
                    yield (<StudioProject>node.value());
            }

            return linq(items.apply(this));
        }

        /****************************************/

        protected init() {
            this.loadState();
            //this.demo();
        }

        /****************************************/

        items = new TreeViewModel<ITreeItem>();
    }
}