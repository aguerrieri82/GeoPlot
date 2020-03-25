namespace WebApp {

    type TData = IInfectionData;

    type GraphVarMap = IDictionary<string>;


    /****************************************/
    /* Regression
    /****************************************/

    class GraphContext {

        setExpressions(values: Desmos.Expression[]) {

            let state = this.calculator.getState();

            for (var value of values) {
                /*
                if (value.type != "folder")
                    continue;*/
                const curExp = <Desmos.IFolderExpression>linq(state.expressions.list).first(a => a.id == value.id);
                if (!curExp)
                    state.expressions.list.push(value);
                else {
                    for (var prop of Object.getOwnPropertyNames(value))
                        curExp[prop] = value[prop];
                }
            }

            const groups = linq(state.expressions.list).where(a=> a.type != "folder").groupBy(a => a.folderId ? a.folderId : "").toDictionary(a => a.key, a => a.values.toArray());

            const newList = [];

            for (let folder of linq(state.expressions.list).where(a => a.type == "folder")) {
                newList.push(folder);
                let items = groups[folder.id];
                if (items)
                    for (let item of items)
                        newList.push(item);
            }

            let items = groups[""];
            if (items)
                for (let item of items)
                    newList.push(item);
                
            state.expressions.list = newList;

            this.calculator.setState(state);
            /*
            for (var value of values) {
                if (value.type == "folder")
                    continue;
                this.calculator.setExpression(value);
            }*/
        }

        /****************************************/

        updateExpression(value: Desmos.Expression) {
            let exp = <Desmos.IMathExpression>linq(this.calculator.getExpressions()).where(a => a.id == value.id).first();
            if (exp) {
                for (var prop of Object.getOwnPropertyNames(value))
                    exp[prop] = value[prop];
                this.calculator.setExpression(exp);
            }
        }

        /****************************************/

        updateVariable(id: string, varName, value: number) {
            this.updateExpression(<Desmos.IMathExpression>{ id: id, latex: varName + "=" + value.toString() });
        }

        /****************************************/

        expressionZoomFit(id: string) {
            this.calculator.controller.dispatch({ type: "expression-zoom-fit", id: id });
        }

        /****************************************/

        setItemVisibile(id: string, value: boolean) {
            this.calculator.controller._setItemHidden(id, !value);
        }

        /****************************************/

        generateVars(map: GraphVarMap) {

            for (var key in map) {
                if (!map[key])
                    map[key] = this.generateVar(key);
            }
        }

        /****************************************/

        generateVar(prefix = "a"): string {
            if (!this.vars[prefix])
                this.vars[prefix] = 0;
            this.vars[prefix]++;
            return prefix[0] + "_{" + this.vars[prefix] + "}";
        }

        /****************************************/

        calculator: Desmos.IGraphingCalculator;
        vars: IDictionary<number> = {};
    }

    /****************************************/

    interface IGraphItem {

        attachGraph(ctx: GraphContext);
        updateGraph(recursive?: boolean);
        folderId: string;
    }

    /****************************************/
    /* Regression
    /****************************************/

    class StudioSerieRegression implements ITreeItem, IGraphItem {

        protected _graphCtx: GraphContext;

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

        updateGraph() {
            if (!this._graphCtx)
                return;
        }

        /****************************************/

        attachGraph(ctx: GraphContext) {
            this._graphCtx = ctx;
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
        readonly optionsTemplateName = "RegressionOptionsTemplate";
        readonly actions: ActionViewModel[] = [];
    }

    /****************************************/
    /* Project
    /****************************************/

    interface IStudioProjectConfig {
        name?: string;
    }

    interface IStudioProjectState extends IStudioProjectConfig {
        series?: IStudioSerieState[];
        visible?: boolean;
        opened?: boolean;
    }

    /****************************************/

    class StudioProject implements ITreeItem, IGraphItem {

        protected _graphCtx: GraphContext;

        constructor(config?: IStudioProjectConfig) {
            if (config)
                this.setState(config);

            this.actions.push(apply(new ActionViewModel(), action => {
                action.text = "Elimina";
                action.icon = "delete";
                action.execute = () => this.remove();
            }));

         
        }

        /****************************************/

        setState(state: IStudioProjectState) {
            if (state.name)
                this.name(state.name);

            if (state.visible != undefined)
                this.node.isVisible(state.visible);

            if (state.opened != undefined)
                this.node.isExpanded(state.opened);

            if (state.series != undefined) {

                this.series.foreach(a => a.remove());

                state.series.forEach(a => {
                    const serie = this.addSerie(null, false);
                    serie.setState(a);
                    //serie.updateGraph();
                });
            }
        }

        /****************************************/

        getState(): IStudioProjectState {

            return {
                name: this.name(),
                series: this.series.select(a => a.getState()).toArray(),
                visible: this.node.isVisible(),
                opened: this.node.isExpanded()
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
            this.node.isVisible.subscribe(value => this.series.foreach(a => a.updateGraphVisibility()));
        }

        /****************************************/

        attachGraph(ctx: GraphContext) {
            this._graphCtx = ctx;
        }

        /****************************************/

        updateGraph(recursive = false) {

            if (!this._graphCtx)
                return;

            if (recursive)
                this.series.foreach(a => a.updateGraph(recursive));
        }

        /****************************************/

        addSerie(configOrSerie?: IStudioSerieConfig | StudioSerie, updateGraph = true): StudioSerie {

            var serie = configOrSerie instanceof StudioSerie ? configOrSerie : new StudioSerie(configOrSerie);

            const node = new TreeNodeViewModel(serie);

            this.node.addNode(node);

            serie.attachNode(node);

            serie.attachGraph(this._graphCtx);

            if (updateGraph)
                serie.updateGraph();

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
        readonly optionsTemplateName = "ProjectOptionsTemplate";
        readonly actions: ActionViewModel[] = [];
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
        varsMap?: IDictionary<string>;
        visible?: boolean;
    }

    /****************************************/

    class StudioSerie implements ITreeItem, IDiscreteFunction, IGraphItem {

        protected _graphCtx: GraphContext;

        protected _varsMap: IDictionary<string> = {
            "x": null,
            "y": null,
            "ofs": null,
            "xofs": null,
        };

        /****************************************/

        constructor(config?: IStudioSerieConfig) {

            if (config) {
                this.setState(config);
            }
            this.actions.push(apply(new ActionViewModel(), action => {
                action.text = "Elimina";
                action.icon = "delete";
                action.execute = () => this.remove();
            }));
            this.actions.push(apply(new ActionViewModel(), action => {
                action.text = "Regressione";
                action.icon = "add_box";
                action.execute = () => this.addRegression();
            }));

                
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

        addRegression() {

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
            /*
            if (state.varsMap) {
                for (var key in state.varsMap)
                    this._varsMap[key] = state.varsMap[key];
            }*/
            if (state.visible != undefined)
                this.node.isVisible(state.visible);

            this.updateGraph();
        }

        /****************************************/

        getState(): IStudioSerieState {
            return {
                color: this.color(),
                name: this.name(),
                offsetX: this.offsetX(),
                source: this.source,
                values: this.values,
                folderId: this.folderId,
                varsMap: this._varsMap,
                visible: this.node.isVisible()
            }
        }

        /****************************************/

        remove() {
            if (this._graphCtx) {
                this._graphCtx.calculator.removeExpression({ id: this.getGraphId("private") });
                this._graphCtx.calculator.removeExpression({ id: this.getGraphId("public") });
            }
            this.node.remove();
        }

        /****************************************/

        attachNode(node: TreeNodeViewModel<ITreeItem>) {
            this.node = node;
            this.node.isVisible.subscribe(value => this.updateGraphVisibility());
            this.node.isSelected.subscribe(value => {
                if (value)
                    this.onSelected();
            })
        }

        /****************************************/

        attachGraph(ctx: GraphContext) {
            this._graphCtx = ctx;
            this._graphCtx.calculator.observe("expressionAnalysis", () => {
                let anal = this._graphCtx.calculator.expressionAnalysis[this.getGraphId("offset")];
                this.offsetX(anal.evaluation.value);
            });

            this.color.subscribe(value => {
                this._graphCtx.updateExpression({ type: "expression", id: this.getGraphId("offset-x-serie"), color: value });
            });

        }

        /****************************************/

        protected onSelected() {
            this._graphCtx.expressionZoomFit(this.getGraphId("table"));
        }

        /****************************************/

        protected getGraphId(section: string) {
            return this.folderId + "/" + section;
        }

        /****************************************/

        updateGraphVisibility() {
            const isVisible = this.node.isVisible() && this.project.node.isVisible();
            this._graphCtx.setItemVisibile(this.getGraphId("public"), isVisible);
            this._graphCtx.setItemVisibile(this.getGraphId("private"), isVisible);
        }

        /****************************************/

        updateGraph(recursive = false) {

            if (!this._graphCtx)
                return;

            if (!this.folderId)
                this.folderId = StringUtils.uuidv4();

            if (!this.color())
                this.color("#0000ff");

            this._graphCtx.generateVars(this._varsMap);

            this._graphCtx.setExpressions([
                {
                    type: "folder",
                    id: this.getGraphId("public"),
                    title: this.project.name() + " - " + this.name(),
                }, {
                    type: "folder",
                    id: this.getGraphId("private"),
                    title: this.project.name() + " - " + this.name(),
                    secret: true, hidden: !this.node.isVisible() || !this.project.node.isVisible()
                }, {
                    type: "expression",
                    id: this.getGraphId("offset"),
                    latex: this._varsMap["ofs"] + "=" + this.offsetX(),
                    folderId: this.getGraphId("public"),
                    label: "Scostamento",
                    slider: {
                        min: (-this.values.length).toString(),
                        max: (this.values.length).toString(),
                        hardMax: true,
                        hardMin: true,
                        step: "1"
                    }
                }, {
                    type: "expression",
                    id: this.getGraphId("offset-x"),
                    latex: this._varsMap["xofs"] + "=" + this._varsMap["x"] + "+" + this._varsMap["ofs"],
                    folderId: this.getGraphId("private"),
                }, {
                    type: "expression",
                    id: this.getGraphId("offset-x-serie"),
                    latex: "(" + this._varsMap["xofs"] + "," + this._varsMap["y"] + ")",
                    folderId: this.getGraphId("private"),
                    points: true,
                    lines: true,
                    color: this.color()
                }, {
                    type: "table",
                    id: this.getGraphId("table"),
                    folderId: this.getGraphId("private"),
                    columns: [
                        {
                            id: this.getGraphId("table/x"),
                            latex: this._varsMap["x"],
                            hidden: true,
                            values: linq(this.values).select(a => a.x.toString()).toArray()
                        },
                        {
                            id: this.getGraphId("table/y"),
                            latex: this._varsMap["y"],
                            values: linq(this.values).select(a => a.y.toString()).toArray(),
                            hidden: true
                        }
                    ]
                }]);

            this._graphCtx.updateVariable(this.getGraphId("offset"), this._varsMap["ofs"], 17);


            this.updateGraphVisibility();
        }

        /****************************************/

        get label(): string {
            return this.name();
        }

        /****************************************/

        get project(): StudioProject {
            return <StudioProject>this.node.parentNode.value();
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
        readonly optionsTemplateName = "StudioOptionsTemplate";
        readonly actions: ActionViewModel[] = [];
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

            if (this._treeView.selectedNode() == this)
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

            if (this.selectedNode() == node)
                return;

            if (this.selectedNode())
                this.selectedNode().isSelected(false);

            this.selectedNode(node);

            if (this.selectedNode())
                this.selectedNode().isSelected(true);
        }

        /****************************************/

        setRoot(node: TreeNodeViewModel<T>) {
            node.attach(this);
            this.root(node);
        }

        /****************************************/

        root = ko.observable<TreeNodeViewModel<T>>();
        selectedNode = ko.observable<TreeNodeViewModel<T>>();
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

    interface IStudioViewModel {
        data: IDayAreaDataSet<TData>;
        geo: IGeoAreaSet;
    }

    /****************************************/


    export class StudioPage {

        private readonly _data: IDayAreaDataSet<TData>;
        private readonly _dataSet = InfectionDataSet;
        private readonly _geo: IGeoAreaSet;
        private readonly _serieCalculator: IndicatorCalculator<TData>;
        private _graphCtx: GraphContext;

        constructor(model: IStudioViewModel) {

            this._data = model.data;
            this._geo = model.geo;
            this._serieCalculator = new IndicatorCalculator(this._data, this._dataSet, this._geo);


            this._graphCtx = new GraphContext();
            this._graphCtx.calculator = Desmos.GraphingCalculator(document.getElementById("calculator"), {
                //xAxisArrowMode: Desmos.AxisArrowModes.BOTH,
                pasteGraphLink: false,
                pasteTableData: false,
                //lockViewport: false,
                //restrictedFunctions: true,
                //restrictGridToFirstQuadrant: true,
                administerSecretFolders: true,
                //authorIDE: true,
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

            if (!this.items.selectedNode())
                return;
            const value = this.items.selectedNode().value();
            value.remove();
        }

        /****************************************/

        getSelectedProject(): StudioProject {
            if (!this.items.selectedNode())
                return;
            const value = this.items.selectedNode().value();
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

        addProject(config?: IStudioProjectConfig, updateGraph = true): StudioProject {
            const project = new StudioProject(config);
            const node = new TreeNodeViewModel(project);
            this.items.root().addNode(node);
            project.attachNode(node);
            project.attachGraph(this._graphCtx);
            if (updateGraph)
                project.updateGraph();
            return project;
        }

        /****************************************/

        getState(): IPageState {

            let result: IPageState = { version: 2 };
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
                console.log(JSON.stringify(value.graphState, null, "  "));
                value.graphState.expressions.list = [];
                this._graphCtx.calculator.setState(value.graphState);
            }

            if (value.vars)
                this._graphCtx.vars = value.vars;

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
            if (ev.keyCode == 46 && (<HTMLElement> ev.target).tagName != "INPUT") {
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