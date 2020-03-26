namespace WebApp {

    type TData = IInfectionData;

    type GraphVarMap = IDictionary<string>;


    function toSafeString(value: any): string {
        if (value == null || value == undefined)
            return undefined;
        return value.toString();
    }

    /****************************************/
    /* ParameterViewModel
    /****************************************/

    interface IParameterConfig {
        value: KnockoutObservable<number>;
        name: string;
    }

    /****************************************/

    class ParameterViewModel {

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
    /* Regression
    /****************************************/

    class GraphContext {

        setExpressions(values: Desmos.Expression[]) {

            const state = this.calculator.getState();

            for (let value of values) {

                const curExp = <Desmos.IFolderExpression>linq(state.expressions.list).first(a => a.id == value.id);
                if (!curExp)
                    state.expressions.list.push(value);
                else {
                    for (let prop of Object.getOwnPropertyNames(value))
                        curExp[prop] = value[prop];
                }
            }

            const groups = linq(state.expressions.list).where(a => a.type != "folder").groupBy(a => a.folderId ? a.folderId : "").toDictionary(a => a.key, a => a.values.toArray());

            const newList = [];

            for (let folder of linq(state.expressions.list).where(a => a.type == "folder")) {
                newList.push(folder);
                const items = groups[folder.id];
                if (items)
                    for (let item of items)
                        newList.push(item);
            }

            const items = groups[""];
            if (items)
                for (let item of items)
                    newList.push(item);

            state.expressions.list = newList;

            this.calculator.setState(state);
        }

        /****************************************/

        setColor(id: string, color: string) {
            this.calculator.controller.dispatch({ type: "set-item-color", id: id, color: color });
        }

        /****************************************/

        updateTable(id: string, values: IFunctionPoint<number>[]) {
            const exp = <Desmos.ITableExpression>linq(this.calculator.getExpressions()).where(a => a.id == id).first();
            if (exp) {
                exp.columns[0].values = linq(values).select(a => a.x.toString()).toArray();
                exp.columns[1].values = linq(values).select(a => a.y.toString()).toArray();
                this.calculator.setExpression(exp);
            }
        }

        /****************************************/

        updateExpression(value: Desmos.Expression) {
            const exp = <Desmos.IMathExpression>linq(this.calculator.getExpressions()).where(a => a.id == value.id).first();
            if (exp) {
                for (let prop of Object.getOwnPropertyNames(value))
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
            this.calculator.updateSettings({});
        }

        /****************************************/

        generateVars(map: GraphVarMap) {

            for (let key in map) {
                if (!map[key])
                    map[key] = this.generateVar(key);
            }
        }

        /****************************************/

        generateVar(prefix = "a"): string {
            if (!this.vars[prefix[0]])
                this.vars[prefix[0]] = 0;
            this.vars[prefix[0]]++;
            return prefix[0] + "_{" + this.vars[prefix[0]] + "}";
        }

        /****************************************/

        serieCalculator: IndicatorCalculator<TData>;
        calculator: Desmos.IGraphingCalculator;
        vars: IDictionary<number> = {};
    }

    /****************************************/

    interface IGraphItem {

        attachGraph(ctx: GraphContext);
        updateGraphVisibility(recursive?: boolean);
        updateGraph(recursive?: boolean);
        folderId: string;
    }


    /****************************************/
    /* BaseItem
    /****************************************/

    interface IItemConfig {
        name?: string;
        color?: string;
    }

    /****************************************/

    interface IItemState extends IItemConfig {
        folderId?: string;
        visible?: boolean;
        opened?: boolean;
    }

    /****************************************/

    abstract class BaseItem<TState extends IItemState, TParent extends ITreeItem & IGraphItem, TChild extends ITreeItem & IGraphItem> implements ITreeItem, IGraphItem {

        protected _graphCtx: GraphContext;
        protected _varsMap: IDictionary<string>;

        constructor() {
        }

        /****************************************/

        protected createActions(result: ActionViewModel[]) {
            result.push(apply(new ActionViewModel(), action => {
                action.text = "Elimina";
                action.icon = "delete";
                action.execute = () => this.remove();
            }))
        }

        /****************************************/

        setState(state: TState) {
            if (state.name)
                this.name(state.name);

            if (state.visible != undefined)
                this.node.isVisible(state.visible);

            if (state.color)
                this.color(state.color);

            if (state.opened != undefined)
                this.node.isExpanded(state.opened);

            if (state.folderId)
                this.folderId = state.folderId;

            this.setStateWork(state);

            this.updateGraph();

            this.setChildrenStateWork(state);
        }

        /****************************************/

        getState(): TState {

            return <TState>{
                name: this.name(),
                visible: this.node.isVisible(),
                folderId: this.folderId,
                color: this.color(),
                opened: this.node.isExpanded()
            };
        }

        /****************************************/

        getVar(name: string): string {

            return this._varsMap[name];
        }

        /****************************************/

        remove(recursive = true) {

            if (this._graphCtx) {
                this._graphCtx.calculator.removeExpression({ id: this.getGraphId("private") });
                this._graphCtx.calculator.removeExpression({ id: this.getGraphId("public") });
            }
            this.node.remove();

            if (recursive)
                this.children.foreach(a => a.remove());
        }

        /****************************************/

        attachNode(node: TreeNodeViewModel<ITreeItem>) {
            this.node = node;
            this.node.isVisible.subscribe(value => this.updateGraphVisibility());
            this.node.isSelected.subscribe(value => {
                if (value)
                    this.onSelected();
            })
            const actions: ActionViewModel[] = [];
            this.createActions(actions);
            this.node.actions(actions);
        }

        /****************************************/

        attachGraph(ctx: GraphContext) {
            this._graphCtx = ctx;

            this._graphCtx.calculator.observe("expressionAnalysis", () => this.onGraphChanged());
            this.color.subscribe(value => this.updateColor());
        }

        /****************************************/

        updateGraphVisibility(recorsive = true) {

            let curNode = this.node;
            let isVisible = true;

            while (curNode) {
                if (!curNode.isVisible()) {
                    isVisible = false;
                    break;
                }
                curNode = curNode.parentNode;
            }

            this._graphCtx.setItemVisibile(this.getGraphId("public"), isVisible);
            this._graphCtx.setItemVisibile(this.getGraphId("private"), isVisible);

            if (recorsive)
                this.children.foreach(a => a.updateGraphVisibility());
        }

        /****************************************/

        updateGraph(recursive = true) {

            if (!this._graphCtx)
                return;

            if (!this.folderId)
                this.folderId = StringUtils.uuidv4();

            const values = this.getExpressions();

            this._graphCtx.setExpressions(values);

            this.updateGraphWork();

            this.updateGraphVisibility();

            this.updateParameters();

            if (recursive)
                this.children.foreach(a => a.updateGraph(recursive));
        }

        /****************************************/

        get parent(): TParent {
            return <TParent>this.node.parentNode.value();
        }

        /****************************************/

        get children(): Linq<TChild> {
            return linq(this.node.nodes()).select(a => <TChild>a.value());
        }

        /****************************************/

        protected abstract setStateWork(state: TState);

        protected abstract getExpressions(): Desmos.Expression[];

        /****************************************/

        protected replaceVars(value: string): string {
            for (let item in this._varsMap) {
                const reg = new RegExp("\\$" + item, "g");
                value = value.replace(reg, this._varsMap[item]);
            }
            return value;
        }

        /****************************************/

        protected getGraphId(section: string) {
            return this.folderId + "/" + section;
        }

        /****************************************/

        protected addChildrenWork(value: TChild, updateGraph = true): TChild {

            const node = new TreeNodeViewModel(value);

            this.node.addNode(node);

            value.attachNode(node);

            value.attachGraph(this._graphCtx);

            if (updateGraph)
                value.updateGraph();

            return value;
        }

        /****************************************/

        protected createParameters(result: ParameterViewModel[]) : boolean{
            return false;
        }

        /****************************************/

        protected updateParameters() {
            const values: ParameterViewModel[] = [];
            if (this.createParameters(values)) {
                this.parameters.removeAll();
                values.forEach(a => this.parameters.push(a));
            }
        }

        /****************************************/

        protected updateGraphWork() {

        }

        /****************************************/

        protected setChildrenStateWork(state: TState) {

        }

        /****************************************/

        protected onSelected() {

        }

        /****************************************/

        protected onGraphChanged() {

        }

        /****************************************/

        protected updateColor() {

        }

        /****************************************/

        folderId: string;
        node: TreeNodeViewModel<ITreeItem>;
        name = ko.observable<string>();
        time = ko.observable(0);
        color = ko.observable<string>();
        itemType: string;
        icon: string;
        optionsTemplateName: string;
        parameters = ko.observableArray<ParameterViewModel>();
    }

    /****************************************/
    /* Regression
    /****************************************/

    type RegressionFunctionType = "linear" | "exponential" | "normal" | "log-normal";

    interface IStudioRegressionConfig extends IItemConfig {
        function?: IRegressionFunction;
    }

    /****************************************/

    interface IStudioRegressionState extends IStudioRegressionConfig, IItemState {
    }

    /****************************************/

    interface IRegressionFunctionVar {
        name: string;
        label?: string;
        autoCompute: boolean;
        minValue?: number;
        maxValue?: number;
        precision?: number;
        step?: number;
        value?: number;
    }


    /****************************************/
    interface IRegressionFunction {
        type: RegressionFunctionType
        name: string;
        value: string;
        vars: IRegressionFunctionVar[];
    }

    /****************************************/

    class RegressionFunctionViewModel {

        select() {
        }

        /****************************************/

        icon: string;
        value: IRegressionFunction;
        vars = ko.observable<RegressionFunctionVarViewModel[]>();
    }

    /****************************************/

    class RegressionFunctionVarViewModel {

        value: IRegressionFunctionVar;
        curValue = ko.observable<number>();
        autoCompute = ko.observable<boolean>();
    }

    /****************************************/

    class StudioSerieRegression extends BaseItem<IStudioRegressionState, StudioSerie, any> {

        protected _varsMap: IDictionary<string> = {};

        /****************************************/

        constructor(config?: IStudioRegressionConfig) {

            super();

            this._varsMap = {
                "fun": null,
                "sum": null,
                "n1": null,
                "n2": null,
                "value": null,
                "time": null
            };

            this.itemType = "regression";
            this.icon = "show_chart";
            this.optionsTemplateName = "RegressionOptionsTemplate";

            this.functions = [];

            this.addFunction({
                name: "Normale",
                type: "normal",
                value: "$y\\ \\sim $c\\cdot\\frac{ e^ {-\\frac{ \\left(\\ln\\ \\left($x - $a\\right) \\ -$u\\right)^ { 2}} { 2$o^ { 2} }}}{ \\left($x - $a\\right) \\sqrt{ 2\\pi } $o }",
                vars: [{
                    name: "a",
                    label: "Scostamento",
                    autoCompute: true,
                    precision: 0
                },
                {
                    name: "c",
                    label: "Totale",
                    autoCompute: true,
                    minValue: 0,
                    maxValue: 30000,
                    precision: 0
                },
                {
                    name: "o",
                    label: "Incremento",
                    autoCompute: true,
                    precision: 5
                },
                {
                    name: "u",
                    label: "Picco",
                    autoCompute: true,
                    precision: 5
                }]
            });

            this.selectedFunction.subscribe(a => {
                if (!this.name() && a)
                    return this.name(a.value.name);

            });

            this.selectedFunction(this.functions[0]);

            if (config)
                this.setState(config);
        }

        /****************************************/

        protected addFunction(value: IRegressionFunction): RegressionFunctionViewModel {
            const model = new RegressionFunctionViewModel();
            model.value = value;
            model.select = () => {

            };

            const vars: RegressionFunctionVarViewModel[] = [];
            for (let item of value.vars) {
                const vModel = new RegressionFunctionVarViewModel();
                vModel.value = item;
                
                vModel.curValue(item.value);
                vModel.autoCompute(item.autoCompute);

                vModel.autoCompute.subscribe(a => this.updateGraph());
                vModel.curValue.subscribe(value => {
                    if (!vModel.autoCompute()) {
                        this._graphCtx.updateVariable(this.getGraphId(item.name + "-value"), this.getVar(item.name), value);
                    }
                });

                vars.push(vModel);
            }

            model.vars(vars);

            this.functions.push(model);
            return model;
        }

        /****************************************/

        protected onGraphChanged() {
            this.updateRegressionVars();
        }

        /****************************************/

        protected updateRegressionVars() {
            let model = this._graphCtx.calculator.controller.getItemModel(this.getGraphId("main"));
            if (model.regressionParameters) {
                for (let item of this.selectedFunction().vars()) {
                    const varName = this.getVar(item.value.name).replace("{", "").replace("}", "");
                    let value = model.regressionParameters[varName];
                    if (value != undefined) {
                        if (item.value.precision != undefined)
                            value = MathUtils.round(value, item.value.precision);
                        item.curValue(value);
                    }
                }
            }
        }

        /****************************************/

        protected createParameters(result: ParameterViewModel[]): boolean {
            return false;
        }

        /****************************************/

        protected setStateWork(state: IStudioRegressionState) {

        }

        /****************************************/

        protected updateGraphWork() {
            this.updateRegressionVars();
        }

        /****************************************/

        protected getExpressions(): Desmos.Expression[] {

            const values: Desmos.Expression[] = [];

            values.push({
                type: "folder",
                id: this.getGraphId("public"),
                title: this.parent.name() + " - " + this.name(),
                collapsed: true
            });
            values.push({
                type: "folder",
                id: this.getGraphId("private"),
                secret: true,
                title: this.parent.name() + " - " + this.name(),
                collapsed: true
            });

            const func = this.selectedFunction().value;

            this._varsMap["x"] = this.parent.getVar("xofs");
            this._varsMap["y"] = this.parent.getVar("y");
            this._varsMap["time"] = this.parent.parent.getVar("time");

            for (let item of func.vars) {
                if (!this._varsMap[item.name])
                    this._varsMap[item.name] = null;
            }

            this._graphCtx.generateVars(this._varsMap);

            values.push({
                type: "expression",
                id: this.getGraphId("main"),
                folderId: this.getGraphId("private"),
                latex: this.replaceVars(func.value),
                hidden: true
            });

            values.push({
                type: "expression",
                id: this.getGraphId("main-func"),
                folderId: this.getGraphId("private"),
                latex: this.replaceVars(func.value.replace("$y\\ \\sim ", "$fun\\left(x\\right)=").replace(/\$x/g, "x")),
                color: this.parent.color(),
                lineStyle: Desmos.Styles.DASHED
            });

            values.push({
                type: "expression",
                id: this.getGraphId("sum-func"),
                folderId: this.getGraphId("private"),
                latex: this.replaceVars("$sum\\left(x\\right)=\\sum_{$n1=1}^{x}\\operatorname{round}\\left($fun\\left($n1\\right)\\right)"),
                hidden: true
            });


            values.push({
                type: "expression",
                id: this.getGraphId("sum-x-time"),
                folderId: this.getGraphId("private"),
                latex: this.replaceVars("$n2=\\left[1,...,$time\\right]"),
            });

            values.push({
                type: "expression",
                id: this.getGraphId("sum-serie"),
                folderId: this.getGraphId("private"),
                latex: this.replaceVars("\\left($n2,\\ $sum\\left($n2\\right)\\right)"),
                color: this.parent.color(),
                lines: true,
                points: false,
                lineStyle: Desmos.Styles.POINT
            });

            values.push({
                type: "expression",
                id: this.getGraphId("sum-value"),
                folderId: this.getGraphId("public"),
                latex: this.replaceVars("$value=$sum\\left($time\\right)"),
            });

            values.push({
                type: "expression",
                id: this.getGraphId("sum-point"),
                folderId: this.getGraphId("private"),
                latex: this.replaceVars("\\left($time,$value\\right)"),
                color: this.parent.color(),
                label: this.parent.name(),
                dragMode: "XY",
                showLabel: true
            });

            for (let item of this.selectedFunction().vars()) {
                if (item.autoCompute())
                    this._graphCtx.calculator.removeExpression({ id: this.getGraphId(item.value.name + "-value") });
                else {
                    values.push({
                        type: "expression",
                        id: this.getGraphId(item.value.name + "-value"),
                        latex: this.getVar(item.value.name) + "=" + (item.curValue() ? item.curValue().toString() : "0"),
                        folderId: this.getGraphId("public"),
                        label: item.value.name,
                        slider: {
                            min: toSafeString(item.value.minValue),
                            max: toSafeString(item.value.maxValue),
                            hardMax: true,
                            hardMin: true,
                            step: toSafeString(item.value.step)
                        }
                    });
                }
            }
    

            return values;
        }

        /****************************************/

        functions: RegressionFunctionViewModel[];
        selectedFunction = ko.observable<RegressionFunctionViewModel>();
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

    interface IStudioSerieConfig extends IItemConfig {
        source?: ISerieSource;
        values?: IFunctionPoint<number>[];
        offsetX?: number;
        children?: IStudioRegressionConfig[];
    }

    /****************************************/

    interface IStudioSerieState extends IStudioSerieConfig, IItemState {
    }

    /****************************************/

    class StudioSerie extends BaseItem<IStudioSerieState, StudioProject, StudioSerieRegression> implements IDiscreteFunction {

        constructor(config?: IStudioSerieConfig) {
            super();

            this.itemType = "serie";
            this.icon = "insert_chart";
            this.optionsTemplateName = "StudioOptionsTemplate";

            this._varsMap = {
                "x": null,
                "y": null,
                "ofs": null,
                "xofs": null,
            };

            if (config) {
                this.setState(config);
            }
        }

        /****************************************/

        protected createActions(result: ActionViewModel[]) {

            super.createActions(result);

            result.push(apply(new ActionViewModel(), action => {
                action.text = "Aggiorna";
                action.icon = "autorenew";
                action.execute = () => this.updateSerie();
            }));

            result.push(apply(new ActionViewModel(), action => {
                action.text = "Nuova regressione";
                action.icon = "add_box";
                action.execute = () => {
                    const reg = this.addRegression();
                    this.node.isExpanded(true);
                    reg.node.isSelected(true);
                }
            }));

            result.push(apply(new ActionViewModel(), action => {
                action.text = "Zoom";
                action.icon = "zoom_in";
                action.execute = () => {
                    this.zoom();
                }

            }));
        }

        /****************************************/

        static fromText(text: string): StudioSerie {
            try {
                const obj = <IStudioData>JSON.parse(text);
                if (obj && obj.type == "serie")
                    return new StudioSerie({
                        name: obj.title,
                        values: obj.values,
                        source: obj.serie,
                        color: obj.color
                    });
            }
            catch{
            }
        }
        /****************************************/

        protected getExpressions(): Desmos.Expression[] {

            if (!this.color())
                this.color("#0000ff");

            this._graphCtx.generateVars(this._varsMap);

            const values: Desmos.Expression[] = [
                {
                    type: "folder",
                    id: this.getGraphId("public"),
                    title: this.parent.name() + " - " + this.name(),
                    collapsed: true
                }, {
                    type: "folder",
                    id: this.getGraphId("private"),
                    title: this.parent.name() + " - " + this.name(),
                    secret: true,
                    collapsed: true
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
                        },
                        {
                            id: this.getGraphId("table/y"),
                            latex: this._varsMap["y"],
                            hidden: true
                        }
                    ]
                }];



            return values;
        }

        /****************************************/

        protected createParameters(result: ParameterViewModel[]): boolean {
            result.push(apply(new ParameterViewModel({ value: this.offsetX, name: "Transla" }), p => {
                p.max(this.values.length);
                p.min(-this.values.length);
                p.step(1);
            }));
            return true;
        }

        /****************************************/

        protected updateGraphWork() {
            this._graphCtx.updateTable(this.getGraphId("table"), this.values);
        }

        /****************************************/

        protected onGraphChanged() {
            const item = this._graphCtx.calculator.expressionAnalysis[this.getGraphId("offset")];
            if (item && item.evaluation)
                this.offsetX(item.evaluation.value);
        }

        /****************************************/

        protected onSelected() {
            this._graphCtx.expressionZoomFit(this.getGraphId("table"));
        }

        /****************************************/

        protected updateColor() {
            this._graphCtx.setColor(this.getGraphId("offset-x-serie"), this.color());
        }     

        /****************************************/

        attachGraph(ctx: GraphContext) {
            super.attachGraph(ctx);

            this.offsetX.subscribe(value =>
                this._graphCtx.updateVariable(this.getGraphId("offset"), this._varsMap["ofs"], value));
        }

        /****************************************/

        protected setChildrenStateWork(state: IStudioSerieState) {
            if (state.children != undefined) {

                this.children.foreach(a => a.remove());

                state.children.forEach(a => {
                    const reg = this.addRegression(null, false);
                    reg.setState(a);
                });
            }
        }

        /****************************************/

        protected setStateWork(state: IStudioSerieState) {

            if (state.offsetX != undefined)
                this.offsetX(state.offsetX);

            if (state.source)
                this.source = state.source;

            if (state.values != undefined)
                this.values = state.values;
        }

        /****************************************/

        getState(): IStudioSerieState {
            const state = super.getState();
            state.offsetX = this.offsetX();
            state.source = this.source;
            state.values = this.values;
            state.children = this.children.select(a => a.getState()).toArray();
            return state;
        }

        /****************************************/

        addRegression(configOrState?: IStudioRegressionState | StudioSerieRegression, updateGraph = true): StudioSerieRegression {
            return this.addChildrenWork(configOrState instanceof StudioSerieRegression ? configOrState : new StudioSerieRegression(configOrState), updateGraph);
        }


        /****************************************/

        updateSerie() {
            this.values = this._graphCtx.serieCalculator.getSerie(this.source);
            this._graphCtx.updateTable(this.getGraphId("table"), this.values);
        }

        /****************************************/

        zoom() {
            const minX = linq(this.values).min(a => a.x);
            const minY = linq(this.values).min(a => a.y);
            const maxX = linq(this.values).max(a => a.x);
            const maxY = linq(this.values).max(a => a.y);

            this._graphCtx.calculator.setMathBounds({
                top: maxY + (maxY - minY) * 0.1,
                right: maxX + (maxX - minX) * 0.1,
                bottom: minY - (maxY - minY) * 0.1,
                left: minX - (maxX - minX) * 0.1,
            });
        }

        /****************************************/

        color = ko.observable<string>();
        offsetX = ko.observable<number>(0);
        source: ISerieSource;
        values: IFunctionPoint<number>[];
    }

    /****************************************/
    /* Project
    /****************************************/

    interface IStudioProjectConfig extends IItemConfig {
    }

    interface IStudioProjectState extends IStudioProjectConfig, IItemState {
        children?: IStudioSerieState[];
        time?: number;
    }

    /****************************************/

    class StudioProject extends BaseItem<IStudioProjectState, any, StudioSerie> {

        constructor(config?: IStudioProjectConfig) {

            super();

            this.itemType = "project";
            this.icon = "folder";
            this.optionsTemplateName = "ProjectOptionsTemplate";

            this._varsMap = {
                "time": null
            };

            if (config)
                this.setState(config);
        }

        /****************************************/

        protected getExpressions(): Desmos.Expression[] {

            this._graphCtx.generateVars(this._varsMap);

            const values: Desmos.Expression[] = [
                {
                    type: "folder",
                    id: this.getGraphId("public"),
                    title: this.name(),
                    collapsed: true
                }, {
                    type: "expression",
                    folderId: this.getGraphId("public"),
                    id: this.getGraphId("time"),
                    latex: this._varsMap["time"] + "=" + this.time(),
                    slider: {
                        hardMin: true,
                        hardMax: true,
                        min: "0",
                        max: "100",
                        step: "1"
                    }
                }
            ];

            return values;
        }

        /****************************************/

        protected createParameters(result: ParameterViewModel[]): boolean {
            result.push(apply(new ParameterViewModel({ value: this.time, name: "Giorno" }), p => {
                p.max(100);
                p.min(0);
                p.step(1);
            }));
            return true;
        }

        /****************************************/

        protected setStateWork(state: IStudioProjectState) {
            if (state.time != undefined)
                this.time(state.time);
        }

        /****************************************/

        protected setChildrenStateWork(state: IStudioProjectState) {
            if (state.children != undefined) {

                this.children.foreach(a => a.remove());

                state.children.forEach(a => {
                    const item = this.addSerie(null, false);
                    item.setState(a);
                });
            }
        }

        /****************************************/

        getState(): IStudioProjectState {
            const state = super.getState();
            state.time = this.time();
            state.children = this.children.select(a => a.getState()).toArray();
            return state;
        }

        /****************************************/

        protected onGraphChanged() {
            const item = this._graphCtx.calculator.expressionAnalysis[this.getGraphId("time")];
            if (item)
                this.time(item.evaluation.value);
        }

        /****************************************/

        attachGraph(ctx: GraphContext) {
            super.attachGraph(ctx);

            this.time.subscribe(value =>
                this._graphCtx.updateVariable(this.getGraphId("time"), this._varsMap["time"], this.time()));
        }

        /****************************************/

        addSerie(configOrSerie?: IStudioSerieConfig | StudioSerie, updateGraph = true): StudioSerie {

            return this.addChildrenWork(configOrSerie instanceof StudioSerie ? configOrSerie : new StudioSerie(configOrSerie), updateGraph);
        }

        /****************************************/

        time = ko.observable(0);
    }

    /****************************************/
    /* TreeViewModel
    /****************************************/

    interface ITreeItem {

        attachNode(node: TreeNodeViewModel<ITreeItem>);
        remove(): void;

        name: KnockoutObservable<string>;
        color?: KnockoutObservable<string>;
        readonly itemType: string;
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
        actions = ko.observable<ActionViewModel[]>();
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
        private _graphCtx: GraphContext;

        constructor(model: IStudioViewModel) {

            this._data = model.data;
            this._geo = model.geo;

            this._graphCtx = new GraphContext();
            this._graphCtx.serieCalculator = new IndicatorCalculator(this._data, this._dataSet, this._geo);
            this._graphCtx.calculator = Desmos.GraphingCalculator(document.getElementById("calculator"), {
                //xAxisArrowMode: Desmos.AxisArrowModes.BOTH,
                pasteGraphLink: false,
                pasteTableData: false,
                expressionsCollapsed: true,
                //lockViewport: false,
                restrictedFunctions: true,
                //restrictGridToFirstQuadrant: true,
                //administerSecretFolders: true,
                authorIDE: true,
                advancedStyling: true
            });

            const actions: ActionViewModel[] = [];
            actions.push(apply(new ActionViewModel(), action => {
                action.text = "Nuovo progetto";
                action.icon = "create_new_folder";
                action.execute = () => this.newProject();
            }));
            actions.push(apply(new ActionViewModel(), action => {
                action.text = "Salva";
                action.icon = "save";
                action.execute = () => this.saveState();
            }));
            actions.push(apply(new ActionViewModel(), action => {
                action.text = "Opzioni";
                action.icon = "settings";
                action.execute = () => this.showOptions();
            }));

            const root = new TreeNodeViewModel<any>();
            root.actions(actions);
            this.items.setRoot(root);

            document.body.addEventListener("paste", ev => {
                ev.preventDefault();
                this.onPaste(ev.clipboardData);
            });

            document.body.addEventListener("keydown", ev => {
                this.onKeyDown(ev);
            });

            M.Modal.init(document.getElementById("options"), {
                onCloseEnd: ()=> this.updateOptions()
            });
            

            setTimeout(() => this.init());
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

        showOptions() {
            const bounds = this._graphCtx.calculator.graphpaperBounds;
            this.maxX(Math.round(bounds.mathCoordinates.width));
            this.maxY(Math.round(bounds.mathCoordinates.height));
            const dialog = M.Modal.getInstance(document.getElementById("options"));
            dialog.open();
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

        loadState() {
            const json = localStorage.getItem("studio");
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
            if (ev.keyCode == 46 && (<HTMLElement>ev.target).tagName != "INPUT") {
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
                const text = data.getData("text/plain").toString();
                if (text) {
                    const serie = StudioSerie.fromText(text);
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
                for (let node of this.items.root().nodes())
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

        maxX = ko.observable<number>();

        maxY = ko.observable<number>();
    }
}

