namespace GeoPlot {

    export interface IKeyValue<TValue> {
        key: string;
        value: TValue;
    }

    export interface IDictionary<TValue> {
        [key: string]: TValue; 
    }
}

