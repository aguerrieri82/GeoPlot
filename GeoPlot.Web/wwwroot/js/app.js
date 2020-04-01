var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        let Api;
        (function (Api) {
            function saveState(id, state) {
                return __awaiter(this, void 0, void 0, function* () {
                    let result = yield WebApp.Http.postJsonAsync("~/SaveState/" + id, state);
                    if (!result.isSuccess)
                        throw result.error;
                    return result.data;
                });
            }
            Api.saveState = saveState;
            /****************************************/
            function loadState(id) {
                return __awaiter(this, void 0, void 0, function* () {
                    let result = yield WebApp.Http.getJsonAsync("~/LoadState/" + id);
                    if (!result.isSuccess)
                        throw result.error;
                    return result.data;
                });
            }
            Api.loadState = loadState;
            /****************************************/
            function loadStudioData() {
                return __awaiter(this, void 0, void 0, function* () {
                    return yield WebApp.Http.getJsonAsync("~/StudioData");
                });
            }
            Api.loadStudioData = loadStudioData;
        })(Api = GeoPlot.Api || (GeoPlot.Api = {}));
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let GeoPlot;
    (function (GeoPlot) {
        class GeoPlotApplication {
            constructor() {
            }
            /****************************************/
            initServices() {
                WebApp.Services.httpClient = new WebApp.XHRHttpClient();
            }
        }
        GeoPlot.GeoPlotApplication = GeoPlotApplication;
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
    /****************************************/
    WebApp.app = (new GeoPlot.GeoPlotApplication());
})(WebApp || (WebApp = {}));
/****************************************/
function capitalizeFirst(value) {
    return value.substr(0, 1).toUpperCase() + value.substr(1);
}
/****************************************/
if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function (callback, type, quality) {
            let canvas = this;
            setTimeout(() => {
                const binStr = atob(canvas.toDataURL(type, quality).split(',')[1]);
                const len = binStr.length;
                const arr = new Uint8Array(len);
                for (let i = 0; i < len; i++)
                    arr[i] = binStr.charCodeAt(i);
                callback(new Blob([arr], { type: type || 'image/png' }));
            });
        }
    });
}
/****************************************/
function expandCollapse(elment) {
    let container = elment.parentElement;
    let content = container.querySelector(".section-content");
    if (container.classList.contains("closed")) {
        content.style.removeProperty("display");
        container.classList.remove("closed");
    }
    else {
        container.classList.add("closed");
        setTimeout(() => content.style.display = "none", 300);
    }
}
/****************************************/
/* Chart
/****************************************/
if (window["Chart"]) {
    Chart.plugins.register({
        beforeDraw: function (chartInstance) {
            var ctx = chartInstance.ctx;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, chartInstance.width, chartInstance.height);
        }
    });
}
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        class ConstIndicatorFunction {
            constructor(value) {
                this._value = value;
            }
            /****************************************/
            value(main, delta, exMain, exDelta, area) {
                let result = this._value(main, area);
                if (exMain) {
                    for (var i in exMain)
                        result -= this.value(exMain[i], exDelta[i], null, null, area);
                }
                return result;
            }
        }
        GeoPlot.ConstIndicatorFunction = ConstIndicatorFunction;
        /****************************************/
        class SimpleIndicatorFunction {
            constructor(value) {
                this._value = value;
            }
            /****************************************/
            value(main, delta, exMain, exDelta, area) {
                var result = this._value(main, area);
                if (delta)
                    result -= this._value(delta, area);
                if (exMain) {
                    for (var i in exMain)
                        result -= this.value(exMain[i], exDelta[i], null, null, area);
                }
                return result;
            }
        }
        GeoPlot.SimpleIndicatorFunction = SimpleIndicatorFunction;
        /****************************************/
        class CombineIndicatorFunction {
            constructor(indicators, value) {
                this._value = value;
                this._indicators = indicators;
            }
            /****************************************/
            value(main, delta, exMain, exDelta, area) {
                const value = {};
                for (var key in this._indicators)
                    value[key] = this._indicators[key].value(main, delta, exMain, exDelta, area);
                return this._value(value);
            }
        }
        GeoPlot.CombineIndicatorFunction = CombineIndicatorFunction;
        /****************************************/
        class SimpleFactorFunction {
            constructor(value) {
                this._value = value;
            }
            /****************************************/
            value(main, delta, exMain, exDelta, area, indicator) {
                let curValue = 0;
                for (var i in main)
                    curValue += indicator.value(main[i], delta[i], exMain[i], exDelta[i], area);
                return this._value(curValue, main[0], area);
            }
        }
        GeoPlot.SimpleFactorFunction = SimpleFactorFunction;
        /****************************************/
        class DoubleFactorFunction {
            constructor(value, factor) {
                this._value = value;
                this._factor = factor;
            }
            /****************************************/
            value(main, delta, exMain, exDelta, area, indicator) {
                let curValue = 0;
                let curFactor = 0;
                for (var i in main) {
                    curValue += indicator.value(main[i], delta[i], exMain[i], exDelta[i], area);
                    curFactor += this._factor.value(main[i], delta[i], exMain[i], exDelta[i], area);
                }
                return this._value(curValue, curFactor);
            }
        }
        GeoPlot.DoubleFactorFunction = DoubleFactorFunction;
        class IndicatorCalculator {
            constructor(data, dataSet, geo) {
                this._data = data;
                this._dataSet = dataSet;
                this._geo = geo;
            }
            /****************************************/
            getFactorValue(options) {
                const areaId = (typeof options.areaOrId == "string" ? options.areaOrId : options.areaOrId.id).toLowerCase();
                const dataAtDay = (number, curAreaId) => number < 0 ? undefined : this._data.days[number].values[curAreaId];
                let dayGroup;
                if (!Array.isArray(options.dayNumberOrGroup))
                    dayGroup = [options.dayNumberOrGroup];
                else
                    dayGroup = options.dayNumberOrGroup;
                let main = [];
                let delta = [];
                let exMain = [];
                let exDelta = [];
                for (var dayNumber of dayGroup) {
                    main.push(dataAtDay(dayNumber, areaId));
                    if (options.isDayDelta)
                        delta.push(dataAtDay(dayNumber - 1, areaId));
                    if (options.execludedAreas) {
                        var curExMain = [];
                        var curExDelta = [];
                        for (var exAreaId of options.execludedAreas) {
                            curExMain.push(dataAtDay(dayNumber, exAreaId.toLowerCase()));
                            if (options.isDayDelta)
                                curExDelta.push(dataAtDay(dayNumber - 1, exAreaId.toLowerCase()));
                        }
                        exMain.push(curExMain);
                        exDelta.push(curExDelta);
                    }
                }
                const factor = WebApp.linq(this._dataSet.factors).first(a => a.id == options.factorId);
                const indicator = WebApp.linq(this._dataSet.indicators).first(a => a.id == options.indicatorId);
                return factor.compute.value(main, delta, exMain, exDelta, this._geo.areas[areaId], indicator.compute);
            }
            /****************************************/
            getIndicatorValue(options) {
                const areaId = (typeof options.areaOrId == "string" ? options.areaOrId : options.areaOrId.id).toLowerCase();
                const indicator = WebApp.linq(this._dataSet.indicators).first(a => a.id == options.indicatorId);
                const dataAtDay = (number, curAreaId) => number < 0 ? undefined : this._data.days[number].values[curAreaId];
                let main = dataAtDay(options.dayNumber, areaId);
                let delta;
                let exMain;
                let exDelta;
                if (options.isDayDelta)
                    delta = dataAtDay(options.dayNumber - 1, areaId);
                if (options.execludedAreas) {
                    exMain = [];
                    exDelta = [];
                    for (var exAreaId of options.execludedAreas) {
                        exMain.push(dataAtDay(options.dayNumber, exAreaId.toLowerCase()));
                        if (options.isDayDelta)
                            exDelta.push(dataAtDay(options.dayNumber - 1, exAreaId.toLowerCase()));
                    }
                    ;
                }
                return indicator.compute.value(main, delta, exMain, exDelta, this._geo.areas[areaId]);
            }
            /****************************************/
            getSerie(source) {
                const result = [];
                if (source.groupSize > 1) {
                    let count = source.groupSize;
                    let group = [];
                    for (let i = 0 + source.startDay; i < this._data.days.length; i++) {
                        group.push(i);
                        count--;
                        if (count == 0) {
                            const item = {
                                x: (source.xAxis == "date" ? new Date(this._data.days[i].date) : i),
                                y: this.getFactorValue({
                                    dayNumberOrGroup: source.isDelta ? group : i,
                                    areaOrId: source.areaId,
                                    factorId: source.factorId,
                                    indicatorId: source.indicatorId,
                                    execludedAreas: source.exeludedAreaIds,
                                    isDayDelta: source.isDelta
                                })
                            };
                            result.push(item);
                            count = source.groupSize;
                            group = [];
                        }
                    }
                }
                else {
                    for (let i = 0 + source.startDay; i < this._data.days.length; i++) {
                        const item = {
                            x: source.xAxis == "date" ? new Date(this._data.days[i].date) : i,
                            y: this.getFactorValue({
                                dayNumberOrGroup: i,
                                areaOrId: source.areaId,
                                factorId: source.factorId,
                                indicatorId: source.indicatorId,
                                execludedAreas: source.exeludedAreaIds,
                                isDayDelta: source.isDelta
                            })
                        };
                        result.push(item);
                    }
                }
                return result;
            }
        }
        GeoPlot.IndicatorCalculator = IndicatorCalculator;
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        let AggregationFunc;
        (function (AggregationFunc) {
            AggregationFunc[AggregationFunc["SUm"] = 0] = "SUm";
            AggregationFunc[AggregationFunc["Avg"] = 1] = "Avg";
        })(AggregationFunc = GeoPlot.AggregationFunc || (GeoPlot.AggregationFunc = {}));
        let GeoAreaType;
        (function (GeoAreaType) {
            GeoAreaType[GeoAreaType["Country"] = 0] = "Country";
            GeoAreaType[GeoAreaType["State"] = 1] = "State";
            GeoAreaType[GeoAreaType["Region"] = 2] = "Region";
            GeoAreaType[GeoAreaType["District"] = 3] = "District";
        })(GeoAreaType = GeoPlot.GeoAreaType || (GeoPlot.GeoAreaType = {}));
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        /****************************************/
        /* BaseTreeItem
        /****************************************/
        class BaseTreeItem {
            constructor() {
                /****************************************/
                this.name = ko.observable();
                this.color = ko.observable();
                this.canDrag = false;
            }
            /****************************************/
            canReadData(transfer) {
                return false;
            }
            /****************************************/
            readData(transfer) {
            }
            /****************************************/
            writeData(transfer) {
                return false;
            }
            /****************************************/
            attachNode(node) {
                this.node = node;
            }
            /****************************************/
            remove() {
            }
            /****************************************/
            onParentChanged() {
            }
            /****************************************/
            canAccept(value) {
                return false;
            }
        }
        GeoPlot.BaseTreeItem = BaseTreeItem;
        /****************************************/
        /* ActionViewModel
        /****************************************/
        class ActionViewModel {
            execute() {
            }
        }
        GeoPlot.ActionViewModel = ActionViewModel;
        /****************************************/
        /* TreeNodeViewModel
        /****************************************/
        class TreeNodeViewModel {
            constructor(value) {
                this._dargEnterCount = 0;
                this._childLoaded = false;
                /****************************************/
                this.nodes = ko.observableArray();
                this.value = ko.observable();
                this.isSelected = ko.observable(false);
                this.isVisible = ko.observable(true);
                this.isExpanded = ko.observable(false);
                this.actions = ko.observable();
                this.value(value);
                this.isExpanded.subscribe((value) => __awaiter(this, void 0, void 0, function* () {
                    if (value && !this._childLoaded) {
                        yield this.loadChildNodes();
                        this._childLoaded = true;
                    }
                }));
                this.isSelected.subscribe(a => {
                    if (a)
                        this._treeView.select(this);
                });
            }
            /****************************************/
            loadChildNodes() {
                return __awaiter(this, void 0, void 0, function* () {
                });
            }
            /****************************************/
            clear() {
                this._childLoaded = false;
                this.nodes.removeAll();
            }
            /****************************************/
            get element() {
                return this._element;
            }
            /****************************************/
            attachNode(element) {
                this._element = element;
                this._element.id = WebApp.DomUtils.generateId();
                this._element["$model"] = this;
                this._element.addEventListener("keydown", ev => this.onKeyDown(ev));
                let header = this._element.querySelector("header");
                header.ondragstart = ev => this.onDrag(ev);
                header.ondragover = ev => this.onDragOver(ev);
                header.ondragenter = ev => this.onDragEnter(ev);
                header.ondragleave = ev => this.onDragLeave(ev);
                header.ondrop = ev => this.onDrop(ev);
            }
            /****************************************/
            onKeyDown(ev) {
                if (ev.keyCode == 46 && ev.target.tagName != "INPUT") {
                    ev.preventDefault();
                    if (this.isSelected())
                        this.value().remove();
                }
            }
            /****************************************/
            onDrag(ev) {
                if (!this.value().writeData(ev.dataTransfer) || !this.value().canDrag) {
                    ev.preventDefault();
                    return false;
                }
            }
            /****************************************/
            onDragEnter(ev) {
                this._dargEnterCount++;
            }
            /****************************************/
            onDragLeave(ev) {
                this._dargEnterCount--;
                if (this._dargEnterCount == 0)
                    WebApp.DomUtils.removeClass(this._element, "drop");
            }
            /****************************************/
            onDragOver(ev) {
                ev.preventDefault();
                if (this._dargEnterCount == 1) {
                    let canDrop = true;
                    if (!this.value().canReadData(ev.dataTransfer))
                        canDrop = false;
                    if (canDrop) {
                        if (ev.ctrlKey)
                            ev.dataTransfer.dropEffect = "copy";
                        else
                            ev.dataTransfer.dropEffect = "move";
                        WebApp.DomUtils.addClass(this._element, "drop");
                    }
                    else
                        ev.dataTransfer.dropEffect = "move";
                }
            }
            /****************************************/
            onDrop(ev) {
                ev.preventDefault();
                this._dargEnterCount = 0;
                WebApp.DomUtils.removeClass(this._element, "drop");
                const elId = ev.dataTransfer.getData("text/html+id");
                if (elId) {
                    const element = document.getElementById(elId);
                    const node = element["$model"];
                    if (!this.value().canAccept(node.value()))
                        return;
                    if (ev.ctrlKey) {
                    }
                    else {
                        if (node._parentNode == this)
                            return;
                        node._parentNode.nodes.remove(node);
                        node._parentNode = this;
                        this.nodes.push(node);
                        this.isExpanded(true);
                        node.value().onParentChanged();
                        return;
                    }
                }
                else
                    this.value().readData(ev.dataTransfer);
            }
            /****************************************/
            remove() {
                if (this._parentNode)
                    this._parentNode.nodes.remove(this);
                if (this._treeView.selectedNode() == this)
                    this._treeView.select(null);
            }
            /****************************************/
            addNode(node) {
                node.attach(this._treeView, this);
                this.nodes.push(node);
            }
            /****************************************/
            attach(treeView, parent) {
                this._treeView = treeView;
                this._parentNode = parent;
                for (let childNode of this.nodes())
                    childNode.attach(treeView);
            }
            /****************************************/
            get parentNode() {
                return this._parentNode;
            }
            /****************************************/
            toggleVisible() {
                this.isVisible(!this.isVisible());
            }
            /****************************************/
            select() {
                this.isSelected(true);
                this._element.focus();
            }
            /****************************************/
            expandCollapse() {
                this.isExpanded(!this.isExpanded());
            }
        }
        GeoPlot.TreeNodeViewModel = TreeNodeViewModel;
        /****************************************/
        /* TreeViewModel
        /****************************************/
        class TreeViewModel {
            constructor() {
                /****************************************/
                this.root = ko.observable();
                this.selectedNode = ko.observable();
            }
            /****************************************/
            select(node) {
                if (this.selectedNode() == node)
                    return;
                if (this.selectedNode())
                    this.selectedNode().isSelected(false);
                this.selectedNode(node);
                if (this.selectedNode())
                    this.selectedNode().isSelected(true);
            }
            /****************************************/
            setRoot(node) {
                node.attach(this);
                this.root(node);
            }
        }
        GeoPlot.TreeViewModel = TreeViewModel;
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
})(WebApp || (WebApp = {}));
/// <reference path="treeview.ts" />
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        /****************************************/
        /* FileDragDrop
        /****************************************/
        class FileDragDrop {
            constructor() {
                this._dargEnterCount = 0;
            }
            /****************************************/
            attachNode(element) {
                this._element = element;
                element.ondragover = ev => this.onDragOver(ev);
                element.ondrop = ev => this.onDrop(ev);
                element.ondragenter = ev => this.onDragEnter(ev);
                element.ondragleave = ev => this.onDragLeave(ev);
            }
            /****************************************/
            onFileDropped(content) {
            }
            /****************************************/
            onDragEnter(ev) {
                this._dargEnterCount++;
            }
            /****************************************/
            onDragLeave(ev) {
                this._dargEnterCount--;
                if (this._dargEnterCount == 0)
                    WebApp.DomUtils.removeClass(this._element, "drop");
            }
            /****************************************/
            onDragOver(ev) {
                ev.preventDefault();
                if (this._dargEnterCount == 1)
                    WebApp.DomUtils.addClass(this._element, "drop");
            }
            /****************************************/
            onDrop(ev) {
                return __awaiter(this, void 0, void 0, function* () {
                    ev.preventDefault();
                    this._dargEnterCount = 0;
                    WebApp.DomUtils.removeClass(this._element, "drop");
                    if (ev.dataTransfer.files.length == 1) {
                        const file = ev.dataTransfer.files[0];
                        if (file.name.toLowerCase().endsWith(".csv")) {
                            const text = yield ev.dataTransfer.files[0].text();
                            this.onFileDropped(text);
                            return;
                        }
                    }
                    M.toast({ html: $string("$(msg-not-supported-only-csv)") });
                });
            }
        }
        GeoPlot.FileDragDrop = FileDragDrop;
        class ProgressViewModel {
            /****************************************/
            constructor() {
                this._showCount = 0;
                /****************************************/
                this.message = ko.observable();
                this.percentage = ko.observable();
                this.status = ko.observable();
                this.status("hidden");
                WebApp.Operation.onBegin.add((s, op) => this.show(op));
                WebApp.Operation.onEnd.add((s, op) => this.hide(op));
                WebApp.Operation.onProgress.add((s, data) => this.update(data.operation, data.progress));
            }
            /****************************************/
            show(op) {
                if (this._showCount == 0) {
                    this.status("indefinite");
                    this.percentage(100);
                }
                this.message(op.message);
                this._showCount++;
            }
            /****************************************/
            update(op, progress) {
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
            hide(op) {
                this._showCount--;
                if (this._showCount == 0) {
                    //this.message("");
                    this.status("hidden");
                }
            }
        }
        GeoPlot.ProgressViewModel = ProgressViewModel;
        /****************************************/
        class ColumnViewModel {
            constructor(value) {
                this.alias = ko.observable();
                this.type = ko.observable();
                this.types = [
                    { text: $string("$(exclude)"), value: WebApp.DaColumnType.Exclude },
                    { text: $string("$(x-axis)"), value: WebApp.DaColumnType.XAxis },
                    { text: $string("$(serie)"), value: WebApp.DaColumnType.Serie },
                    { text: $string("$(group)"), value: WebApp.DaColumnType.Group }
                ];
                this.value = value;
                this.type(value.type);
                this.alias(value.name);
            }
        }
        /****************************************/
        class GroupItem extends GeoPlot.BaseTreeItem {
            constructor(value) {
                super();
                this.value = value;
                this.icon = "folder";
                this.itemType = "group";
                this.color("#ffc107");
                this.name(value.name);
            }
            /****************************************/
            attachNode(node) {
                super.attachNode(node);
                node.isVisible.subscribe(value => {
                    for (var childNode of this.node.nodes())
                        childNode.isVisible(value);
                });
            }
        }
        /****************************************/
        class SerieItem extends GeoPlot.BaseTreeItem {
            constructor(value) {
                super();
                this.value = value;
                this.icon = "insert_chart";
                this.itemType = "serie";
                this.color("#4caf50");
                this.name(value.name);
            }
        }
        /****************************************/
        class DataImportControl {
            constructor() {
                /****************************************/
                this.hasHeader = ko.observable();
                this.columnSeparator = ko.observable();
                this.columns = ko.observable();
                this.table = ko.observable();
                this.treeView = new GeoPlot.TreeViewModel();
                this.progress = new ProgressViewModel();
                this.hasData = ko.observable(false);
                this.sourceUrl = ko.observable();
                this.fileDrop = new FileDragDrop();
                this.columnSeparators = [
                    { text: $string("$(tab-key)"), value: "\t" },
                    { text: ",", value: "," },
                    { text: ";", value: ";" },
                    { text: $string("$(sapce-key)"), value: " " }
                ];
                this.treeView.setRoot(new GeoPlot.TreeNodeViewModel());
                this.treeView.selectedNode.subscribe(a => this.onNodeSelected(a));
                this.fileDrop.onFileDropped = text => this.importText(text);
            }
            /****************************************/
            importText(text, options) {
                return __awaiter(this, void 0, void 0, function* () {
                    M.toast({ html: $string("$(msg-start-analysis)") });
                    yield WebApp.PromiseUtils.delay(0);
                    this.hasData(true);
                    this._text = text;
                    this._adapter = new WebApp.TextTableDataAdapter();
                    this._options = yield this._adapter.analyzeAsync(this._text, options, 5000);
                    if (!this._options.columnSeparator || !this._options.rowSeparator || !this._options.columns || this._options.columns.length < 2)
                        return false;
                    this.hasHeader(this._options.hasHeader);
                    this.columnSeparator(this._options.columnSeparator);
                    const cols = [];
                    for (let col of this._options.columns) {
                        var model = new ColumnViewModel(col);
                        cols.push(model);
                    }
                    this.columns(cols);
                    yield this.updatePreview();
                    return true;
                });
            }
            /****************************************/
            getSelectedData() {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = [];
                    yield this.getSelectedDataWork(this.treeView.root(), [], result);
                    return result;
                });
            }
            /****************************************/
            getSelectedDataWork(node, groups, result) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!node.isVisible())
                        return;
                    if (node.value() instanceof SerieItem) {
                        const serie = node.value().value;
                        const source = {
                            type: "data-import",
                            options: this._options,
                            serie: serie,
                            groups: groups
                        };
                        result.push(source);
                        return;
                    }
                    if (!node.isExpanded())
                        yield node.loadChildNodes();
                    if (node.value() instanceof GroupItem) {
                        const group = node.value().value;
                        let newGroups = groups.slice(0, groups.length);
                        newGroups.push({ id: group.colId, value: group.name });
                        groups = newGroups;
                    }
                    for (let childNode of node.nodes())
                        yield this.getSelectedDataWork(childNode, groups, result);
                });
            }
            /****************************************/
            executeImport() {
                return __awaiter(this, void 0, void 0, function* () {
                    const data = yield this.getSelectedData();
                    if (this._onGetData) {
                        this._onGetData(data);
                        this._onGetData = null;
                    }
                    this._model.close();
                });
            }
            /****************************************/
            applyChanges() {
                return __awaiter(this, void 0, void 0, function* () {
                    this._options.hasHeader = this.hasHeader();
                    this._options.columnSeparator = this.columnSeparator();
                    this._options.columns.forEach((col, i) => {
                        col.name = this.columns()[i].alias();
                        col.type = this.columns()[i].type();
                    });
                    yield this.updatePreview(true);
                });
            }
            /****************************************/
            updateGroups() {
                return __awaiter(this, void 0, void 0, function* () {
                    const group = yield this._adapter.loadGroupAsync(this._text, this._options);
                    let childNode = new GeoPlot.TreeNodeViewModel(new GroupItem(group));
                    this.treeView.root().clear();
                    this.treeView.root().addNode(childNode);
                    childNode.value().attachNode(childNode);
                    this.updateNode(childNode, group);
                    childNode.isExpanded(true);
                });
            }
            /****************************************/
            updateNode(node, group) {
                node.clear();
                if (group.groups) {
                    for (let item of WebApp.linq(group.groups)) {
                        let childNode = new GeoPlot.TreeNodeViewModel(new GroupItem(item.value));
                        childNode.loadChildNodes = () => __awaiter(this, void 0, void 0, function* () { return this.updateNode(childNode, item.value); });
                        node.addNode(childNode);
                        childNode.value().attachNode(childNode);
                    }
                }
                if (group.series) {
                    for (let item of WebApp.linq(group.series)) {
                        let childNode = new GeoPlot.TreeNodeViewModel(new SerieItem(item.value));
                        node.addNode(childNode);
                        childNode.value().attachNode(childNode);
                    }
                }
            }
            /****************************************/
            updateTable() {
                return __awaiter(this, void 0, void 0, function* () {
                    const result = yield this._adapter.loadTableAsync(this._text, this._options, 50);
                    const table = {
                        header: WebApp.linq(this._options.columns).where(a => a.type != WebApp.DaColumnType.Exclude).select(a => a.name).toArray(),
                        rows: WebApp.linq(result).select(a => WebApp.linq(a).select(b => this.format(b.value)).toArray()).toArray()
                    };
                    this.table(table);
                });
            }
            /****************************************/
            format(value) {
                if (typeof value == "number")
                    return formatNumber(value);
                if (typeof value == "boolean")
                    return $string(value ? "$(yes)" : "$(no)");
                if (value instanceof Date)
                    return WebApp.DateUtils.format(value, $string("$(date-format)"));
                return value;
            }
            /****************************************/
            updatePreview(force = false) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (force || this._options.rowsCount < 5000 - 1)
                        yield this.updateGroups();
                    else
                        this.treeView.root().clear();
                    yield this.updateTable();
                });
            }
            /****************************************/
            onNodeSelected(node) {
                if (node && node.value() instanceof SerieItem) {
                    const serie = node.value().value;
                    const xColumn = WebApp.linq(this._options.columns).where(a => a.type == WebApp.DaColumnType.XAxis).select(a => a.name).first();
                    const table = {
                        header: [xColumn, serie.name],
                        rows: WebApp.linq(serie.values).take(50).select(a => [this.format(a.x), this.format(a.y)]).toArray()
                    };
                    this.table(table);
                }
                else
                    this.table(null);
            }
            /****************************************/
            show() {
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
            importUrl() {
                return __awaiter(this, void 0, void 0, function* () {
                    const op = WebApp.Operation.begin($string("$(msg-download-progress)"));
                    try {
                        let request = yield fetch(this.sourceUrl());
                        if (request.ok) {
                            const text = yield request.text();
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
                });
            }
        }
        GeoPlot.DataImportControl = DataImportControl;
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
})(WebApp || (WebApp = {}));
/// <reference path="../indicators.ts" />
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        /****************************************/
        GeoPlot.InfectionDataSet = {
            name: "COVID-19",
            indicators: [
                {
                    id: "totalPositive",
                    name: $string("$(total-positive)"),
                    colorLight: "#f44336",
                    colorDark: "#b71c1c",
                    compute: new GeoPlot.SimpleIndicatorFunction(a => a.totalPositive)
                },
                {
                    id: "currentPositive",
                    name: $string("$(current-positive)"),
                    validFor: ["region", "country"],
                    colorLight: "#e91e63",
                    colorDark: "#880e4f",
                    compute: new GeoPlot.SimpleIndicatorFunction(a => a.currentPositive)
                },
                {
                    id: "totalDeath",
                    name: $string("$(death)"),
                    validFor: ["region", "country"],
                    colorLight: "#9c27b0",
                    colorDark: "#4a148c",
                    compute: new GeoPlot.SimpleIndicatorFunction(a => a.totalDeath)
                },
                {
                    id: "totalSevere",
                    name: $string("$(severe)"),
                    validFor: ["region", "country"],
                    colorLight: "#ff9800",
                    colorDark: "#e65100",
                    compute: new GeoPlot.SimpleIndicatorFunction(a => a.totalSevere)
                },
                {
                    id: "totalHospedalized",
                    name: $string("$(hospedalized)"),
                    validFor: ["region", "country"],
                    colorLight: "#fdd835",
                    colorDark: "#fbc02d",
                    compute: new GeoPlot.SimpleIndicatorFunction(a => a.totalHospedalized)
                },
                {
                    id: "totalHealed",
                    name: $string("$(healed)"),
                    validFor: ["region", "country"],
                    colorLight: "#4caf50",
                    colorDark: "#1b5e20",
                    compute: new GeoPlot.SimpleIndicatorFunction(a => a.totalHealed)
                },
                {
                    id: "toatlTests",
                    name: $string("$(tested)"),
                    validFor: ["region", "country"],
                    colorLight: "#03a9f4",
                    colorDark: "#01579b",
                    compute: new GeoPlot.SimpleIndicatorFunction(a => a.toatlTests)
                },
                {
                    id: "surface",
                    name: $string("$(surface) ($(geo))"),
                    validFor: ["region", "district"],
                    colorLight: "#777",
                    colorDark: "#222",
                    compute: new GeoPlot.ConstIndicatorFunction((v, a) => WebApp.MathUtils.round(a.surface, 0))
                },
                {
                    id: "density",
                    name: $string("$(density) ($(geo))"),
                    validFor: ["region", "district"],
                    colorLight: "#777",
                    colorDark: "#222",
                    compute: new GeoPlot.ConstIndicatorFunction((v, a) => WebApp.MathUtils.round(a.demography.total / a.surface, 0))
                },
                {
                    id: "population",
                    name: $string("$(population) ($(geo))"),
                    validFor: ["region", "district"],
                    colorLight: "#777",
                    colorDark: "#222",
                    compute: new GeoPlot.ConstIndicatorFunction((v, a) => a.demography.total)
                },
                {
                    id: "populationOld",
                    name: $string("$(population) +65 ($(geo))"),
                    validFor: ["region", "district"],
                    colorLight: "#777",
                    colorDark: "#222",
                    compute: new GeoPlot.ConstIndicatorFunction((v, a) => a.demography.over65)
                } /*,
                {
                    id: "extimated-death",
                    name: $string("Morti stimati"),
                    validFor: ["country"],
                    colorLight: "#f44336",
                    colorDark: "#b71c1c",
                    compute: new CombineIndicatorFunction({
                        totalPositive: new SimpleIndicatorFunction(a => a.totalPositive),
                        toatlTests: new SimpleIndicatorFunction(a => a.toatlTests),
                        dailyDeath: new ConstIndicatorFunction((v, a) => 1450)
                    }, values => Math.round((values.totalPositive / values.toatlTests) * values.dailyDeath))
                },
                {
                    id: "healed-death",
                    name: $string("$(death) + $(healed)"),
                    validFor: ["country", "region"],
                    colorLight: "#4caf50",
                    colorDark: "#1b5e20",
                    compute: new CombineIndicatorFunction({
                        totalHealed: new SimpleIndicatorFunction(a => a.totalHealed),
                        totalDeath: new SimpleIndicatorFunction(a => a.totalDeath)
                    }, values => values.totalHealed + values.totalDeath)
                }*/
            ],
            factors: [
                {
                    id: "none",
                    name: $string("$(none)"),
                    compute: new GeoPlot.SimpleFactorFunction((i, v, a) => i),
                    format: a => formatNumber(a),
                    reference: (v, a) => "N/A",
                    description: $string("[indicator]")
                },
                {
                    id: "population",
                    name: $string("$(population)"),
                    compute: new GeoPlot.SimpleFactorFunction((i, v, a) => (i / a.demography.total) * 100000),
                    format: a => formatNumber(a),
                    reference: (v, a) => formatNumber(a.demography.total),
                    description: $string("[indicator] $(every-100k)")
                },
                {
                    id: "population",
                    name: $string("$(population) +65"),
                    compute: new GeoPlot.SimpleFactorFunction((i, v, a) => (i / a.demography.over65) * 100000),
                    format: a => formatNumber(WebApp.MathUtils.round(a, 1)),
                    reference: (v, a) => formatNumber(a.demography.over65),
                    description: $string("[indicator] $(every-100k) +65")
                },
                {
                    id: "density",
                    name: $string("$(density)"),
                    compute: new GeoPlot.SimpleFactorFunction((i, v, a) => (i / (a.demography.total / a.surface)) * 100000),
                    format: a => formatNumber(WebApp.MathUtils.round(a, 1)),
                    reference: (v, a) => formatNumber(WebApp.MathUtils.round(a.demography.total / a.surface, 1)),
                    description: $string("[indicator] $(over-density)")
                },
                {
                    id: "totalPositive",
                    name: $string("$(total-positive)"),
                    validFor: ["region", "country"],
                    compute: new GeoPlot.DoubleFactorFunction((i, f) => !i ? 0 : (i / f) * 100, new GeoPlot.SimpleIndicatorFunction(v => v.totalPositive)),
                    format: a => WebApp.MathUtils.round(a, 1) + "%",
                    reference: (v, a) => !v.totalPositive ? "N/A" : formatNumber(v.totalPositive),
                    description: $string("% [indicator] $(over-total-positive)")
                },
                {
                    id: "severe",
                    name: $string("$(severe)"),
                    validFor: ["region", "country"],
                    compute: new GeoPlot.DoubleFactorFunction((i, f) => !i ? 0 : (i / f) * 100, new GeoPlot.SimpleIndicatorFunction(v => v.totalSevere)),
                    format: a => WebApp.MathUtils.round(a, 1) + "%",
                    reference: (v, a) => !v.totalSevere ? "N/A" : formatNumber(v.totalSevere),
                    description: $string("% [indicator] $(over-severe)")
                },
                {
                    id: "test",
                    name: $string("$(tested)"),
                    validFor: ["region", "country"],
                    compute: new GeoPlot.DoubleFactorFunction((i, f) => !i ? 0 : (i / f) * 100, new GeoPlot.SimpleIndicatorFunction(v => v.toatlTests)),
                    format: a => WebApp.MathUtils.round(a, 1) + "%",
                    reference: (v, a) => !v.toatlTests ? "N/A" : formatNumber(v.toatlTests),
                    description: $string("% [indicator] $(over-tested)")
                },
            ]
        };
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        GeoPlot.ViewModes = {
            "district": {
                label: {
                    singular: $string("$(district)"),
                    plural: $string("$(districts)")
                },
                mapGroup: "group_district",
                tab: "districtTab",
                areaType: GeoPlot.GeoAreaType.District,
                validateId: (id) => id[0].toLowerCase() == 'd'
            },
            "region": {
                label: {
                    singular: $string("$(region)"),
                    plural: $string("$(regions)")
                },
                mapGroup: "group_region",
                tab: "regionTab",
                areaType: GeoPlot.GeoAreaType.Region,
                validateId: (id) => id[0].toLowerCase() == 'r'
            },
            "country": {
                label: {
                    singular: $string("$(italian)"),
                    plural: $string("$(italians)")
                },
                mapGroup: "group_country",
                tab: "italyTab",
                areaType: GeoPlot.GeoAreaType.Country,
                validateId: (id) => id.toLowerCase() == 'it'
            }
        };
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
})(WebApp || (WebApp = {}));
if (window["ko"]) {
    ko.bindingHandlers.attach = {
        init: (element, valueAccessor, allBindings, viewModel) => {
            let func = ko.unwrap(valueAccessor());
            if (func === true || func == undefined)
                func = viewModel["attachNode"];
            if (typeof func != "function")
                throw "Supplied argument is not a function";
            setTimeout(() => func.call(viewModel, element));
        }
    };
}
var WebApp;
(function (WebApp) {
    /****************************************/
    /* IDataAdapter
    /****************************************/
    /****************************************/
    let DaColumnType;
    (function (DaColumnType) {
        DaColumnType[DaColumnType["Exclude"] = 0] = "Exclude";
        DaColumnType[DaColumnType["XAxis"] = 1] = "XAxis";
        DaColumnType[DaColumnType["Serie"] = 2] = "Serie";
        DaColumnType[DaColumnType["Group"] = 3] = "Group";
    })(DaColumnType = WebApp.DaColumnType || (WebApp.DaColumnType = {}));
    /****************************************/
    class BaseDataAdapter {
        constructor() {
        }
    }
    /****************************************/
    class TextTableDataAdapter extends BaseDataAdapter {
        constructor() {
            super();
        }
        /****************************************/
        createIdentifier(value) {
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
        extractHeader(text, options) {
            const firstRow = WebApp.linq(new WebApp.SplitEnumerator(text, options.rowSeparator)).first();
            const cols = WebApp.linq(new WebApp.CsvSplitEnumerator(firstRow, options.columnSeparator)).toArray();
            let headers;
            if (options.hasHeader !== false) {
                const rowAnal = [];
                this.analyzeRow(cols, rowAnal);
                const stringCount = WebApp.linq(rowAnal).sum(a => a.stringCount);
                const emptyCount = WebApp.linq(rowAnal).sum(a => a.emptyCount);
                if (stringCount > 0 && stringCount + emptyCount == cols.length) {
                    options.hasHeader = true;
                    headers = WebApp.linq(cols).select((a, i) => {
                        if (a == "")
                            return "col" + i;
                        return a;
                    }).toArray();
                }
            }
            if (!headers) {
                options.hasHeader = false;
                headers = WebApp.linq(cols).select((a, i) => "col" + i).toArray();
            }
            if (!options.columns)
                options.columns = WebApp.linq(headers).select(a => ({ id: this.createIdentifier(a), name: a, type: DaColumnType.Exclude })).toArray();
        }
        /****************************************/
        extractRowSeparator(text, options) {
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
        extractColumnSeparator(text, options) {
            if (options.columnSeparator)
                return;
            const items = ["\t", ";", ",", " "];
            const stats = {};
            const rows = WebApp.linq(new WebApp.SplitEnumerator(text, options.rowSeparator)).take(10);
            for (let row of rows) {
                for (let item of items) {
                    if (stats[item] === false)
                        continue;
                    const cols = WebApp.linq(new WebApp.CsvSplitEnumerator(row, item)).count();
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
        analyzeRow(cols, result) {
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
        analyzeColumn(value, result) {
            if (!result.values || Object.keys(result.values).length < 150)
                value in result.values ? result.values[value]++ : result.values[value] = 1;
            if (value == null || value.length == 0 || value.trim().length == 0)
                result.emptyCount++;
            else if (!isNaN(value))
                result.numberCount++;
            else if (Date.parse(value))
                result.dateCount++;
            else if (value == "true" || value == "false")
                result.booleanCount++;
            else
                result.stringCount++;
        }
        /****************************************/
        createParser(anal) {
            if (anal.numberCount > 0 && anal.stringCount == 0)
                return a => isNaN(a) ? null : parseFloat(a);
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
                };
            return a => null;
        }
        /****************************************/
        analyzeAsync(text, options, maxRows) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!options)
                    options = {};
                //Separators
                this.extractRowSeparator(text, options);
                this.extractColumnSeparator(text, options);
                //Header
                this.extractHeader(text, options);
                //Rows
                let rows = WebApp.linq(new WebApp.SplitEnumerator(text, options.rowSeparator));
                if (maxRows)
                    rows = rows.take(maxRows);
                if (options.hasHeader)
                    rows = rows.skip(1);
                let curOp = WebApp.Operation.begin("Analazing rows...");
                //col analysis
                const colAnalysis = [];
                let rowCount = 0;
                yield rows.foreachAsync((row) => __awaiter(this, void 0, void 0, function* () {
                    rowCount++;
                    this.analyzeRow(WebApp.linq(new WebApp.CsvSplitEnumerator(row, options.columnSeparator)).toArray(), colAnalysis);
                    if (rowCount % 200 == 0) {
                        curOp.progress = { current: rowCount };
                        yield WebApp.PromiseUtils.delay(0);
                    }
                }));
                options.rowsCount = rowCount;
                curOp.end();
                const columns = WebApp.linq(options.columns);
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
                            var values = WebApp.linq(col.values);
                            if (values.count() > 1 && values.any(a => a.value > 1))
                                options.columns[i].type = DaColumnType.Group;
                        }
                    });
                }
                return options;
            });
        }
        /****************************************/
        loadTableAsync(text, options, maxItems) {
            return __awaiter(this, void 0, void 0, function* () {
                var result = [];
                var rows = WebApp.linq(new WebApp.SplitEnumerator(text, options.rowSeparator));
                if (options.hasHeader)
                    rows = rows.skip(1);
                for (var row of rows) {
                    const cols = WebApp.linq(new WebApp.CsvSplitEnumerator(row, options.columnSeparator)).toArray();
                    const item = {};
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
            });
        }
        /****************************************/
        loadGroupAsync(text, options) {
            return __awaiter(this, void 0, void 0, function* () {
                var result = { name: $string("$(da-main-group)") };
                var rows = WebApp.linq(new WebApp.SplitEnumerator(text, options.rowSeparator));
                if (options.hasHeader)
                    rows = rows.skip(1);
                const xColumnIndex = WebApp.linq(options.columns).where(a => a.type == DaColumnType.XAxis).select((a, i) => i).first();
                let curOp = WebApp.Operation.begin("Loading groups...");
                let rowCount = 0;
                let chunkCount;
                yield rows.foreachAsync((row) => __awaiter(this, void 0, void 0, function* () {
                    const values = WebApp.linq(new WebApp.CsvSplitEnumerator(row, options.columnSeparator)).toArray();
                    const xValue = options.columns[xColumnIndex].parser(values[xColumnIndex]);
                    const item = {};
                    let curGroup = result;
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
                        yield WebApp.PromiseUtils.delay(0);
                    }
                }));
                options.rowsCount = rowCount;
                curOp.end();
                return result;
            });
        }
    }
    WebApp.TextTableDataAdapter = TextTableDataAdapter;
    /****************************************/
    class JsonDataAdapter extends BaseDataAdapter {
        constructor() {
            super();
        }
        /****************************************/
        loadGroupAsync(text, options) {
            return __awaiter(this, void 0, void 0, function* () {
                return null;
            });
        }
        /****************************************/
        loadTableAsync(text, options, maxItems) {
            return __awaiter(this, void 0, void 0, function* () {
                return null;
            });
        }
        /****************************************/
        analyzeAsync(text, options, maxRows) {
            return __awaiter(this, void 0, void 0, function* () {
                return null;
            });
        }
    }
    WebApp.JsonDataAdapter = JsonDataAdapter;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        class Geo {
            static project(point) {
                var result = { x: 0, y: 0 };
                result.x = point.lng * Geo.OriginShift / 180;
                result.y = Math.log(Math.tan((90 + point.lat) * Math.PI / 360)) / (Math.PI / 180);
                result.y = -(result.y * Geo.OriginShift / 180);
                result.x -= Geo.OFFSET_X;
                result.y -= Geo.OFFSET_Y;
                return result;
            }
        }
        Geo.EarthRadius = 6378137;
        Geo.OriginShift = 2 * Math.PI * Geo.EarthRadius / 2;
        Geo.OFFSET_X = 1263355;
        Geo.OFFSET_Y = 5543162;
        GeoPlot.Geo = Geo;
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    /****************************************/
    class LinearGradient {
        constructor(...values) {
            if (values.length > 0) {
                if (typeof values[0] == "string")
                    this.colors = WebApp.linq(values).select(a => new RgbColor(a)).toArray();
                else
                    this.colors = values;
            }
            else
                this.colors = [];
        }
        /****************************************/
        valueAt(pos) {
            if (pos < 0)
                return this.colors[0];
            if (pos > 1)
                this.colors[this.colors.length - 1];
            const stepSize = 1 / (this.colors.length - 1);
            const minX = Math.floor(pos / stepSize);
            const maxX = Math.ceil(pos / stepSize);
            const minOfs = (pos - minX * stepSize) / stepSize;
            const c1 = this.colors[minX];
            const c2 = this.colors[maxX];
            const c3 = new RgbColor();
            c3.r = c1.r + (c2.r - c1.r) * minOfs;
            c3.g = c1.g + (c2.g - c1.g) * minOfs;
            c3.b = c1.b + (c2.b - c1.b) * minOfs;
            return c3;
        }
    }
    WebApp.LinearGradient = LinearGradient;
    /****************************************/
    class RgbColor {
        constructor(value) {
            /****************************************/
            this.r = 0;
            this.g = 0;
            this.b = 0;
            if (value)
                this.fromHex(value);
        }
        /****************************************/
        fromHex(value) {
            if (value.length == 4) {
                this.r = parseInt("0x" + value[1] + value[1]) / 255;
                this.g = parseInt("0x" + value[2] + value[2]) / 255;
                this.b = parseInt("0x" + value[3] + value[3]) / 255;
            }
            else {
                this.r = parseInt("0x" + value[1] + value[2]) / 255;
                this.g = parseInt("0x" + value[3] + value[4]) / 255;
                this.b = parseInt("0x" + value[5] + value[6]) / 255;
            }
        }
        /****************************************/
        toString() {
            function toHex(value) {
                let res = Math.round(value * 255).toString(16);
                if (res.length == 1)
                    return "0" + res;
                return res;
            }
            return "#" + toHex(this.r) + toHex(this.g) + toHex(this.b);
        }
    }
    WebApp.RgbColor = RgbColor;
    /****************************************/
    class Graphics {
        constructor(svg) {
            this._svg = svg;
        }
        /****************************************/
        setViewPort(minX, minY, maxX, maxY) {
            this._svg.viewBox.baseVal.x = minX;
            this._svg.viewBox.baseVal.y = minY;
            this._svg.viewBox.baseVal.width = maxX - minX;
            this._svg.viewBox.baseVal.height = maxY - minY;
        }
        /****************************************/
        drawPoly(poly) {
            var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            polygon.style.fill = poly.fillColor;
            polygon.style.stroke = poly.strokeColor;
            polygon.style.strokeWidth = poly.strokeSize + "%";
            polygon.id = poly.id;
            for (let i = 0; i < poly.geometry.points.length; i++) {
                let point = this._svg.createSVGPoint();
                point.x = poly.geometry.points[i].x;
                point.y = poly.geometry.points[i].y;
                polygon.points.appendItem(point);
            }
            this._svg.appendChild(polygon);
        }
    }
    WebApp.Graphics = Graphics;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        class BaseOperation {
            /****************************************/
            constructor(config) {
                /****************************************/
                this.message = null;
                this.parentOperation = null;
                if (!config.type)
                    this._type = WebApp.OperationType.Global;
                else
                    this._type = config.type;
                this.parentOperation = config.parentOperation;
            }
            /****************************************/
            end() {
                WebApp.Operation.end(this);
            }
            /****************************************/
            get type() {
                return this._type;
            }
            /****************************************/
            get progress() {
                return this._progress;
            }
            /****************************************/
            set progress(value) {
                this._progress = value;
                if (this._progress) {
                    console.log(this.getProgressDescription(this._progress));
                    if (this._progress.message)
                        this.message = this._progress.message;
                    WebApp.Operation.onProgress.raise(this, { operation: this, progress: value });
                }
                else
                    this.message = undefined;
            }
            /****************************************/
            addSubOperation(op) {
            }
            /****************************************/
            removeSubOperation(op) {
            }
            /****************************************/
            getProgressDescription(value) {
                let msg = "Progress (" + this.message + "): ";
                if (value.message)
                    msg += "'" + value.message + "'";
                if (value.current != null && value.totCount != null)
                    msg += " - " + value.current + "/" + value.totCount + " (" + Math.round(100 / value.totCount * value.current) + "%)";
                else if (value.current != null)
                    msg += value.current;
                return msg;
            }
        }
        /****************************************/
        class BaseOperationManager {
            constructor() {
                this._oprations = [];
                /****************************************/
                this.onBegin = WebApp.event();
                this.onEnd = WebApp.event();
                this.onProgress = WebApp.event();
            }
            progress(progress) {
                if (WebApp.ObjectUtils.isString(progress))
                    progress = { message: progress };
                if (this.current)
                    this.current.progress = progress;
            }
            /****************************************/
            begin(configOrMessge) {
                var _a;
                if (WebApp.ObjectUtils.isString(configOrMessge))
                    configOrMessge = { message: configOrMessge };
                let operation = new BaseOperation(configOrMessge);
                console.group("Begin operation: ", $string((_a = operation.message) !== null && _a !== void 0 ? _a : ""));
                operation.progress = configOrMessge;
                if (operation.parentOperation === undefined)
                    operation.parentOperation = this.current;
                this._oprations.push(operation);
                if (!operation.parentOperation) {
                    if (operation.type == WebApp.OperationType.Global) {
                    }
                }
                else
                    operation.parentOperation.addSubOperation(operation);
                this.onBegin.raise(this, operation);
                return operation;
            }
            /****************************************/
            end(operation) {
                var _a;
                console.groupEnd();
                console.log("End operation: ", $string((_a = operation.message) !== null && _a !== void 0 ? _a : ""));
                const index = this._oprations.indexOf(operation);
                this._oprations.splice(index, 1);
                if (operation.parentOperation)
                    operation.parentOperation.removeSubOperation(operation);
                else {
                    if (operation.type == WebApp.OperationType.Global) {
                    }
                }
                this.onEnd.raise(this, operation);
            }
            /****************************************/
            get current() {
                return this._oprations.length > 0 ? this._oprations[this._oprations.length - 1] : null;
            }
            /****************************************/
            get operations() {
                return this._oprations;
            }
        }
        GeoPlot.BaseOperationManager = BaseOperationManager;
        /****************************************/
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
})(WebApp || (WebApp = {}));
(function (WebApp) {
    WebApp.Operation = new WebApp.GeoPlot.BaseOperationManager();
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class SplitEnumerator {
        constructor(value, separator, startIndex = 0) {
            this._value = value;
            this._separator = separator;
            this._startIndex = startIndex;
        }
        /****************************************/
        get current() {
            if (!this._current)
                this._current = this._value.substring(this._currentStartIndex, this._curIndex - this._separator.length);
            return this._current;
        }
        /****************************************/
        moveNext() {
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
        reset() {
            this._curIndex = this._startIndex;
            this._currentStartIndex = this._curIndex;
            this._current = null;
        }
    }
    WebApp.SplitEnumerator = SplitEnumerator;
    /****************************************/
    class CsvSplitEnumerator {
        /****************************************/
        constructor(value, separator, startIndex = 0) {
            this._state = 0;
            this._wordLength = 0;
            this._value = value;
            this._separator = separator;
            this._startIndex = startIndex;
        }
        /****************************************/
        get current() {
            if (!this._current) {
                this._current = this._value.substr(this._wordStartIndex, this._wordLength);
                if (this._hasEscape)
                    this._current = this._current.replace("\"\"", "\"");
            }
            return this._current;
        }
        /****************************************/
        moveNext() {
            let found = false;
            while (true) {
                const c = this._curIndex >= this._value.length ? "" : this._value[this._curIndex];
                switch (this._state) {
                    case 0:
                        if (c == "\"") {
                            this._state = 1;
                            this._hasEscape = false;
                            this._wordLength = 0;
                            this._wordStartIndex = this._curIndex + 1;
                        }
                        else if (c == this._separator || !c) {
                            this._wordStartIndex = this._curIndex;
                            this._wordLength = 0;
                            found = this._curIndex <= this._value.length;
                        }
                        else {
                            this._state = 2;
                            this._wordLength = 1;
                            this._wordStartIndex = this._curIndex;
                        }
                        break;
                    case 1:
                        if (c == "\"")
                            this._state = 3;
                        else
                            this._wordLength++;
                        break;
                    case 2:
                        if (c == this._separator || !c) {
                            this._state = 0;
                            found = true;
                        }
                        else
                            this._wordLength++;
                        break;
                    case 3:
                        if (c == "\"") {
                            this._hasEscape = true;
                            this._wordLength += 2;
                            this._state = 1;
                        }
                        else if (c == this._separator || !c) {
                            found = true;
                            this._state = 0;
                        }
                        else
                            this._state = 4;
                        break;
                    case 4:
                        if (c == this._separator || !c) {
                            found = true;
                            this._state = 0;
                        }
                        break;
                }
                this._curIndex++;
                if (!c || found)
                    break;
            }
            this._current = null;
            return found;
        }
        /****************************************/
        reset() {
            this._hasEscape = false;
            this._curIndex = this._startIndex;
            this._wordStartIndex = this._curIndex;
            this._wordLength = 0;
            this._current = null;
            this._state = 0;
        }
    }
    WebApp.CsvSplitEnumerator = CsvSplitEnumerator;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    /****************************************/
    class TipViewModel {
        constructor(value, closeAfter) {
            this.isVisible = ko.observable(false);
            this.isTransparent = ko.observable(false);
            this.value = value;
            this._closeAfter = closeAfter;
        }
        /****************************************/
        dontShowAgain() {
        }
        /****************************************/
        onActionExecuted() {
        }
        /****************************************/
        executeAction() {
            if (this.value.showAction)
                this.value.showAction();
            setTimeout(() => this.startPulse());
            this.onActionExecuted();
        }
        /****************************************/
        startPulse() {
            this._element = document.querySelector(this.value.elementSelector);
            if (!this._element)
                return;
            let relY = WebApp.DomUtils.centerElement(this._element);
            WebApp.DomUtils.addClass(this._element, "pulse");
            let tipElement = document.querySelector(".tip-container");
            if (relY < (tipElement.clientTop + tipElement.clientHeight))
                this.isTransparent(true);
        }
        /****************************************/
        stopPulse() {
            if (!this._element)
                return;
            WebApp.DomUtils.removeClass(this._element, "pulse");
            this.isTransparent(false);
        }
        /****************************************/
        next() {
        }
        /****************************************/
        understood() {
        }
        /****************************************/
        onClose() {
        }
        /****************************************/
        close() {
            clearTimeout(this._closeTimeoutId);
            this.stopPulse();
            this.isVisible(false);
            this.onClose();
        }
        /****************************************/
        show() {
            if (this._closeTimeoutId)
                clearTimeout(this._closeTimeoutId);
            this.isVisible(true);
            if (this._closeAfter)
                this._closeTimeoutId = setTimeout(() => this.close(), this._closeAfter);
        }
    }
    WebApp.TipViewModel = TipViewModel;
    /****************************************/
    class TipManager {
        constructor(tips, getPreferences, savePreferences) {
            this.tip = ko.observable();
            this._getPreferences = getPreferences;
            this._tips = tips;
            this.savePreferences = savePreferences;
        }
        /****************************************/
        get preferences() {
            return this._getPreferences();
        }
        /****************************************/
        savePreferences() {
        }
        /****************************************/
        markAction(actionId, label) {
            this.preferences.actions[actionId]++;
            this.savePreferences();
            if (!window["gtag"])
                return;
            WebApp.safeCall(() => gtag("event", actionId, {
                event_category: "GeoPlot",
                event_label: label,
                value: this.preferences.actions[actionId]
            }));
        }
        /****************************************/
        markTip(tipId, action) {
            if (!window["gtag"])
                return;
            WebApp.safeCall(() => gtag("event", action, {
                event_category: "GeoPlot/Tip",
                event_label: tipId
            }));
        }
        /****************************************/
        engageUser() {
            if (this.preferences.showTips != undefined && !this.preferences.showTips)
                return;
            const nextTip = WebApp.linq(this._tips).where(a => a.value.showAfter > 0 && this.preferences.actions[a.key] == 0).first();
            if (!this.showTip(nextTip.key, {
                onClose: () => this.engageUser(),
                timeout: nextTip.value.showAfter,
            })) {
                this.engageUser();
            }
        }
        /****************************************/
        showTip(tipId, options) {
            if (this.preferences.showTips != undefined && !this.preferences.showTips)
                return false;
            if ((!options || !options.override) && this.tip() && this.tip().isVisible())
                return false;
            if ((!options || !options.force) && this.preferences.actions[tipId])
                return false;
            const tip = this._tips[tipId];
            const model = new TipViewModel(tip);
            model.onActionExecuted = () => {
                this.markTip(tipId, "how");
            };
            model.dontShowAgain = () => {
                this.preferences.showTips = false;
                this.savePreferences();
                model.close();
                this.markTip(tipId, "dontShowAgain");
            };
            model.understood = () => {
                this.preferences.actions[tipId]++;
                this.savePreferences();
                model.close();
                this.markTip(tipId, "understood");
            };
            model.onClose = () => {
                //this.tip(null);
                if (options && options.onClose)
                    options.onClose();
            };
            let nextTip = WebApp.linq(this._tips).where(a => a.value.order > tip.order && this.preferences.actions[a.key] == 0).first();
            if (nextTip) {
                model.next = () => {
                    model.close();
                    this.preferences.actions[tipId]++;
                    this.showTip(nextTip.key);
                    this.markTip(tipId, "next");
                };
            }
            else
                model.next = null;
            this.tip(model);
            setTimeout(() => model.show(), options && options.timeout ? options.timeout * 1000 : 0);
            return true;
        }
    }
    WebApp.TipManager = TipManager;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        /****************************************/
        class IndicatorViewModel {
            constructor() {
                this.value = ko.observable();
            }
            select() {
            }
        }
        /****************************************/
        class AreaViewModel {
            constructor() {
                this.data = ko.observable();
                this.factor = ko.observable();
                this.indicator = ko.observable();
                this.reference = ko.observable();
                this.indicators = ko.observable();
            }
            select() {
            }
        }
        /****************************************/
        class GeoPlotPage {
            constructor(model) {
                this._topAreasVisible = false;
                this._execludedArea = new Map();
                this._dataSet = GeoPlot.InfectionDataSet;
                this._keepState = false;
                this._debugMode = false;
                this._tips = {
                    areaSelected: {
                        order: 0,
                        featureName: "Zone",
                        html: "Puoi vedere i dati relativi ad una particolare area selezionadoli sulla mappa.",
                        elementSelector: ".card-map .center-align",
                        showAfter: 3,
                        showAction: () => {
                            this.viewMode("region");
                            this.selectedArea = this._geo.areas["r10"];
                        }
                    },
                    indicatorSelected: {
                        order: 1,
                        featureName: "Indicatori",
                        html: "Puoi vedere il grafico associato all'indicatore, facendo click sull'indicatore.",
                        elementSelector: ".indicators .summary-field",
                        showAfter: 15,
                        showAction: () => {
                            if (!this.currentArea())
                                this._tips.areaSelected.showAction();
                            this.selectedIndicator(WebApp.linq(this._dataSet.indicators).first(a => a.id == "totalDeath"));
                        }
                    },
                    dayChanged: {
                        order: 2,
                        featureName: "Cronologia",
                        html: "Puoi vedere gli indicatori dei giorni precedenti muovendo la slide.",
                        elementSelector: ".day input[type=range]",
                        showAfter: 20,
                        showAction: () => {
                            this.dayNumber(5);
                        }
                    },
                    indicatorChanged: {
                        order: 3,
                        featureName: "Indicatori",
                        html: "Puoi cambiare l'indicatore scegliendolo dal filtro nell'elenco.",
                        elementSelector: ".filter-indicator",
                        showAfter: 0
                    },
                    viewChanged: {
                        order: 4,
                        featureName: "Zone",
                        html: "Puoi vedere gli indicatori a livello regionale, nazionale o provinciale.",
                        elementSelector: "#areaTabs",
                        showAfter: 0,
                        showAction: () => {
                            this.viewMode("district");
                        }
                    },
                    topAreasOpened: {
                        order: 5,
                        featureName: "Zone",
                        html: "Puo vedere le zone più colpite di un qualsiasi indicatore scelto.",
                        elementSelector: "#topCases .card-title",
                        showAfter: 20,
                        showAction: () => {
                            if (this.viewMode() == "country")
                                this.viewMode("region");
                            M.Collapsible.getInstance(document.getElementById("topCases")).open(0);
                        }
                    },
                    deltaSelected: {
                        order: 5.5,
                        featureName: "Indicatori",
                        html: "Puoi vedere l'incremento giornaliero dell'indicatore anzichè il valore totale.",
                        elementSelector: ".day-delta",
                        showAfter: 20,
                        showAction: () => {
                            if (!this.currentArea())
                                this._tips.areaSelected.showAction();
                            this.isDayDelta(true);
                        }
                    },
                    factorChanged: {
                        order: 6,
                        featureName: "Indicatori",
                        html: "Puoi mettere in relazione qualsiasi indicatore a numerosi parametri (es. % Positivi su Tamponi).",
                        elementSelector: ".filter-factor",
                        showAfter: 30,
                        showAction: () => {
                            if (!this.currentArea())
                                this._tips.areaSelected.showAction();
                            this.selectedIndicator(WebApp.linq(this._dataSet.indicators).first(a => a.id == "totalPositive"));
                            this.selectedFactor(WebApp.linq(this._dataSet.factors).first(a => a.id == "population"));
                        }
                    },
                    groupChanged: {
                        order: 7,
                        featureName: "Grafico",
                        html: "Puo raggruppare i dati del grafico in gruppi da 1 a 7 giorni. Puoi anche scegliere la data d'inizio.",
                        elementSelector: ".row-chart-group .select-wrapper",
                        showAfter: 30,
                        showAction: () => {
                            if (!this.currentArea())
                                this._tips.areaSelected.showAction();
                            var element = document.querySelector(".chart-options");
                            if (element.classList.contains("closed"))
                                element.classList.remove("closed");
                            this.groupSize(2);
                            M.FormSelect.init(document.querySelectorAll(".row-chart-group select"));
                        }
                    },
                    chartActionExecuted: {
                        order: 8,
                        featureName: "Grafico",
                        html: "Puoi portare il grafico a schermo interno, copiarlo, o copiare la serie numerico e incollarla in excel.",
                        elementSelector: ".chart .actions",
                        showAfter: 30
                    },
                    scaleChanged: {
                        order: 9,
                        featureName: "Grafico",
                        html: "Puoi cambiare da scala logaritmica a scala lineare.",
                        elementSelector: ".log-scale",
                        showAfter: 210,
                        showAction: () => {
                            this.isLogScale(true);
                        }
                    },
                    maxFactorChanged: {
                        order: 10,
                        featureName: "Mappa",
                        html: "Puoi cambiare il riferimento rispetto al quale la mappa viene colorata. Normalmente è in base al valore massimo che si ha avuto globalmente.",
                        elementSelector: ".max-factor",
                        showAfter: 60,
                        showAction: () => {
                            if (!this.currentArea())
                                this._tips.areaSelected.showAction();
                            this.selectedIndicator(WebApp.linq(this._dataSet.indicators).first(a => a.id == "totalPositive"));
                            this.autoMaxFactor(false);
                            this.maxFactor(1000);
                        }
                    },
                    regionExcluded: {
                        order: 11,
                        featureName: "Mappa",
                        html: "Nella vista nazionale puoi escludere dagli indicatori il valore di una o più regioni cliccando sulla mappa.",
                        elementSelector: ".card-map .center-align",
                        showAfter: 0,
                        showAction: () => {
                            if (this.viewMode() != "country")
                                this.viewMode("country");
                            this._execludedArea.set("R8", this._geo.areas["r8"]);
                            this.updateIndicator();
                        }
                    }
                };
                this._specialDates = {
                    current: {
                        date: undefined,
                        color: "#000",
                        width: 0.5,
                        label: "Giorno corrente"
                    },
                    "dpcm8": {
                        date: new Date(2020, 2, 7),
                        color: "#000",
                        dash: [5, 5],
                        width: 1,
                        visible: true,
                        label: "DPCM 8 Marzo (italia zona rossa)"
                    },
                    "dpcm9": {
                        date: new Date(2020, 2, 9),
                        color: "#000",
                        dash: [5, 5],
                        width: 1,
                        visible: true,
                        label: "DPCM 9 Marzo (italia zona rossa)"
                    },
                    "dpcm11": {
                        date: new Date(2020, 2, 11),
                        color: "#000",
                        dash: [5, 5],
                        width: 1,
                        visible: true,
                        label: "DPCM 11 Marzo (chiusura attività)"
                    },
                    "mds20": {
                        date: new Date(2020, 2, 20),
                        color: "#070",
                        dash: [5, 5],
                        width: 1,
                        visible: false,
                        label: "MDS 20 Marzo (chiura parchi, motoria nelle vicinane)"
                    },
                    "dpcm22": {
                        date: new Date(2020, 2, 21),
                        color: "#000",
                        dash: [5, 5],
                        width: 1,
                        visible: true,
                        label: "DPCM 22 Marzo (chiusura ulteriore attività)"
                    },
                    "dpcm25": {
                        date: new Date(2020, 2, 24),
                        color: "#000",
                        dash: [5, 5],
                        width: 1,
                        visible: true,
                        label: "DPCM 25 Marzo (maggiori sanzioni)"
                    }
                };
                /****************************************/
                this.dayNumber = ko.observable(0);
                this.totalDays = ko.observable(0);
                this.currentData = ko.observable();
                this.currentArea = ko.observable();
                this.topAreas = ko.observable();
                this.viewMode = ko.observable("district");
                this.selectedIndicator = ko.observable();
                this.selectedFactor = ko.observable();
                this.autoMaxFactor = ko.observable(true);
                this.maxFactor = ko.observable();
                this.isPlaying = ko.observable(false);
                this.isLogScale = ko.observable(false);
                this.isDayDelta = ko.observable(false);
                this.isZoomChart = ko.observable(false);
                this.isShowEnvData = ko.observable(false);
                this.groupSize = ko.observable(1);
                this.startDay = ko.observable(0);
                this.isNoFactorSelected = ko.computed(() => this.selectedFactor() && this.selectedFactor().id == 'none');
                this.groupDays = [1, 2, 3, 4, 5, 6, 7];
                this.factorDescription = ko.observable();
                this._data = model.data;
                this._geo = model.geo;
                this._debugMode = model.debugMode;
                this._calculator = new GeoPlot.IndicatorCalculator(this._data, this._dataSet, this._geo);
                this.totalDays(this._data.days.length - 1);
                this.dayNumber.subscribe(value => {
                    if (value != this._data.days.length - 1)
                        this.tipManager.markAction("dayChanged");
                    this.updateDayData();
                    this._specialDates.current.date = new Date(this._data.days[value].date);
                    this.updateChart();
                });
                this._mapSvg = document.getElementsByTagName("svg").item(0);
                this._mapSvg.addEventListener("click", e => this.onMapClick(e));
                this.days = [];
                for (var i = 0; i < this._data.days.length; i++)
                    this.days.push({ number: i, value: new Date(this._data.days[i].date), text: WebApp.DateUtils.format(this._data.days[i].date, $string("$(date-format-short)")) });
                const areaTabs = M.Tabs.init(document.getElementById("areaTabs"));
                areaTabs.options.onShow = (el) => {
                    this.setViewMode(el.dataset["viewMode"]);
                };
                const topCasesView = M.Collapsible.init(document.getElementById("topCases"));
                topCasesView.options.onOpenStart = () => {
                    if (!this._daysData)
                        this.updateTopAreas();
                    this._topAreasVisible = true;
                    this.tipManager.markAction("topAreasOpened");
                };
                topCasesView.options.onCloseEnd = () => {
                    this._topAreasVisible = false;
                };
                this.indicators = ko.computed(() => WebApp.linq(this._dataSet.indicators)
                    .where(a => !a.validFor || a.validFor.indexOf(this.viewMode()) != -1)
                    .toArray());
                this.factors = ko.computed(() => WebApp.linq(this._dataSet.factors)
                    .where(a => !a.validFor || a.validFor.indexOf(this.viewMode()) != -1)
                    .toArray());
                this.selectedIndicator.subscribe(value => {
                    if (!value)
                        return;
                    this.updateIndicator();
                    if (value.id != "totalPositive")
                        this.tipManager.markAction("indicatorChanged", value.id);
                });
                this.selectedFactor.subscribe(value => {
                    if (!value)
                        return;
                    this.updateIndicator();
                    if (value.id != "none")
                        this.tipManager.markAction("factorChanged", value.id);
                    setTimeout(() => M.FormSelect.init(document.querySelectorAll(".row-chart-group select")));
                });
                this.autoMaxFactor.subscribe(value => {
                    if (value) {
                        this.updateMaxFactor();
                        this.updateMap();
                    }
                    this.updateUrl();
                });
                this.maxFactor.subscribe(value => {
                    if (!this.autoMaxFactor()) {
                        this.updateMap();
                        this.tipManager.markAction("maxFactorChanged", value.toString());
                    }
                    this.updateUrl();
                });
                this.isDayDelta.subscribe(value => {
                    this.computeStartDayForGroup();
                    this.updateIndicator();
                    if (value)
                        this.tipManager.markAction("deltaSelected");
                });
                this.isLogScale.subscribe(value => {
                    this.updateChart();
                    this.updateUrl();
                    if (value)
                        this.tipManager.markAction("scaleChanged");
                });
                this.isZoomChart.subscribe(value => {
                    this.updateChart();
                });
                this.groupSize.subscribe(value => {
                    this.computeStartDayForGroup();
                    this.updateChart();
                    this.updateUrl();
                    if (value > 1)
                        this.tipManager.markAction("groupChanged", value.toString());
                });
                this.startDay.subscribe(value => {
                    this.updateChart();
                    this.updateUrl();
                });
                const urlParams = new URLSearchParams(window.location.search);
                const stateRaw = urlParams.get("state");
                this._keepState = urlParams.get("keepState") == "true";
                this.loadPreferences();
                this.tipManager = new WebApp.TipManager(this._tips, () => this._preferences, () => this.savePreferences());
                this.tipManager.engageUser();
                let state;
                if (stateRaw && this._keepState)
                    state = JSON.parse(atob(stateRaw));
                else
                    state = {};
                setTimeout(() => this.loadState(state), 0);
                if (!this._debugMode)
                    window.addEventListener("beforeunload", () => this.savePreferences());
                //Templating.template(document.querySelector("#template"), "TestComponent", Templating.model({ isChecked: false }));
            }
            /****************************************/
            isDefaultState(state) {
                return (!state.day || state.day == this._data.days.length - 1) &&
                    (!state.view || state.view == "region") &&
                    !state.area &&
                    (!state.indicator || state.indicator == "totalPositive") &&
                    (!state.factor || state.factor == "none") &&
                    !state.maxFactor &&
                    !state.dayDelta &&
                    !state.logScale &&
                    !state.showEnvData &&
                    (!state.groupSize || state.groupSize == 1) &&
                    (state.startDay == undefined || state.startDay == 0) &&
                    (!state.excludedArea);
            }
            /****************************************/
            loadState(state) {
                if (!state.view)
                    state.view = "region";
                const viewTabs = M.Tabs.getInstance(document.getElementById("areaTabs"));
                viewTabs.select(GeoPlot.ViewModes[state.view].tab);
                document.body.scrollTop = 0;
                if (state.logScale != undefined)
                    this.isLogScale(state.logScale);
                if (state.groupSize)
                    this.groupSize(state.groupSize);
                if (state.startDay != undefined)
                    this.startDay(state.startDay);
                if (state.dayDelta != undefined)
                    this.isDayDelta(state.dayDelta);
                if (state.showEnvData != undefined)
                    this.isShowEnvData(state.showEnvData);
                if (state.maxFactor) {
                    this.autoMaxFactor(false);
                    this.maxFactor(state.maxFactor);
                }
                this.dayNumber(state.day != undefined ? state.day : this._data.days.length - 1);
                if (state.excludedArea) {
                    this._execludedArea.clear();
                    for (let areaId of state.excludedArea)
                        this._execludedArea.set(areaId, this._geo.areas[areaId.toLowerCase()]);
                }
                if (state.indicator)
                    this.selectedIndicator(WebApp.linq(this._dataSet.indicators).first(a => a.id == state.indicator));
                if (state.factor)
                    this.selectedFactor(WebApp.linq(this._dataSet.factors).first(a => a.id == state.factor));
                if (state.area)
                    this.selectedArea = this._geo.areas[state.area.toLowerCase()];
            }
            /****************************************/
            saveStata() {
                return {
                    view: this.viewMode() == "region" ? undefined : this.viewMode(),
                    indicator: this.selectedIndicator() ? this.selectedIndicator().id : undefined,
                    factor: this.selectedFactor() ? this.selectedFactor().id : undefined,
                    dayDelta: this.isDayDelta() ? true : undefined,
                    maxFactor: this.autoMaxFactor() ? undefined : this.maxFactor(),
                    day: this.dayNumber() == this._data.days.length - 1 ? undefined : this.dayNumber(),
                    area: this.selectedArea ? this.selectedArea.id : undefined,
                    groupSize: this.groupSize() == 1 ? undefined : this.groupSize(),
                    startDay: this.startDay() == 0 ? undefined : this.startDay(),
                    logScale: this.isLogScale() ? true : undefined,
                    excludedArea: this._execludedArea.size > 0 ? WebApp.linq(this._execludedArea.keys()).toArray() : undefined,
                    showEnvData: this.isShowEnvData() ? true : undefined
                };
            }
            /****************************************/
            loadPreferences() {
                let json = localStorage.getItem("preferences");
                if (json) {
                    try {
                        this._preferences = JSON.parse(json);
                    }
                    catch (_a) {
                    }
                    if (!this._preferences || this._preferences.version != 1) {
                        this._preferences = this.getDefaultPreferences();
                        this._preferences.isFirstView = false;
                        this._preferences.showTips = false;
                        this.savePreferences();
                    }
                }
                else
                    this._preferences = this.getDefaultPreferences();
            }
            /****************************************/
            getDefaultPreferences() {
                return ({
                    isFirstView: true,
                    showTips: true,
                    version: 1,
                    actions: {
                        areaSelected: 0,
                        indicatorSelected: 0,
                        indicatorChanged: 0,
                        dayChanged: 0,
                        viewChanged: 0,
                        chartActionExecuted: 0,
                        factorChanged: 0,
                        groupChanged: 0,
                        maxFactorChanged: 0,
                        scaleChanged: 0,
                        topAreasOpened: 0,
                        deltaSelected: 0,
                        regionExcluded: 0
                    }
                });
            }
            /****************************************/
            savePreferences() {
                this._preferences.isFirstView = false;
                localStorage.setItem("preferences", JSON.stringify(this._preferences));
            }
            /****************************************/
            toggleChartZoom() {
                this._preferences.actions.chartActionExecuted++;
                this.isZoomChart(!this.isZoomChart());
            }
            /****************************************/
            copyMap() {
                return __awaiter(this, void 0, void 0, function* () {
                    const element = document.querySelector("svg.map");
                    const svgText = element.outerHTML;
                    const blob = new Blob([svgText], { type: "image/svg+xml" });
                    if (navigator["clipboard"] && navigator["clipboard"]["write"]) {
                        const svgImage = document.createElement('img');
                        svgImage.style.width = element.clientWidth + "px";
                        svgImage.style.height = element.clientHeight + "px";
                        svgImage.onload = function () {
                            const canvas = document.createElement("canvas");
                            canvas.width = element.clientWidth;
                            canvas.height = element.clientHeight;
                            const ctx = canvas.getContext("2d");
                            ctx.fillStyle = "white";
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            ctx.drawImage(svgImage, 0, 0);
                            canvas.toBlob((pngBlob) => __awaiter(this, void 0, void 0, function* () {
                                let item = new ClipboardItem({ [pngBlob.type]: pngBlob });
                                yield navigator.clipboard.write([item]);
                                M.toast({ html: $string("$(msg-map-copied)") });
                            }));
                        };
                        svgImage.src = window.URL.createObjectURL(blob);
                    }
                    else {
                        const element = document.createElement("a");
                        element.href = window.URL.createObjectURL(blob);
                        element.target = "_blan";
                        element.download = "map.svg";
                        element.click();
                        M.toast({ html: $string("$(msg-no-copy)") });
                    }
                });
            }
            /****************************************/
            copyChart() {
                this._chart.canvas.toBlob((blob) => __awaiter(this, void 0, void 0, function* () {
                    if (navigator["clipboard"] && navigator["clipboard"]["write"]) {
                        let item = new ClipboardItem({ [blob.type]: blob });
                        yield navigator.clipboard.write([item]);
                        M.toast({ html: $string("$(msg-chart-copied)") });
                    }
                    else {
                        const url = window.URL.createObjectURL(blob);
                        const element = document.createElement("a");
                        element.href = url;
                        element.target = "_blan";
                        element.download = this._chart.options.title.text + ".png";
                        element.click();
                        M.toast({ html: $string("$(msg-no-copy)") });
                    }
                }));
                this.tipManager.markAction("chartActionExecuted", "copy");
            }
            /****************************************/
            copySerie() {
                return __awaiter(this, void 0, void 0, function* () {
                    const data = this._chart.data.datasets[0].data;
                    let text = "";
                    for (let i = 0; i < data.length; i++)
                        text += WebApp.DateUtils.format(data[i].x, $string("$(date-format)")) + "\t" + i + "\t" + WebApp.MathUtils.round(data[i].y, 1) + "\n";
                    WebApp.DomUtils.copyText(text);
                    M.toast({ html: $string("$(msg-serie-copied)") });
                    this.tipManager.markAction("chartActionExecuted", "copySerie");
                });
            }
            /****************************************/
            copySerieForStudio() {
                return __awaiter(this, void 0, void 0, function* () {
                    let obj = {
                        type: "serie",
                        version: 1,
                        color: this.selectedIndicator().colorLight,
                        serie: {
                            type: "geoplot",
                            areaId: this.selectedArea.id,
                            indicatorId: this.selectedIndicator().id,
                            xAxis: "dayNumber",
                            startDay: this.startDay(),
                            exeludedAreaIds: WebApp.linq(this._execludedArea.keys()).toArray(),
                            factorId: this.selectedFactor().id,
                            groupSize: this.groupSize(),
                            isDelta: this.isDayDelta(),
                        },
                        title: this.factorDescription()
                    };
                    obj.values = this._calculator.getSerie(obj.serie);
                    WebApp.DomUtils.copyText(JSON.stringify(obj));
                    M.toast({ html: $string("$(msg-serie-copied-studio)") });
                    this.tipManager.markAction("chartActionExecuted", "copySerieForStudio");
                });
            }
            /****************************************/
            play() {
                if (this.dayNumber() == this._data.days.length - 1)
                    this.dayNumber(0);
                this.isPlaying(true);
                this.nextFrame();
            }
            /****************************************/
            pause() {
                this.isPlaying(false);
            }
            /****************************************/
            setViewMode(mode) {
                if (mode != "region")
                    this.tipManager.markAction("viewChanged", mode);
                this.viewMode(mode);
                const districtGroup = document.getElementById("group_district");
                if (mode == "district")
                    districtGroup.style.removeProperty("display");
                else
                    districtGroup.style.display = "none";
                this.selectedArea = null;
                this._chart = null;
                this._execludedArea.clear();
                this.clearMap();
                this.updateMaxFactor();
                this.updateDayData();
                if (this.viewMode() == "country") {
                    this.selectedArea = this._geo.areas["it"];
                    this.tipManager.showTip("regionExcluded", { timeout: 5 });
                }
                else {
                    if (this._topAreasVisible)
                        this.updateTopAreas();
                    else
                        this._daysData = undefined;
                }
                setTimeout(() => M.FormSelect.init(document.querySelectorAll(".row-indicator select")));
            }
            /****************************************/
            get selectedArea() {
                return this._selectedArea;
            }
            set selectedArea(value) {
                if (value == this._selectedArea)
                    return;
                if (this._selectedArea) {
                    const element = document.getElementById(this._selectedArea.id.toUpperCase());
                    if (element)
                        element.classList.remove("selected");
                }
                this._selectedArea = value;
                if (this._selectedArea) {
                    const element = document.getElementById(this._selectedArea.id.toUpperCase());
                    if (element) {
                        element.classList.add("selected");
                        const parent = element.parentElement;
                        element.remove();
                        parent.appendChild(element);
                    }
                }
                this.changeArea();
            }
            /****************************************/
            getFactorValue(dayNumberOrGroup, areaOrId) {
                return this._calculator.getFactorValue({
                    dayNumberOrGroup: dayNumberOrGroup,
                    areaOrId: areaOrId,
                    factorId: this.selectedFactor().id,
                    indicatorId: this.selectedIndicator().id,
                    isDayDelta: this.isDayDelta(),
                    execludedAreas: WebApp.linq(this._execludedArea.keys()).toArray()
                });
            }
            /****************************************/
            getIndicatorValue(dayNumber, areaOrId, indicatorId) {
                return this._calculator.getIndicatorValue({
                    dayNumber: dayNumber,
                    areaOrId: areaOrId,
                    indicatorId: indicatorId,
                    isDayDelta: this.isDayDelta(),
                    execludedAreas: WebApp.linq(this._execludedArea.keys()).toArray()
                });
            }
            /****************************************/
            computeStartDayForGroup() {
                let totDays = this.days.length - this.startDay();
                const module = (totDays % this.groupSize());
                if (module != 0) {
                    const invModule = this.groupSize() - module;
                    if (this.startDay() - invModule >= 0)
                        this.startDay(this.startDay() - invModule);
                    else if (this.startDay() + module < this.days.length - 1)
                        this.startDay(this.startDay() + module);
                    M.FormSelect.init(document.querySelectorAll(".row-chart-group select"));
                }
            }
            /****************************************/
            onMapClick(e) {
                const item = e.target;
                const areaId = item.parentElement.id;
                const area = this._geo.areas[areaId.toLowerCase()];
                if (!area)
                    return;
                if (this.viewMode() == "country") {
                    if (this._execludedArea.has(areaId))
                        this._execludedArea.delete(areaId);
                    else {
                        this._execludedArea.set(areaId, area);
                        M.toast({ html: $string("$(msg-region-ex)").replace("[region]", area.name) });
                    }
                    this.updateIndicator();
                }
                else {
                    if (item.parentElement.classList.contains(this.viewMode()))
                        this.selectedArea = area;
                }
                this.tipManager.markAction("areaSelected", area.name);
            }
            /****************************************/
            nextFrame() {
                if (!this.isPlaying())
                    return;
                if (this.dayNumber() >= this._data.days.length - 1)
                    this.pause();
                else
                    this.dayNumber(parseInt(this.dayNumber().toString()) + 1);
                setTimeout(() => this.nextFrame(), 1000);
            }
            /****************************************/
            changeArea() {
                if (this._selectedArea == null)
                    this.currentArea(null);
                else {
                    var isEmptyArea = !this.currentArea();
                    const area = new AreaViewModel();
                    area.value = this._selectedArea;
                    this.updateArea(area);
                    this.currentArea(area);
                    this.updateFactorDescription();
                    this.updateAreaIndicators();
                    this.updateChart();
                    if (isEmptyArea) {
                        M.FormSelect.init(document.querySelectorAll(".row-chart-group select"));
                        M.Tooltip.init(document.querySelectorAll(".row-chart-group .tooltipped"));
                    }
                }
                this.updateUrl();
            }
            /****************************************/
            updateAreaIndicators() {
                if (!this.currentArea())
                    return;
                if (!this.currentArea().indicators()) {
                    const items = [];
                    for (let indicator of this.indicators()) {
                        let item = new IndicatorViewModel();
                        item.indicator = indicator;
                        item.select = () => {
                            this.tipManager.markAction("indicatorSelected", item.indicator.id);
                            this.selectedIndicator(indicator);
                            setTimeout(() => M.FormSelect.init(document.querySelectorAll(".row-indicator select")));
                        };
                        items.push(item);
                    }
                    this.currentArea().indicators(items);
                }
                const areaId = this.currentArea().value.id.toLowerCase();
                for (let item of this.currentArea().indicators())
                    item.value(this.getIndicatorValue(this.dayNumber(), areaId, item.indicator.id));
            }
            /****************************************/
            updateFactorDescription() {
                let desc = "";
                if (this.isDayDelta())
                    desc = "$(new) ";
                desc += this.selectedFactor().description.replace("[indicator]", this.selectedIndicator().name);
                if (this.currentArea())
                    desc += " - " + this.currentArea().value.name;
                if (this._execludedArea.size > 0) {
                    desc += " - $(except) (";
                    let i = 0;
                    for (let key of this._execludedArea.keys()) {
                        if (i > 0)
                            desc += ", ";
                        desc += this._execludedArea.get(key).name;
                        i++;
                    }
                    desc += ")";
                }
                this.factorDescription($string(desc));
            }
            /****************************************/
            updateIndicator() {
                if (!this.selectedIndicator() || !this.selectedFactor())
                    return;
                this.updateFactorDescription();
                /*
                if (this.selectedFactor().id != "none") {
     
                    if (this.groupSize() != 1)
                        this.groupSize(1);
                }*/
                this.updateMaxFactor();
                this.updateDayData();
                this.updateChart();
                this.updateUrl();
                if (this._topAreasVisible)
                    this.updateTopAreas();
            }
            /****************************************/
            updateMaxFactor() {
                if (!this.selectedFactor() || !this.selectedIndicator() || !this.autoMaxFactor())
                    return;
                let result = Number.NEGATIVE_INFINITY;
                let curView = GeoPlot.ViewModes[this.viewMode()];
                for (let i = 0; i < this._data.days.length; i++) {
                    const day = this._data.days[i];
                    for (let areaId in day.values) {
                        if (!curView.validateId(areaId))
                            continue;
                        const factor = this.getFactorValue(i, areaId);
                        if (factor > result && factor != Number.POSITIVE_INFINITY)
                            result = factor;
                    }
                }
                this.maxFactor(parseFloat(result.toFixed(1)));
            }
            /****************************************/
            initChart() {
                const canvas = document.querySelector("#areaGraph");
                const referencesPlugIn = {
                    afterDraw: chart => {
                        const data = chart.data.datasets[0].data;
                        if (!data || data.length == 0)
                            return;
                        const xScale = chart["scales"]["x-axis-0"];
                        const ctx = chart.ctx;
                        for (let key in this._specialDates) {
                            let item = this._specialDates[key];
                            if (!item.date || item.visible === false)
                                continue;
                            let offset = xScale["getPixelForValue"]({ x: item.date });
                            ctx.lineWidth = item.width || 1;
                            ctx.beginPath();
                            ctx.moveTo(offset, chart.chartArea.top);
                            ctx.lineTo(offset, chart.chartArea.bottom);
                            ctx.strokeStyle = item.color || "#000";
                            if (item.dash)
                                ctx.setLineDash(item.dash);
                            else
                                ctx.setLineDash([]);
                            if (item.dashOffset)
                                ctx.lineDashOffset = item.dashOffset;
                            ctx.stroke();
                        }
                    }
                };
                this._chart = new Chart(canvas, {
                    plugins: [referencesPlugIn],
                    type: "line",
                    data: {
                        datasets: [
                            {
                                lineTension: 0,
                                data: [],
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        maintainAspectRatio: false,
                        legend: {
                            display: true,
                            position: "bottom"
                        },
                        title: {
                            display: false,
                        },
                        tooltips: {
                            callbacks: {
                                label: (t, d) => {
                                    return t.xLabel + ": " + WebApp.MathUtils.round(parseFloat(t.value), 1);
                                }
                            }
                        },
                        scales: {
                            xAxes: [{
                                    type: "time",
                                    distribution: "linear",
                                    time: {
                                        unit: "day",
                                        tooltipFormat: "DD/MMM"
                                    }
                                }],
                        }
                    }
                });
            }
            /****************************************/
            updateChart() {
                if (!this.selectedIndicator() || !this.currentArea() || !this.selectedFactor())
                    return;
                if (this._chart == null)
                    this.initChart();
                const area = this.currentArea().value;
                const areaId = area.id.toLowerCase();
                const field = this.selectedIndicator().id;
                this._chart.data.datasets[0].label = this.factorDescription();
                this._chart.options.title.text = this._chart.data.datasets[0].label;
                if (this.isLogScale())
                    this._chart.options.scales.yAxes[0].type = "logarithmic";
                else
                    this._chart.options.scales.yAxes[0].type = "linear";
                this._chart.data.datasets[0].borderColor = this.selectedIndicator().colorDark;
                this._chart.data.datasets[0].backgroundColor = this.selectedIndicator().colorLight;
                this._chart.data.datasets[0].data = this._calculator.getSerie({
                    type: "geoplot",
                    areaId: area.id,
                    indicatorId: this.selectedIndicator().id,
                    xAxis: "date",
                    startDay: this.startDay(),
                    exeludedAreaIds: WebApp.linq(this._execludedArea.keys()).toArray(),
                    factorId: this.selectedFactor().id,
                    groupSize: this.groupSize(),
                    isDelta: this.isDayDelta()
                });
                this._chart.update();
            }
            /****************************************/
            updateArea(value, dayNumber) {
                if (!value || !this.selectedIndicator() || !this.selectedFactor())
                    return;
                if (dayNumber == undefined)
                    dayNumber = this.dayNumber();
                const id = value.value.id.toLowerCase();
                const area = value.value;
                const day = this._data.days[dayNumber];
                if (!day || !day.values[id]) {
                    M.toast({
                        html: $string("$msg-no-data)")
                    });
                    return;
                }
                value.data(day.values[id]);
                value.indicator(this.getIndicatorValue(dayNumber, id, this.selectedIndicator().id));
                value.factor(WebApp.MathUtils.round(this.getFactorValue(dayNumber, area), 1));
                value.reference(this.selectedFactor().reference(day.values[id], area));
            }
            /****************************************/
            updateTopAreas() {
                this._daysData = [];
                for (let i = 0; i < this._data.days.length; i++) {
                    const day = this._data.days[i];
                    const item = {};
                    const isInArea = GeoPlot.ViewModes[this.viewMode()].validateId;
                    item.topAreas = WebApp.linq(day.values).select(a => ({
                        factor: this.getFactorValue(i, a.key),
                        value: a
                    }))
                        .orderByDesc(a => a.factor).where(a => isInArea(a.value.key)).select(a => {
                        const area = new AreaViewModel();
                        area.value = this._geo.areas[a.value.key.toLowerCase()];
                        area.select = () => this.selectedArea = area.value;
                        this.updateArea(area, i);
                        return area;
                    }).take(25).toArray();
                    this._daysData.push(item);
                }
                this.topAreas(this._daysData[this.dayNumber()].topAreas);
            }
            /****************************************/
            updateDayData() {
                const day = this._data.days[this.dayNumber()];
                this.currentData(WebApp.DateUtils.format(day.date, $string("$(date-format)")));
                this.updateMap();
                this.updateArea(this.currentArea());
                this.updateAreaIndicators();
                if (this._daysData && this._topAreasVisible)
                    this.topAreas(this._daysData[this.dayNumber()].topAreas);
                this.updateUrl();
            }
            /****************************************/
            updateUrl() {
                if (!this._keepState)
                    return;
                const state = this.saveStata();
                let url = WebApp.app.baseUrl + "Overview";
                if (!this.isDefaultState(state))
                    url += "?state=" + encodeURIComponent(btoa(JSON.stringify(state))) + "&keepState=true";
                history.replaceState(null, null, url);
            }
            /****************************************/
            clearMap() {
                const day = this._data.days[this.dayNumber()];
                for (const key in day.values) {
                    const element = document.getElementById(key.toUpperCase());
                    if (element) {
                        //element.style.fillOpacity = "1";
                        element.style.removeProperty("fill");
                    }
                }
            }
            /****************************************/
            updateMap() {
                if (!this.selectedIndicator() || !this.selectedFactor())
                    return;
                if (this.viewMode() != "country") {
                    const day = this._data.days[this.dayNumber()];
                    const gradient = new WebApp.LinearGradient("#fff", this.selectedIndicator().colorDark);
                    for (const key in day.values) {
                        const element = document.getElementById(key.toUpperCase());
                        if (element) {
                            const area = this._geo.areas[key];
                            if (area.type != GeoPlot.ViewModes[this.viewMode()].areaType)
                                continue;
                            let factor = this.getFactorValue(this.dayNumber(), area);
                            if (factor == Number.POSITIVE_INFINITY)
                                factor = NaN;
                            factor = Math.min(1, factor / this.maxFactor());
                            if (isNaN(factor)) {
                                if (element.classList.contains("valid"))
                                    element.classList.remove("valid");
                                //element.style.fillOpacity = "1";
                                element.style.removeProperty("fill");
                            }
                            else {
                                if (!element.classList.contains("valid"))
                                    element.classList.add("valid");
                                const value = WebApp.MathUtils.discretize(WebApp.MathUtils.exponential(factor), 20);
                                //element.style.fillOpacity = value.toString();
                                element.style.fill = gradient.valueAt(0.15 + (factor * 0.85)).toString();
                            }
                        }
                    }
                }
                else {
                    WebApp.linq(document.querySelectorAll("g.region")).foreach((element) => {
                        if (this._execludedArea.has(element.id))
                            element.style.fill = "#444";
                        else
                            element.style.fill = "#FFF";
                    });
                }
            }
        }
        GeoPlot.GeoPlotPage = GeoPlotPage;
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        function toSafeString(value) {
            if (value == null || value == undefined)
                return undefined;
            return value.toString();
        }
        /****************************************/
        class ParameterViewModel {
            constructor(config) {
                this.min = ko.observable();
                this.max = ko.observable();
                this.step = ko.observable();
                this.isSelected = ko.observable(true);
                this.value = config.value;
                this.name = config.name;
            }
        }
        /****************************************/
        /* Regression
        /****************************************/
        class GraphContext {
            constructor() {
                this.vars = {};
            }
            setExpressions(values) {
                const state = this.calculator.getState();
                for (let value of values) {
                    const curExp = WebApp.linq(state.expressions.list).first(a => a.id == value.id);
                    if (!curExp)
                        state.expressions.list.push(value);
                    else {
                        for (let prop of Object.getOwnPropertyNames(value))
                            curExp[prop] = value[prop];
                    }
                }
                const groups = WebApp.linq(state.expressions.list).where(a => a.type != "folder").groupBy(a => a.folderId ? a.folderId : "").toDictionary(a => a.key, a => a.values.toArray());
                const newList = [];
                for (let folder of WebApp.linq(state.expressions.list).where(a => a.type == "folder")) {
                    newList.push(folder);
                    const items = groups[folder.id];
                    if (items)
                        for (let item of items)
                            newList.push(item);
                }
                const items = groups[""];
                if (items)
                    for (let item of items)
                        newList.push(item);
                state.expressions.list = newList;
                this.calculator.setState(state);
            }
            /****************************************/
            setColor(id, color) {
                this.calculator.controller.dispatch({ type: "set-item-color", id: id, color: color });
            }
            /****************************************/
            updateTable(id, values) {
                const exp = WebApp.linq(this.calculator.getExpressions()).where(a => a.id == id).first();
                if (exp) {
                    exp.columns[0].values = WebApp.linq(values).select(a => a.x.toString()).toArray();
                    exp.columns[1].values = WebApp.linq(values).select(a => a.y.toString()).toArray();
                    this.calculator.setExpression(exp);
                }
            }
            /****************************************/
            updateExpression(value) {
                const exp = WebApp.linq(this.calculator.getExpressions()).where(a => a.id == value.id).first();
                /*if (exp) {
                    for (let prop of Object.getOwnPropertyNames(value))
                        exp[prop] = value[prop];
                    this.calculator.setExpression(exp);
                }*/
                this.calculator.setExpression(value);
            }
            /****************************************/
            updateVariable(id, varName, value) {
                if (!varName)
                    return;
                this.updateExpression({ id: id, latex: varName + "=" + value.toString() });
            }
            /****************************************/
            expressionZoomFit(id) {
                this.calculator.controller.dispatch({ type: "expression-zoom-fit", id: id });
            }
            /****************************************/
            setItemVisibile(id, value) {
                this.updateExpression({ id: id, hidden: !value });
                //this.calculator.controller._setItemHidden(id, !value);
                //this.calculator.updateSettings({});
            }
            /****************************************/
            generateVars(map) {
                for (let key in map) {
                    if (!map[key])
                        map[key] = this.generateVar(key);
                }
            }
            /****************************************/
            generateVar(prefix = "a") {
                if (!this.vars[prefix[0]])
                    this.vars[prefix[0]] = 0;
                this.vars[prefix[0]]++;
                return prefix[0] + "_{" + this.vars[prefix[0]] + "}";
            }
        }
        /****************************************/
        class BaseItem {
            constructor() {
                this.canDrag = false;
                this.name = ko.observable();
                this.time = ko.observable(0);
                this.color = ko.observable();
                this.parameters = ko.observableArray();
            }
            /****************************************/
            createActions(result) {
                result.push(WebApp.apply(new GeoPlot.ActionViewModel(), action => {
                    action.text = $string("$(delete)");
                    action.icon = "delete";
                    action.execute = () => this.remove();
                }));
            }
            /****************************************/
            canAccept(value) {
                return false;
            }
            /****************************************/
            canReadData(transfer) {
                return false;
            }
            /****************************************/
            readData(transfer) {
            }
            /****************************************/
            writeData(transfer) {
                return false;
            }
            /****************************************/
            setState(state) {
                if (state.name)
                    this.name(state.name);
                if (state.visible != undefined)
                    this.node.isVisible(state.visible);
                if (state.color)
                    this.color(state.color);
                if (state.opened != undefined)
                    this.node.isExpanded(state.opened);
                if (state.folderId)
                    this.folderId = state.folderId;
                this.setStateWork(state);
                this.updateGraph();
                this.setChildrenStateWork(state);
            }
            /****************************************/
            getState() {
                return {
                    name: this.name(),
                    visible: this.node.isVisible(),
                    folderId: this.folderId,
                    color: this.color(),
                    opened: this.node.isExpanded()
                };
            }
            /****************************************/
            getVar(name) {
                return this._varsMap[name];
            }
            /****************************************/
            remove(recursive = true) {
                if (this._graphCtx) {
                    this._graphCtx.calculator.removeExpression({ id: this.getGraphId("private") });
                    this._graphCtx.calculator.removeExpression({ id: this.getGraphId("public") });
                }
                this.node.remove();
                if (recursive)
                    this.children.foreach(a => a.remove());
            }
            /****************************************/
            attachNode(node) {
                this.node = node;
                this.node.isVisible.subscribe(value => this.updateGraphVisibility());
                this.node.isSelected.subscribe(value => {
                    if (value)
                        this.onSelected();
                });
                const actions = [];
                this.createActions(actions);
                this.node.actions(actions);
            }
            /****************************************/
            attachGraph(ctx) {
                this._graphCtx = ctx;
                this._graphCtx.calculator.observe("expressionAnalysis", () => this.onGraphChanged());
                this.color.subscribe(value => this.updateColor());
            }
            /****************************************/
            isFullVisible() {
                let curNode = this.node;
                while (curNode) {
                    if (!curNode.isVisible())
                        return false;
                    curNode = curNode.parentNode;
                }
                return true;
            }
            /****************************************/
            updateGraphVisibility(recorsive = true) {
                const visible = this.isFullVisible();
                this._graphCtx.setItemVisibile(this.getGraphId("public"), visible);
                this._graphCtx.setItemVisibile(this.getGraphId("private"), visible);
                if (recorsive)
                    this.children.foreach(a => a.updateGraphVisibility());
                return visible;
            }
            /****************************************/
            updateGraph(recursive = true) {
                if (!this._graphCtx)
                    return;
                if (!this.folderId)
                    this.folderId = WebApp.StringUtils.uuidv4();
                const values = this.getExpressions();
                this._graphCtx.setExpressions(values);
                this.updateGraphWork();
                this.updateGraphVisibility();
                this.updateParameters();
                if (recursive)
                    this.children.foreach(a => a.updateGraph(recursive));
            }
            /****************************************/
            onParentChanged() {
                this.updateGraphVisibility();
            }
            /****************************************/
            get parent() {
                return this.node.parentNode.value();
            }
            /****************************************/
            get children() {
                return WebApp.linq(this.node.nodes()).select(a => a.value());
            }
            /****************************************/
            replaceVars(value) {
                for (let item in this._varsMap) {
                    const reg = new RegExp("\\$" + item, "g");
                    value = value.replace(reg, this._varsMap[item]);
                }
                return value;
            }
            /****************************************/
            getGraphId(section) {
                return this.folderId + "/" + section;
            }
            /****************************************/
            addChildrenWork(value, updateGraph = true) {
                const node = new GeoPlot.TreeNodeViewModel(value);
                this.node.addNode(node);
                value.attachNode(node);
                value.attachGraph(this._graphCtx);
                if (updateGraph)
                    value.updateGraph();
                value.onParentChanged();
                return value;
            }
            /****************************************/
            createParameters(result) {
                return false;
            }
            /****************************************/
            updateParameters() {
                const values = [];
                if (this.createParameters(values)) {
                    this.parameters.removeAll();
                    values.forEach(a => this.parameters.push(a));
                }
            }
            /****************************************/
            updateGraphWork() {
            }
            /****************************************/
            setChildrenStateWork(state) {
            }
            /****************************************/
            onSelected() {
            }
            /****************************************/
            onGraphChanged() {
            }
            /****************************************/
            updateColor() {
            }
        }
        /****************************************/
        class RegressionFunctionViewModel {
            constructor() {
                this.vars = ko.observable();
            }
            select() {
            }
        }
        /****************************************/
        class RegressionFunctionVarViewModel {
            constructor() {
                this.curValue = ko.observable();
                this.autoCompute = ko.observable();
                this.min = ko.observable();
                this.max = ko.observable();
                this.step = ko.observable();
            }
        }
        /****************************************/
        class StudioSerieRegression extends BaseItem {
            /****************************************/
            constructor(config) {
                super();
                this._varsMap = {};
                this.selectedFunction = ko.observable();
                this.showIntegration = ko.observable(true);
                this.maxDay = ko.observable();
                this.endDay = ko.observable();
                this._varsMap = {
                    "fun": null,
                    "sum": null,
                    "n1": null,
                    "n2": null,
                    "value": null,
                    "time": null,
                    "tend": null,
                    "xp": null
                };
                this.itemType = "regression";
                this.icon = "show_chart";
                this.optionsTemplateName = "RegressionOptionsTemplate";
                this.functions = [];
                this.addFunction({
                    name: $string("$(log-normal)"),
                    type: "log-normal",
                    value: "$y\\sim $c\\cdot\\frac{ e^ {-\\frac{ \\left(\\ln\\ \\left($x - $a\\right) \\ -$u\\right)^ { 2}} { 2$o^ { 2} }}}{ \\left($x - $a\\right) \\sqrt{ 2\\pi } $o }",
                    vars: [{
                            name: "a",
                            label: $string("$(offset)"),
                            autoCompute: true,
                            precision: 0
                        },
                        {
                            name: "c",
                            label: $string("$(total)"),
                            autoCompute: true,
                            precision: 0
                        },
                        {
                            name: "o",
                            label: $string("$(variance)"),
                            autoCompute: true,
                            precision: 5
                        },
                        {
                            name: "u",
                            label: $string("$(average)"),
                            autoCompute: true,
                            precision: 5
                        }]
                });
                this.addFunction({
                    name: $string("$(normal)"),
                    type: "normal",
                    value: "$y\\sim $c\\cdot\\ \\left(\\frac{1}{\\sqrt{2\\cdot\\pi}\\cdot $o}\\right)\\cdot e^{-\\frac{1}{2}\\cdot\\left(\\frac{\\left($x-$u\\right)}{$o}\\right)^{2}}",
                    vars: [
                        {
                            name: "c",
                            label: $string("$(total)"),
                            autoCompute: true,
                            precision: 0
                        },
                        {
                            name: "o",
                            label: $string("$(variance)"),
                            autoCompute: true,
                            precision: 5
                        },
                        {
                            name: "u",
                            label: $string("$(avg-peak)"),
                            autoCompute: true,
                            precision: 0
                        }
                    ]
                });
                this.addFunction({
                    name: $string("$(exponential)"),
                    type: "exponential",
                    value: "$y\\sim $a^{\\left($x-$b\\right)}",
                    vars: [
                        {
                            name: "a",
                            label: $string("$(base)"),
                            autoCompute: true,
                            precision: 5
                        },
                        {
                            name: "b",
                            label: $string("$(offset)"),
                            autoCompute: true,
                            precision: 5
                        }
                    ]
                });
                this.addFunction({
                    name: $string("$(linear)"),
                    type: "linear",
                    value: "$y\\sim $a+$m$x",
                    vars: [
                        {
                            name: "a",
                            label: $string("$(offset)"),
                            autoCompute: true,
                            precision: 5
                        },
                        {
                            name: "m",
                            label: $string("$(slope)"),
                            autoCompute: true,
                            precision: 5
                        }
                    ]
                });
                this.showIntegration.subscribe(() => {
                    this._graphCtx.setItemVisibile(this.getGraphId("sum-serie"), this.isFullVisible() && this.showIntegration());
                    this._graphCtx.setItemVisibile(this.getGraphId("sum-point"), this.isFullVisible() && this.showIntegration());
                });
                this.selectedFunction.subscribe(a => {
                    if (!this.name() && a)
                        return this.name(a.value.name);
                });
                this.endDay.subscribe(a => this.updateEndDay());
                this.maxDay.subscribe(a => this.updateEndDay());
                this.selectedFunction(this.functions[0]);
                if (config)
                    this.setState(config);
            }
            /****************************************/
            addFunction(value) {
                const model = new RegressionFunctionViewModel();
                model.value = value;
                model.select = () => {
                    this.selectedFunction(model);
                    this.name(model.value.name);
                    this.updateGraph();
                };
                const vars = [];
                for (let item of value.vars) {
                    const vModel = new RegressionFunctionVarViewModel();
                    vModel.value = item;
                    vModel.curValue(item.value);
                    vModel.autoCompute(item.autoCompute);
                    vModel.min(item.minValue);
                    vModel.max(item.maxValue);
                    vModel.step(item.step);
                    vModel.min.subscribe(a => item.minValue = a);
                    vModel.max.subscribe(a => item.maxValue = a);
                    vModel.step.subscribe(a => item.step = a);
                    vModel.curValue.subscribe(a => item.value = a);
                    vModel.autoCompute.subscribe(a => {
                        item.autoCompute = a;
                        this.updateGraph();
                    });
                    vModel.curValue.subscribe(value => {
                        if (!vModel.autoCompute()) {
                            this._graphCtx.updateVariable(this.getGraphId(item.name + "-value"), this.getVar(item.name), value);
                        }
                    });
                    vars.push(vModel);
                }
                model.vars(vars);
                this.functions.push(model);
                return model;
            }
            /****************************************/
            onGraphChanged() {
                /*
                const item = this._graphCtx.calculator.expressionAnalysis[this.getGraphId("end-day")];
                if (item && item.evaluation)
                    this.endDay(item.evaluation.value);*/
                this.updateRegressionVars();
            }
            /****************************************/
            updateRegressionVars() {
                let model = this._graphCtx.calculator.controller.getItemModel(this.getGraphId("main"));
                if (model && model.regressionParameters) {
                    for (let item of this.selectedFunction().vars()) {
                        const varName = this.getVar(item.value.name).replace("{", "").replace("}", "");
                        let value = model.regressionParameters[varName];
                        if (value != undefined) {
                            if (item.value.precision != undefined)
                                value = WebApp.MathUtils.round(value, item.value.precision);
                            item.curValue(value);
                        }
                    }
                }
            }
            /****************************************/
            createParameters(result) {
                result.push(WebApp.apply(new ParameterViewModel({ value: this.endDay, name: $string("$(reg-days)") }), p => {
                    p.max = this.maxDay;
                    p.min(0);
                    p.step(1);
                }));
                return true;
            }
            /****************************************/
            setStateWork(state) {
                if (state.function) {
                    const func = WebApp.linq(this.functions).first(a => a.value.type == state.function.type);
                    if (func) {
                        for (let item of state.function.vars) {
                            const funcVar = WebApp.linq(func.vars()).first(a => a.value.name == item.name);
                            if (funcVar) {
                                funcVar.autoCompute(item.autoCompute);
                                funcVar.max(item.maxValue);
                                funcVar.min(item.minValue);
                                funcVar.step(item.step);
                                funcVar.curValue(item.value);
                            }
                        }
                        this.selectedFunction(func);
                    }
                }
                if (state.showIntegration != undefined)
                    this.showIntegration(state.showIntegration);
            }
            /****************************************/
            getState() {
                const state = super.getState();
                state.function = this.selectedFunction().value;
                state.showIntegration = this.showIntegration();
                for (let item of this.selectedFunction().vars()) {
                    item.value.value = item.curValue();
                    item.value.maxValue = item.max();
                    item.value.minValue = item.min();
                    item.value.step = item.step();
                    item.value.autoCompute = item.autoCompute();
                }
                return state;
            }
            /****************************************/
            onParentChanged() {
                super.onParentChanged();
                this.color(this.parent.color());
                this.maxDay(WebApp.linq(this.parent.values).max(a => a.x));
                if (this.endDay() == undefined)
                    this.endDay(this.maxDay());
            }
            /****************************************/
            updateEndDay() {
                if (!this._varsMap["tend"])
                    return;
                this._graphCtx.updateExpression({
                    type: "expression",
                    id: this.getGraphId("end-day"),
                    latex: this._varsMap["tend"] + "=" + this.endDay(),
                    slider: {
                        min: "0",
                        step: "1",
                        max: (this.maxDay()).toString(),
                    }
                });
            }
            /****************************************/
            updateColor() {
                this._graphCtx.setColor(this.getGraphId("main-func"), this.color());
                this._graphCtx.setColor(this.getGraphId("sum-serie"), this.color());
                this._graphCtx.setColor(this.getGraphId("sum-point"), this.color());
                this._graphCtx.setColor(this.getGraphId("end-day-line"), this.color());
            }
            /****************************************/
            updateGraphWork() {
                this.updateRegressionVars();
            }
            /****************************************/
            getExpressions() {
                const values = [];
                values.push({
                    type: "folder",
                    id: this.getGraphId("public"),
                    title: this.parent.name() + " - " + this.name(),
                    collapsed: true
                });
                values.push({
                    type: "folder",
                    id: this.getGraphId("private"),
                    secret: true,
                    title: this.parent.name() + " - " + this.name(),
                    collapsed: true
                });
                const func = this.selectedFunction().value;
                this._varsMap["x"] = "";
                this._varsMap["y"] = this.parent.getVar("y");
                this._varsMap["time"] = this.parent.parent.getVar("time");
                for (let item of func.vars) {
                    if (!this._varsMap[item.name])
                        this._varsMap[item.name] = null;
                }
                this._graphCtx.generateVars(this._varsMap);
                this._varsMap["x"] = this.getVar("xp");
                values.push({
                    type: "expression",
                    id: this.getGraphId("main"),
                    folderId: this.getGraphId("private"),
                    latex: this.replaceVars(func.value),
                    hidden: true
                });
                values.push({
                    type: "expression",
                    id: this.getGraphId("main-func"),
                    folderId: this.getGraphId("private"),
                    latex: this.replaceVars(func.value.replace("$y\\sim ", "$fun\\left(x\\right)=").replace(/\$x/g, "x")),
                    color: this.parent.color(),
                    lineStyle: Desmos.Styles.DASHED
                });
                values.push({
                    type: "expression",
                    id: this.getGraphId("sum-func"),
                    folderId: this.getGraphId("private"),
                    latex: this.replaceVars("$sum\\left(x\\right)=\\sum_{$n1=1}^{x}\\operatorname{round}\\left($fun\\left($n1\\right)\\right)"),
                    hidden: true
                });
                values.push({
                    type: "expression",
                    id: this.getGraphId("sum-x-time"),
                    folderId: this.getGraphId("private"),
                    latex: this.replaceVars("$n2=\\left[1,...,$time\\right]"),
                });
                values.push({
                    type: "expression",
                    id: this.getGraphId("sum-serie"),
                    folderId: this.getGraphId("private"),
                    latex: this.replaceVars("\\left($n2,\\ $sum\\left($n2\\right)\\right)"),
                    color: this.parent.color(),
                    lines: true,
                    hidden: !this.showIntegration(),
                    lineStyle: Desmos.Styles.SOLID,
                    pointStyle: "NONE",
                    points: false
                });
                values.push({
                    type: "expression",
                    id: this.getGraphId("sum-value"),
                    folderId: this.getGraphId("public"),
                    latex: this.replaceVars("$value=$sum\\left($time\\right)"),
                });
                values.push({
                    type: "expression",
                    id: this.getGraphId("sum-point"),
                    folderId: this.getGraphId("private"),
                    hidden: !this.showIntegration(),
                    latex: this.replaceVars("\\left($time,$value\\right)"),
                    color: this.parent.color(),
                    label: this.parent.name(),
                    dragMode: "XY",
                    showLabel: true
                });
                values.push({
                    type: "expression",
                    id: this.getGraphId("end-day"),
                    latex: this._varsMap["tend"] + "=" + this.endDay(),
                    folderId: this.getGraphId("public"),
                    label: "Giorni Previsione",
                    slider: {
                        min: (0).toString(),
                        max: (this.maxDay()).toString(),
                        hardMax: true,
                        hardMin: true,
                        step: "1"
                    }
                });
                values.push({
                    type: "expression",
                    id: this.getGraphId("end-day-line"),
                    color: this.color(),
                    latex: "x=" + this._varsMap["tend"],
                    folderId: this.getGraphId("private"),
                    lines: true
                });
                values.push({
                    type: "expression",
                    id: this.getGraphId("end-day-serie"),
                    latex: this.replaceVars("$xp=[0,...,$tend]+" + this.parent.getVar("ofs")),
                    folderId: this.getGraphId("private"),
                    hidden: true
                });
                for (let item of this.selectedFunction().vars()) {
                    if (item.autoCompute())
                        this._graphCtx.calculator.removeExpression({ id: this.getGraphId(item.value.name + "-value") });
                    else {
                        values.push({
                            type: "expression",
                            id: this.getGraphId(item.value.name + "-value"),
                            latex: this.getVar(item.value.name) + "=" + (item.curValue() ? item.curValue().toString() : "0"),
                            folderId: this.getGraphId("public"),
                            label: item.value.name,
                            slider: {
                                min: toSafeString(item.value.minValue),
                                max: toSafeString(item.value.maxValue),
                                hardMax: true,
                                hardMin: true,
                                step: toSafeString(item.value.step)
                            }
                        });
                    }
                }
                return values;
            }
        }
        /****************************************/
        class StudioSerie extends BaseItem {
            constructor(config) {
                super();
                /****************************************/
                this.color = ko.observable();
                this.offsetX = ko.observable(0);
                this.canDrag = true;
                this.itemType = "serie";
                this.icon = "insert_chart";
                this.optionsTemplateName = "StudioOptionsTemplate";
                this._varsMap = {
                    "x": null,
                    "y": null,
                    "ofs": null,
                    "xofs": null,
                };
                if (config) {
                    this.setState(config);
                }
            }
            /****************************************/
            importValues(points) {
                if (points && points.length > 0) {
                    if (points[0].x instanceof Date) {
                        const startDate = points[0].x;
                        return WebApp.linq(points).select(a => ({
                            x: Math.round(WebApp.DateUtils.diff(a.x, startDate).totalDays),
                            xLabel: a.x,
                            y: a.y
                        })).toArray();
                    }
                    if (isNaN(points[0].x)) {
                        return WebApp.linq(points).select((a, i) => ({
                            x: i,
                            xLabel: a.x,
                            y: a.y
                        })).toArray();
                    }
                }
                return points;
            }
            /****************************************/
            writeData(transfer) {
                var data = {
                    version: 1,
                    type: "serieState",
                    state: this.getState()
                };
                transfer.setData("application/json+studio", JSON.stringify(data));
                transfer.setData("text/html+id", this.node.element.id);
                return true;
            }
            /****************************************/
            createActions(result) {
                super.createActions(result);
                result.push(WebApp.apply(new GeoPlot.ActionViewModel(), action => {
                    action.text = $string("$(update)"),
                        action.icon = "autorenew";
                    action.execute = () => this.updateSerie();
                }));
                result.push(WebApp.apply(new GeoPlot.ActionViewModel(), action => {
                    action.text = $string("$(new-regression)"),
                        action.icon = "add_box";
                    action.execute = () => {
                        const reg = this.addRegression(null, false);
                        reg.updateGraph();
                        this.node.isExpanded(true);
                        reg.node.isSelected(true);
                    };
                }));
                result.push(WebApp.apply(new GeoPlot.ActionViewModel(), action => {
                    action.text = $string("$(zoom)"),
                        action.icon = "zoom_in";
                    action.execute = () => {
                        this.zoom();
                    };
                }));
            }
            /****************************************/
            static fromText(text) {
                try {
                    const obj = JSON.parse(text);
                    if (obj) {
                        if (obj.type == "serie")
                            return new StudioSerie({
                                name: obj.title,
                                values: obj.values,
                                source: obj.serie,
                                color: obj.color
                            });
                        if (obj.type == "serieState")
                            return new StudioSerie(obj.state);
                    }
                }
                catch (_a) {
                }
            }
            /****************************************/
            getExpressions() {
                if (!this.color())
                    this.color("#0000ff");
                this._graphCtx.generateVars(this._varsMap);
                const values = [
                    {
                        type: "folder",
                        id: this.getGraphId("public"),
                        title: this.parent.name() + " - " + this.name(),
                        collapsed: true
                    }, {
                        type: "folder",
                        id: this.getGraphId("private"),
                        title: this.parent.name() + " - " + this.name(),
                        secret: true,
                        collapsed: true
                    }, {
                        type: "expression",
                        id: this.getGraphId("offset"),
                        latex: this._varsMap["ofs"] + "=" + this.offsetX(),
                        folderId: this.getGraphId("public"),
                        label: "Scostamento",
                        slider: {
                            min: (-this.values.length).toString(),
                            max: (this.values.length).toString(),
                            hardMax: true,
                            hardMin: true,
                            step: "1"
                        }
                    }, {
                        type: "expression",
                        id: this.getGraphId("offset-x"),
                        latex: this._varsMap["xofs"] + "=" + this._varsMap["x"] + "+" + this._varsMap["ofs"],
                        folderId: this.getGraphId("private"),
                    }, {
                        type: "expression",
                        id: this.getGraphId("offset-x-serie"),
                        latex: "(" + this._varsMap["xofs"] + "," + this._varsMap["y"] + ")",
                        folderId: this.getGraphId("private"),
                        points: true,
                        lines: true,
                        color: this.color()
                    }, {
                        type: "table",
                        id: this.getGraphId("table"),
                        folderId: this.getGraphId("private"),
                        columns: [
                            {
                                id: this.getGraphId("table/x"),
                                latex: this._varsMap["x"],
                            },
                            {
                                id: this.getGraphId("table/y"),
                                latex: this._varsMap["y"],
                                hidden: true
                            }
                        ]
                    }
                ];
                return values;
            }
            /****************************************/
            createParameters(result) {
                result.push(WebApp.apply(new ParameterViewModel({ value: this.offsetX, name: $string("$(shift)") }), p => {
                    p.max(this.values.length);
                    p.min(-this.values.length);
                    p.step(1);
                }));
                return true;
            }
            /****************************************/
            updateGraphWork() {
                this._graphCtx.updateTable(this.getGraphId("table"), this.values);
            }
            /****************************************/
            onGraphChanged() {
                /*
                const item = this._graphCtx.calculator.expressionAnalysis[this.getGraphId("offset")];
                if (item && item.evaluation)
                    this.offsetX(item.evaluation.value);*/
            }
            /****************************************/
            onSelected() {
                this._graphCtx.expressionZoomFit(this.getGraphId("table"));
            }
            /****************************************/
            updateColor() {
                this._graphCtx.setColor(this.getGraphId("offset-x-serie"), this.color());
                this.children.foreach(a => a.onParentChanged());
            }
            /****************************************/
            attachGraph(ctx) {
                super.attachGraph(ctx);
                this.offsetX.subscribe(value => this._graphCtx.updateVariable(this.getGraphId("offset"), this._varsMap["ofs"], value));
            }
            /****************************************/
            setChildrenStateWork(state) {
                if (state.children != undefined) {
                    this.children.foreach(a => a.remove());
                    state.children.forEach(a => {
                        const reg = this.addRegression(null, false);
                        reg.setState(a);
                    });
                }
            }
            /****************************************/
            setStateWork(state) {
                if (state.offsetX != undefined)
                    this.offsetX(state.offsetX);
                if (state.source)
                    this.source = state.source;
                if (state.values != undefined)
                    this.values = this.importValues(state.values);
            }
            /****************************************/
            getState() {
                const state = super.getState();
                state.offsetX = this.offsetX();
                state.source = this.source;
                state.values = this.values;
                state.children = this.children.select(a => a.getState()).toArray();
                return state;
            }
            /****************************************/
            addRegression(configOrState, updateGraph = true) {
                return this.addChildrenWork(configOrState instanceof StudioSerieRegression ? configOrState : new StudioSerieRegression(configOrState), updateGraph);
            }
            /****************************************/
            updateSerie() {
                return __awaiter(this, void 0, void 0, function* () {
                    if (this.source.type == "geoplot") {
                        if (!this._graphCtx.serieCalculator) {
                            M.toast({ html: $string("$(msg-downloading-data)") });
                            const model = yield GeoPlot.Api.loadStudioData();
                            this._graphCtx.serieCalculator = new GeoPlot.IndicatorCalculator(model.data, GeoPlot.InfectionDataSet, model.geo);
                        }
                        this.values = this.importValues(this._graphCtx.serieCalculator.getSerie(this.source));
                        this._graphCtx.updateTable(this.getGraphId("table"), this.values);
                        this.children.foreach(a => a.onParentChanged());
                        M.toast({ html: $string("$(msg-update-complete)") });
                    }
                    else
                        M.toast({ html: $string("$(msg-update-not-supported)") });
                });
            }
            /****************************************/
            zoom() {
                const minX = WebApp.linq(this.values).min(a => a.x);
                const minY = WebApp.linq(this.values).min(a => a.y);
                const maxX = WebApp.linq(this.values).max(a => a.x);
                const maxY = WebApp.linq(this.values).max(a => a.y);
                this._graphCtx.calculator.setMathBounds({
                    top: maxY + (maxY - minY) * 0.1,
                    right: maxX + (maxX - minX) * 0.1,
                    bottom: minY - (maxY - minY) * 0.1,
                    left: minX - (maxX - minX) * 0.1,
                });
            }
        }
        /****************************************/
        class StudioProject extends BaseItem {
            constructor(config) {
                super();
                /****************************************/
                this.time = ko.observable(0);
                this.itemType = "project";
                this.icon = "folder";
                this.optionsTemplateName = "ProjectOptionsTemplate";
                this._varsMap = {
                    "time": null
                };
                if (config)
                    this.setState(config);
            }
            /****************************************/
            canAccept(value) {
                return (value instanceof StudioSerie);
            }
            /****************************************/
            canReadData(transfer) {
                return transfer.types.indexOf("application/json+studio") != -1;
            }
            /****************************************/
            readData(transfer) {
                const textData = transfer.getData("application/json+studio");
                let serie = StudioSerie.fromText(textData);
                if (serie) {
                    this.addSerie(serie);
                    this.node.isExpanded(true);
                }
            }
            /****************************************/
            getExpressions() {
                this._graphCtx.generateVars(this._varsMap);
                const values = [
                    {
                        type: "folder",
                        id: this.getGraphId("public"),
                        title: this.name(),
                        collapsed: true
                    }, {
                        type: "expression",
                        folderId: this.getGraphId("public"),
                        id: this.getGraphId("time"),
                        latex: this._varsMap["time"] + "=" + this.time(),
                        slider: {
                            hardMin: true,
                            hardMax: true,
                            min: "0",
                            max: "100",
                            step: "1"
                        }
                    }
                ];
                return values;
            }
            /****************************************/
            createParameters(result) {
                result.push(WebApp.apply(new ParameterViewModel({ value: this.time, name: $string("$(day)") }), p => {
                    p.max(100);
                    p.min(0);
                    p.step(1);
                }));
                return true;
            }
            /****************************************/
            setStateWork(state) {
                if (state.time != undefined)
                    this.time(state.time);
            }
            /****************************************/
            setChildrenStateWork(state) {
                if (state.children != undefined) {
                    this.children.foreach(a => a.remove());
                    state.children.forEach(a => {
                        const item = this.addSerie(null, false);
                        item.setState(a);
                    });
                }
            }
            /****************************************/
            getState() {
                const state = super.getState();
                state.time = this.time();
                state.children = this.children.select(a => a.getState()).toArray();
                return state;
            }
            /****************************************/
            onGraphChanged() {
                /*
                const item = this._graphCtx.calculator.expressionAnalysis[this.getGraphId("time")];
                if (item)
                    this.time(item.evaluation.value);*/
            }
            /****************************************/
            attachGraph(ctx) {
                super.attachGraph(ctx);
                this.time.subscribe(value => this._graphCtx.updateVariable(this.getGraphId("time"), this._varsMap["time"], this.time()));
            }
            /****************************************/
            addSerie(configOrSerie, updateGraph = true) {
                return this.addChildrenWork(configOrSerie instanceof StudioSerie ? configOrSerie : new StudioSerie(configOrSerie), updateGraph);
            }
        }
        /****************************************/
        class StudioPage {
            constructor(projectId) {
                /****************************************/
                this.items = new GeoPlot.TreeViewModel();
                this.maxX = ko.observable();
                this.maxY = ko.observable();
                this.dataImport = new GeoPlot.DataImportControl();
                this._projectId = projectId;
                this._graphCtx = new GraphContext();
                this._graphCtx.calculator = Desmos.GraphingCalculator(document.getElementById("calculator"), {
                    //xAxisArrowMode: Desmos.AxisArrowModes.BOTH,
                    pasteGraphLink: false,
                    pasteTableData: false,
                    expressionsCollapsed: true,
                    //lockViewport: false,
                    restrictedFunctions: true,
                    //restrictGridToFirstQuadrant: true,
                    administerSecretFolders: true,
                    authorIDE: true,
                    advancedStyling: true
                });
                const actions = [];
                actions.push(WebApp.apply(new GeoPlot.ActionViewModel(), action => {
                    action.text = $string("$(new-project)"),
                        action.icon = "create_new_folder";
                    action.execute = () => this.newProject();
                }));
                actions.push(WebApp.apply(new GeoPlot.ActionViewModel(), action => {
                    action.text = $string("$(save)"),
                        action.icon = "save";
                    action.execute = () => this.saveState();
                }));
                actions.push(WebApp.apply(new GeoPlot.ActionViewModel(), action => {
                    action.text = $string("$(import)"),
                        action.icon = "import_export";
                    action.execute = () => this.import();
                }));
                actions.push(WebApp.apply(new GeoPlot.ActionViewModel(), action => {
                    action.text = $string("$(share) Studio"),
                        action.icon = "share";
                    action.execute = () => this.share();
                }));
                actions.push(WebApp.apply(new GeoPlot.ActionViewModel(), action => {
                    action.text = $string("$(options)"),
                        action.icon = "settings";
                    action.execute = () => this.showOptions();
                }));
                const root = new GeoPlot.TreeNodeViewModel();
                root.actions(actions);
                this.items.setRoot(root);
                document.body.addEventListener("paste", (ev) => __awaiter(this, void 0, void 0, function* () {
                    if (yield this.onPaste(ev.clipboardData))
                        ev.preventDefault();
                }));
                M.Modal.init(document.getElementById("options"), {
                    onCloseEnd: () => this.updateOptions()
                });
                setTimeout(() => this.init());
            }
            /****************************************/
            updateOptions() {
                const maxX = parseInt(this.maxX());
                const maxY = parseInt(this.maxY());
                this._graphCtx.calculator.setMathBounds({
                    bottom: -maxY / 10,
                    left: -maxX / 10,
                    right: maxX,
                    top: maxY
                });
            }
            /****************************************/
            share() {
                return __awaiter(this, void 0, void 0, function* () {
                    const projectId = WebApp.StringUtils.uuidv4();
                    yield GeoPlot.Api.saveState(projectId, this.getState());
                    const url = WebApp.Uri.absolute("~/" + $language.split("-")[0] + "/Studio/" + projectId);
                    yield WebApp.DomUtils.copyText(url);
                    M.toast({ html: $string("$(msg-shared)") });
                });
            }
            /****************************************/
            showOptions() {
                const bounds = this._graphCtx.calculator.graphpaperBounds;
                this.maxX(Math.round(bounds.mathCoordinates.width));
                this.maxY(Math.round(bounds.mathCoordinates.height));
                const dialog = M.Modal.getInstance(document.getElementById("options"));
                dialog.open();
            }
            /****************************************/
            getSelectedProject() {
                if (!this.items.selectedNode())
                    return;
                const value = this.items.selectedNode().value();
                if (value.itemType == "project")
                    return value;
                if (value.itemType == "serie")
                    return value.parent;
                if (value.itemType == "regression")
                    return value.parent.parent;
            }
            /****************************************/
            newProject() {
                const proj = this.addProject({ name: "Project " + (this.projects.count() + 1) });
                proj.node.isSelected(true);
                return proj;
            }
            /****************************************/
            addProject(config, updateGraph = true) {
                const project = new StudioProject(config);
                const node = new GeoPlot.TreeNodeViewModel(project);
                this.items.root().addNode(node);
                project.attachNode(node);
                project.attachGraph(this._graphCtx);
                if (updateGraph)
                    project.updateGraph();
                return project;
            }
            /****************************************/
            getState() {
                const result = { version: 2 };
                result.graphState = this._graphCtx.calculator.getState();
                result.vars = this._graphCtx.vars;
                result.projects = this.projects.select(a => a.getState()).toArray();
                return result;
            }
            /****************************************/
            setState(value) {
                if (!value)
                    return;
                if (value.graphState) {
                    value.graphState.expressions.list = [];
                    this._graphCtx.calculator.setState(value.graphState);
                }
                if (value.projects != undefined) {
                    this.projects.toArray().forEach(a => a.remove());
                    value.projects.forEach(a => {
                        const proj = this.addProject(null, false);
                        proj.setState(a);
                    });
                }
            }
            /****************************************/
            loadState() {
                return __awaiter(this, void 0, void 0, function* () {
                    if (this._projectId) {
                        let result = yield GeoPlot.Api.loadState(this._projectId);
                        this.setState(result);
                    }
                    else {
                        const json = localStorage.getItem("studio");
                        if (json)
                            this.setState(JSON.parse(json));
                    }
                });
            }
            /****************************************/
            saveState() {
                return __awaiter(this, void 0, void 0, function* () {
                    if (this._projectId) {
                        yield GeoPlot.Api.saveState(this._projectId, this.getState());
                        M.toast({ html: $string("$(msg-saved)") });
                    }
                    else {
                        localStorage.setItem("studio", JSON.stringify(this.getState()));
                        M.toast({ html: $string("$(msg-saved-device)") });
                    }
                });
            }
            /****************************************/
            demo() {
                const proj = this.addProject({ name: "Project 1" });
                this.addProject({ name: "Project 2" });
                this.addProject({ name: "Project 3" });
                proj.addSerie({
                    name: "Serie 1"
                });
            }
            /****************************************/
            onPaste(data) {
                return __awaiter(this, void 0, void 0, function* () {
                    const text = data.getData("text/plain").toString();
                    if (text)
                        return yield this.importText(text);
                    return false;
                });
            }
            /****************************************/
            import() {
                return __awaiter(this, void 0, void 0, function* () {
                    //            var text = await (await fetch("https://raw.githubusercontent.com/datasets/covid-19/master/data/countries-aggregated.csv")).text();
                    let project = this.getSelectedProject();
                    const data = yield this.dataImport.show();
                    this.addImportedData(data, project);
                    return true;
                });
            }
            /****************************************/
            importText(text) {
                return __awaiter(this, void 0, void 0, function* () {
                    let project = this.getSelectedProject();
                    if (!project && !this.projects.any())
                        project = this.newProject();
                    if (!project) {
                        M.toast({ html: $string("$(msg-select-project)") });
                        return false;
                    }
                    const serie = StudioSerie.fromText(text);
                    if (serie) {
                        project.addSerie(serie);
                        project.node.isExpanded(true);
                        serie.node.isExpanded(true);
                        serie.zoom();
                        const reg = serie.addRegression(null, false);
                        reg.updateGraph();
                        reg.node.isSelected(true);
                        return true;
                    }
                    try {
                        if (yield this.dataImport.importText(text))
                            yield this.import();
                    }
                    catch (e) {
                        console.error(e);
                    }
                    M.toast({ html: $string("$(msg-format-not-reconized)") });
                    return false;
                });
            }
            /****************************************/
            addImportedData(data, project) {
                if (data.length == 1) {
                    if (this.items.selectedNode() && this.items.selectedNode().value() instanceof StudioSerie) {
                        if (confirm("Sostituire la serie selezionata con i nuovi dati?")) {
                            const serie = this.items.selectedNode().value();
                            serie.source = data[0];
                            serie.importValues(data[0].serie.values);
                            serie.updateGraph(true);
                            return true;
                        }
                    }
                }
                project.node.isExpanded(true);
                for (let item of data) {
                    const serie = new StudioSerie({
                        name: item.serie.name,
                        values: item.serie.values,
                        source: item
                    });
                    project.addSerie(serie);
                    serie.node.isExpanded(true);
                    const reg = serie.addRegression(null, false);
                    reg.updateGraph();
                    reg.node.isSelected(true);
                }
            }
            /****************************************/
            get projects() {
                function* items() {
                    for (let node of this.items.root().nodes())
                        yield node.value();
                }
                return WebApp.linq(items.apply(this));
            }
            /****************************************/
            init() {
                return __awaiter(this, void 0, void 0, function* () {
                    this.loadState();
                });
            }
        }
        GeoPlot.StudioPage = StudioPage;
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
})(WebApp || (WebApp = {}));
//# sourceMappingURL=app.js.map