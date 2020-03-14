namespace GeoPlot {

    export namespace Format {

        export function price(value: number): string {
            return (Math.round(value * 100) / 100).toFixed(2);
        }
    
        export function replaceArgs(value: string, args: IDictionary<any> | IMap<any, string>): string {

            if (!value)
                return;

            let map: IMap<any, string>;

            if (typeof (args) != "function")
                map = key => args[key];
            else
                map = <any>args;

            let state = 0;
            let result = "";
            let curName = "";

            for (let i = 0; i < value.length; i++) {
                let c = value[i];
                switch (state) {
                    case 0:
                        if (c == "{") {
                            curName = "";
                            state = 1;
                        }
                        else
                            result += c;
                        break;
                    case 1:
                        if (c == "}" || c == ":" || c == "=") {
                            state = 0;

                            if (args)
                                result += map(curName);

                            if (c == ":" || c == "=")
                                state = 2;
                            else
                                state = 0;
                        }
                        else if (c != "?")
                            curName += c;
                        break;
                    case 2:
                        if (c == "}")
                            state = 0;
                        break;
                }
            }

            return result;
        }

        /****************************************/

        export function replaceArgs2(value: string, args: IDictionary<any> | IMap<any, string>) : string {

            if (!value)
                return value;

            let map: IMap<any, string>;

            if (typeof (args) != "function")
                map = key => args[key];
            else
                map = <any>args;

            let result = "";
            let paramName = "";
            let state = 0;

            for (let i = 0; i < value.length; i++) {
                let c = value[i];

                switch (state) {
                    case 0:
                        if (c == '$')
                            state = 1;
                        else
                            result += c;
                        break;
                    case 1:
                        if (c == '(') {
                            state = 2;
                            paramName = "";
                        }
                        else {
                            result += "$" + c;
                            state = 0;
                        }
                        break;
                    case 2:
                        if (c == ')') {
                            let paramValue = map(paramName);
                            result += JSON.stringify(paramValue);
                            state = 0;
                        }
                        else
                            paramName += c;
                        break;
                }
            }
            return result;
        }

        /****************************************/

        export function linkify(value: string): string {

            if (!value)
                return "";

            var replacedText, replacePattern1, replacePattern2, replacePattern3;

            //URLs starting with http://, https://, or ftp://
            replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
            replacedText = value.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

            //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
            replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
            replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

            //Change email addresses to mailto:: links.
            replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
            replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

            return replacedText;
        }
    }
}