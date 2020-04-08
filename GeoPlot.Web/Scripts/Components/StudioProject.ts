namespace WebApp.GeoPlot {

    type AggregateMode = "none" | "sum" | "avg";

    export interface IStudioProjectConfig extends IStudioItemConfig {
        aggregationMode?: AggregateMode;
        children?: IStudioSerieState[];
    }

    /****************************************/

    export interface IStudioProjectState extends IStudioProjectConfig, IStudioItemState {
        time?: number;
    }

    /****************************************/

    export class StudioProject extends BaseStudioItem<IStudioProjectState, any, StudioSerie> {

        constructor(config?: IStudioProjectConfig) {

            super();

            this.itemType = "project";
            this.icon = "folder";
            this.optionsTemplateName = "ProjectOptionsTemplate";

            this.aggregationModes = [
                {
                    text: $string("$(none)"),
                    value: "none"
                },
                {
                    text: $string("$(sum)"),
                    value: "sum"
                },
                {
                    text: $string("$(average)"),
                    value: "avg",
                }
            ];

            this._varsMap = {
                "time": null,
                "xagg": null,
                "yagg": null
            };

            if (config)
                this.setState(config);
        }

        /****************************************/

        createActions(result: ActionView[]) {

            super.createActions(result);

            result.push(apply(new ActionView(), action => {
                action.text = $string("$(update-all-proj)");
                action.icon = "autorenew";
                action.execute = () => this.updateAllSerie();
            }));
        }

        /****************************************/

        async updateAllSerie() {

            for (let item of this.children)
                await item.updateSerie();
        }

        /****************************************/

        canAccept(value: object): boolean {
            return (value instanceof StudioSerie);
        }

        /****************************************/

        canReadData(transfer: DataTransfer): boolean {
            return transfer.types.indexOf("application/json+studio") != -1;
        }

        /****************************************/

        readData(transfer: DataTransfer) {

            const textData = transfer.getData("application/json+studio");
            let serie = StudioSerie.fromText(textData);
            if (serie) {
                this.addSerie(serie);
                this.node.isExpanded(true);
            }
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
                },
                {
                    type: "folder",
                    id: this.getGraphId("private"),
                    title: this.name(),
                    secret: true,
                    collapsed: true
                },
                {
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
                },
                {
                    type: "table",
                    id: this.getGraphId("aggregate"),
                    folderId: this.getGraphId("private"),
                    columns: [
                        {
                            id: this.getGraphId("table/xagg"),
                            latex: this._varsMap["xagg"],
                        },
                        {
                            id: this.getGraphId("table/yagg"),
                            latex: this._varsMap["yagg"],
                            lines: true,
                            points: true
                            //hidden: this.aggregationMode() == "none"
                        }
                    ]
                }
            ];

            return values;
        }

        /****************************************/

        updateAggregate() {

            const values: { [key: number]: number } = {};

            const children = this.children.toArray();

            for (var child of children) {
                const ofs = parseInt(<any>child.offsetX());
                for (var item of child.values) {
                    const xReal = item.x + ofs;
                    if (!(xReal in values))
                        values[xReal] = item.y;
                    else
                        values[xReal] += item.y;
                }
            }

            const funValues = linq(values).orderBy(a => a.key).select(a => (<IFunctionPoint>{ x: <any>a.key, y: a.value })).toArray();
            this._graphCtx.updateTable(this.getGraphId("aggregate"), funValues);

        }

        /****************************************/

        protected updateColor() {
            this._graphCtx.setColor(this.getGraphId("aggregate"), this.color());
        }

        /****************************************/

        get mainExpression() {
            return this.getGraphId("aggregate");
        }

        /****************************************/

        protected createParameters(result: ParameterViewModel[]): boolean {
            result.push(apply(new ParameterViewModel({ value: this.time, name: $string("$(day)") }), p => {
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
            if (state.aggregationMode)
                this.aggregationMode(state.aggregationMode);
            else
                this.aggregationMode("none");
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
            if (this.aggregationMode() != "none")
                this.updateAggregate();
        }

        /****************************************/

        getState(): IStudioProjectState {
            const state = super.getState();
            state.time = this.time();
            state.children = this.children.select(a => a.getState()).toArray();
            state.aggregationMode = this.aggregationMode();
            return state;
        }

        /****************************************/

        protected onGraphChanged() {
            /*
            const item = this._graphCtx.calculator.expressionAnalysis[this.getGraphId("time")];
            if (item)
                this.time(item.evaluation.value);*/
        }

        /****************************************/

        attachGraph(ctx: GraphContext) {
            super.attachGraph(ctx);

            this.time.subscribe(value =>
                this._graphCtx.updateVariable(this.getGraphId("time"), this._varsMap["time"], this.time()));

            this.aggregationMode.subscribe(a => this.updateAggregate());
        }

        /****************************************/

        addSerie(configOrSerie?: IStudioSerieConfig | StudioSerie, updateGraph = true): StudioSerie {
             return this.addChildrenWork(configOrSerie instanceof StudioSerie ? configOrSerie : new StudioSerie(configOrSerie), updateGraph);
        }

        /****************************************/

        time = ko.observable(0);
        aggregationMode = ko.observable<AggregateMode>("none");
        aggregationModes: ITextValue<AggregateMode>[];
    }
}