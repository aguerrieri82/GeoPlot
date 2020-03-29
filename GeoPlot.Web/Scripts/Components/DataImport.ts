namespace WebApp.GeoPlot {


    class SplitEnumerator implements IEnumerator<string> {
        private _separator: string;
        private _value: string;
        private _startIndex : number;
        private _curIndex: number;
        private _currentStartIndex: number;
        private _current: string;

        constructor(value: string, separator: string, startIndex = 0) {
            this._value = value;
            this._separator = separator;
            this._startIndex = startIndex;
        }

        /****************************************/

        get current(): string {
            if (!this._current)
                this._current = this._value.substring(this._currentStartIndex, this._curIndex);
            return this._current;
        }

        /****************************************/

        moveNext(): boolean {

            if (this._curIndex == this._value.length)
                return false;

            this._currentStartIndex = this._curIndex;

            var index = this._value.indexOf(this._separator, this._curIndex);

            if (index == -1) {
                this._curIndex = this._value.length;
            }
            else 
                this._curIndex = index + this._separator.length;
            
            this._current = null;

            return true;
        }

        /****************************************/

        reset(): void {
            this._curIndex = this._startIndex;
            this._currentStartIndex = this._curIndex;
            this._current = null;
        }

    } 

    interface IColumnAnalisys {
        values: IDictionary<number>;
        booleanCount: number;
        stringCount: number;
        emptyCount: number;
        numberCount: number;
        dateCount: number;
    }

    /****************************************/
    /* IDataAdapter
    /****************************************/

    interface IDataAdapterOptions {
        columnsIds?: string[];
        groupColumns?: string[];
        serieColumns?: string[];
        xColumn?: string;
        source?: () => Promise<string>;
    }

    /****************************************/

    interface IDataAdapter {
        parse(text: string): IDictionary<string>[];
    }

    /****************************************/

    abstract class BaseDataAdapter implements IDataAdapter {

        constructor(options: IDataAdapterOptions) {
            
        }

        abstract parse(text: string): IDictionary<string>[];
    } 

    /****************************************/
    /* TextTableDataAdapter
    /****************************************/

    type TextParser = (value: string) => any;


    interface ITextTableDataAdapterOptions extends IDataAdapterOptions {

        hasHeader?: boolean;
        columnSeparator?: string;
        rowSeparator?: string;
        columnsParser?: IDictionary<TextParser>;
    }

    /****************************************/

    export class TextTableDataAdapter extends BaseDataAdapter  {

        private _options: ITextTableDataAdapterOptions;

        constructor(options?: ITextTableDataAdapterOptions) {
            super(options);
            this._options = options;
        }

        /****************************************/

        protected createIdentifier(value: string): string {
            let state = 0;
            let result = "";
            for (let i = 0; i < value.length; i++) {
                const c = value[i];
                switch (state) {
                    case 0:
                        result += c.toLowerCase();
                        state = 1;
                        break;
                    case 1:
                        if (c == " " || c == "-" || c == "_")
                            state = 2;
                        else
                            result += c;
                        break;
                    case 2:
                        result += c.toUpperCase();
                        state = 1;
                        break;
                }
            }
            return result;
        }

        /****************************************/

        protected extractHeader(text: string)  {

            const firstRow = linq(new SplitEnumerator(text, this._options.rowSeparator)).first();
            const cols = firstRow.split(this._options.columnSeparator);

            let headers: string[];

            if (this._options.hasHeader !== false) {

                const rowAnal: IColumnAnalisys[] = [];

                this.analyzeRow(cols, rowAnal);

                const stringCount = linq(rowAnal).sum(a => a.stringCount);
                const emptyCount = linq(rowAnal).sum(a => a.emptyCount);

                if (stringCount > 0 && stringCount + emptyCount == cols.length) {
                    this._options.hasHeader = true;

                    headers = linq(cols).select((a, i) => {
                        if (a == "")
                            return "col" + i;
                        return this.createIdentifier(a)
                    }).toArray();
                }
            }

            if (!headers) {
                this._options.hasHeader = false;

                headers = linq(cols).select((a, i) => "col" + i).toArray();
            }
            if (!this._options.columnsIds)
                this._options.columnsIds = headers;
        }

        /****************************************/

        protected extractRowSeparator(text: string)  {
            if (this._options.rowSeparator)
                return;

            const items = ["\r\n", "\n"];

            for (var item of items) {
                if (text.indexOf(item) != -1) {
                    this._options.rowSeparator = item;
                    return;
                }
            }
        }

        /****************************************/

        protected extractColumnSeparator(text: string) {

            if (this._options.columnSeparator) 
                return;

            const items = ["\t", ";", ",", " "];

            const stats = { };

            const rows = linq(new SplitEnumerator(text, this._options.rowSeparator)).take(10);

            for (let row of rows) {

                for (let item of items) {

                    if (stats[item] === false)
                        continue;

                    const cols = linq(new SplitEnumerator(row, item)).count();

                    if (cols > 1 && !(item in stats))
                        stats[item] = cols;
                    else {
                        if (stats[item] != cols)
                            stats[item] = false;
                    }
                }
            }

            for (var key in stats) {
                if (stats[key] !== false) {
                    this._options.columnSeparator = key;
                    return;
                }
            }
        }

        /****************************************/

        protected analyzeRow(cols: string[], result: IColumnAnalisys[]) {

            if (result.length == 0) {
                for (let i = 0; i < cols.length; i++) {
                    result.push({
                        values: {},
                        booleanCount: 0,
                        dateCount: 0,
                        emptyCount: 0,
                        numberCount: 0,
                        stringCount: 0
                    });
                }
            }

            for (let i = 0; i < cols.length; i++) 
                this.analyzeColumn(cols[i], result[i]);
        }

        /****************************************/

        protected analyzeColumn(value: string, result: IColumnAnalisys) {

            value in result.values ? result.values[value]++ : result.values[value] = 1;

            if (value == "")
                result.emptyCount++;

            else if (!isNaN(<any>value))
                result.numberCount++;

            else if (Date.parse(value))
                result.dateCount++;

            else if (value == "true" || value == "false")
                result.booleanCount++;
            else
                result.stringCount++;
        }

        /****************************************/

        protected createParser(anal: IColumnAnalisys): TextParser {

            if (anal.numberCount > 0 && anal.stringCount == 0)
                return a => !a  ? null : parseFloat(a);

            if (anal.booleanCount > 0 && anal.stringCount == 0)
                return a => a == "true";

            if (anal.dateCount > 0 && anal.stringCount == 0)
                return a => !a ? null : new Date(a);

            if (anal.stringCount > 0)
                return a => {
                    if (!a)
                        return "";
                    if (a.startsWith("\"") && a.endsWith("\""))
                        return a.substr(1, a.length - 2);
                    return a;
                }

            return a => null;
        }

        /****************************************/

        protected analyze(text: string) {

            //Separators
            this.extractRowSeparator(text);
            this.extractColumnSeparator(text);

            //Header
            this.extractHeader(text);

            //Rows
            let rows = linq(new SplitEnumerator(text, this._options.rowSeparator));

            if (this._options.hasHeader)
                rows = rows.skip(1);

            //col analysis
            const colAnalysis : IColumnAnalisys[] = [];
            rows.foreach(row =>
                this.analyzeRow(row.split(this._options.columnSeparator), colAnalysis));

            //Parser
            if (!this._options.columnsParser) {
                this._options.columnsParser = {};
                colAnalysis.forEach((a, i) =>
                    this._options.columnsParser[this._options.columnsIds[i]] = this.createParser(a));
            }

            //X-axis
            if (!this._options.xColumn)
                this._options.xColumn = this._options.columnsIds[0];

            //Y-axis
            if (!this._options.serieColumns) {
                this._options.serieColumns = [];
                colAnalysis.forEach((col, i) => {

                    if (col.numberCount > 0 && col.stringCount == 0)
                        this._options.serieColumns.push(this._options.columnsIds[i]);
                });
            }

            //groups
            if (!this._options.groupColumns) {

                this._options.groupColumns = [];

                colAnalysis.forEach((col, i) => {

                    if (col.stringCount > 0) {
                        var values = linq(col.values);
                        if (values.count() > 1 && values.any(a => a.value > 1))
                            this._options.groupColumns.push(this._options.columnsIds[i]);
                    }
                });
            }

            return colAnalysis;
        }

        /****************************************/

        parse(text: string) : IDictionary<string>[] {

            this.analyze(text);

            var result: IDictionary<string>[] = [];

            var rows = linq(new SplitEnumerator(text, this._options.rowSeparator));

            if (this._options.hasHeader)
                rows = rows.skip(1);

            for (var row of rows) {
                var cols = row.split(this._options.columnSeparator);

                var item: IDictionary<string> = {};

                for (let i = 0; i < cols.length; i++)
                    item[this._options.columnsIds[i]] = this._options.columnsParser[this._options.columnsIds[i]](cols[i]);

                result.push(item);
            }

            return result;
        }
    }

    /****************************************/
    /* JsonDataAdapter
    /****************************************/

    interface JsonDataAdapterOptions extends IDataAdapterOptions{

        dataPath?: string;
    }

    /****************************************/  

    class JsonDataAdapter extends BaseDataAdapter {

        constructor(options: JsonDataAdapterOptions) {
            super(options);
        }

        /****************************************/

        parse(text: string): IDictionary<string>[] {
            return null;
        }
    }

    /****************************************/
    /* DataImportControl
    /****************************************/

    export class DataImportControl {
        constructor() {

        }


    }
}