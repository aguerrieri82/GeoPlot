namespace GeoPlot {

    export class TimeSpan  {

        constructor(ticks: number = 0) {
            this.ticks = ticks;
        }

        /****************************************/

        get totalDays() {
            return this.ticks / (1000 * 60 * 60 * 24);
        }

        /****************************************/

        get totalHours() {
            return this.ticks / (1000 * 60 * 60);
        }

        /****************************************/

        get totalMinutes() {
            return this.ticks / (1000 * 60);
        }

        /****************************************/

        get totalSeconds() {
            return this.ticks / (1000);
        }

        /****************************************/

        get totalMilliseconds() {
            return this.ticks;
        }

        /****************************************/

        get days() {
            return Math.floor(this.ticks / (1000 * 60 * 60 * 24))
        }

        /****************************************/

        get hours() {
            return Math.floor(this.ticks / (1000 * 60 * 60)) % 24;
        }

        /****************************************/

        get minutes() {
            return Math.floor(this.ticks / (1000 * 60)) % 60;
        }

        /****************************************/

        get seconds() {
            return Math.floor(this.ticks / (1000)) % 60;
        }

        /****************************************/

        get milliseconds() {
            return this.ticks % 1000;
        }


        /****************************************/

        format(format: string): string {
            return Format.replaceArgs(format, arg => TimeSpan.formatArgument(this, arg));
        }

        /****************************************/

        toString() {
            return this.format("{hh}:{mm}:{ss}");
        }

        /****************************************/

        static zero() {
            return new TimeSpan(0);
        }

        /****************************************/

        static fromMilliseconds(value: number) {
            return new TimeSpan(value);
        }

        /****************************************/

        static fromSeconds(value: number) {
            return new TimeSpan(value * 1000);
        }

        /****************************************/

        static fromMinutes(value: number) {
            return new TimeSpan(value * 1000 * 60);
        }

        /****************************************/

        static fromHours(value: number) {
            return new TimeSpan(value * 1000 * 60 * 60);
        }

        /****************************************/

        static fromDays(value: number) {
            return new TimeSpan(value * 1000 * 60 * 60 * 24);
        }

        /****************************************/

        static create(days: number = 0, hours: number = 0, minutes: number = 0, seconds: number = 0, milliseconds: number = 0) {
            return new TimeSpan(
                (days * 1000 * 60 * 60 * 24) +
                (hours * 1000 * 60 * 60) +
                (minutes * 1000 * 60) +
                (seconds * 1000) +
                (milliseconds));
        }

        /****************************************/

        static formatArgument(value: TimeSpan, arg: string): string {
            switch (arg) {
          
                case "d":
                    return value.days.toString();
                case "dd":
                    return StringUtils.padLeft(value.days.toString(), 2, "0");
                case "h":
                    return value.hours.toString();
                case "hh":
                    return StringUtils.padLeft(value.hours.toString(), 2, "0");
                case "m":
                    return value.minutes.toString();
                case "mm":
                    return StringUtils.padLeft(value.minutes.toString(), 2, "0");
                case "s":
                    return value.seconds.toString();
                case "ss":
                    return StringUtils.padLeft(value.seconds.toString(), 2, "0");
                case "f":
                    return (value.milliseconds / 100).toString();
                case "ff":
                    return (value.milliseconds / 10).toString();
                case "fff":
                    return value.milliseconds.toString();
            }
            return arg;
        }

        /****************************************/

        ticks: number;
    }    
}

