namespace WebApp.GeoPlot {

    /****************************************/
    /* IDataAdapter
    /****************************************/

    interface IDataAdapterOptions {
        columnsAliases?: IDictionary<string>;
        groupColumns?: string[];
        serieColumns: string[];
        yColumn: string;
        source: () => Promise<string>;
    }

    /****************************************/

    interface IDataAdapter {

    }

    /****************************************/

    abstract class BaseDataAdapter implements IDataAdapter {

    } 

    /****************************************/
    /* TextTableDataAdapter
    /****************************************/


    interface ITextTableDataAdapterOptions extends IDataAdapterOptions {

        hasHeader?: boolean;
        columnSeparator?: string;
        rowSeparator?: string;
    }

    /****************************************/

    class TextTableDataAdapter extends BaseDataAdapter  {

    }

    /****************************************/
    /* JsonDataAdapter
    /****************************************/


    interface JsonDataAdapterOptions extends IDataAdapterOptions{

        dataPath?: string;
    }

    /****************************************/


    class JsonDataAdapter extends BaseDataAdapter {

    }

    /****************************************/
    /* DataImportControl
    /****************************************/

    export class DataImportControl {
        constructor() {

        }


    }
}