namespace WebApp {

    function setExpression(calc: Desmos.IGraphingCalculator, value: Desmos.Expression) {

        var state = calc.getState();
        var curExp = <Desmos.IFolderExpression>linq(state.expressions.list).first(a => a.id == value.id);
        if (!curExp)
            state.expressions.list.push(value);
        else {

            for (var prop in curExp)
                curExp[prop] = value[prop];
        }
        calc.setState(state);
    }

    /****************************************/

    export interface ISerieSources extends ITreeItem {
        areaId: string;
        exeludedAreaIds?: string[];
        indicatorId: string;
        factorId?: string;
        groupSize?: number;
        startDay?: number;
        endDay?: number;
        isDelta?: boolean;
    }

    /****************************************/

    interface IFunctionPoint {
        x: number;
        y: number;
    }


    /****************************************/
    /* Regression
    /****************************************/

    interface IUpdateGraphOptions {
        calculator: Desmos.IGraphingCalculator;
        recursive?: boolean;
        collector?: string[];
    }

    interface IGraphItem {

        updateGraph(oprions: IUpdateGraphOptions);

        folderId: string;
    }

    /****************************************/
    /* Regression
    /****************************************/

    class StudioSerieRegression implements ITreeItem, IGraphItem {

        constructor() {

        }

        /****************************************/

        updateGraph(options: IUpdateGraphOptions) {

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

    /****************************************/

    class StudioProject implements ITreeItem, IGraphItem {

        protected _calculator: Desmos.IGraphingCalculator;

        constructor(config?: IStudioProjectConfig) {
            if (config) {
                if (config.name)
                    this.name(config.name);
            }
        }

        /****************************************/

        updateGraph(options: IUpdateGraphOptions) {

            this._calculator = options.calculator;

            if (!this.folderId) 
                this.folderId = StringUtils.uuidv4();

            setExpression(options.calculator, { type: "folder", id: this.folderId, title: this.name() });


            if (options.recursive)
                this.series().forEach(a => a.updateGraph(options));
        }

        /****************************************/

        addSerie(config?: IStudioSerieConfig): StudioSerie{

            var result = new StudioSerie(config);

            result.project = this;
            result.node = new TreeNodeViewModel(result);

            this.node.nodes.push(result.node);

            if (this._calculator)
                result.updateGraph({ calculator: this._calculator });

            return result;
        }

        /****************************************/

        get label() : string {
            return this.name();
        }

        /****************************************/

        name = ko.observable<string>();
        series = ko.observableArray<StudioSerie>();
        folderId: string;
        node: TreeNodeViewModel<ITreeItem>;
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
        readonly values: IFunctionPoint[];
    }

    /****************************************/

    interface IStudioSerieConfig {
        name?: string;
        source?: ISerieSources;
        values?: IFunctionPoint[];
        color?: string;
        offsetX?: number;
    }

    /****************************************/

    interface IStudioSerieState extends IStudioSerieConfig {

    }

    /****************************************/

    class StudioSerie implements ITreeItem, IDiscreteFunction, IGraphItem {

        protected _calculator: Desmos.IGraphingCalculator;

        constructor(config?: IStudioSerieConfig) {
            if (config) {
                if (config.name)
                    this.name(config.name);
            }
        }


        /****************************************/

        updateGraph(options: IUpdateGraphOptions) {
            this._calculator = options.calculator;

            if (!this.folderId)
                this.folderId = StringUtils.uuidv4();

            setExpression(options.calculator, { type: "folder", id: this.folderId, folderId: this.project.folderId, title: this.name() });
        }

        /****************************************/

        get label(): string {
            return this.name();
        }

        /****************************************/

        name = ko.observable<string>();
        color = ko.observable<string>();
        offsetX = ko.observable<number>(0);
        graphFolderId = ko.observable<number>(0);
        folderId: string;
        source: ISerieSources;
        values: IFunctionPoint[];
        project: StudioProject;

        node: TreeNodeViewModel<ITreeItem>;
        readonly itemType = "serie";
        readonly icon = "insert_chart";
    }

    /****************************************/
    /* TreeViewModel
    /****************************************/

    interface ITreeItem {

        readonly itemType: string;
        readonly label: string;
        readonly icon: string;
        node: TreeNodeViewModel<ITreeItem>;
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

        constructor(value?: T) {

            this.value(value);
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
        isSelected = ko.observable(true);
        isExpanded = ko.observable(false);
        actions = ko.observableArray<ActionViewModel>();
    }

    /****************************************/

    export class TreeViewModel<T> {

        root = ko.observable<TreeNodeViewModel<T>>();
    }

    /****************************************/
    /* Page
    /****************************************/

    interface IPageState {
        version: number;
        graphState?: Desmos.IGraphState;
        series?: IStudioSerieState[];
    }

    /****************************************/


    export class StudioPage {

        private _calculator: Desmos.IGraphingCalculator;

        constructor() {

            this._calculator = Desmos.GraphingCalculator(document.getElementById("calculator"), {
                xAxisArrowMode: Desmos.AxisArrowModes.BOTH,
                pasteGraphLink: true,
                restrictedFunctions: true,
                restrictGridToFirstQuadrant: true,
                administerSecretFolders: true,
                authorIDE: true,
                advancedStyling: true
            });
            /*
            this._calculator.setExpression({
                id: "xzxxz",
                type: "table", columns: [{
                    latex: "x_{1}",
                    values: [0, 1, 2, 3]
                }, {
                    latex: "y_{1}",
                    lines: true,
                    points: true,
                    values: [10, 12, 25, 11]
                }]
            })
            */
            this.series.root(new TreeNodeViewModel());

            window.addEventListener("beforeunload", () => this.saveState());

            setTimeout(() => {
                //this.loadState();
                this.demo();
            });

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

        protected addProject(config?: IStudioProjectConfig): StudioProject {
            const project = new StudioProject(config);
            project.node = new TreeNodeViewModel(project);
            this.series.root().nodes.push(project.node);
            project.updateGraph({ calculator: this._calculator });
            return project;
        }     

        /****************************************/

        protected loadState() {
            let json = localStorage.getItem("studio");
            if (json)
                this.setState(JSON.parse(json));
        }


        /****************************************/

        protected saveState() {
            localStorage.setItem("studio", JSON.stringify(this.getState()));
        }

        /****************************************/

        getState(): IPageState {
            let result: IPageState = { version: 1 };
            result.graphState = this._calculator.getState();
            return result;
        }

        /****************************************/

        setState(value: IPageState) {
            if (!value)
                return;
            if (value.graphState)
                this._calculator.setState(value.graphState);
        }

        /****************************************/

        test() {
            let state = this._calculator.getState();
        }

        /****************************************/

        series = new TreeViewModel<ITreeItem>();
    }
}