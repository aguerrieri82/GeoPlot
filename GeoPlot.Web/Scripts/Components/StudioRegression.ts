namespace WebApp.GeoPlot {

    export type RegressionFunctionType = "linear" | "exponential" | "normal" | "log-normal";

    function toSafeString(value: any): string {
        if (value == null || value == undefined)
            return undefined;
        return value.toString();
    }

    /****************************************/
    
    export interface IStudioRegressionConfig extends IStudioItemConfig {
        function?: IRegressionFunction;
        showIntegration?: boolean;
    }

    /****************************************/

    export interface IStudioRegressionState extends IStudioRegressionConfig, IStudioItemState {

    }

    /****************************************/

    export interface IRegressionFunctionVar {
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

    export interface IRegressionFunction {
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
        min = ko.observable<number>();
        max = ko.observable<number>();
        step = ko.observable<number>();
    }

    /****************************************/

    export class StudioSerieRegression extends BaseStudioItem<IStudioRegressionState, StudioSerie, any> {

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
                "time": null,
                "tend": null,
                "xp": null
            };

            this.itemType = "regression";
            this.icon = "show_chart";
            this.optionsTemplateName = "RegressionOptionsTemplate";

            this.functions = [];

            this.addFunction({
                name: $string("$(log-normal)"),
                type: "log-normal",
                value: "$y\\sim $c\\cdot\\frac{ e^ {-\\frac{ \\left(\\ln\\ \\left($x - $a\\right) \\ -$u\\right)^ { 2}} { 2$o^ { 2} }}}{ \\left($x - $a\\right) \\sqrt{ 2\\pi } $o }",
                vars: [{
                    name: "a",
                    label: $string("$(offset)"),
                    autoCompute: true,
                    precision: 0
                },
                {
                    name: "c",
                    label: $string("$(total)"),
                    autoCompute: true,
                    precision: 0
                },
                {
                    name: "o",
                    label: $string("$(variance)"),
                    autoCompute: true,
                    precision: 5
                },
                {
                    name: "u",
                    label: $string("$(average)"),
                    autoCompute: true,
                    precision: 5
                }]
            });

            this.addFunction({
                name: $string("$(normal)"),
                type: "normal",
                value: "$y\\sim $c\\cdot\\ \\left(\\frac{1}{\\sqrt{2\\cdot\\pi}\\cdot $o}\\right)\\cdot e^{-\\frac{1}{2}\\cdot\\left(\\frac{\\left($x-$u\\right)}{$o}\\right)^{2}}",
                vars: [
                    {
                        name: "c",
                        label: $string("$(total)"),
                        autoCompute: true,
                        precision: 0
                    },
                    {
                        name: "o",
                        label: $string("$(variance)"),
                        autoCompute: true,
                        precision: 5
                    },
                    {
                        name: "u",
                        label: $string("$(avg-peak)"),
                        autoCompute: true,
                        precision: 0
                    }]
            });

            this.addFunction({
                name: $string("$(exponential)"),
                type: "exponential",
                value: "$y\\sim $a^{\\left($x-$b\\right)}",
                vars: [
                    {
                        name: "a",
                        label: $string("$(base)"),
                        autoCompute: true,
                        precision: 5
                    },
                    {
                        name: "b",
                        label: $string("$(offset)"),
                        autoCompute: true,
                        precision: 5
                    }]
            });

            this.addFunction({
                name: $string("$(linear)"),
                type: "linear",
                value: "$y\\sim $a+$m$x",
                vars: [
                    {
                        name: "a",
                        label: $string("$(offset)"),
                        autoCompute: true,
                        precision: 5
                    },
                    {
                        name: "m",
                        label: $string("$(slope)"),
                        autoCompute: true,
                        precision: 5
                    }]
            });

            this.showIntegration.subscribe(() => {
                this._graphCtx.setItemVisibile(this.getGraphId("sum-serie"), this.isFullVisible() && this.showIntegration());
                this._graphCtx.setItemVisibile(this.getGraphId("sum-point"), this.isFullVisible() && this.showIntegration());

            });

            this.selectedFunction.subscribe(a => {
                if (!this.name() && a)
                    return this.name(a.value.name);

            });

            this.endDay.subscribe(a => this.updateEndDay());
            this.maxDay.subscribe(a => this.updateEndDay());

            this.selectedFunction(this.functions[0]);

            if (config)
                this.setState(config);
        }

        /****************************************/

        get mainExpression(): string {
            return this.getGraphId("main-func");
        }

        /****************************************/

        protected addFunction(value: IRegressionFunction): RegressionFunctionViewModel {
            const model = new RegressionFunctionViewModel();
            model.value = value;
            model.select = () => {
                this.selectedFunction(model);
                this.name(model.value.name);
                this.updateGraph()
            };

            const vars: RegressionFunctionVarViewModel[] = [];
            for (let item of value.vars) {
                const vModel = new RegressionFunctionVarViewModel();
                vModel.value = item;

                vModel.curValue(item.value);
                vModel.autoCompute(item.autoCompute);
                vModel.min(item.minValue);
                vModel.max(item.maxValue);
                vModel.step(item.step);

                vModel.min.subscribe(a => item.minValue = a);
                vModel.max.subscribe(a => item.maxValue = a);
                vModel.step.subscribe(a => item.step = a);
                vModel.curValue.subscribe(a => item.value = a);
                vModel.autoCompute.subscribe(a => {
                    item.autoCompute = a;
                    this.updateGraph();
                });

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
            /*
            const item = this._graphCtx.calculator.expressionAnalysis[this.getGraphId("end-day")];
            if (item && item.evaluation)
                this.endDay(item.evaluation.value);*/

            this.updateRegressionVars();
        }

        /****************************************/

        protected updateRegressionVars() {
            let model = this._graphCtx.calculator.controller.getItemModel(this.getGraphId("main"));
            if (model && model.regressionParameters) {
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
            result.push(apply(new ParameterViewModel({ value: this.endDay, name: $string("$(reg-days)") }), p => {
                p.max = this.maxDay;
                p.min(0);
                p.step(1);
            }));
            return true;
        }

        /****************************************/

        protected setStateWork(state: IStudioRegressionState) {
            if (state.function) {
                const func = linq(this.functions).first(a => a.value.type == state.function.type);
                if (func) {
                    for (let item of state.function.vars) {
                        const funcVar = linq(func.vars()).first(a => a.value.name == item.name);
                        if (funcVar) {
                            funcVar.autoCompute(item.autoCompute);
                            funcVar.max(item.maxValue);
                            funcVar.min(item.minValue);
                            funcVar.step(item.step);
                            funcVar.curValue(item.value);
                        }
                    }
                    this.selectedFunction(func);
                }
            }
            if (state.showIntegration != undefined)
                this.showIntegration(state.showIntegration);
        }

        /****************************************/

        getState(): IStudioRegressionState {
            const state = super.getState();
            state.function = this.selectedFunction().value;
            state.showIntegration = this.showIntegration();

            for (let item of this.selectedFunction().vars()) {
                item.value.value = item.curValue();
                item.value.maxValue = item.max();
                item.value.minValue = item.min();
                item.value.step = item.step();
                item.value.autoCompute = item.autoCompute();
            }
            return state;
        }

        /****************************************/

        onParentChanged() {
            super.onParentChanged();
            this.color(this.parent.color());
            this.maxDay(linq(this.parent.values).max(a => a.x));
            if (this.endDay() == undefined)
                this.endDay(this.maxDay());
        }

        /****************************************/

        protected updateEndDay() {
            if (!this._varsMap["tend"])
                return;
            this._graphCtx.updateExpression({
                type: "expression",
                id: this.getGraphId("end-day"),
                latex: this._varsMap["tend"] + "=" + this.endDay(),
                slider: {
                    min: "0",
                    step: "1",
                    max: (this.maxDay()).toString(),
                }
            });
        }

        /****************************************/

        protected updateColor() {
            this._graphCtx.setColor(this.getGraphId("main-func"), this.color());
            this._graphCtx.setColor(this.getGraphId("sum-serie"), this.color());
            this._graphCtx.setColor(this.getGraphId("sum-point"), this.color());
            this._graphCtx.setColor(this.getGraphId("end-day-line"), this.color());

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

            this._varsMap["x"] = "";
            this._varsMap["y"] = this.parent.getVar("y");
            this._varsMap["time"] = this.parent.parent.getVar("time");

            for (let item of func.vars) {
                if (!this._varsMap[item.name])
                    this._varsMap[item.name] = null;
            }

            this._graphCtx.generateVars(this._varsMap);
            this._varsMap["x"] = this.getVar("xp");

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
                latex: this.replaceVars(func.value.replace("$y\\sim ", "$fun\\left(x\\right)=").replace(/\$x/g, "x")),
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
                hidden: !this.showIntegration(),
                lineStyle: Desmos.Styles.SOLID,
                pointStyle: "NONE",
                points: false
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
                hidden: !this.showIntegration(),
                latex: this.replaceVars("\\left($time,$value\\right)"),
                color: this.parent.color(),
                label: this.parent.name(),
                dragMode: "XY",
                showLabel: true
            });

            values.push({
                type: "expression",
                id: this.getGraphId("end-day"),
                latex: this._varsMap["tend"] + "=" + this.endDay(),
                folderId: this.getGraphId("public"),
                label: "Giorni Previsione",
                slider: {
                    min: (0).toString(),
                    max: (this.maxDay()).toString(),
                    hardMax: true,
                    hardMin: true,
                    step: "1"
                }
            });

            values.push({
                type: "expression",
                id: this.getGraphId("end-day-line"),
                color: this.color(),
                latex: "x=" + this._varsMap["tend"],
                folderId: this.getGraphId("private"),
                lines: true
            });

            values.push({
                type: "expression",
                id: this.getGraphId("end-day-serie"),
                latex: this.replaceVars("$xp=[0,...,$tend]+" + this.parent.getVar("ofs")),
                folderId: this.getGraphId("private"),
                hidden: true
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
        showIntegration = ko.observable<boolean>(true);
        maxDay = ko.observable<number>();
        endDay = ko.observable<number>();
    }
}