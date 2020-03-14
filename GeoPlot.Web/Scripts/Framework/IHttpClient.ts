namespace GeoPlot {

    export interface IHttpRequestConfig {
        url: string;
        method: string;
        data?: any;
        dataType?: string;
        responseType?: string;
        headers?: IDictionary<string>;
        onProgress?: (ev: ProgressEvent) => void;
    }

    /****************************************/

    export interface IHttpClient {

        requestAsync<T>(config: IHttpRequestConfig): Promise<T>;
    }
}