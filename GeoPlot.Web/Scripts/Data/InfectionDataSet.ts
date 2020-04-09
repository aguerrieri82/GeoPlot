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
        historicDeaths: Dictionary<number>;
    }

    /****************************************/


    export var InfectionDataSet: IDataSet<IInfectionData> = {

        name: "COVID-19",
        empty: {
            currentPositive: undefined,
            historicDeaths: { "2015": undefined, "2016": undefined, "2017": undefined, "2018": undefined, "2019": undefined, "2020": undefined },
            toatlTests: undefined,
            totalDeath: undefined,
            totalHealed: undefined,
            totalHospedalized: undefined,
            totalPositive: undefined,
            totalSevere: undefined,
        },
        indicators: [
            {
                id: "totalPositive",
                name: $string("$(total-positive)"),
                colorLight: "#f44336",
                colorDark: "#b71c1c",
                validFor: ["region", "country", "district"],
                showInFavorites: true,
                compute: new SimpleIndicatorFunction(a => a.totalPositive)
            },
            {
                id: "currentPositive",
                name: $string("$(current-positive)"),
                validFor: ["region", "country"],
                colorLight: "#e91e63",
                colorDark: "#880e4f",
                showInFavorites: true,
                compute: new SimpleIndicatorFunction(a => a.currentPositive)
            },
            {
                id: "totalDeath",
                name: $string("$(death)"),
                validFor: ["region", "country"],
                colorLight: "#9c27b0",
                colorDark: "#4a148c",
                showInFavorites: true,
                compute: new SimpleIndicatorFunction(a => a.totalDeath)
            },
            {
                id: "totalSevere",
                name: $string("$(severe)"),
                validFor: ["region", "country"],
                colorLight: "#ff9800",
                colorDark: "#e65100",
                showInFavorites: true,
                compute: new SimpleIndicatorFunction(a => a.totalSevere)
            },
            {
                id: "totalHospedalized",
                name: $string("$(hospedalized)"),
                validFor: ["region", "country"],
                colorLight: "#fdd835",
                colorDark: "#fbc02d",
                showInFavorites: true,
                compute: new SimpleIndicatorFunction(a => a.totalHospedalized)
            },
            {
                id: "totalHealed",
                name: $string("$(healed)"),
                validFor: ["region", "country"],
                colorLight: "#4caf50",
                colorDark: "#1b5e20",
                showInFavorites: true,
                compute: new SimpleIndicatorFunction(a => a.totalHealed)
            },
            {
                id: "toatlTests",
                name: $string("$(tested)"),
                validFor: ["region", "country"],
                colorLight: "#03a9f4",
                colorDark: "#01579b",
                showInFavorites: true,
                compute: new SimpleIndicatorFunction(a => a.toatlTests)
            },
            {
                id: "surface",
                name: $string("$(surface) ($(geo))"),
                validFor: ["region", "district"],
                colorLight: "#777",
                colorDark: "#222",
                showInFavorites: false,
                compute: new ConstIndicatorFunction((v, a) => MathUtils.round(a.surface, 0))
            },
            {
                id: "density",
                name: $string("$(density) ($(geo))"),
                validFor: ["region", "district"],
                colorLight: "#777",
                colorDark: "#222",
                showInFavorites: false,
                compute: new ConstIndicatorFunction((v, a) => MathUtils.round(a.demography.total / a.surface, 0))
            },
            {
                id: "population",
                name: $string("$(population) ($(geo))"),
                validFor: ["region", "district"],
                colorLight: "#777",
                colorDark: "#222",
                showInFavorites: false,
                compute: new ConstIndicatorFunction((v, a) => a.demography.total)
            },
            {
                id: "populationOld",
                name: $string("$(population) +65 ($(geo))"),
                validFor: ["region", "district"],
                colorLight: "#777",
                colorDark: "#222",
                showInFavorites: false,
                compute: new ConstIndicatorFunction((v, a) => a.demography.over65)
            },
            {
                id: "death2017",
                name: $string("$(total-death) +60 (2017)"),
                validFor: ["region", "district", "details"],
                colorLight: "#9c27b0",
                colorDark: "#4a148c",      
                showInFavorites: true,
                compute: new SimpleIndicatorFunction(a =>
                    a.historicDeaths ? a.historicDeaths["2017"] : undefined)
            },
            {
                id: "death2018",
                name: $string("$(total-death) +60 (2018)"),
                validFor: ["region", "district", "details"],
                colorLight: "#9c27b0",
                colorDark: "#4a148c",
                showInFavorites: true,
                compute: new SimpleIndicatorFunction(a =>
                    a.historicDeaths ? a.historicDeaths["2018"] : undefined)
            },
            {
                id: "death2019",
                name: $string("$(total-death) +60 (2019)"),
                validFor: ["region", "district", "details"],
                colorLight: "#9c27b0",
                colorDark: "#4a148c",
                showInFavorites: true,
                compute: new SimpleIndicatorFunction(a =>
                    a.historicDeaths ? a.historicDeaths["2019"] : undefined)
            },
            {
                id: "death2020",
                name: $string("$(total-death) +60 (2020)*"),
                validFor: ["region", "district", "details"],
                colorLight: "#9c27b0",
                colorDark: "#4a148c",
                showInFavorites: true,
                compute: new SimpleIndicatorFunction(a =>
                    a.historicDeaths ? a.historicDeaths["2020"] : undefined)
            },

            /*,
            /*,
            {
                id: "extimated-death",
                name: $string("Morti stimati"),
                validFor: ["country"],
                colorLight: "#f44336",
                colorDark: "#b71c1c",
                compute: new CombineIndicatorFunction({
                    totalPositive: new SimpleIndicatorFunction(a => a.totalPositive),
                    toatlTests: new SimpleIndicatorFunction(a => a.toatlTests),
                    dailyDeath: new ConstIndicatorFunction((v, a) => 1450)
                }, values => Math.round((values.totalPositive / values.toatlTests) * values.dailyDeath))
            },
            {
                id: "healed-death",
                name: $string("$(death) + $(healed)"),
                validFor: ["country", "region"],
                colorLight: "#4caf50",
                colorDark: "#1b5e20",
                compute: new CombineIndicatorFunction({
                    totalHealed: new SimpleIndicatorFunction(a => a.totalHealed),
                    totalDeath: new SimpleIndicatorFunction(a => a.totalDeath)
                }, values => values.totalHealed + values.totalDeath)
            }*/
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
            },
        ]
    };
}


