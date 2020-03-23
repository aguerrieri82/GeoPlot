namespace WebApp {

    class GeoPlotApplication   {

        constructor() {
            
        }

        /****************************************/

        initServices() {

            Services.httpClient = new XHRHttpClient(); 
        }

        /****************************************/

        baseUrl: string;
    }

    /****************************************/

    export var app : IApplication = <any>(new GeoPlotApplication());
}
 