namespace WebApp.GeoPlot {



    /****************************************/

    export class ConstIndicatorFunction<TData> implements IIndicatorFunction<TData> {
        private readonly _value: (value: TData, area?: IGeoArea) => number;

        constructor(value: (value: TData, area?: IGeoArea) => number) {
            this._value = value;
        }

        /****************************************/

        value(main: TData, delta: TData, exMain: TData[], exDelta: TData[], area: IGeoArea): number {
            let result = this._value(main, area);
            if (exMain) {
                for (var i in exMain)
                    result = MathUtils.sumNull(result, -this.value(exMain[i], exDelta[i], null, null, area));
            }
            return result;
        }
    }

    /****************************************/

    export class SimpleIndicatorFunction<TData> implements IIndicatorFunction<TData> {
        private readonly _value: (value: TData, area?: IGeoArea) => number;

        constructor(value: (value: TData, area?: IGeoArea) => number) {
            this._value = value;
        }

        /****************************************/

        value(main: TData, delta: TData, exMain: TData[], exDelta: TData[], area: IGeoArea): number {
            var result = this._value(main, area);
            if (delta)
                result -= this._value(delta, area);
            if (exMain) {
                for (var i in exMain)
                    result -= this.value(exMain[i], exDelta[i], null, null, area);
            }
            return result;
        }
    }

    /****************************************/

    export class CombineIndicatorFunction<TData, TDic extends IDictionary<IIndicatorFunction<TData>>> implements IIndicatorFunction<TData> {

        private readonly _value: (values: DictionaryOf<TDic, number>) => number
        private readonly _indicators: TDic;

        constructor(indicators: TDic, value: (values: DictionaryOf<TDic, number>) => number) {
            this._value = value;
            this._indicators = indicators;
        }

        /****************************************/

        value(main: TData, delta: TData, exMain: TData[], exDelta: TData[], area: IGeoArea): number {

            const value: DictionaryOf<TDic, number> = <any>{};
            
            for (var key in this._indicators) 
                value[key] = this._indicators[key].value(main, delta, exMain, exDelta, area);

            return this._value(value);
        }
    }

    /****************************************/

    export class SimpleFactorFunction<TData> implements IFactorFunction<TData> {
        private readonly _value: (indicator: number, value?: TData, area?: IGeoArea) => number;

        constructor(value: (indicator: number, value?: TData, area?: IGeoArea) => number) {
            this._value = value;
        }

        /****************************************/

        value(main: TData[], delta: TData[], exMain: TData[][], exDelta: TData[][], area: IGeoArea, indicator: IIndicatorFunction<TData>): number {
            let curValue: number;
            for (var i in main) 
                curValue = MathUtils.sumNull(curValue, indicator.value(main[i], delta[i], exMain[i], exDelta[i], area));
            return this._value(curValue, main[0], area);
        }
    }

    /****************************************/

    export class DoubleFactorFunction<TData> implements IFactorFunction<TData> {
        private readonly _value: (indicator: number, factor: number) => number;
        private readonly _factor: IIndicatorFunction<TData>;

        constructor(value: (indicator: number, factor: number) => number, factor: IIndicatorFunction<TData>) {
            this._value = value;
            this._factor = factor;
        }

        /****************************************/

        value(main: TData[], delta: TData[], exMain: TData[][], exDelta: TData[][], area: IGeoArea, indicator: IIndicatorFunction<TData>): number {
            let curValue: number;
            let curFactor: number;
            for (var i in main) {
                curValue = MathUtils.sumNull(curValue, indicator.value(main[i], delta[i], exMain[i], exDelta[i], area));
                curFactor = MathUtils.sumNull(curFactor, this._factor.value(main[i], delta[i], exMain[i], exDelta[i], area));
            }
            return this._value(curValue, curFactor);
        }
    }


    /****************************************/

    interface IComputeIndicatorOptions<TData> {
        dayNumber: number;
        areaOrId: string | IGeoArea;
        indicatorId: keyof TData | string;
        isDayDelta?: boolean;
        execludedAreas?: string[];
    }

    interface IComputeFactorOptions<TData> {
        factorId: string;
        indicatorId: string;
        dayNumberOrGroup: number | number[];
        areaOrId: string | IGeoArea;
        isDayDelta?: boolean;
        execludedAreas?: string[];
    }


    export class IndicatorCalculator<TData> {

        constructor(data: RangeDayAreaDataSet<TData>, dataSet: IDataSet<TData>, geo: IGeoAreaSet) {
            this.data = data;
            this.dataSet = dataSet;
            this.geo = geo;
        }

        /****************************************/

