/// <reference path="treeview.ts" />

namespace WebApp.GeoPlot {

    
    /****************************************/
    /* FileDragDrop
    /****************************************/

    export class FileDragDrop {

        protected _element: HTMLElement;
        protected _dargEnterCount = 0;

        /****************************************/

        attachNode(element: HTMLElement) {

            this._element = element;
            element.ondragover = ev => this.onDragOver(ev);
            element.ondrop = ev => this.onDrop(ev);
            element.ondragenter = ev => this.onDragEnter(ev);
            element.ondragleave = ev => this.onDragLeave(ev);
        }

        /****************************************/

        onFileDropped(content: string) {

        }

        /****************************************/

        protected onDragEnter(ev: DragEvent) {
            this._dargEnterCount++;
        }

        /****************************************/

        protected onDragLeave(ev: DragEvent) {
            this._dargEnterCount--;
            if (this._dargEnterCount == 0)
                DomUtils.removeClass(this._element, "drop");
        }
            
        /****************************************/

        protected onDragOver(ev: DragEvent) {
            ev.preventDefault();

            if (this._dargEnterCount == 1) 
                DomUtils.addClass(this._element, "drop");
        }

        /****************************************/

        protected async onDrop(ev: DragEvent) {
            ev.preventDefault();

            this._dargEnterCount = 0;

            DomUtils.removeClass(this._element, "drop");
            if (ev.dataTransfer.files.length == 1) {
                const file = ev.dataTransfer.files[0];
                if (file.name.toLowerCase().endsWith(".csv")) {
                    const text = await ev.dataTransfer.files[0].text();
                    this.onFileDropped(text);
                    return;
                }
            }
            M.toast({html: $string("$(msg-not-supported-only-csv)")})
        }
    }

    /****************************************/
    /* ProgressViewModel
    /****************************************/

    type ProgressStatus = "hidden" | "indefinite" | "show";

    export class ProgressViewModel {

        _showCount = 0;

        /****************************************/

        constructor() {
            this.status("hidden");
            Operation.onBegin.add((s, op) => this.show(op));
            Operation.onEnd.add((s, op) => this.hide(op));
            Operation.onProgress.add((s, data) => this.update(data.operation, data.progress));
        }

        /****************************************/

        show(op: IOperation) {
            if (this._showCount == 0) {
                this.status("indefinite");
                this.percentage(100);
            }
            this.message(<string>op.message);
            this._showCount++;
        }

        /****************************************/

        update(op: IOperation, progress: IOperationProgress) {

            this.message(op["getProgressDescription"](progress));
            if (progress.totCount != undefined && progress.current != undefined) {
                this.percentage(Math.min(100, (progress.current / progress.totCount) * 100));
                this.status("show");
            }
            else {
                this.status("show");
                this.percentage(100);
            }
        }

        /****************************************/

        hide(op: IOperation) {
            this._showCount--;
            if (this._showCount == 0) {
                //this.message("");
                this.status("hidden");
            }
        }

        /****************************************/

        message = ko.observable<string>();
        percentage = ko.observable<number>();
        status = ko.observable<ProgressStatus>();
    }

    /****************************************/
    /* DataImportControl
    /****************************************/

    export interface IDataImportSerieSource {
        type: "data-import";
        options: IDaOptions;
        groups?: { id: string, value: string }[];
        serie: IDaSerie;
        source?: string;
    }

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

        constructor(value: IDaColumn<T>) {
            this.types = [
                { text: $string("$(exclude)"), value: DaColumnType.Exclude },
                { text: $string("$(x-axis)"), value: DaColumnType.XAxis },
                { text: $string("$(serie)"), value: DaColumnType.Serie },
                { text: $string("$(group)"), value: DaColumnType.Group }
            ];

            this.value = value;
            this.type(value.type);
            this.alias(value.name);
        }

        /****************************************/

