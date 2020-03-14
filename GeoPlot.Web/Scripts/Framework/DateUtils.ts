namespace GeoPlot {

    export class DateUtils  {
        
        static WEEK_DAYS = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
        static MONTHS = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];

        /****************************************/

        static parse(value: Date | string): Date {

            if (value instanceof Date)
                return value;

            return new Date(<string>value);
        }

        /****************************************/

        static equalsDate(a: Date, b: Date): boolean {
            return this.trucateTime(a).getTime() == this.trucateTime(b).getTime();
        }

        /****************************************/

        static trucateTime(date: Date): Date {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        }

        /****************************************/

        static addDays(date: Date, value: number): Date {
            return this.add(date, TimeSpan.fromDays(value));
        }

        /****************************************/

        static add(date: Date, value: TimeSpan): Date {
            date = this.parse(date);
            return new Date(date.getTime() + value.ticks);
        }

        /****************************************/

        static diff(date1: Date, date2: Date): TimeSpan {
            return new TimeSpan(this.parse(date1).getTime() - this.parse(date2).getTime());
        }

        /****************************************/

        static now(): Date {
            return new Date();
        }

        /****************************************/

        static today(): Date {
            return this.truncateTime(this.now());
        }

        /****************************************/

        static truncateTime(date: Date): Date {
            date = this.parse(date);
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        }

        /****************************************/

        static timeOfDay(date: Date): TimeSpan {
            date = this.parse(date);
            return new TimeSpan(date.getTime() - this.truncateTime(date).getTime());
        }

        /****************************************/

        static format(date: Date|string, format: string): string {
            date = this.parse(date);
            return Format.replaceArgs(format, arg => this.formatArgument(date, arg));
        }

        /****************************************/

        static formatDate(date: Date | string): string {
            if (!date)
                return null;
            return this.format(date, "{YYYY}-{MM}-{DD}");
        }

        /****************************************/

        static formatArgument(value: Date|string, arg: string): string {
            value = this.parse(value);
            switch (arg) {
                case "D":
                    return value.getDate().toString();
                case "DD":
                    return StringUtils.padLeft(value.getDate().toString(), 2, "0");
                case "W":
                    return this.WEEK_DAYS[(value.getDay() + 6) % 7].substr(0, 3);
                case "WW":
                    return this.WEEK_DAYS[(value.getDay() + 6) % 7];
                case "M":
                    return value.getMonth().toString();
                case "MM":
                    return StringUtils.padLeft((value.getMonth() + 1).toString(), 2, "0");
                case "MMM":
                    return this.MONTHS[value.getMonth()].substr(0, 3);
                case "MMMM": 
                    return this.MONTHS[value.getMonth()];
                case "YYYY":
                    return value.getFullYear().toString();
                case "h":
                    return value.getHours().toString();
                case "hh":
                    return StringUtils.padLeft(value.getHours().toString(), 2, "0");
                case "m":
                    return value.getMinutes().toString();
                case "mm":
                    return StringUtils.padLeft(value.getMinutes().toString(), 2, "0");
                case "s":
                    return value.getSeconds().toString();
                case "ss":
                    return StringUtils.padLeft(value.getSeconds().toString(), 2, "0");
                case "f":
                    return (value.getMilliseconds() / 100).toString();
                case "ff":
                    return (value.getMilliseconds() / 10).toString();
                case "fff":
                    return value.getMilliseconds().toString();
            }
            return arg;
        }
    }    
}

