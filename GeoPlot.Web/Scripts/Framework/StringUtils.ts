namespace GeoPlot {

    export class StringUtils {

        static random(length: number): string {

            let result = "";

            let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < length; i++)
                result += chars.charAt(Math.floor(Math.random() * chars.length));

            return result;
        }

        /****************************************/

        static repeat(value: string, count: number): string {
            let result = "";
            for (var i = 0; i < count; i++)
                result += value;
            return result;
        }

        /****************************************/

        static padLeft(value: string, count: number, char: string): string {
            if (value == null)
                return;
            if (value.length >= count)
                return value;
            return this.repeat(char, count - value.length) + value;
        }

        /****************************************/

        static padRight(value: string, count: number, char: string): string {
            if (value == null)
                return;
            if (value.length >= count)
                return value;
            return value + this.repeat(char, count - value.length);
        }
    }
}


