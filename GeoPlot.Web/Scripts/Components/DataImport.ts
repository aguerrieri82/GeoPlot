namespace WebApp.GeoPlot {


    class SplitEnumerator implements IEnumerator<string> {
        private _separator: string;
        private _value: string;
        private _startIndex: number;
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
                this._current = this._value.substring(this._currentStartIndex, this._curIndex - this._separator.length);
            return this._current;
        }

        /****************************************/

        moveNext(): boolean {

            if (this._curIndex > this._value.length)
                return false;

            this._currentStartIndex = this._curIndex;

            var index = this._value.indexOf(this._separator, this._curIndex);

            if (index == -1) {
                this._curIndex = this._value.length + 1;
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

    interface IDataAdapter<TOptions extends IDataAdapterOptions> {

        parse(text: string): IDictionary<string>[];

        analyze(text: string): TOptions;

        options: TOptions;
    }

    /****************************************/

    abstract class BaseDataAdapter<TOptions extends IDataAdapterOptions> implements IDataAdapter<TOptions> {

        constructor(options: TOptions) {
            this.options = options;
        }

        abstract parse(text: string): IDictionary<string>[];

        abstract analyze(text: string): TOptions;

        options: TOptions;
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

    export class TextTableDataAdapter extends BaseDataAdapter<ITextTableDataAdapterOptions> {

        constructor(options?: ITextTableDataAdapterOptions) {
            super(options);
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

        protected extractHeader(text: string) {

            const firstRow = linq(new SplitEnumerator(text, this.options.rowSeparator)).first();
            const cols = firstRow.split(this.options.columnSeparator);

            let headers: string[];

            if (this.options.hasHeader !== false) {

                const rowAnal: IColumnAnalisys[] = [];

                this.analyzeRow(cols, rowAnal);

                const stringCount = linq(rowAnal).sum(a => a.stringCount);
                const emptyCount = linq(rowAnal).sum(a => a.emptyCount);

                if (stringCount > 0 && stringCount + emptyCount == cols.length) {
                    this.options.hasHeader = true;

                    headers = linq(cols).select((a, i) => {
                        if (a == "")
                            return "col" + i;
                        return this.createIdentifier(a)
                    }).toArray();
                }
            }

            if (!headers) {
                this.options.hasHeader = false;

                headers = linq(cols).select((a, i) => "col" + i).toArray();
            }
            if (!this.options.columnsIds)
                this.options.columnsIds = headers;
        }

        /****************************************/

        protected extractRowSeparator(text: string) {
            if (this.options.rowSeparator)
                return;

            const items = ["\r\n", "\n"];

            for (var item of items) {
                if (text.indexOf(item) != -1) {
                    this.options.rowSeparator = item;
                    return;
                }
            }
        }

        /****************************************/

        protected extractColumnSeparator(text: string) {

            if (this.options.columnSeparator)
                return;

            const items = ["\t", ";", ",", " "];

            const stats = {};

            const rows = linq(new SplitEnumerator(text, this.options.rowSeparator)).take(10);

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
                    this.options.columnSeparator = key;
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

            if (value == null || value.length == 0 || value.trim().length == 0)
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
                return a => isNaN(<any>a) ? null : parseFloat(a);

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

        analyze(text: string) : ITextTableDataAdapterOptions {

            //Separators
            this.extractRowSeparator(text);
            this.extractColumnSeparator(text);

            //Header
            this.extractHeader(text);

            //Rows
            let rows = linq(new SplitEnumerator(text, this.options.rowSeparator));

            if (this.options.hasHeader)
                rows = rows.skip(1);

            //col analysis
            const colAnalysis: IColumnAnalisys[] = [];
            rows.foreach(row =>
                this.analyzeRow(row.split(this.options.columnSeparator), colAnalysis));

            //Parser
            if (!this.options.columnsParser) {
                this.options.columnsParser = {};
                colAnalysis.forEach((a, i) =>
                    this.options.columnsParser[this.options.columnsIds[i]] = this.createParser(a));
            }

            //X-axis
            if (!this.options.xColumn)
                this.options.xColumn = this.options.columnsIds[0];

            //Y-axis
            if (!this.options.serieColumns) {
                this.options.serieColumns = [];
                colAnalysis.forEach((col, i) => {

                    if (col.numberCount > 0 && col.stringCount == 0)
                        this.options.serieColumns.push(this.options.columnsIds[i]);
                });
            }

            //groups
            if (!this.options.groupColumns) {

                this.options.groupColumns = [];

                colAnalysis.forEach((col, i) => {

                    if (col.stringCount > 0 && col.emptyCount == 0) {
                        var values = linq(col.values);
                        if (values.count() > 1 && values.any(a => a.value > 1))
                            this.options.groupColumns.push(this.options.columnsIds[i]);
                    }
                });
            }

            return this.options;
        }

        /****************************************/

        parse(text: string): IDictionary<string>[] {

            var result: IDictionary<string>[] = [];

            var rows = linq(new SplitEnumerator(text, this.options.rowSeparator));

            if (this.options.hasHeader)
                rows = rows.skip(1);

            for (var row of rows) {
                var cols = row.split(this.options.columnSeparator);

                var item: IDictionary<string> = {};

                for (let i = 0; i < cols.length; i++) {
                    const colId = this.options.columnsIds[i];
                    if (this.options.xColumn != colId &&
                        this.options.serieColumns.indexOf(colId) == -1 &&
                        this.options.groupColumns.indexOf(colId) == -1)
                        continue;
                    item[colId] = this.options.columnsParser[colId](cols[i]);
                }

                result.push(item);
            }

            return result;
        }
    }

    /****************************************/
    /* JsonDataAdapter
    /****************************************/

    interface JsonDataAdapterOptions extends IDataAdapterOptions {

        dataPath?: string;
    }

    /****************************************/

    class JsonDataAdapter extends BaseDataAdapter<JsonDataAdapterOptions> {


        constructor(options: JsonDataAdapterOptions) {
            super(options);
        }

        /****************************************/

        parse(text: string): IDictionary<string>[] {
            return null;
        }

        /****************************************/

        analyze(text: string): JsonDataAdapterOptions {
            throw new Error("Method not implemented.");
        }
    }

    /****************************************/
    /* DataImportControl
    /****************************************/

    interface ITextValue<TValue> {
        text: string;
        value: TValue;
    }

    /****************************************/

    interface ITableViewModel {

        header: string[];
        rows: string[][];
    }

    /****************************************/

    enum ColumnType {
        Exclude,
        XAxis,
        Serie,
        Group
    }

    /****************************************/

    class ColumnViewModel {

        constructor(name: string, type?: ColumnType) {
            this.types = [
                { text: "Escludi", value: ColumnType.Exclude },
                { text: "Asse X", value: ColumnType.XAxis },
                { text: "Serie", value: ColumnType.Serie },
                { text: "Gruppo", value: ColumnType.Group }
            ];

            this.name = name;
            this.type(type);
            this.alias(name);
        }

        /****************************************/

        name: string;
        alias = ko.observable<string>();
        type = ko.observable(ColumnType.Exclude);
        types: ITextValue<ColumnType>[];
    }


    /****************************************/

    abstract class BaseTreeItem implements ITreeItem {

        constructor() {
            this.canDrag = false;
        }

        /****************************************/

        canReadData(transfer: DataTransfer): boolean {
            return false;
        }

        /****************************************/

        readData(transfer: DataTransfer) {

        }

        /****************************************/

        writeData(transfer: DataTransfer): boolean {
            return false;
        }

        /****************************************/

        attachNode(node: TreeNodeViewModel<ITreeItem>) {
            this.node = node;
        }

        /****************************************/

        remove(): void {

        }

        /****************************************/

        onParentChanged(): void {

        }

        /****************************************/
    
        canAccept(value: object): boolean {
            return false;
        }

        /****************************************/

        name: KnockoutObservable<string>;
        color?: KnockoutObservable<string>;
        canDrag: boolean;
        itemType: string;
        icon: string;
        node: TreeNodeViewModel<ITreeItem>;
    }

    /****************************************/

    class GroupItem extends BaseTreeItem {
        constructor() {
            super();
        }
    }
    /****************************************/

    class SerieItem extends BaseTreeItem {
        constructor() {
            super();
        }
    }

    /****************************************/

    export class DataImportControl {

        private _model: M.Modal;
        private _adapter: IDataAdapter<IDataAdapterOptions>;
        private _text: string;

        constructor() {

            this.columnSeparators = [
                { text: "TAB", value: "\t" },
                { text: ",", value: "," },
                { text: ";", value: ";" },
                { text: "SPACE", value: " " }
            ];

            this.columnSeparators = [
                { text: "TAB", value: "\t" },
                { text: ",", value: "," },
                { text: ";", value: ";" },
                { text: "SPACE", value: " " }
            ];

            const root = new TreeNodeViewModel<any>();            
            this.treeView.setRoot(root);
        }

        /****************************************/

        import(text: string) {

            debugger;

            let count = linq(new SplitEnumerator("a,s,,",",")).count();

            this._text = text;
            this._adapter = new TextTableDataAdapter({});

            const options = <ITextTableDataAdapterOptions>this._adapter.analyze(this._text);

            this.hasHeader(options.hasHeader);
            this.columnSeparator(options.columnSeparator);

            const cols: ColumnViewModel[] = [];

            for (let col of options.columnsIds) {
                var model = new ColumnViewModel(col);
                if (options.xColumn == col)
                    model.type(ColumnType.XAxis);
                else if (options.serieColumns && options.serieColumns.indexOf(col) != -1)
                    model.type(ColumnType.Serie);
                else if (options.groupColumns && options.groupColumns.indexOf(col) != -1)
                    model.type(ColumnType.Group);
                else
                    model.type(ColumnType.Exclude);

                cols.push(model);
            }

            this.columns(cols);

            this.table(null);

            this.treeView.root().nodes.removeAll();

            this.updatePreview();
        }

        protected format(value: any): string {
            if (typeof value == "number")
                return formatNumber(value);
            if (typeof value == "boolean")
                return value ? "si" : "no";
            if (value instanceof Date)
                return DateUtils.format(value, $string("$(date-format)"));
            return value;
        }

        /****************************************/

        protected updatePreview() {

            const result = this._adapter.parse(this._text);



            const table: ITableViewModel = {
                header: linq(this._adapter.options.columnsIds).where(a =>
                    this._adapter.options.xColumn == a ||
                    this._adapter.options.serieColumns.indexOf(a) != -1 ||
                    this._adapter.options.groupColumns.indexOf(a) != -1).toArray(),                    
                rows: linq(result).take(50).select(a=> linq(a).select(b=> this.format( b.value)).toArray()).toArray()
            }

            this.table(table);
        }

        /****************************************/

        show() {

            if (!this._model)
                this._model = M.Modal.init(document.getElementById("dataImport"));

            this._model.open();
        }

        /****************************************/

        hasHeader = ko.observable<boolean>();
        columnSeparator = ko.observable<string>();
        columns = ko.observable<ColumnViewModel[]>();
        columnSeparators: ITextValue<string>[];
        table = ko.observable<ITableViewModel>();
        treeView = new TreeViewModel<ITreeItem>();
    }
}