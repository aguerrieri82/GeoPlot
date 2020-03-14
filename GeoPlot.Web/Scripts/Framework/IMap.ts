namespace GeoPlot {

    export interface IMap<TKey, TValue> {
        (arg: TKey): TValue;
    }
}

