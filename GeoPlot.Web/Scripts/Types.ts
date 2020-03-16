namespace GeoPlot {

    export interface IGeoPoint {
        lat: number;
        lng: number;
    }

    export interface IDayAreaGroupItem<TValue> {
        date: string;
        values: IDictionary<TValue>;
    }

    export interface IDayAreaDataSet<TData>
    {
        days: IDayAreaGroupItem<TData>[];
    }    

    export interface IInfectionData {
        totalPositive: number;
        currentPositive: number;
        totalDeath: number;
        totalSevere: number;
        totalHospedalized: number;
        totalHealed: number;
        toatlTests: number;
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
        geography: IPoly2D[];
        parentId: string;
    }

    export interface IGeoAreaSet {
        viewBox: IRect2D;
        areas: IDictionary<IGeoArea>;
    }
}

