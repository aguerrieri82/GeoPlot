namespace WebApp.GeoPlot {

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
                    result -= this.value(exMain[i], exDelta[i], null, null, area);
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
            let curValue = 0;
            for (var i in main) 
                curValue += indicator.value(main[i], delta[i], exMain[i], exDelta[i], area);
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
            let curValue = 0;
            let curFactor = 0;
            for (var i in main) {
                curValue += indicator.value(main[i], delta[i], exMain[i], exDelta[i], area);
                curFactor += this._factor.value(main[i], delta[i], exMain[i], exDelta[i], area);
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

        private readonly _data: IDayAreaDataSet<TData>;
        private readonly _dataSet: IDataSet<TData>;
        private readonly _geo: IGeoAreaSet;

        constructor(data: IDayAreaDataSet<TData>, dataSet: IDataSet<TData>, geo: IGeoAreaSet) {
            this._data = data;
            this._dataSet = dataSet;
            this._geo = geo;
        }

        /****************************************/

        getFactorValue(options: IComputeFactorOptions<TData>) {

            const areaId = (typeof options.areaOrId == "string" ? options.areaOrId : options.areaOrId.id).toLowerCase();

            const dataAtDay = (number: number, curAreaId: string) =>
                number < 0 ? undefined : this._data.days[number].values[curAreaId];

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

                main.push(dataAtDay(dayNumber, areaId));

                if (options.isDayDelta)
                    delta.push(dataAtDay(dayNumber - 1, areaId));

                if (options.execludedAreas) {
                    var curExMain = [];
                    var curExDelta = [];
                    for (var exAreaId of options.execludedAreas) {
                        curExMain.push(dataAtDay(dayNumber, exAreaId.toLowerCase()));
                        if (options.isDayDelta)
                            curExDelta.push(dataAtDay(dayNumber - 1, exAreaId.toLowerCase()));
                    }
                    exMain.push(curExMain)
                    exDelta.push(curExDelta)
                }
            }

            const factor = linq(this._dataSet.factors).first(a => a.id == options.factorId);
            const indicator = linq(this._dataSet.indicators).first(a => a.id == options.indicatorId);

            return factor.compute.value(main, delta, exMain, exDelta, this._geo.areas[areaId], indicator.compute);
        }

        /****************************************/

        getIndicatorValue(options: IComputeIndicatorOptions<TData>) {

            const areaId = (typeof options.areaOrId == "string" ? options.areaOrId : options.areaOrId.id).toLowerCase();

            const indicator = linq(this._dataSet.indicators).first(a => a.id == options.indicatorId);

            const dataAtDay = (number: number, curAreaId: string) =>
                number < 0 ? undefined : this._data.days[number].values[curAreaId];


            let main = dataAtDay(options.dayNumber, areaId);
            let delta: TData;
            let exMain: TData[];
            let exDelta: TData[];

            if (options.isDayDelta)
                delta = dataAtDay(options.dayNumber - 1, areaId);

            if (options.execludedAreas) {
                exMain = [];
                exDelta = [];
                for (var exAreaId of options.execludedAreas) {
                    exMain.push(dataAtDay(options.dayNumber, exAreaId.toLowerCase()));
                    if (options.isDayDelta)
                        exDelta.push(dataAtDay(options.dayNumber - 1, exAreaId.toLowerCase()));
                };
            }

            return indicator.compute.value(main, delta, exMain, exDelta, this._geo.areas[areaId]);
        }

        /****************************************/

        getSerie<TX extends Date|number>(source: IDayAreaSerieSource) : IFunctionPoint[] {

            const result: IFunctionPoint[] = [];
            if (source.groupSize > 1) {

                let count = source.groupSize;
                let group: number[] = [];
                for (let i = 0 + source.startDay; i < this._data.days.length; i++) {
                    group.push(i);
                    count--;
                    if (count == 0) {
                        const item: IFunctionPoint = {
                            x: <any>(source.xAxis == "date" ? new Date(this._data.days[i].date) : i),
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
                }
            }
            else {
                for (let i = 0 + source.startDay; i < this._data.days.length; i++) {

                    const item: Chart.ChartPoint = {
                        x: source.xAxis == "date" ? new Date(this._data.days[i].date) : i,
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
                }
            }

            return result;
        }
    }

}


