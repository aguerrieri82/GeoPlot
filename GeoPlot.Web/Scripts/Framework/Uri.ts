namespace GeoPlot {

    export class Uri {

        private static _relativeSegment : string;
        private static _absoluteSegment: string;

        /****************************************/

        static absolute(uri: string): string {

            if (uri.substr(0, 2) == "./" || uri.substr(0, 2) == "~/")
                return this.getAbsoluteSegment(document.URL) + this.appRoot.substr(1) + uri.substr(2);

            else if (uri.substr(0, 1) == "/")
                return this.getAbsoluteSegment(document.URL) + uri.substr(1);

            else if (this.isAbsolute(uri))
                return uri;

            return this.getRelativeSegment(document.URL) + uri.substr(1);
        }

        /****************************************/

        static isAbsolute(uri: string): boolean {
            return uri.indexOf("://") != -1;
        }

        /****************************************/

        static getRelativeSegment(uri: string): string {

            if (!this._relativeSegment) {

                this._relativeSegment = "";

                let index = uri.lastIndexOf("/");
                if (index != -1)
                    this._relativeSegment = uri.substr(0, index + 1);
            }
            return this._relativeSegment;
        }    

        /****************************************/

        static getAbsoluteSegment(uri: string): string {

            if (!this._absoluteSegment) {

                this._absoluteSegment = "";

                let index = uri.indexOf("://");
                if (index != -1) {
                    index = uri.indexOf("/", index + 4);
                    if (index != -1)
                        this._absoluteSegment = uri.substr(0, index + 1);
                }
            }

            return this._absoluteSegment;
        }    

        static appRoot: string = "";
    }
}