declare var $stringTable: WebApp.IDictionary<string>;

function $string(format: string): string {

    var REP_EXP = /\$\((?<id>[^)]+)\)/g;

    return format.replace(REP_EXP, (m, value) => $stringTable[value]);
}
 