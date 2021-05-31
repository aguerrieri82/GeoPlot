namespace WebApp.GeoPlot {

    interface IFunction {

    }

    /****************************************/

    interface IDiscreteFunction extends IFunction {
        readonly values: IFunctionPoint[];
    }

    /****************************************/

    export interface IStudioSerieConfig extends IStudioItemConfig {
        source?: SerieSource;
        values?: IFunctionPoint[];
        offsetX?: number;
        children?: IStudioRegressionConfig[];
    }

    /****************************************/

    export interface IStudioSerieState extends IStudioSerieConfig, IStudioItemState {
    }

    /****************************************/

    export class StudioSerie extends BaseStudioItem<IStudioSerieState, StudioProject, StudioSerieRegression> implements IDiscreteFunction {

        constructor(config?: IStudioSerieConfig) {
            super();

            this.canDrag = true;
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

        importValues(points: IDaSeriePoint[]) {

            if (points && points.length > 0) {

                if (points[0].x instanceof Date) {
                    const startDate = <Date>points[0].x;
                    this.values = linq(points).select(a => (<IFunctionPoint>{
                        x: Math.round(DateUtils.diff(a.x, startDate).totalDays),
                        xLabel: a.x,
                        y: a.y
                    })).toArray();
                }

                else if (isNaN(points[0].x)) {
                    this.values = linq(points).select((a, i) => (<IFunctionPoint>{
                        x: i,
                        xLabel: a.x,
                        y: a.y
                    })).toArray();
                    return;
                }
                else
                    this.values = points;
            }
            else
                this.values = [];

            this.onSerieChanged();
        }


        /****************************************/

        writeData(transfer: DataTransfer): boolean {
            var data: StudioData = {
                version: 1,
                type: "serieState",
                state: this.getState()
            };
            transfer.setData("application/json+studio", JSON.stringify(data));
            transfer.setData("text/html+id", this.node.element.id);
            return true;
        }

        /****************************************/

        protected createActions(result: ActionView[]) {

            super.createActions(result);

            result.push(apply(new ActionView(), action => {
                action.text = $string("$(update)");
                action.icon = "autorenew";
                action.execute = () => this.updateSerie();
            }));

            result.push(apply(new ActionView(), action => {
                action.text = $string("$(new-regression)");
                action.icon = "add_box";
                action.execute = () => {
                    const reg = this.addRegression(null, false);
                    reg.updateGraph();
                    this.node.isExpanded(true);
                    reg.node.isSelected(true);
                }
            }));

            result.push(apply(new ActionView(), action => {
                action.text = $string("$(zoom)");
                action.icon = "zoom_in";
                action.execute = () => this.zoom();

            }));

            result.push(apply(new ActionView(), action => {
                action.text = $string("$(align-with-this)");
                action.icon = "compare_arrows";
                action.execute = () => {
                    let answer = prompt($string("$(tollerance)"), "10");
                    this.alignOthers(isNaN(<any>answer) ? 10 : parseInt(answer));
                };
            }));
        }

        /****************************************/

        static fromText(text: string): StudioSerie {
            try {
                const obj = <StudioData>JSON.parse(text);
                if (obj) {

                    if (obj.type == "serie")
                        return new StudioSerie({
                            name: obj.title,
                            values: obj.values,
                            source: obj.serie,
                            color: obj.color
                        });

                    if (obj.type == "serieState")
                        return new StudioSerie(obj.state);
                }
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

        alignOthers(tollerance: number, ...series: StudioSerie[]) {
            if (!series || series.length == 0)
                series = this.parent.children.where(a => a != this).toArray();
            for (let serie of series)
                serie.alignWith(this, tollerance);
        }

        /****************************************/

        alignWith(other: StudioSerie, tollerance: number) {

            let minOfs = 0;
            let minValue = Number.NEGATIVE_INFINITY;
            for (let ofs = -this.values.length; ofs < this.values.length; ofs++) {

                let value = 0;
                for (let i = 0; i < this.values.length; i++) {
                    const ofsX = i - ofs;

                    if (ofsX < 0 || ofsX >= this.values.length)
                        continue;

                    if (i >= other.values.length)
                        continue;

                    if (Math.abs(this.values[ofsX].y - other.values[i].y) < tollerance)
                        value++;
                }
                if (value > minValue) {
                    minValue = value;
                    minOfs = ofs;
                }
            }

            other.offsetX(0);
            this.offsetX(minOfs);
        }

        /****************************************/

        get mainExpression(): string {
            return this.getGraphId("offset-x-serie");
        }

        /****************************************/

        protected createParameters(result: ParameterViewModel[]): boolean {
            result.push(apply(new ParameterViewModel({ value: this.offsetX, name: $string("$(shift)") }), p => {
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
            /*
            const item = this._graphCtx.calculator.expressionAnalysis[this.getGraphId("offset")];
            if (item && item.evaluation)
                this.offsetX(item.evaluation.value);*/
        }

        /****************************************/

        protected onSelected() {
            super.onSelected();
            //this._graphCtx.expressionZoomFit(this.getGraphId("table"));
        }

        /****************************************/

        protected updateColor() {
            this._graphCtx.setColor(this.getGraphId("offset-x-serie"), this.color());
            this.children.foreach(a => a.onParentChanged());
        }

        /****************************************/

        attachGraph(ctx: GraphContext) {
            super.attachGraph(ctx);

            this.offsetX.subscribe(value => {
                this._graphCtx.updateVariable(this.getGraphId("offset"), this._varsMap["ofs"], value);
                this.onSerieChanged();
            });
        }

        /****************************************/

        protected onSerieChanged() {
            if (this._isUpdating == 0)
                this.parent.updateAggregate();
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
                this.source = this.upgradeSource(state.source);

            if (state.values != undefined)
                this.importValues(state.values);
        }

        /****************************************/

        protected upgradeSource(source: SerieSource): SerieSource{

            if (!source.type)
                source.type = "geoplot";

            if (source.type == "geoplot") {
                
                source.areaId = this.upgradeAreaId(source.areaId);
                if (source.exeludedAreaIds)
                    for (let i = 0; i < source.exeludedAreaIds.length; i++) 
                        source.exeludedAreaIds[i] = this.upgradeAreaId(source.exeludedAreaIds[i]);
                    
            }
            return source;
        }

        /****************************************/

        protected upgradeAreaId(id: string): string {

            if (id) {
                if (id.startsWith("R") && id.length == 2)
                    return "R0" + id.substring(1);
                if (id.startsWith("D") && id.length == 2)
                    return "D00" + id.substring(1);
                if (id.startsWith("D") && id.length == 3)
                    return "D0" + id.substring(1);
            }

            return id;
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

        async changeColor() {

            const color = await ColorPicker.instance.pick();
            if (color)
                this.color(color);
        }

        /****************************************/

        async updateSerie() {

            if (this.source.type == "geoplot" || !this.source.type) {

                if (!this._graphCtx.serieCalculator) {
                    M.toast({ html: $string("$(msg-downloading-data)") })
                    const model = await Api.loadStudioData();
                    this._graphCtx.serieCalculator = new IndicatorCalculator(new RangeDayAreaDataSet( model.data), InfectionDataSet, model.geo);
                }

                const daySource = this.source as IDayAreaSerieSource;

                if (daySource.range) {
                    this._graphCtx.serieCalculator.data.startDay = daySource.range.start;
                    this._graphCtx.serieCalculator.data.endDay = daySource.range.end;
                }
                else {
                    this._graphCtx.serieCalculator.data.startDay = undefined;
                    this._graphCtx.serieCalculator.data.endDay = undefined;
                }

                this.importValues(this._graphCtx.serieCalculator.getSerie(daySource));

                this._graphCtx.updateTable(this.getGraphId("table"), this.values);
                this.children.foreach(a => a.onParentChanged());

                this.onSerieChanged();

                M.toast({ html: $string("$(msg-update-complete)") })
            }
            else
                M.toast({ html: $string("$(msg-update-not-supported)") })

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
        source: SerieSource;
        values: IFunctionPoint[] = [];
    }
}