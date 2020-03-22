/// <reference path="../indicators.ts" />

namespace WebApp {

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
                name: "Positivi Totali",
                colorLight: "#f44336",
                colorDark: "#b71c1c",
                compute: new SimpleIndicatorFunction(a => a.totalPositive)
            },
            {
                id: "currentPositive",
                name: "Attuali Positivi",
                validFor: ["region", "country"],
                colorLight: "#e91e63",
                colorDark: "#880e4f",
                compute: new SimpleIndicatorFunction(a => a.currentPositive)
            },
            {
                id: "totalDeath",
                name: "Deceduti",
                validFor: ["region", "country"],
                colorLight: "#9c27b0",
                colorDark: "#4a148c",
                compute: new SimpleIndicatorFunction(a => a.totalDeath)
            },
            {
                id: "totalSevere",
                name: "Gravi",
                validFor: ["region", "country"],
                colorLight: "#ff9800",
                colorDark: "#e65100",
                compute: new SimpleIndicatorFunction(a => a.totalSevere)
            },
            {
                id: "totalHospedalized",
                name: "Ricoverati",
                validFor: ["region", "country"],
                colorLight: "#fdd835",
                colorDark: "#fbc02d",
                compute: new SimpleIndicatorFunction(a => a.totalHospedalized)
            },
            {
                id: "totalHealed",
                name: "Guariti",
                validFor: ["region", "country"],
                colorLight: "#4caf50",
                colorDark: "#1b5e20",
                compute: new SimpleIndicatorFunction(a => a.totalHealed)
            },
            {
                id: "toatlTests",
                name: "Tamponi",
                validFor: ["region", "country"],
                colorLight: "#03a9f4",
                colorDark: "#01579b",
                compute: new SimpleIndicatorFunction(a => a.toatlTests)
            },
            {
                id: "surface",
                name: "Superfice (Geo)",
                validFor: ["region", "district"],
                colorLight: "#777",
                colorDark: "#222",
                compute: new ConstIndicatorFunction((v, a) => MathUtils.round(a.surface, 0))
            },
            {
                id: "density",
                name: "Densita (Geo)",
                validFor: ["region", "district"],
                colorLight: "#777",
                colorDark: "#222",
                compute: new ConstIndicatorFunction((v, a) => MathUtils.round(a.demography.total / a.surface, 0))
            },
            {
                id: "population",
                name: "Popolazione (Geo)",
                validFor: ["region", "district"],
                colorLight: "#777",
                colorDark: "#222",
                compute: new ConstIndicatorFunction((v, a) => a.demography.total)
            },
            {
                id: "populationOld",
                name: "Popolazione +65 (Geo)",
                validFor: ["region", "district"],
                colorLight: "#777",
                colorDark: "#222",
                compute: new ConstIndicatorFunction((v, a) => a.demography.over65)
            },
        ],
        factors: [
            {
                id: "none",
                name: "Nessuno",
                compute: new SimpleFactorFunction((i, v, a) => i),
                format: a => formatNumber(a),
                reference: (v, a) => "N/A",
                description: "[indicator]"
            },
            {
                id: "population",
                name: "Popolazione",
                compute: new SimpleFactorFunction((i, v, a) => (i / a.demography.total) * 100000),
                format: a => formatNumber(a),
                reference: (v, a) => formatNumber(a.demography.total),
                description: "[indicator] ogni 100.000 abitanti"
            },
            {
                id: "population",
                name: "Popolazione +65",
                compute: new SimpleFactorFunction((i, v, a) => (i / a.demography.over65) * 100000),
                format: a => formatNumber(MathUtils.round(a, 1)),
                reference: (v, a) => formatNumber(a.demography.over65),
                description: "[indicator] ogni 100.000 abitanti +65"
            },
            {
                id: "density",
                name: "Densità",
                compute: new SimpleFactorFunction((i, v, a) => (i / (a.demography.total / a.surface)) * 100000),
                format: a => formatNumber(MathUtils.round(a, 1)),
                reference: (v, a) => formatNumber(MathUtils.round(a.demography.total / a.surface, 1)),
                description: "[indicator] rispetto densità territorio"
            },
            {
                id: "totalPositive",
                name: "Positivi Totali",
                validFor: ["region", "country"],
                compute: new DoubleFactorFunction((i, f) => !i ? 0 : (i / f) * 100, new SimpleIndicatorFunction(v => v.totalPositive)),
                format: a => MathUtils.round(a, 1) + "%",
                reference: (v, a) => !v.totalPositive ? "N/A" : formatNumber(v.totalPositive),
                description: "% [indicator] su positivi totali"
            },
            {
                id: "severe",
                name: "Gravi",
                validFor: ["region", "country"],
                compute: new DoubleFactorFunction((i, f) => !i ? 0 : (i / f) * 100, new SimpleIndicatorFunction(v => v.totalSevere)),
                format: a => MathUtils.round(a, 1) + "%",
                reference: (v, a) => !v.totalSevere ? "N/A" : formatNumber(v.totalSevere),
                description: "% [indicator] sui gravi totali"
            },
            {
                id: "test",
                name: "Tamponi",
                validFor: ["region", "country"],
                compute: new DoubleFactorFunction((i, f) => !i ? 0 : (i / f) * 100, new SimpleIndicatorFunction(v => v.toatlTests)),
                format: a => MathUtils.round(a, 1) + "%",
                reference: (v, a) => !v.toatlTests ? "N/A" : formatNumber(v.toatlTests),
                description: "% [indicator] sui tamponi eseguiti"
            }
        ]
    };
}


