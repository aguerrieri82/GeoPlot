namespace WebApp {

    export namespace GeoPlot {

        export class GeoPlotApplication {

            constructor() {

            }

            /****************************************/

            initServices() {

                Services.httpClient = new XHRHttpClient();
            }

            /****************************************/

            baseUrl: string;
        } 
    }

    /****************************************/

    export var app: IApplication = <any>(new GeoPlot.GeoPlotApplication());
}
 