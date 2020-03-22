namespace WebApp {

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

}


