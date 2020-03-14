namespace GeoPlot {

    export interface IGeoPoint {
        lat: number;
        lng: number;
    }

    export interface IDayAreaItem<TValue> {
        data: string;
        values: IDictionary<TValue>;
    }

    export interface IDayAreaDataSet<TData>
    {
        max: TData;
        maxFactor: IDemography;
        days: IDayAreaItem<TData>[];
    }    

    export interface IInfectionData {
        totalPositive: number;
    }

    export enum GeoAreaType {
        Country,
        State,
        Region,
        District
    }

    export interface IDemography {
        total?: number;
        male?: number;
        female?: number;
        old?: number;
    }

    export interface IGeoArea {
        id: string;
        name: string;
        demography: IDemography;
        type: GeoAreaType;
        poly: IPoly2D[];
    }

    export interface IGeoAreaSet {
        viewBox: IRect2D;
        areas: IDictionary<IGeoArea>;
    }
}

