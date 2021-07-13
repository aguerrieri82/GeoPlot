import { IDataImportSerieSource } from "./Components/DataImport";
import { ViewMode } from "./Data/ViewModes";
import { IPoly2D, IRect2D, LinearGradient } from "./Framework/Graphics";
import { IDictionary } from "./WebApp";

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

export interface IDayAreaDataSet<TData> {
    days: IDayAreaGroupItem<TData>[];
}

export enum GeoAreaType {
    Continent = 0,
    CountryGroup = 1,
    Country = 2,
    State = 3,
    Region = 4,
    District = 5,
    Municipality = 6
}

export enum Gender {
    All,
    Male,
    Female
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
    id: keyof TData | string;
    name: string;
    description?: string;
    validFor?: ViewMode[];
    colorLight?: string;
    colorDark?: string;
    gradient?: LinearGradient;
    canBeNegative?: boolean;
    showInFavorites?: boolean;
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

/****************************************/

export interface IDataSet<TData> {
    name: string;
    empty: TData;
    indicators: IIndicator<TData>[];
    factors: IFactor<TData>[];
}

/****************************************/

export type SerieSource = IDayAreaSerieSource | IDataImportSerieSource;

/****************************************/

export interface IDayAreaSerieSource {
    type: "geoplot";
    areaId: string;
    exeludedAreaIds?: string[];
    indicatorId: string;
    factorId?: string;
    groupSize?: number;
    startDay?: number;
    endDay?: number;
    isDelta?: boolean;
    xAxis: "dayNumber" | "date";
    range?: {
        start: number,
        end: number
    };

}

/****************************************/

export interface IFunctionPoint {
    x: number | Date;
    y: number;
    xLabel?: string;
}

/****************************************/

export interface IApiResult<T> {
    error: string;
    data: T;
    isSuccess: boolean;
}

/****************************************/

export interface ITextValue<TValue> {
    text: string;
    value: TValue;
}

/****************************************/

export const MATERIAL_COLORS = {
    "red": { "600": "#f44336" },
    "pink": { "600": "#e91e63" },
    "purple": { "600": "#9c27b0" },
    "deep_purple": { "600": "#673ab7" },
    "indigo": { "600": "#3f51b5" },
    "blue": { "600": "#2196f3" },
    "light_blue": { "600": "#03a9f4" },
    "cyan": { "600": "#00bcd4" },
    "teal": { "600": "#009688" },
    "green": { "600": "#4caf50" },
    "light_green": { "600": "#8bc34a" },
    "lime": { "600": "#cddc39" },
    "yellow": { "600": "#ffeb3b" },
    "amber": { "600": "#ffc107" },
    "orange": { "600": "#ff9800" },
    "depp_orange": { "600": "#ff5722" },
    "brown": { "600": "#795548" },
    "grey": { "600": "#9e9e9e" },
    "blue_gray": { "600": "#607d8b" },
};


declare function gtag(...args: any);