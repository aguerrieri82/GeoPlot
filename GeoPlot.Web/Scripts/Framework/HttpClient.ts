namespace GeoPlot {

    export class Http {

        static getStringAsync(url: string): Promise<string> {
            return Services.httpClient.requestAsync<string>({
                url: url,
                method: "GET",
            });
        }

        /****************************************/

        static postStringAsync(url: string, data: any): Promise<string> {
            return Services.httpClient.requestAsync<string>({
                url: url,
                method: "POST",
                data: data,
            });
        }

        /****************************************/

        static getJsonAsync<T>(url: string): Promise<T> {

            return Services.httpClient.requestAsync<T>({
                url: url,
                method: "GET",
                responseType: "application/json",
            });
        }

        /****************************************/

        static postJsonAsync<T>(url: string, data: any): Promise<T> {

            return Services.httpClient.requestAsync<T>({
                url: url,
                method: "POST",
                responseType: "application/json",
                data: data,
            });
        }

        /****************************************/

        static postBinaryAsync<T>(url: string, data: Blob | File | ArrayBuffer, onProgress?: (ev: ProgressEvent) => void): Promise<T> {

            return Services.httpClient.requestAsync<T>({
                url: url,
                method: "POST",
                responseType: "application/json",
                dataType: "application/octet-stream",
                data: data,
                onProgress: onProgress
            });
        }
    }

    /****************************************/

    export class XHRHttpClient implements IHttpClient {

        requestAsync<T>(config: IHttpRequestConfig): Promise<T> {

            return new Promise((resolve, reject) => {

                let xmlhttp = new XMLHttpRequest();

       
                xmlhttp.onreadystatechange = ev => {

                    if (xmlhttp.readyState == XMLHttpRequest.DONE) {


                        if (xmlhttp.status == 200) {

                            let data: any = xmlhttp.responseText;

                            let isJson = config.responseType == "application/json";
                            if (isJson)
                                data = JSON.parse(data);

                            resolve(data);
                        }
                        else
                            reject(xmlhttp.status);
                    }
                };

                if (config.onProgress)
                    xmlhttp.upload.onprogress = config.onProgress;

                xmlhttp.open(config.method, Uri.absolute(config.url), true);

                let contentType = config.dataType;
                let data = config.data;

                if (config.data) {

                    let isJson = contentType == "application/json" || typeof config.data == "object";
                    let isObj = contentType == "application/octet-stream"

                    if (isJson && !isObj) {
                        contentType = "application/json";
                        if (data && typeof config.data != "string")
                            data = JSON.stringify(data)
                    }
                }

                if (contentType)
                    xmlhttp.setRequestHeader("Content-type", contentType);

                if (config.headers) {
                    for (let header in config.headers)
                        xmlhttp.setRequestHeader(header, config.headers[header]);
                }

                xmlhttp.send(data);
            });
        }
    }
}