namespace WebApp {

    class GeoPlotApplication {

        constructor() {
            
        }

        /****************************************/

        initServices() {

            Services.httpClient = new XHRHttpClient(); 
        }

        appRoot: string;
    }

    /****************************************/

    export var app = new GeoPlotApplication();
}
 