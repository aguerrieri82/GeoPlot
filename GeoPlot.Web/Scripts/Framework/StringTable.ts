                                                                                       declare var $language: string;
declare var $stringTable: WebApp.IDictionary<string>;

var $numberFormat = new Intl.NumberFormat($language, {});

function formatNumber(value: number) {
    if (!value)
        return "";
    return $numberFormat.format(value);
}

function $string(format: string): string {
    
    var REP_EXP = /\$\(([^\)]+)\)/g;
    return format.replace(REP_EXP, (m, value) => $stringTable[value]);
} 
 