namespace WebApp {

    export enum AggregationFunc {
        SUm,
        Avg
    }

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

    export enum GeoAreaType {
        Country,
        State,
        Region,
        District
    }

    export interface IAggregateDemography {
        total: number;
        male?: number;
        female?: number;
        over65?: number;
    }

    export interface IGeoArea {
        id: string;
        name: string;
        demography: IAggregateDemography;
        surface: number;
        type: GeoAreaType;
        geography: IPoly2D[];
        parentId: string;
    }

    export interface IGeoAreaSet {
        viewBox: IRect2D;
        areas: IDictionary<IGeoArea>;
    }

    /****************************************/

    export interface IIndicatorFunction<TData> {
        value(main: TData, delta: TData, exMain: TData[], exDelta: TData[], area: IGeoArea): number;
    }

    export interface IFactorFunction<TData> {
        value(main: TData[], delta: TData[], exMain: TData[][], exDelta: TData[][], area: IGeoArea, indicator: IIndicatorFunction<TData>): number;
    }

    /****************************************/

    export interface IIndicator<TData> {
        id: keyof TData|string;
        name: string;
        validFor?: ViewMode[];
        colorLight?: string;
        colorDark?: string;
        compute: IIndicatorFunction<TData>;
    }

    export interface IFactor<TData> {
        id: string;
        name: string;
        validFor?: ViewMode[];
        compute: IFactorFunction<TData>;
        format: (value: number) => string,
        reference: (value: TData, area: IGeoArea) => any;
        description: string;
    }

    export interface IDataSet<TData> {
        name: string;
        indicators: IIndicator<TData>[];
        factors: IFactor<TData>[];
    }

    /****************************************/

    export interface IStudioData {
        version: number;
    }

    export interface IStudioData {
        type: "serie";
        serie: ISerieSource;
        title: string;
        values?: IFunctionPoint<number>[];
        color?: string;
    }

    /****************************************/

    export interface ISerieSource {
        areaId: string;
        exeludedAreaIds?: string[];
        indicatorId: string;
        factorId?: string;
        groupSize?: number;
        startDay?: number;
        endDay?: number;
        isDelta?: boolean;
        xAxis: "dayNumber" | "date";

    }

    /****************************************/

    export interface IFunctionPoint<TX extends Date|number> {
        x: TX;
        y: number;
    }
}


