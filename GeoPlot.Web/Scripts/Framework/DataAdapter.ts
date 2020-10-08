namespace WebApp {

    /****************************************/
    /* IDataAdapter
    /****************************************/

    type TextParser<T> = (value: string) => T;

    type TextFormatter<T> = (value: T) => string;

    interface IDaColumnAnalisys {
        values: IDictionary<number>;
        booleanCount: number;
        stringCount: number;
        emptyCount: number;
        numberCount: number;
        dateCount: number;
    }

    /****************************************/

    export interface IDaSeriePoint {
        x: any;
        y: number;
    }

    /****************************************/

    export interface IDaSerie {
        name: string;
        values: IDaSeriePoint[];
        colId: string;
    }

    /****************************************/

    export interface IDaGroup {
        name: string;
        colId?: string;
        groups?: IDictionary<IDaGroup>;
        series?: IDictionary<IDaSerie>;
    }

    /****************************************/

    export interface IDaMainGroup extends IDaGroup {
    }

    /****************************************/

    export type IDaTable = IDictionary<any>[];

    /****************************************/

    export enum DaColumnType {
        Exclude,
        XAxis,
        Serie,
        Group
    }

    /****************************************/

    export interface IDaColumnFilter<T> {

        include?: T[];
        exclude?: T[];
    }

    /****************************************/

    export interface IDaColumn<T> {

        id: string;
        type: DaColumnType;
        name?: string;
        filter?: IDaColumnFilter<T>;
        parser?: TextParser<T>;
        formatter?: TextFormatter<T>;
    }

    /****************************************/

    export interface IDaOptions {
        rowsCount?: number;
        columns?: IDaColumn<any>[];
        source?: () => Promise<string>;
    }

    /****************************************/

    export interface IDataAdapter<TOptions extends IDaOptions> {

        loadGroupAsync(text: string, options: TOptions): Promise<IDaMainGroup>;

        loadTableAsync(text: string, options: ITextTableDaOptions, maxItems?: number): Promise<IDaTable>

        analyzeAsync(text: string, options?: TOptions, maxRows?: number): Promise<TOptions>;
    }

    /****************************************/

    abstract class BaseDataAdapter<TOptions extends IDaOptions> implements IDataAdapter<TOptions> {

        constructor() {
        }

        /****************************************/

        abstract loadGroupAsync(text: string, options: TOptions): Promise<IDaMainGroup>;

        abstract loadTableAsync(text: string, options: TOptions, maxItems?: number): Promise<IDaTable>;

        abstract analyzeAsync(text: string, options?: TOptions, maxRows?: number): Promise<TOptions>;
    }

    /****************************************/
    /* TextTableDataAdapter
    /****************************************/

    export interface ITextTableDaOptions extends IDaOptions {

        hasHeader?: boolean;
        columnSeparator?: string;
        rowSeparator?: string;
    }

    /****************************************/

    export class TextTableDataAdapter extends BaseDataAdapter<ITextTableDaOptions> {

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

        protected extractHeader(text: string, options: ITextTableDaOptions) {

            const firstRow = linq(new SplitEnumerator(text, options.rowSeparator)).first();
            const cols = linq(new CsvSplitEnumerator(firstRow, options.columnSeparator)).toArray();

            let headers: string[];

            if (options.hasHeader !== false) {

                const rowAnal: IDaColumnAnalisys[] = [];

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
                options.columns = linq(headers).select(a => ({ id: this.createIdentifier(a), name: a, type: DaColumnType.Exclude })).toArray();
        }

        /****************************************/

        protected extractRowSeparator(text: string, options: ITextTableDaOptions) {
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

        protected extractColumnSeparator(text: string, options: ITextTableDaOptions) {

            if (options.columnSeparator)
                return;

            const items = ["\t", ";", ",", " "];

            const stats = {};

            const rows = linq(new SplitEnumerator(text, options.rowSeparator)).take(10);

            for (let row of rows) {

                if (row.trim().length == 0)
                    continue;

                for (let item of items) {

                    if (stats[item] === false)
                        continue;

                    const cols = linq(new CsvSplitEnumerator(row, item)).count();

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

        protected analyzeRow(cols: string[], result: IDaColumnAnalisys[]) {

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

        protected analyzeColumn(value: string, result: IDaColumnAnalisys) {

            if (!result.values || Object.keys(result.values).length < 150)
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

        protected createParser(anal: IDaColumnAnalisys): TextParser<any> {

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

        async analyzeAsync(text: string, options?: ITextTableDaOptions, maxRows?: number): Promise<ITextTableDaOptions> {

            if (!options)
                options = {};

            //Separators
            this.extractRowSeparator(text, options);
            this.extractColumnSeparator(text, options);

            //Header
            this.extractHeader(text, options);

            //Rows
            let rows = linq(new SplitEnumerator(text, options.rowSeparator));
            if (maxRows)
                rows = rows.take(maxRows);

            if (options.hasHeader)
                rows = rows.skip(1);

            let curOp = Operation.begin("Analazing rows...");

            //col analysis
            const colAnalysis: IDaColumnAnalisys[] = [];
            let rowCount = 0;

            await rows.foreachAsync(async row => {
                rowCount++;
                this.analyzeRow(linq(new CsvSplitEnumerator(row, options.columnSeparator)).toArray(), colAnalysis);
                if (rowCount % 200 == 0) {
                    curOp.progress = { current: rowCount };
                    await PromiseUtils.delay(0);
                }
            });

            options.rowsCount = rowCount;

            curOp.end();

            const columns = linq(options.columns);

            //Parser
            colAnalysis.forEach((col, i) => {
                if (!options.columns[i].parser)
                    options.columns[i].parser = this.createParser(col);
            });

            //X-axis
            if (!columns.any(a => a.type == DaColumnType.XAxis))
                columns.first(a => a.type == DaColumnType.Exclude).type = DaColumnType.XAxis;

            //Y-axis
            if (!columns.any(a => a.type == DaColumnType.Serie)) {
                colAnalysis.forEach((col, i) => {

                    if (col.numberCount > 0 && col.stringCount == 0)
                        options.columns[i].type = DaColumnType.Serie;
                });
            }

            //groups
            if (!columns.any(a => a.type == DaColumnType.Group)) {

                colAnalysis.forEach((col, i) => {

                    if (col.stringCount > 0 && col.emptyCount == 0) {
                        var values = linq(col.values);
                        if (values.count() > 1 && values.any(a => a.value > 1))
                            options.columns[i].type = DaColumnType.Group;
                    }
                });
            }

            return options;
        }


        /****************************************/

        async loadTableAsync(text: string, options: ITextTableDaOptions, maxItems?: number): Promise<IDaTable> {

            var result: IDaTable = [];

            var rows = linq(new SplitEnumerator(text, options.rowSeparator));

            if (options.hasHeader)
                rows = rows.skip(1);

            for (var row of rows) {
                const cols = linq(new CsvSplitEnumerator(row, options.columnSeparator)).toArray();

                const item: IDictionary<string> = {};

                for (let i = 0; i < cols.length; i++) {
                    const col = options.columns[i];
                    if (col.type == DaColumnType.Exclude)
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

        async loadGroupAsync(text: string, options: ITextTableDaOptions): Promise<IDaMainGroup> {

            var result: IDaMainGroup = { name: $string("$(da-main-group)") };
            var rows = linq(new SplitEnumerator(text, options.rowSeparator));

            if (options.hasHeader)
                rows = rows.skip(1);

            const xColumnIndex = linq(options.columns).where(a => a.type == DaColumnType.XAxis).select((a, i) => i).first();

            let curOp = Operation.begin("Loading groups...");
            let rowCount = 0;
            let chunkCount;

            await rows.foreachAsync(async row => {

                const values = linq(new CsvSplitEnumerator(row, options.columnSeparator)).toArray();
                const xValue = options.columns[xColumnIndex].parser(values[xColumnIndex]);

                const item: IDictionary<string> = {};

                let curGroup: IDaGroup = result;

                for (let i = 0; i < values.length; i++) {
                    const col = options.columns[i];

                    if (col.type == DaColumnType.Exclude || col.type == DaColumnType.XAxis)
                        continue;

                    let value = col.parser(values[i]);

                    if (col.type == DaColumnType.Group) {

                        if (!curGroup.groups)
                            curGroup.groups = {};

                        if (value === "")
                            value = $string("<$(empty)>");

                        if (!(value in curGroup.groups))
                            curGroup.groups[value] = { name: value, colId: col.id };

                        curGroup = curGroup.groups[value];
                    }

                    else if (col.type == DaColumnType.Serie) {
                        if (!curGroup.series)
                            curGroup.series = {};

                        if (!(col.id in curGroup.series))
                            curGroup.series[col.id] = { name: col.name, colId: col.id, values: [] };

                        curGroup.series[col.id].values.push({ x: xValue, y: value });
                    }
                }

                rowCount++;

                if (rowCount % 200 == 0) {
                    curOp.progress = { current: rowCount, totCount: options.rowsCount };
                    await PromiseUtils.delay(0);
                }
            });

            options.rowsCount = rowCount

            curOp.end();

            return result;
        }
    }

    /****************************************/
    /* JsonDataAdapter
    /****************************************/

    export interface JsonDaOptions extends IDaOptions {

        dataPath?: string;
    }

    /****************************************/

    export class JsonDataAdapter extends BaseDataAdapter<JsonDaOptions> {

        constructor() {
            super();
        }

        /****************************************/

        async loadGroupAsync(text: string, options: JsonDaOptions): Promise<IDaMainGroup> {

            return null;
        }

        /****************************************/

        async loadTableAsync(text: string, options: JsonDaOptions, maxItems?: number): Promise<IDaTable> {

            return null;
        }

        /****************************************/

        async analyzeAsync(text: string, options?: JsonDaOptions, maxRows?: number): Promise<JsonDaOptions> {
            return null;
        }

    }
}