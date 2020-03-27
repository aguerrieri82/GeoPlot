/// <reference path="../indicators.ts" />

namespace WebApp.GeoPlot {

    export interface IInfectionData {
        totalPositive: number;
        currentPositive: number;
        totalDeath: number;
        totalSevere: number;
        totalHospedalized: number;
        totalHealed: number;
        toatlTests: number;
    }

    /****************************************/


    export var InfectionDataSet: IDataSet<IInfectionData> = {

        name: "COVID-19",
        indicators: [
            {
                id: "totalPositive",
                name: $string("$(total-positive)"),
                colorLight: "#f44336",
                colorDark: "#b71c1c",
                compute: new SimpleIndicatorFunction(a => a.totalPositive)
            },
            {
                id: "currentPositive",
                name: $string("$(current-positive)"),
                validFor: ["region", "country"],
                colorLight: "#e91e63",
                colorDark: "#880e4f",
                compute: new SimpleIndicatorFunction(a => a.currentPositive)
            },
            {
                id: "totalDeath",
                name: $string("$(death)"),
                validFor: ["region", "country"],
                colorLight: "#9c27b0",
                colorDark: "#4a148c",
                compute: new SimpleIndicatorFunction(a => a.totalDeath)
            },
            {
                id: "totalSevere",
                name: $string("$(severe)"),
                validFor: ["region", "country"],
                colorLight: "#ff9800",
                colorDark: "#e65100",
                compute: new SimpleIndicatorFunction(a => a.totalSevere)
            },
            {
                id: "totalHospedalized",
                name: $string("$(hospedalized)"),
                validFor: ["region", "country"],
                colorLight: "#fdd835",
                colorDark: "#fbc02d",
                compute: new SimpleIndicatorFunction(a => a.totalHospedalized)
            },
            {
                id: "totalHealed",
                name: $string("$(healed)"),
                validFor: ["region", "country"],
                colorLight: "#4caf50",
                colorDark: "#1b5e20",
                compute: new SimpleIndicatorFunction(a => a.totalHealed)
            },
            {
                id: "toatlTests",
                name: $string("$(tested)"),
                validFor: ["region", "country"],
                colorLight: "#03a9f4",
                colorDark: "#01579b",
                compute: new SimpleIndicatorFunction(a => a.toatlTests)
            },
            {
                id: "surface",
                name: $string("$(surface) ($(geo))"),
                validFor: ["region", "district"],
                colorLight: "#777",
                colorDark: "#222",
                compute: new ConstIndicatorFunction((v, a) => MathUtils.round(a.surface, 0))
            },
            {
                id: "density",
                name: $string("$(density) ($(geo))"),
                validFor: ["region", "district"],
                colorLight: "#777",
                colorDark: "#222",
                compute: new ConstIndicatorFunction((v, a) => MathUtils.round(a.demography.total / a.surface, 0))
            },
            {
                id: "population",
                name: $string("$(population) ($(geo))"),
                validFor: ["region", "district"],
                colorLight: "#777",
                colorDark: "#222",
                compute: new ConstIndicatorFunction((v, a) => a.demography.total)
            },
            {
                id: "populationOld",
                name: $string("$(population) +65 ($(geo))"),
                validFor: ["region", "district"],
                colorLight: "#777",
                colorDark: "#222",
                compute: new ConstIndicatorFunction((v, a) => a.demography.over65)
            },
        ],
        factors: [
            {
                id: "none",
                name: $string("$(none)"),
                compute: new SimpleFactorFunction((i, v, a) => i),
                format: a => formatNumber(a),
                reference: (v, a) => "N/A",
                description: $string("[indicator]")
            },
            {
                id: "population",
                name: $string("$(population)"),
                compute: new SimpleFactorFunction((i, v, a) => (i / a.demography.total) * 100000),
                format: a => formatNumber(a),
                reference: (v, a) => formatNumber(a.demography.total),
                description: $string("[indicator] $(every-100k)")
            },
            {
                id: "population",
                name: $string("$(population) +65"),
                compute: new SimpleFactorFunction((i, v, a) => (i / a.demography.over65) * 100000),
                format: a => formatNumber(MathUtils.round(a, 1)),
                reference: (v, a) => formatNumber(a.demography.over65),
                description: $string("[indicator] $(every-100k) +65")
            },
            {
                id: "density",
                name: $string("$(density)"),
                compute: new SimpleFactorFunction((i, v, a) => (i / (a.demography.total / a.surface)) * 100000),
                format: a => formatNumber(MathUtils.round(a, 1)),
                reference: (v, a) => formatNumber(MathUtils.round(a.demography.total / a.surface, 1)),
                description: $string("[indicator] $(over-density)")
            },
            {
                id: "totalPositive",
                name: $string("$(total-positive)"),
                validFor: ["region", "country"],
                compute: new DoubleFactorFunction((i, f) => !i ? 0 : (i / f) * 100, new SimpleIndicatorFunction(v => v.totalPositive)),
                format: a => MathUtils.round(a, 1) + "%",
                reference: (v, a) => !v.totalPositive ? "N/A" : formatNumber(v.totalPositive),
                description: $string("% [indicator] $(over-total-positive)")
            },
            {
                id: "severe",
                name: $string("$(severe)"),
                validFor: ["region", "country"],
                compute: new DoubleFactorFunction((i, f) => !i ? 0 : (i / f) * 100, new SimpleIndicatorFunction(v => v.totalSevere)),
                format: a => MathUtils.round(a, 1) + "%",
                reference: (v, a) => !v.totalSevere ? "N/A" : formatNumber(v.totalSevere),
                description: $string("% [indicator] $(over-severe)")
            },
            {
                id: "test",
                name: $string("$(tested)"),
                validFor: ["region", "country"],
                compute: new DoubleFactorFunction((i, f) => !i ? 0 : (i / f) * 100, new SimpleIndicatorFunction(v => v.toatlTests)),
                format: a => MathUtils.round(a, 1) + "%",
                reference: (v, a) => !v.toatlTests ? "N/A" : formatNumber(v.toatlTests),
                description: $string("% [indicator] $(over-tested)")
            }
        ]
    };
}