        getDataAtDay(number: number, curAreaId: string) : TData {
            if (number < 0)
                return undefined;
            const day = this.data.get(number);
            if (day) {
                const data = day.values[curAreaId]
                if (data)
                    return data;
            }
            return this.dataSet.empty;
        }

        /****************************************/

        getFactorValue(options: IComputeFactorOptions<TData>) {

            const areaId = (typeof options.areaOrId == "string" ? options.areaOrId : options.areaOrId.id).toLowerCase();

            let dayGroup: number[];
            if (!Array.isArray(options.dayNumberOrGroup))
                dayGroup = [options.dayNumberOrGroup];
            else
                dayGroup = options.dayNumberOrGroup;

            let main: TData[] = [];
            let delta: TData[] = [];
            let exMain: TData[][] = [];
            let exDelta: TData[][] = [];

            for (var dayNumber of dayGroup) {

                main.push(this.getDataAtDay(dayNumber, areaId));

                if (options.isDayDelta)
                    delta.push(this.getDataAtDay(dayNumber - 1, areaId));

                if (options.execludedAreas) {
                    var curExMain = [];
                    var curExDelta = [];
                    for (var exAreaId of options.execludedAreas) {
                        curExMain.push(this.getDataAtDay(dayNumber, exAreaId.toLowerCase()));
                        if (options.isDayDelta)
                            curExDelta.push(this.getDataAtDay(dayNumber - 1, exAreaId.toLowerCase()));
                    }
                    exMain.push(curExMain)
                    exDelta.push(curExDelta)
                }
            }

            const factor = linq(this.dataSet.factors).first(a => a.id == options.factorId);
            const indicator = linq(this.dataSet.indicators).first(a => a.id == options.indicatorId);

            return factor.compute.value(main, delta, exMain, exDelta, this.geo.areas[areaId], indicator.compute);
        }

        /****************************************/

        getIndicatorValue(options: IComputeIndicatorOptions<TData>) {

            const areaId = (typeof options.areaOrId == "string" ? options.areaOrId : options.areaOrId.id).toLowerCase();

            const indicator = linq(this.dataSet.indicators).first(a => a.id == options.indicatorId);

            let main = this.getDataAtDay(options.dayNumber, areaId);
            let delta: TData;
            let exMain: TData[];
            let exDelta: TData[];

            if (options.isDayDelta)
                delta = this.getDataAtDay(options.dayNumber - 1, areaId);

            if (options.execludedAreas) {
                exMain = [];
                exDelta = [];
                for (var exAreaId of options.execludedAreas) {
                    exMain.push(this.getDataAtDay(options.dayNumber, exAreaId.toLowerCase()));
                    if (options.isDayDelta)
                        exDelta.push(this.getDataAtDay(options.dayNumber - 1, exAreaId.toLowerCase()));
                };
            }

            return indicator.compute.value(main, delta, exMain, exDelta, this.geo.areas[areaId]);
        }

        /****************************************/

        getSerie<TX extends Date|number>(source: IDayAreaSerieSource) : IFunctionPoint[] {

            const result: IFunctionPoint[] = [];

            if (source.groupSize > 1) {

                let count = source.groupSize;
                let group: number[] = [];
                this.data.days.skip(source.startDay).foreach((day, i) => {
                    group.push(i);
                    count--;
                    if (count == 0) {
                        const item: IFunctionPoint = {
                            x: <any>(source.xAxis == "date" ? new Date(day.date) : i),
                            y: this.getFactorValue({
                                dayNumberOrGroup: source.isDelta ? group : i,
                                areaOrId: source.areaId,
                                factorId: source.factorId,
                                indicatorId: source.indicatorId,
                                execludedAreas: source.exeludedAreaIds,
                                isDayDelta: source.isDelta
                            })
                        };
                        result.push(<any>item);
                        count = source.groupSize;
                        group = [];
                    }
                });
            }
            else {
                this.data.days.skip(source.startDay).foreach((day, i) => {

                    const item: Chart.ChartPoint = {
                        x: source.xAxis == "date" ? new Date(day.date) : i,
                        y: this.getFactorValue({
                            dayNumberOrGroup: i,
                            areaOrId: source.areaId,
                            factorId: source.factorId,
                            indicatorId: source.indicatorId,
                            execludedAreas: source.exeludedAreaIds,
                            isDayDelta: source.isDelta
                        })
                    };
                    result.push(<any>item);
                });
            }

            return result;
        }
        data: RangeDayAreaDataSet<TData>;
        dataSet: IDataSet<TData>;
        geo: IGeoAreaSet;
    }

}


