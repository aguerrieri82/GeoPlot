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

    /****************************************/

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

    interface IDataSeriePoint {
        x: any;
        y: number;
    }

    /****************************************/

    interface IDataSerie {
        name: string;
        values: IDataSeriePoint[];
    }

    /****************************************/

    interface IDataGroup {
        name: string;
        groups?: IDictionary<IDataGroup>;
        series?: IDictionary<IDataSerie>;
    }

    interface IDataMainGroup extends IDataGroup {
    }

    type IDataTable = IDictionary<any>[];

    /****************************************/

    type TextParser<T> = (value: string) => T;

    type TextFormatter<T> = (value: T) => string;

    enum ColumnType {
        Exclude,
        XAxis,
        Serie,
        Group
    }

    /****************************************/

    interface IColumnFilter<T> {

        include?: T[];
        exclude?: T[];
    }

    /****************************************/

    interface IDataAdapterColumn<T> {

        id: string;
        type: ColumnType;
        name?: string;
        filter?: IColumnFilter<T>;
        parser?: TextParser<T>;
        formatter?: TextFormatter<T>;
    }

    /****************************************/

    interface IDataAdapterOptions {
        columns?: IDataAdapterColumn<any>[];
        source?: () => Promise<string>;
    }

    /****************************************/

    interface IDataAdapter<TOptions extends IDataAdapterOptions> {

        loadGroup(text: string, options: TOptions): IDataMainGroup;

        loadTable(text: string, options: ITextTableDataAdapterOptions, maxItems?: number): IDataTable 

        analyze(text: string, options?: TOptions): TOptions;
    }

    /****************************************/

    abstract class BaseDataAdapter<TOptions extends IDataAdapterOptions> implements IDataAdapter<TOptions> {

        constructor() {
        }

        abstract loadGroup(text: string, options: TOptions): IDataMainGroup;

        abstract loadTable(text: string, options: TOptions, maxItems?: number): IDataTable;

        abstract analyze(text: string, options?: TOptions): TOptions;
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

    export class TextTableDataAdapter extends BaseDataAdapter<ITextTableDataAdapterOptions> {

        constructor() {
            super();
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

        protected extractHeader(text: string, options: ITextTableDataAdapterOptions) {

            const firstRow = linq(new SplitEnumerator(text, options.rowSeparator)).first();
            const cols = firstRow.split(options.columnSeparator);

            let headers: string[];

            if (options.hasHeader !== false) {

                const rowAnal: IColumnAnalisys[] = [];

                this.analyzeRow(cols, rowAnal);

                const stringCount = linq(rowAnal).sum(a => a.stringCount);
                const emptyCount = linq(rowAnal).sum(a => a.emptyCount);

                if (stringCount > 0 && stringCount + emptyCount == cols.length) {
                    options.hasHeader = true;

                    headers = linq(cols).select((a, i) => {
                        if (a == "")
                            return "col" + i;
                        return a;
                    }).toArray();
                }
            }

            if (!headers) {
                options.hasHeader = false;

                headers = linq(cols).select((a, i) => "col" + i).toArray();
            }
            if (!options.columns)
                options.columns = linq(headers).select(a => ({ id: this.createIdentifier(a), name: a, type: ColumnType.Exclude })).toArray();
        }

        /****************************************/

        protected extractRowSeparator(text: string, options: ITextTableDataAdapterOptions) {
            if (options.rowSeparator)
                return;

            const items = ["\r\n", "\n"];

            for (var item of items) {
                if (text.indexOf(item) != -1) {
                    options.rowSeparator = item;
                    return;
                }
            }
        }

        /****************************************/

        protected extractColumnSeparator(text: string, options: ITextTableDataAdapterOptions) {

            if (options.columnSeparator)
                return;

            const items = ["\t", ";", ",", " "];

            const stats = {};

            const rows = linq(new SplitEnumerator(text, options.rowSeparator)).take(10);

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
                    options.columnSeparator = key;
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

        protected createParser(anal: IColumnAnalisys): TextParser<any> {

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

        analyze(text: string, options?: ITextTableDataAdapterOptions): ITextTableDataAdapterOptions {

            if (!options)
                options = {};

            //Separators
            this.extractRowSeparator(text, options);
            this.extractColumnSeparator(text, options);

            //Header
            this.extractHeader(text, options);

            //Rows
            let rows = linq(new SplitEnumerator(text, options.rowSeparator));

            if (options.hasHeader)
                rows = rows.skip(1);

            //col analysis
            const colAnalysis: IColumnAnalisys[] = [];
            rows.foreach(row =>
                this.analyzeRow(row.split(options.columnSeparator), colAnalysis));

            const columns = linq(options.columns);

            //Parser
            colAnalysis.forEach((col, i) => {
                if (!options.columns[i].parser)
                    options.columns[i].parser = this.createParser(col);
            });

            //X-axis
            if (!columns.any(a => a.type == ColumnType.XAxis))
                columns.first(a => a.type == ColumnType.Exclude).type = ColumnType.XAxis;

            //Y-axis
            if (!columns.any(a => a.type == ColumnType.Serie)) {
                colAnalysis.forEach((col, i) => {

                    if (col.numberCount > 0 && col.stringCount == 0)
                        options.columns[i].type = ColumnType.Serie;
                });
            }

            //groups
            if (!columns.any(a => a.type == ColumnType.Group)) {

                colAnalysis.forEach((col, i) => {

                    if (col.stringCount > 0 && col.emptyCount == 0) {
                        var values = linq(col.values);
                        if (values.count() > 1 && values.any(a => a.value > 1))
                            options.columns[i].type = ColumnType.Group;
                    }
                });
            }

            return options;
        }


        /****************************************/

        loadTable(text: string, options: ITextTableDataAdapterOptions, maxItems? : number): IDataTable {

            var result: IDataTable = [];

            var rows = linq(new SplitEnumerator(text, options.rowSeparator));

            if (options.hasHeader)
                rows = rows.skip(1);

            for (var row of rows) {
                var cols = row.split(options.columnSeparator);

                var item: IDictionary<string> = {};

                for (let i = 0; i < cols.length; i++) {
                    const col = options.columns[i];
                    if (col.type == ColumnType.Exclude)
                        continue;
                    item[col.id] = col.parser(cols[i]);
                }

                result.push(item);

                if (maxItems && result.length >= maxItems)
                    break;
            }

            return result;
        }    

        /****************************************/

        loadGroup(text: string, options: ITextTableDataAdapterOptions): IDataMainGroup {

            var result: IDataMainGroup = {name: "main" };
            var rows = linq(new SplitEnumerator(text, options.rowSeparator));

            if (options.hasHeader)
                rows = rows.skip(1);

            const xColumnIndex = linq(options.columns).where(a => a.type == ColumnType.XAxis).select((a, i) => i).first();

            for (var row of rows) {

                const values = row.split(options.columnSeparator);
                const xValue = options.columns[xColumnIndex].parser(values[xColumnIndex]);

                const item: IDictionary<string> = {};

                let curGroup: IDataGroup = result;

                for (let i = 0; i < values.length; i++) {
                    const col = options.columns[i];

                    if (col.type == ColumnType.Exclude || col.type == ColumnType.XAxis)
                        continue;

                    let value = col.parser(values[i]);

                    if (col.type == ColumnType.Group) {

                        if (!curGroup.groups)
                            curGroup.groups = {};

                        if (value === "")
                            value = $string("<$(empty)>");

                        if (!(value in curGroup.groups)) 
                            curGroup.groups[value] = { name: value };

                        curGroup = curGroup.groups[value];
                    }

                    else if (col.type == ColumnType.Serie) {
                        if (!curGroup.series)
                            curGroup.series = {};

                        if (!(col.id in curGroup.series))
                            curGroup.series[col.id] = { name: col.id, values: [] };

                        curGroup.series[col.id].values.push({ x: xValue, y: value });
                    }
                }
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

        constructor() {
            super();
        }

        /****************************************/

        loadGroup(text: string, options: JsonDataAdapterOptions): IDataMainGroup {

            return null;
        }

        /****************************************/

        loadTable(text: string, options: JsonDataAdapterOptions, maxItems?: number): IDataTable {

            return null;
        }

        /****************************************/

        analyze(text: string, options?: JsonDataAdapterOptions): JsonDataAdapterOptions {
            return null;
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

    class ColumnViewModel<T> {

        constructor(value: IDataAdapterColumn<T>) {
            this.types = [
                { text: $string("$(exclude)"), value: ColumnType.Exclude },
                { text: $string("$(x-axis)"), value: ColumnType.XAxis },
                { text: $string("$(serie)"), value: ColumnType.Serie },
                { text: $string("$(group)"), value: ColumnType.Group }
            ];

            this.value = value;
            this.type(value.type);
            this.alias(value.name);
        }

        /****************************************/

        value: IDataAdapterColumn<T>;
        alias = ko.observable<string>();
        type = ko.observable();
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

        name = ko.observable<string>();
        color = ko.observable<string>();
        canDrag: boolean;
        itemType: string;
        icon: string;
        node: TreeNodeViewModel<ITreeItem>;
    }

    /****************************************/

    class GroupItem extends BaseTreeItem {

        constructor(value: IDataGroup) {
            super();
            this.value = value;
            this.icon = "folder";
            this.itemType = "group";
            this.color("#ffc107");
            this.name(value.name);
        }

        /****************************************/

        value: IDataGroup;
    }

    /****************************************/

    class SerieItem extends BaseTreeItem {

        constructor(value: IDataSerie) {
            super();
            this.value = value;
            this.icon = "insert_chart";
            this.itemType = "serie";
            this.color("#4caf50");
            this.name(value.name);
        }

        /****************************************/

        value: IDataSerie;
    }

    /****************************************/

    export class DataImportControl {

        private _model: M.Modal;
        private _adapter: IDataAdapter<IDataAdapterOptions>;
        private _text: string;
        private _options: ITextTableDataAdapterOptions;

        constructor() {

            this.columnSeparators = [
                { text: $string("$(tab-key)"), value: "\t" },
                { text: ",", value: "," },
                { text: ";", value: ";" },
                { text: $string("$(sapce-key)"), value: " " }
            ];

    

            const root = new TreeNodeViewModel<any>();            
            this.treeView.setRoot(root);
            this.treeView.selectedNode.subscribe(a => this.onNodeSelected(a));
        }

        /****************************************/

        import(text: string, options?: ITextTableDataAdapterOptions) : boolean {

            this._text = text;
            this._adapter = new TextTableDataAdapter();
            this._options = this._adapter.analyze(this._text, options);

            if (!this._options.columnSeparator || !this._options.rowSeparator || !this._options.columns || this._options.columns.length < 2)
                return false;

            this.hasHeader(this._options.hasHeader);
            this.columnSeparator(this._options.columnSeparator);

            const cols: ColumnViewModel<any>[] = [];

            for (let col of this._options.columns) {
                var model = new ColumnViewModel(col);
                cols.push(model);
            }

            this.columns(cols);

            this.updatePreview();

            return true;
        }

        /****************************************/

        applyChanges() {
            this._options.hasHeader = this.hasHeader();
            this._options.columnSeparator = this.columnSeparator();
            this._options.columns.forEach((col, i) => {
                col.name = this.columns()[i].alias();
                col.type = this.columns()[i].type();
            });

            this.updatePreview();
        }

        /****************************************/

        protected updateGroups() {

            const group = this._adapter.loadGroup(this._text, this._options);

            this.updateNode(this.treeView.root(), group);
        }

        /****************************************/

        protected updateNode(node: TreeNodeViewModel<ITreeItem>, group: IDataGroup) {

            node.clear();

            if (group.groups) {
                for (let item of linq(group.groups)) {
                    let childNode = new TreeNodeViewModel<ITreeItem>(new GroupItem(item.value));
                    childNode.loadChildNodes = async () => this.updateNode(childNode, item.value);
                    node.addNode(childNode);
                }
            }

            if (group.series) {
                for (let item of linq(group.series)) {
                    let childNode = new TreeNodeViewModel<ITreeItem>(new SerieItem(item.value));
                    node.addNode(childNode);
                }
            }

        }

        /****************************************/

        protected updateTable() {


            const result = this._adapter.loadTable(this._text, this._options, 50);

            const table: ITableViewModel = {
                header: linq(this._options.columns).where(a => a.type != ColumnType.Exclude).select(a => a.name).toArray(),
                rows: linq(result).select(a => linq(a).select(b => this.format(b.value)).toArray()).toArray()
            }

            this.table(table);
        }

        /****************************************/

        protected format(value: any): string {
            if (typeof value == "number")
                return formatNumber(value);
            if (typeof value == "boolean")
                return $string(value ? "$(yes)" : "$(no)");
            if (value instanceof Date)
                return DateUtils.format(value, $string("$(date-format)"));
            return value;
        }

        /****************************************/

        protected updatePreview() {

            this.updateGroups();
            this.updateTable();
        }

        /****************************************/

        protected onNodeSelected(node: TreeNodeViewModel<ITreeItem>) {

            if (node && node.value() instanceof SerieItem) {

                const serie = (<SerieItem>node.value()).value;
                const xColumn = linq(this._options.columns).where(a => a.type == ColumnType.XAxis).select(a => a.name).first();

                const table: ITableViewModel = {
                    header: [xColumn, serie.name],
                    rows: linq(serie.values).take(50).select(a => [this.format(a.x), this.format(a.y)]).toArray()
                }
                this.table(table);
            }
            else
                this.table(null);
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
        columns = ko.observable<ColumnViewModel<any>[]>();
        columnSeparators: ITextValue<string>[];
        table = ko.observable<ITableViewModel>();
        treeView = new TreeViewModel<ITreeItem>();
    }
}