        value: IDaColumn<T>;
        alias = ko.observable<string>();
        type = ko.observable();
        types: ITextValue<DaColumnType>[];
    }

    /****************************************/

    class GroupItem extends BaseTreeItem {

        constructor(value: IDaGroup) {
            super();
            this.value = value;
            this.icon = "folder";
            this.itemType = "group";
            this.color("#ffc107");
            this.name(value.name);
        }

        /****************************************/

        attachNode(node: TreeNodeViewModel<ITreeItem>) {
            super.attachNode(node);
            node.isVisible.subscribe(value => {
                for (var childNode of this.node.nodes())
                    childNode.isVisible(value); 
            })
        }


        /****************************************/

        value: IDaGroup;
    }

    /****************************************/

    class SerieItem extends BaseTreeItem {

        constructor(value: IDaSerie) {
            super();
            this.value = value;
            this.icon = "insert_chart";
            this.itemType = "serie";
            this.color("#4caf50");
            this.name(value.name);
        }

        /****************************************/

        value: IDaSerie;
        colId: string;
    }

    /****************************************/

    export class DataImportControl {

        private _model: M.Modal;
        private _adapter: IDataAdapter<IDaOptions>;
        private _text: string;
        private _options: ITextTableDaOptions;
        private _onGetData: (data: IDataImportSerieSource[]) => void;

        constructor() {

            this.columnSeparators = [
                { text: $string("$(tab-key)"), value: "\t" },
                { text: ",", value: "," },
                { text: ";", value: ";" },
                { text: $string("$(sapce-key)"), value: " " }
            ];
            
            this.treeView.setRoot(new TreeNodeViewModel<any>());
            this.treeView.selectedNode.subscribe(a => this.onNodeSelected(a));

            this.fileDrop.onFileDropped = text => this.importText(text);
        }

        /****************************************/

        async importText(text: string, options?: ITextTableDaOptions): Promise<boolean> {

            M.toast({ html: $string("$(msg-start-analysis)") })

            this.hasData(true);

            await PromiseUtils.delay(0);

            this._text = text;
            this._adapter = new TextTableDataAdapter();
            this._options = await this._adapter.analyzeAsync(this._text, options, 5000);

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

            await this.updatePreview();

            return true;
        }

        /****************************************/

        async getSelectedData(): Promise<IDataImportSerieSource[]> {

            const result: IDataImportSerieSource[] = [];
            await this.getSelectedDataWork(this.treeView.root(), [], result);
            return result;
        }

        /****************************************/

        protected async getSelectedDataWork(node: TreeNodeViewModel<ITreeItem>, groups: { id: string, value: string }[], result: IDataImportSerieSource[]) {

            if (!node.isVisible())
                return;

            if (node.value() instanceof SerieItem) {
                const serie = (<SerieItem>node.value()).value;
                const source: IDataImportSerieSource = {
                    type: "data-import",
                    options: this._options,
                    serie: serie,
                    groups: groups
                };
                result.push(source);
                return;
            }

            if (!node.isExpanded())
                await node.loadChildNodes();

            if (node.value() instanceof GroupItem) {

                const group = (<GroupItem>node.value()).value;

                let newGroups = groups.slice(0, groups.length);
                newGroups.push({ id: group.colId, value: group.name });

                groups = newGroups;
            }

            for (let childNode of node.nodes())
                await this.getSelectedDataWork(childNode, groups, result);
        }


        /****************************************/

        async executeImport() {
            const data = await this.getSelectedData();
            if (this._onGetData) {
                this._onGetData(data);
                this._onGetData = null;
            }
            this._model.close();
        }

        /****************************************/

        async applyChanges() {
            this._options.hasHeader = this.hasHeader();
            this._options.columnSeparator = this.columnSeparator();
            this._options.columns.forEach((col, i) => {
                col.name = this.columns()[i].alias();
                col.type = this.columns()[i].type();
            });

            await this.updatePreview(true);
        }

        /****************************************/

        protected async updateGroups() {

            const group = await this._adapter.loadGroupAsync(this._text, this._options);

            let childNode = new TreeNodeViewModel<ITreeItem>(new GroupItem(group));

            this.treeView.root().clear();
            this.treeView.root().addNode(childNode);
            childNode.value().attachNode(childNode);

            this.updateNode(childNode, group);

            childNode.isExpanded(true);
        }

        /****************************************/

        protected updateNode(node: TreeNodeViewModel<ITreeItem>, group: IDaGroup) {

            node.clear();

            if (group.groups) {
                for (let item of linq(group.groups)) {
                    let childNode = new TreeNodeViewModel<ITreeItem>(new GroupItem(item.value));
                    childNode.loadChildNodes = async () => this.updateNode(childNode, item.value);
                    node.addNode(childNode);
                    childNode.value().attachNode(childNode);
                }
            }

            if (group.series) {
                for (let item of linq(group.series)) {
                    let childNode = new TreeNodeViewModel<ITreeItem>(new SerieItem(item.value));
                    node.addNode(childNode);
                    childNode.value().attachNode(childNode);

                }
            }
        }

        /****************************************/

        protected async updateTable() {

            const result = await this._adapter.loadTableAsync(this._text, this._options, 50);

            const table: ITableViewModel = {
                header: linq(this._options.columns).where(a => a.type != DaColumnType.Exclude).select(a => a.name).toArray(),
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

        protected async updatePreview(force = false) {

            if (force || this._options.rowsCount < 5000 - 1)
                await this.updateGroups();
            else
                this.treeView.root().clear();

            await this.updateTable();
        }

        /****************************************/

        protected onNodeSelected(node: TreeNodeViewModel<ITreeItem>) {

            if (node && node.value() instanceof SerieItem) {

                const serie = (<SerieItem>node.value()).value;
                const xColumn = linq(this._options.columns).where(a => a.type == DaColumnType.XAxis).select(a => a.name).first();

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

        show() : Promise<IDataImportSerieSource[]> {

            if (!this._model) {
                this._model = M.Modal.init(document.getElementById("dataImport"), {
                    onCloseEnd: el => {
                        if (this._onGetData)
                            this._onGetData([]);
                        this.reset();
                    }
                });
            }

            this._model.open();
            
            return new Promise(res => this._onGetData = res);
        }

        /****************************************/

        reset() {
            this._text = null;
            this._options = null;
            this._onGetData = null;
            this.hasData(false);
            this.treeView.root().clear();
            this.table(null);
        }

        /****************************************/

        async importUrl() {
            const op = Operation.begin($string("$(msg-download-progress)"));
            try {
                let request = await fetch(this.sourceUrl());
                if (request.ok) {
                    const text = await request.text();
                    if (text) {
                        this.importText(text);
                        return;
                    }
                }
                M.toast({ html: $string("$(msg-download-error): " + request.statusText) });
            }
            finally {
                op.end();
            }
        }

        /****************************************/

        hasHeader = ko.observable<boolean>();
        columnSeparator = ko.observable<string>();
        columns = ko.observable<ColumnViewModel<any>[]>();
        columnSeparators: ITextValue<string>[];
        table = ko.observable<ITableViewModel>();
        treeView = new TreeViewModel<ITreeItem>();
        progress = new ProgressViewModel();
        hasData = ko.observable(false);
        sourceUrl = ko.observable<string>();
        fileDrop = new FileDragDrop();
    }
}