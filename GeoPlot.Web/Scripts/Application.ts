
/// <reference path="Framework/HttpClient.ts" />
/// <reference path="Framework/Services.ts" />

namespace GeoPlot {

    class Application {

        constructor(){
        }

        /****************************************/

        initServices() {

            Services.httpClient = new XHRHttpClient();
        }
    }

    /****************************************/

    export var app = new Application();
}
 