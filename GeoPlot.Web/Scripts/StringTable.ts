﻿declare var StringTable: WebApp.IDictionary<string>;

function $string(format: string): string {

    var REP_EXP = /\$\((?<id>[^)]+)\)/g;

    return format.replace(REP_EXP, (m, value) => StringTable[value]);
}
 