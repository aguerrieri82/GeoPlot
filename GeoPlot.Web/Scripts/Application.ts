import { XHRHttpClient, Services, IApplication, IAppArgs } from "./WebApp";

export class GeoPlotApplication implements IApplication<IAppArgs> {

    handleError(source: any, error: any, message?: string) {

    }

    runAsync(args?: IAppArgs) {
        Services.httpClient = new XHRHttpClient();
        this.baseUrl = args.baseUrl;
        return Promise.resolve();
    }

    startupArgs: IAppArgs;

    appName: string;

    baseUrl: string;

    isDev: boolean;

    language: string;
} 