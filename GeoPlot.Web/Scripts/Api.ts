namespace WebApp.GeoPlot {

    export namespace Api {

        export async function saveState(id: Guid, state: object) {

            let result = await Http.postJsonAsync<IApiResult<boolean>>("~/SaveState/" + id, state);
            if (!result.isSuccess)
                throw result.error;
            return result.data;
        }

        /****************************************/

        export async function loadState<T>(id: Guid) {
            let result = await Http.getJsonAsync<IApiResult<T>>("~/LoadState/" + id);
            if (!result.isSuccess)
                throw result.error;
            return result.data;
        }

    /****************************************/

        export async function loadStudioData() {
            return await Http.getJsonAsync<IStudioViewModel>("~/StudioData");
        }
    }
}
 