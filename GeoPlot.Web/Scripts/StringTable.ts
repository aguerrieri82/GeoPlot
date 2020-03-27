namespace WebApp.GeoPlot {

    export declare var StringTable: IDictionary<string>;
}

function $string(format: string): string {

    var REP_EXP = /\$\((?<id>[^)]+)\)/g;

    return format.replace(REP_EXP, (m, value) => WebApp.GeoPlot.StringTable[value]);
}
 