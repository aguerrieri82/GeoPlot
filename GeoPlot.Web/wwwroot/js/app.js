var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        var Api;
        (function (Api) {
            function saveState(id, state) {
                return __awaiter(this, void 0, void 0, function () {
                    var result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, WebApp.Http.postJsonAsync("~/SaveState/" + id, state)];
                            case 1:
                                result = _a.sent();
                                if (!result.isSuccess)
                                    throw result.error;
                                return [2 /*return*/, result.data];
                        }
                    });
                });
            }
            Api.saveState = saveState;
            /****************************************/
            function loadState(id) {
                return __awaiter(this, void 0, void 0, function () {
                    var result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, WebApp.Http.getJsonAsync("~/LoadState/" + id)];
                            case 1:
                                result = _a.sent();
                                if (!result.isSuccess)
                                    throw result.error;
                                return [2 /*return*/, result.data];
                        }
                    });
                });
            }
            Api.loadState = loadState;
            /****************************************/
            function loadStudioData() {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, WebApp.Http.getJsonAsync("~/StudioData")];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                });
            }
            Api.loadStudioData = loadStudioData;
        })(Api = GeoPlot.Api || (GeoPlot.Api = {}));
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        var GeoPlotApplication = /** @class */ (function () {
            function GeoPlotApplication() {
            }
            /****************************************/
            GeoPlotApplication.prototype.initServices = function () {
                WebApp.Services.httpClient = new WebApp.XHRHttpClient();
            };
            return GeoPlotApplication;
        }());
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
            var canvas = this;
            setTimeout(function () {
                var binStr = atob(canvas.toDataURL(type, quality).split(',')[1]);
                var len = binStr.length;
                var arr = new Uint8Array(len);
                for (var i = 0; i < len; i++)
                    arr[i] = binStr.charCodeAt(i);
                callback(new Blob([arr], { type: type || 'image/png' }));
            });
        }
    });
}
/****************************************/
function expandCollapse(elment) {
    var container = elment.parentElement;
    var content = container.querySelector(".section-content");
    if (container.classList.contains("closed")) {
        content.style.removeProperty("display");
        container.classList.remove("closed");
    }
    else {
        container.classList.add("closed");
        setTimeout(function () { return content.style.display = "none"; }, 300);
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
        var ConstIndicatorFunction = /** @class */ (function () {
            function ConstIndicatorFunction(value) {
                this._value = value;
            }
            /****************************************/
            ConstIndicatorFunction.prototype.value = function (main, delta, exMain, exDelta, area) {
                var result = this._value(main, area);
                if (exMain) {
                    for (var i in exMain)
                        result -= this.value(exMain[i], exDelta[i], null, null, area);
                }
                return result;
            };
            return ConstIndicatorFunction;
        }());
        GeoPlot.ConstIndicatorFunction = ConstIndicatorFunction;
        /****************************************/
        var SimpleIndicatorFunction = /** @class */ (function () {
            function SimpleIndicatorFunction(value) {
                this._value = value;
            }
            /****************************************/
            SimpleIndicatorFunction.prototype.value = function (main, delta, exMain, exDelta, area) {
                var result = this._value(main, area);
                if (delta)
                    result -= this._value(delta, area);
                if (exMain) {
                    for (var i in exMain)
                        result -= this.value(exMain[i], exDelta[i], null, null, area);
                }
                return result;
            };
            return SimpleIndicatorFunction;
        }());
        GeoPlot.SimpleIndicatorFunction = SimpleIndicatorFunction;
        /****************************************/
        var CombineIndicatorFunction = /** @class */ (function () {
            function CombineIndicatorFunction(indicators, value) {
                this._value = value;
                this._indicators = indicators;
            }
            /****************************************/
            CombineIndicatorFunction.prototype.value = function (main, delta, exMain, exDelta, area) {
                var value = {};
                for (var key in this._indicators)
                    value[key] = this._indicators[key].value(main, delta, exMain, exDelta, area);
                return this._value(value);
            };
            return CombineIndicatorFunction;
        }());
        GeoPlot.CombineIndicatorFunction = CombineIndicatorFunction;
        /****************************************/
        var SimpleFactorFunction = /** @class */ (function () {
            function SimpleFactorFunction(value) {
                this._value = value;
            }
            /****************************************/
            SimpleFactorFunction.prototype.value = function (main, delta, exMain, exDelta, area, indicator) {
                var curValue = 0;
                for (var i in main)
                    curValue += indicator.value(main[i], delta[i], exMain[i], exDelta[i], area);
                return this._value(curValue, main[0], area);
            };
            return SimpleFactorFunction;
        }());
        GeoPlot.SimpleFactorFunction = SimpleFactorFunction;
        /****************************************/
        var DoubleFactorFunction = /** @class */ (function () {
            function DoubleFactorFunction(value, factor) {
                this._value = value;
                this._factor = factor;
            }
            /****************************************/
            DoubleFactorFunction.prototype.value = function (main, delta, exMain, exDelta, area, indicator) {
                var curValue = 0;
                var curFactor = 0;
                for (var i in main) {
                    curValue += indicator.value(main[i], delta[i], exMain[i], exDelta[i], area);
                    curFactor += this._factor.value(main[i], delta[i], exMain[i], exDelta[i], area);
                }
                return this._value(curValue, curFactor);
            };
            return DoubleFactorFunction;
        }());
        GeoPlot.DoubleFactorFunction = DoubleFactorFunction;
        var IndicatorCalculator = /** @class */ (function () {
            function IndicatorCalculator(data, dataSet, geo) {
                this._data = data;
                this._dataSet = dataSet;
                this._geo = geo;
            }
            /****************************************/
            IndicatorCalculator.prototype.getFactorValue = function (options) {
                var e_1, _a, e_2, _b;
                var _this = this;
                var areaId = (typeof options.areaOrId == "string" ? options.areaOrId : options.areaOrId.id).toLowerCase();
                var dataAtDay = function (number, curAreaId) {
                    return number < 0 ? undefined : _this._data.days[number].values[curAreaId];
                };
                var dayGroup;
                if (!Array.isArray(options.dayNumberOrGroup))
                    dayGroup = [options.dayNumberOrGroup];
                else
                    dayGroup = options.dayNumberOrGroup;
                var main = [];
                var delta = [];
                var exMain = [];
                var exDelta = [];
                try {
                    for (var dayGroup_1 = __values(dayGroup), dayGroup_1_1 = dayGroup_1.next(); !dayGroup_1_1.done; dayGroup_1_1 = dayGroup_1.next()) {
                        var dayNumber = dayGroup_1_1.value;
                        main.push(dataAtDay(dayNumber, areaId));
                        if (options.isDayDelta)
                            delta.push(dataAtDay(dayNumber - 1, areaId));
                        if (options.execludedAreas) {
                            var curExMain = [];
                            var curExDelta = [];
                            try {
                                for (var _c = (e_2 = void 0, __values(options.execludedAreas)), _d = _c.next(); !_d.done; _d = _c.next()) {
                                    var exAreaId = _d.value;
                                    curExMain.push(dataAtDay(dayNumber, exAreaId.toLowerCase()));
                                    if (options.isDayDelta)
                                        curExDelta.push(dataAtDay(dayNumber - 1, exAreaId.toLowerCase()));
                                }
                            }
                            catch (e_2_1) { e_2 = { error: e_2_1 }; }
                            finally {
                                try {
                                    if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                                }
                                finally { if (e_2) throw e_2.error; }
                            }
                            exMain.push(curExMain);
                            exDelta.push(curExDelta);
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (dayGroup_1_1 && !dayGroup_1_1.done && (_a = dayGroup_1.return)) _a.call(dayGroup_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                var factor = WebApp.linq(this._dataSet.factors).first(function (a) { return a.id == options.factorId; });
                var indicator = WebApp.linq(this._dataSet.indicators).first(function (a) { return a.id == options.indicatorId; });
                return factor.compute.value(main, delta, exMain, exDelta, this._geo.areas[areaId], indicator.compute);
            };
            /****************************************/
            IndicatorCalculator.prototype.getIndicatorValue = function (options) {
                var e_3, _a;
                var _this = this;
                var areaId = (typeof options.areaOrId == "string" ? options.areaOrId : options.areaOrId.id).toLowerCase();
                var indicator = WebApp.linq(this._dataSet.indicators).first(function (a) { return a.id == options.indicatorId; });
                var dataAtDay = function (number, curAreaId) {
                    return number < 0 ? undefined : _this._data.days[number].values[curAreaId];
                };
                var main = dataAtDay(options.dayNumber, areaId);
                var delta;
                var exMain;
                var exDelta;
                if (options.isDayDelta)
                    delta = dataAtDay(options.dayNumber - 1, areaId);
                if (options.execludedAreas) {
                    exMain = [];
                    exDelta = [];
                    try {
                        for (var _b = __values(options.execludedAreas), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var exAreaId = _c.value;
                            exMain.push(dataAtDay(options.dayNumber, exAreaId.toLowerCase()));
                            if (options.isDayDelta)
                                exDelta.push(dataAtDay(options.dayNumber - 1, exAreaId.toLowerCase()));
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                    ;
                }
                return indicator.compute.value(main, delta, exMain, exDelta, this._geo.areas[areaId]);
            };
            /****************************************/
            IndicatorCalculator.prototype.getSerie = function (source) {
                var result = [];
                if (source.groupSize > 1) {
                    var count = source.groupSize;
                    var group = [];
                    for (var i = 0 + source.startDay; i < this._data.days.length; i++) {
                        group.push(i);
                        count--;
                        if (count == 0) {
                            var item = {
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
                    for (var i = 0 + source.startDay; i < this._data.days.length; i++) {
                        var item = {
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
            };
            return IndicatorCalculator;
        }());
        GeoPlot.IndicatorCalculator = IndicatorCalculator;
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        var AggregationFunc;
        (function (AggregationFunc) {
            AggregationFunc[AggregationFunc["SUm"] = 0] = "SUm";
            AggregationFunc[AggregationFunc["Avg"] = 1] = "Avg";
        })(AggregationFunc = GeoPlot.AggregationFunc || (GeoPlot.AggregationFunc = {}));
        var GeoAreaType;
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
        var SplitEnumerator = /** @class */ (function () {
            function SplitEnumerator(value, separator, startIndex) {
                if (startIndex === void 0) { startIndex = 0; }
                this._value = value;
                this._separator = separator;
                this._startIndex = startIndex;
            }
            Object.defineProperty(SplitEnumerator.prototype, "current", {
                /****************************************/
                get: function () {
                    if (!this._current)
                        this._current = this._value.substring(this._currentStartIndex, this._curIndex);
                    return this._current;
                },
                enumerable: true,
                configurable: true
            });
            /****************************************/
            SplitEnumerator.prototype.moveNext = function () {
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
            };
            /****************************************/
            SplitEnumerator.prototype.reset = function () {
                this._curIndex = this._startIndex;
                this._currentStartIndex = this._curIndex;
                this._current = null;
            };
            return SplitEnumerator;
        }());
        /****************************************/
        var BaseDataAdapter = /** @class */ (function () {
            function BaseDataAdapter(options) {
            }
            return BaseDataAdapter;
        }());
        /****************************************/
        var TextTableDataAdapter = /** @class */ (function (_super) {
            __extends(TextTableDataAdapter, _super);
            function TextTableDataAdapter(options) {
                var _this = _super.call(this, options) || this;
                _this._options = options;
                return _this;
            }
            /****************************************/
            TextTableDataAdapter.prototype.createIdentifier = function (value) {
                var state = 0;
                var result = "";
                for (var i = 0; i < value.length; i++) {
                    var c = value[i];
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
            };
            /****************************************/
            TextTableDataAdapter.prototype.extractHeader = function (text) {
                var _this = this;
                var firstRow = WebApp.linq(new SplitEnumerator(text, this._options.rowSeparator)).first();
                var cols = firstRow.split(this._options.columnSeparator);
                var headers;
                if (this._options.hasHeader !== false) {
                    var rowAnal = [];
                    this.analyzeRow(cols, rowAnal);
                    var stringCount = WebApp.linq(rowAnal).sum(function (a) { return a.stringCount; });
                    var emptyCount = WebApp.linq(rowAnal).sum(function (a) { return a.emptyCount; });
                    if (stringCount > 0 && stringCount + emptyCount == cols.length) {
                        this._options.hasHeader = true;
                        headers = WebApp.linq(cols).select(function (a, i) {
                            if (a == "")
                                return "col" + i;
                            return _this.createIdentifier(a);
                        }).toArray();
                    }
                }
                if (!headers) {
                    this._options.hasHeader = false;
                    headers = WebApp.linq(cols).select(function (a, i) { return "col" + i; }).toArray();
                }
                if (!this._options.columnsIds)
                    this._options.columnsIds = headers;
            };
            /****************************************/
            TextTableDataAdapter.prototype.extractRowSeparator = function (text) {
                var e_4, _a;
                if (this._options.rowSeparator)
                    return;
                var items = ["\r\n", "\n"];
                try {
                    for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
                        var item = items_1_1.value;
                        if (text.indexOf(item) != -1) {
                            this._options.rowSeparator = item;
                            return;
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            };
            /****************************************/
            TextTableDataAdapter.prototype.extractColumnSeparator = function (text) {
                var e_5, _a, e_6, _b;
                if (this._options.columnSeparator)
                    return;
                var items = ["\t", ";", ",", " "];
                var stats = {};
                var rows = WebApp.linq(new SplitEnumerator(text, this._options.rowSeparator)).take(10);
                try {
                    for (var rows_1 = __values(rows), rows_1_1 = rows_1.next(); !rows_1_1.done; rows_1_1 = rows_1.next()) {
                        var row = rows_1_1.value;
                        try {
                            for (var items_2 = (e_6 = void 0, __values(items)), items_2_1 = items_2.next(); !items_2_1.done; items_2_1 = items_2.next()) {
                                var item = items_2_1.value;
                                if (stats[item] === false)
                                    continue;
                                var cols = WebApp.linq(new SplitEnumerator(row, item)).count();
                                if (cols > 1 && !(item in stats))
                                    stats[item] = cols;
                                else {
                                    if (stats[item] != cols)
                                        stats[item] = false;
                                }
                            }
                        }
                        catch (e_6_1) { e_6 = { error: e_6_1 }; }
                        finally {
                            try {
                                if (items_2_1 && !items_2_1.done && (_b = items_2.return)) _b.call(items_2);
                            }
                            finally { if (e_6) throw e_6.error; }
                        }
                    }
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (rows_1_1 && !rows_1_1.done && (_a = rows_1.return)) _a.call(rows_1);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                for (var key in stats) {
                    if (stats[key] !== false) {
                        this._options.columnSeparator = key;
                        return;
                    }
                }
            };
            /****************************************/
            TextTableDataAdapter.prototype.analyzeRow = function (cols, result) {
                if (result.length == 0) {
                    for (var i = 0; i < cols.length; i++) {
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
                for (var i = 0; i < cols.length; i++)
                    this.analyzeColumn(cols[i], result[i]);
            };
            /****************************************/
            TextTableDataAdapter.prototype.analyzeColumn = function (value, result) {
                value in result.values ? result.values[value]++ : result.values[value] = 1;
                if (value == "")
                    result.emptyCount++;
                else if (!isNaN(value))
                    result.numberCount++;
                else if (Date.parse(value))
                    result.dateCount++;
                else if (value == "true" || value == "false")
                    result.booleanCount++;
                else
                    result.stringCount++;
            };
            /****************************************/
            TextTableDataAdapter.prototype.createParser = function (anal) {
                if (anal.numberCount > 0 && anal.stringCount == 0)
                    return function (a) { return !a ? null : parseFloat(a); };
                if (anal.booleanCount > 0 && anal.stringCount == 0)
                    return function (a) { return a == "true"; };
                if (anal.dateCount > 0 && anal.stringCount == 0)
                    return function (a) { return !a ? null : new Date(a); };
                if (anal.stringCount > 0)
                    return function (a) {
                        if (!a)
                            return "";
                        if (a.startsWith("\"") && a.endsWith("\""))
                            return a.substr(1, a.length - 2);
                        return a;
                    };
                return function (a) { return null; };
            };
            /****************************************/
            TextTableDataAdapter.prototype.analyze = function (text) {
                var _this = this;
                //Separators
                this.extractRowSeparator(text);
                this.extractColumnSeparator(text);
                //Header
                this.extractHeader(text);
                //Rows
                var rows = WebApp.linq(new SplitEnumerator(text, this._options.rowSeparator));
                if (this._options.hasHeader)
                    rows = rows.skip(1);
                //col analysis
                var colAnalysis = [];
                rows.foreach(function (row) {
                    return _this.analyzeRow(row.split(_this._options.columnSeparator), colAnalysis);
                });
                //Parser
                if (!this._options.columnsParser) {
                    this._options.columnsParser = {};
                    colAnalysis.forEach(function (a, i) {
                        return _this._options.columnsParser[_this._options.columnsIds[i]] = _this.createParser(a);
                    });
                }
                //X-axis
                if (!this._options.xColumn)
                    this._options.xColumn = this._options.columnsIds[0];
                //Y-axis
                if (!this._options.serieColumns) {
                    this._options.serieColumns = [];
                    colAnalysis.forEach(function (col, i) {
                        if (col.numberCount > 0 && col.stringCount == 0)
                            _this._options.serieColumns.push(_this._options.columnsIds[i]);
                    });
                }
                //groups
                if (!this._options.groupColumns) {
                    this._options.groupColumns = [];
                    colAnalysis.forEach(function (col, i) {
                        if (col.stringCount > 0) {
                            var values = WebApp.linq(col.values);
                            if (values.count() > 1 && values.any(function (a) { return a.value > 1; }))
                                _this._options.groupColumns.push(_this._options.columnsIds[i]);
                        }
                    });
                }
                return colAnalysis;
            };
            /****************************************/
            TextTableDataAdapter.prototype.parse = function (text) {
                var e_7, _a;
                this.analyze(text);
                var result = [];
                var rows = WebApp.linq(new SplitEnumerator(text, this._options.rowSeparator));
                if (this._options.hasHeader)
                    rows = rows.skip(1);
                try {
                    for (var rows_2 = __values(rows), rows_2_1 = rows_2.next(); !rows_2_1.done; rows_2_1 = rows_2.next()) {
                        var row = rows_2_1.value;
                        var cols = row.split(this._options.columnSeparator);
                        var item = {};
                        for (var i = 0; i < cols.length; i++)
                            item[this._options.columnsIds[i]] = this._options.columnsParser[this._options.columnsIds[i]](cols[i]);
                        result.push(item);
                    }
                }
                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                finally {
                    try {
                        if (rows_2_1 && !rows_2_1.done && (_a = rows_2.return)) _a.call(rows_2);
                    }
                    finally { if (e_7) throw e_7.error; }
                }
                return result;
            };
            return TextTableDataAdapter;
        }(BaseDataAdapter));
        GeoPlot.TextTableDataAdapter = TextTableDataAdapter;
        /****************************************/
        var JsonDataAdapter = /** @class */ (function (_super) {
            __extends(JsonDataAdapter, _super);
            function JsonDataAdapter(options) {
                return _super.call(this, options) || this;
            }
            /****************************************/
            JsonDataAdapter.prototype.parse = function (text) {
                return null;
            };
            return JsonDataAdapter;
        }(BaseDataAdapter));
        /****************************************/
        /* DataImportControl
        /****************************************/
        var DataImportControl = /** @class */ (function () {
            function DataImportControl() {
            }
            return DataImportControl;
        }());
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
                    compute: new GeoPlot.SimpleIndicatorFunction(function (a) { return a.totalPositive; })
                },
                {
                    id: "currentPositive",
                    name: $string("$(current-positive)"),
                    validFor: ["region", "country"],
                    colorLight: "#e91e63",
                    colorDark: "#880e4f",
                    compute: new GeoPlot.SimpleIndicatorFunction(function (a) { return a.currentPositive; })
                },
                {
                    id: "totalDeath",
                    name: $string("$(death)"),
                    validFor: ["region", "country"],
                    colorLight: "#9c27b0",
                    colorDark: "#4a148c",
                    compute: new GeoPlot.SimpleIndicatorFunction(function (a) { return a.totalDeath; })
                },
                {
                    id: "totalSevere",
                    name: $string("$(severe)"),
                    validFor: ["region", "country"],
                    colorLight: "#ff9800",
                    colorDark: "#e65100",
                    compute: new GeoPlot.SimpleIndicatorFunction(function (a) { return a.totalSevere; })
                },
                {
                    id: "totalHospedalized",
                    name: $string("$(hospedalized)"),
                    validFor: ["region", "country"],
                    colorLight: "#fdd835",
                    colorDark: "#fbc02d",
                    compute: new GeoPlot.SimpleIndicatorFunction(function (a) { return a.totalHospedalized; })
                },
                {
                    id: "totalHealed",
                    name: $string("$(healed)"),
                    validFor: ["region", "country"],
                    colorLight: "#4caf50",
                    colorDark: "#1b5e20",
                    compute: new GeoPlot.SimpleIndicatorFunction(function (a) { return a.totalHealed; })
                },
                {
                    id: "toatlTests",
                    name: $string("$(tested)"),
                    validFor: ["region", "country"],
                    colorLight: "#03a9f4",
                    colorDark: "#01579b",
                    compute: new GeoPlot.SimpleIndicatorFunction(function (a) { return a.toatlTests; })
                },
                {
                    id: "surface",
                    name: $string("$(surface) ($(geo))"),
                    validFor: ["region", "district"],
                    colorLight: "#777",
                    colorDark: "#222",
                    compute: new GeoPlot.ConstIndicatorFunction(function (v, a) { return WebApp.MathUtils.round(a.surface, 0); })
                },
                {
                    id: "density",
                    name: $string("$(density) ($(geo))"),
                    validFor: ["region", "district"],
                    colorLight: "#777",
                    colorDark: "#222",
                    compute: new GeoPlot.ConstIndicatorFunction(function (v, a) { return WebApp.MathUtils.round(a.demography.total / a.surface, 0); })
                },
                {
                    id: "population",
                    name: $string("$(population) ($(geo))"),
                    validFor: ["region", "district"],
                    colorLight: "#777",
                    colorDark: "#222",
                    compute: new GeoPlot.ConstIndicatorFunction(function (v, a) { return a.demography.total; })
                },
                {
                    id: "populationOld",
                    name: $string("$(population) +65 ($(geo))"),
                    validFor: ["region", "district"],
                    colorLight: "#777",
                    colorDark: "#222",
                    compute: new GeoPlot.ConstIndicatorFunction(function (v, a) { return a.demography.over65; })
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
                    compute: new GeoPlot.SimpleFactorFunction(function (i, v, a) { return i; }),
                    format: function (a) { return formatNumber(a); },
                    reference: function (v, a) { return "N/A"; },
                    description: $string("[indicator]")
                },
                {
                    id: "population",
                    name: $string("$(population)"),
                    compute: new GeoPlot.SimpleFactorFunction(function (i, v, a) { return (i / a.demography.total) * 100000; }),
                    format: function (a) { return formatNumber(a); },
                    reference: function (v, a) { return formatNumber(a.demography.total); },
                    description: $string("[indicator] $(every-100k)")
                },
                {
                    id: "population",
                    name: $string("$(population) +65"),
                    compute: new GeoPlot.SimpleFactorFunction(function (i, v, a) { return (i / a.demography.over65) * 100000; }),
                    format: function (a) { return formatNumber(WebApp.MathUtils.round(a, 1)); },
                    reference: function (v, a) { return formatNumber(a.demography.over65); },
                    description: $string("[indicator] $(every-100k) +65")
                },
                {
                    id: "density",
                    name: $string("$(density)"),
                    compute: new GeoPlot.SimpleFactorFunction(function (i, v, a) { return (i / (a.demography.total / a.surface)) * 100000; }),
                    format: function (a) { return formatNumber(WebApp.MathUtils.round(a, 1)); },
                    reference: function (v, a) { return formatNumber(WebApp.MathUtils.round(a.demography.total / a.surface, 1)); },
                    description: $string("[indicator] $(over-density)")
                },
                {
                    id: "totalPositive",
                    name: $string("$(total-positive)"),
                    validFor: ["region", "country"],
                    compute: new GeoPlot.DoubleFactorFunction(function (i, f) { return !i ? 0 : (i / f) * 100; }, new GeoPlot.SimpleIndicatorFunction(function (v) { return v.totalPositive; })),
                    format: function (a) { return WebApp.MathUtils.round(a, 1) + "%"; },
                    reference: function (v, a) { return !v.totalPositive ? "N/A" : formatNumber(v.totalPositive); },
                    description: $string("% [indicator] $(over-total-positive)")
                },
                {
                    id: "severe",
                    name: $string("$(severe)"),
                    validFor: ["region", "country"],
                    compute: new GeoPlot.DoubleFactorFunction(function (i, f) { return !i ? 0 : (i / f) * 100; }, new GeoPlot.SimpleIndicatorFunction(function (v) { return v.totalSevere; })),
                    format: function (a) { return WebApp.MathUtils.round(a, 1) + "%"; },
                    reference: function (v, a) { return !v.totalSevere ? "N/A" : formatNumber(v.totalSevere); },
                    description: $string("% [indicator] $(over-severe)")
                },
                {
                    id: "test",
                    name: $string("$(tested)"),
                    validFor: ["region", "country"],
                    compute: new GeoPlot.DoubleFactorFunction(function (i, f) { return !i ? 0 : (i / f) * 100; }, new GeoPlot.SimpleIndicatorFunction(function (v) { return v.toatlTests; })),
                    format: function (a) { return WebApp.MathUtils.round(a, 1) + "%"; },
                    reference: function (v, a) { return !v.toatlTests ? "N/A" : formatNumber(v.toatlTests); },
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
                validateId: function (id) { return id[0].toLowerCase() == 'd'; }
            },
            "region": {
                label: {
                    singular: $string("$(region)"),
                    plural: $string("$(regions)")
                },
                mapGroup: "group_region",
                tab: "regionTab",
                areaType: GeoPlot.GeoAreaType.Region,
                validateId: function (id) { return id[0].toLowerCase() == 'r'; }
            },
            "country": {
                label: {
                    singular: $string("$(italian)"),
                    plural: $string("$(italians)")
                },
                mapGroup: "group_country",
                tab: "italyTab",
                areaType: GeoPlot.GeoAreaType.Country,
                validateId: function (id) { return id.toLowerCase() == 'it'; }
            }
        };
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
})(WebApp || (WebApp = {}));
if (window["ko"]) {
    ko.bindingHandlers.attach = {
        init: function (element, valueAccessor, allBindings, viewModel) {
            var func = ko.unwrap(valueAccessor());
            if (func === true || func == undefined)
                func = viewModel["attachNode"];
            if (typeof func != "function")
                throw "Supplied argument is not a function";
            setTimeout(function () {
                return func.call(viewModel, element);
            });
        }
    };
}
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        var Geo = /** @class */ (function () {
            function Geo() {
            }
            Geo.project = function (point) {
                var result = { x: 0, y: 0 };
                result.x = point.lng * Geo.OriginShift / 180;
                result.y = Math.log(Math.tan((90 + point.lat) * Math.PI / 360)) / (Math.PI / 180);
                result.y = -(result.y * Geo.OriginShift / 180);
                result.x -= Geo.OFFSET_X;
                result.y -= Geo.OFFSET_Y;
                return result;
            };
            Geo.EarthRadius = 6378137;
            Geo.OriginShift = 2 * Math.PI * Geo.EarthRadius / 2;
            Geo.OFFSET_X = 1263355;
            Geo.OFFSET_Y = 5543162;
            return Geo;
        }());
        GeoPlot.Geo = Geo;
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    /****************************************/
    var LinearGradient = /** @class */ (function () {
        function LinearGradient() {
            var values = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                values[_i] = arguments[_i];
            }
            if (values.length > 0) {
                if (typeof values[0] == "string")
                    this.colors = WebApp.linq(values).select(function (a) { return new RgbColor(a); }).toArray();
                else
                    this.colors = values;
            }
            else
                this.colors = [];
        }
        /****************************************/
        LinearGradient.prototype.valueAt = function (pos) {
            if (pos < 0)
                return this.colors[0];
            if (pos > 1)
                this.colors[this.colors.length - 1];
            var stepSize = 1 / (this.colors.length - 1);
            var minX = Math.floor(pos / stepSize);
            var maxX = Math.ceil(pos / stepSize);
            var minOfs = (pos - minX * stepSize) / stepSize;
            var c1 = this.colors[minX];
            var c2 = this.colors[maxX];
            var c3 = new RgbColor();
            c3.r = c1.r + (c2.r - c1.r) * minOfs;
            c3.g = c1.g + (c2.g - c1.g) * minOfs;
            c3.b = c1.b + (c2.b - c1.b) * minOfs;
            return c3;
        };
        return LinearGradient;
    }());
    WebApp.LinearGradient = LinearGradient;
    /****************************************/
    var RgbColor = /** @class */ (function () {
        function RgbColor(value) {
            /****************************************/
            this.r = 0;
            this.g = 0;
            this.b = 0;
            if (value)
                this.fromHex(value);
        }
        /****************************************/
        RgbColor.prototype.fromHex = function (value) {
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
        };
        /****************************************/
        RgbColor.prototype.toString = function () {
            function toHex(value) {
                var res = Math.round(value * 255).toString(16);
                if (res.length == 1)
                    return "0" + res;
                return res;
            }
            return "#" + toHex(this.r) + toHex(this.g) + toHex(this.b);
        };
        return RgbColor;
    }());
    WebApp.RgbColor = RgbColor;
    /****************************************/
    var Graphics = /** @class */ (function () {
        function Graphics(svg) {
            this._svg = svg;
        }
        /****************************************/
        Graphics.prototype.setViewPort = function (minX, minY, maxX, maxY) {
            this._svg.viewBox.baseVal.x = minX;
            this._svg.viewBox.baseVal.y = minY;
            this._svg.viewBox.baseVal.width = maxX - minX;
            this._svg.viewBox.baseVal.height = maxY - minY;
        };
        /****************************************/
        Graphics.prototype.drawPoly = function (poly) {
            var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            polygon.style.fill = poly.fillColor;
            polygon.style.stroke = poly.strokeColor;
            polygon.style.strokeWidth = poly.strokeSize + "%";
            polygon.id = poly.id;
            for (var i = 0; i < poly.geometry.points.length; i++) {
                var point = this._svg.createSVGPoint();
                point.x = poly.geometry.points[i].x;
                point.y = poly.geometry.points[i].y;
                polygon.points.appendItem(point);
            }
            this._svg.appendChild(polygon);
        };
        return Graphics;
    }());
    WebApp.Graphics = Graphics;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    /****************************************/
    var TipViewModel = /** @class */ (function () {
        function TipViewModel(value, closeAfter) {
            this.isVisible = ko.observable(false);
            this.isTransparent = ko.observable(false);
            this.value = value;
            this._closeAfter = closeAfter;
        }
        /****************************************/
        TipViewModel.prototype.dontShowAgain = function () {
        };
        /****************************************/
        TipViewModel.prototype.onActionExecuted = function () {
        };
        /****************************************/
        TipViewModel.prototype.executeAction = function () {
            var _this = this;
            if (this.value.showAction)
                this.value.showAction();
            setTimeout(function () { return _this.startPulse(); });
            this.onActionExecuted();
        };
        /****************************************/
        TipViewModel.prototype.startPulse = function () {
            this._element = document.querySelector(this.value.elementSelector);
            if (!this._element)
                return;
            var relY = WebApp.DomUtils.centerElement(this._element);
            WebApp.DomUtils.addClass(this._element, "pulse");
            var tipElement = document.querySelector(".tip-container");
            if (relY < (tipElement.clientTop + tipElement.clientHeight))
                this.isTransparent(true);
        };
        /****************************************/
        TipViewModel.prototype.stopPulse = function () {
            if (!this._element)
                return;
            WebApp.DomUtils.removeClass(this._element, "pulse");
            this.isTransparent(false);
        };
        /****************************************/
        TipViewModel.prototype.next = function () {
        };
        /****************************************/
        TipViewModel.prototype.understood = function () {
        };
        /****************************************/
        TipViewModel.prototype.onClose = function () {
        };
        /****************************************/
        TipViewModel.prototype.close = function () {
            clearTimeout(this._closeTimeoutId);
            this.stopPulse();
            this.isVisible(false);
            this.onClose();
        };
        /****************************************/
        TipViewModel.prototype.show = function () {
            var _this = this;
            if (this._closeTimeoutId)
                clearTimeout(this._closeTimeoutId);
            this.isVisible(true);
            if (this._closeAfter)
                this._closeTimeoutId = setTimeout(function () { return _this.close(); }, this._closeAfter);
        };
        return TipViewModel;
    }());
    WebApp.TipViewModel = TipViewModel;
    /****************************************/
    var TipManager = /** @class */ (function () {
        function TipManager(tips, getPreferences, savePreferences) {
            this.tip = ko.observable();
            this._getPreferences = getPreferences;
            this._tips = tips;
            this.savePreferences = savePreferences;
        }
        Object.defineProperty(TipManager.prototype, "preferences", {
            /****************************************/
            get: function () {
                return this._getPreferences();
            },
            enumerable: true,
            configurable: true
        });
        /****************************************/
        TipManager.prototype.savePreferences = function () {
        };
        /****************************************/
        TipManager.prototype.markAction = function (actionId, label) {
            var _this = this;
            this.preferences.actions[actionId]++;
            this.savePreferences();
            if (!window["gtag"])
                return;
            WebApp.safeCall(function () { return gtag("event", actionId, {
                event_category: "GeoPlot",
                event_label: label,
                value: _this.preferences.actions[actionId]
            }); });
        };
        /****************************************/
        TipManager.prototype.markTip = function (tipId, action) {
            if (!window["gtag"])
                return;
            WebApp.safeCall(function () { return gtag("event", action, {
                event_category: "GeoPlot/Tip",
                event_label: tipId
            }); });
        };
        /****************************************/
        TipManager.prototype.engageUser = function () {
            var _this = this;
            if (this.preferences.showTips != undefined && !this.preferences.showTips)
                return;
            var nextTip = WebApp.linq(this._tips).where(function (a) { return a.value.showAfter > 0 && _this.preferences.actions[a.key] == 0; }).first();
            if (!this.showTip(nextTip.key, {
                onClose: function () { return _this.engageUser(); },
                timeout: nextTip.value.showAfter,
            })) {
                this.engageUser();
            }
        };
        /****************************************/
        TipManager.prototype.showTip = function (tipId, options) {
            var _this = this;
            if (this.preferences.showTips != undefined && !this.preferences.showTips)
                return false;
            if ((!options || !options.override) && this.tip() && this.tip().isVisible())
                return false;
            if ((!options || !options.force) && this.preferences.actions[tipId])
                return false;
            var tip = this._tips[tipId];
            var model = new TipViewModel(tip);
            model.onActionExecuted = function () {
                _this.markTip(tipId, "how");
            };
            model.dontShowAgain = function () {
                _this.preferences.showTips = false;
                _this.savePreferences();
                model.close();
                _this.markTip(tipId, "dontShowAgain");
            };
            model.understood = function () {
                _this.preferences.actions[tipId]++;
                _this.savePreferences();
                model.close();
                _this.markTip(tipId, "understood");
            };
            model.onClose = function () {
                //this.tip(null);
                if (options && options.onClose)
                    options.onClose();
            };
            var nextTip = WebApp.linq(this._tips).where(function (a) { return a.value.order > tip.order && _this.preferences.actions[a.key] == 0; }).first();
            if (nextTip) {
                model.next = function () {
                    model.close();
                    _this.preferences.actions[tipId]++;
                    _this.showTip(nextTip.key);
                    _this.markTip(tipId, "next");
                };
            }
            else
                model.next = null;
            this.tip(model);
            setTimeout(function () { return model.show(); }, options && options.timeout ? options.timeout * 1000 : 0);
            return true;
        };
        return TipManager;
    }());
    WebApp.TipManager = TipManager;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        /****************************************/
        var IndicatorViewModel = /** @class */ (function () {
            function IndicatorViewModel() {
                this.value = ko.observable();
            }
            IndicatorViewModel.prototype.select = function () {
            };
            return IndicatorViewModel;
        }());
        /****************************************/
        var AreaViewModel = /** @class */ (function () {
            function AreaViewModel() {
                this.data = ko.observable();
                this.factor = ko.observable();
                this.indicator = ko.observable();
                this.reference = ko.observable();
                this.indicators = ko.observable();
            }
            AreaViewModel.prototype.select = function () {
            };
            return AreaViewModel;
        }());
        /****************************************/
        var GeoPlotPage = /** @class */ (function () {
            function GeoPlotPage(model) {
                var _this = this;
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
                        showAction: function () {
                            _this.viewMode("region");
                            _this.selectedArea = _this._geo.areas["r10"];
                        }
                    },
                    indicatorSelected: {
                        order: 1,
                        featureName: "Indicatori",
                        html: "Puoi vedere il grafico associato all'indicatore, facendo click sull'indicatore.",
                        elementSelector: ".indicators .summary-field",
                        showAfter: 15,
                        showAction: function () {
                            if (!_this.currentArea())
                                _this._tips.areaSelected.showAction();
                            _this.selectedIndicator(WebApp.linq(_this._dataSet.indicators).first(function (a) { return a.id == "totalDeath"; }));
                        }
                    },
                    dayChanged: {
                        order: 2,
                        featureName: "Cronologia",
                        html: "Puoi vedere gli indicatori dei giorni precedenti muovendo la slide.",
                        elementSelector: ".day input[type=range]",
                        showAfter: 20,
                        showAction: function () {
                            _this.dayNumber(5);
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
                        showAction: function () {
                            _this.viewMode("district");
                        }
                    },
                    topAreasOpened: {
                        order: 5,
                        featureName: "Zone",
                        html: "Puo vedere le zone più colpite di un qualsiasi indicatore scelto.",
                        elementSelector: "#topCases .card-title",
                        showAfter: 20,
                        showAction: function () {
                            if (_this.viewMode() == "country")
                                _this.viewMode("region");
                            M.Collapsible.getInstance(document.getElementById("topCases")).open(0);
                        }
                    },
                    deltaSelected: {
                        order: 5.5,
                        featureName: "Indicatori",
                        html: "Puoi vedere l'incremento giornaliero dell'indicatore anzichè il valore totale.",
                        elementSelector: ".day-delta",
                        showAfter: 20,
                        showAction: function () {
                            if (!_this.currentArea())
                                _this._tips.areaSelected.showAction();
                            _this.isDayDelta(true);
                        }
                    },
                    factorChanged: {
                        order: 6,
                        featureName: "Indicatori",
                        html: "Puoi mettere in relazione qualsiasi indicatore a numerosi parametri (es. % Positivi su Tamponi).",
                        elementSelector: ".filter-factor",
                        showAfter: 30,
                        showAction: function () {
                            if (!_this.currentArea())
                                _this._tips.areaSelected.showAction();
                            _this.selectedIndicator(WebApp.linq(_this._dataSet.indicators).first(function (a) { return a.id == "totalPositive"; }));
                            _this.selectedFactor(WebApp.linq(_this._dataSet.factors).first(function (a) { return a.id == "population"; }));
                        }
                    },
                    groupChanged: {
                        order: 7,
                        featureName: "Grafico",
                        html: "Puo raggruppare i dati del grafico in gruppi da 1 a 7 giorni. Puoi anche scegliere la data d'inizio.",
                        elementSelector: ".row-chart-group .select-wrapper",
                        showAfter: 30,
                        showAction: function () {
                            if (!_this.currentArea())
                                _this._tips.areaSelected.showAction();
                            var element = document.querySelector(".chart-options");
                            if (element.classList.contains("closed"))
                                element.classList.remove("closed");
                            _this.groupSize(2);
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
                        showAction: function () {
                            _this.isLogScale(true);
                        }
                    },
                    maxFactorChanged: {
                        order: 10,
                        featureName: "Mappa",
                        html: "Puoi cambiare il riferimento rispetto al quale la mappa viene colorata. Normalmente è in base al valore massimo che si ha avuto globalmente.",
                        elementSelector: ".max-factor",
                        showAfter: 60,
                        showAction: function () {
                            if (!_this.currentArea())
                                _this._tips.areaSelected.showAction();
                            _this.selectedIndicator(WebApp.linq(_this._dataSet.indicators).first(function (a) { return a.id == "totalPositive"; }));
                            _this.autoMaxFactor(false);
                            _this.maxFactor(1000);
                        }
                    },
                    regionExcluded: {
                        order: 11,
                        featureName: "Mappa",
                        html: "Nella vista nazionale puoi escludere dagli indicatori il valore di una o più regioni cliccando sulla mappa.",
                        elementSelector: ".card-map .center-align",
                        showAfter: 0,
                        showAction: function () {
                            if (_this.viewMode() != "country")
                                _this.viewMode("country");
                            _this._execludedArea.set("R8", _this._geo.areas["r8"]);
                            _this.updateIndicator();
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
                this.isNoFactorSelected = ko.computed(function () { return _this.selectedFactor() && _this.selectedFactor().id == 'none'; });
                this.groupDays = [1, 2, 3, 4, 5, 6, 7];
                this.factorDescription = ko.observable();
                this._data = model.data;
                this._geo = model.geo;
                this._debugMode = model.debugMode;
                this._calculator = new GeoPlot.IndicatorCalculator(this._data, this._dataSet, this._geo);
                this.totalDays(this._data.days.length - 1);
                this.dayNumber.subscribe(function (value) {
                    if (value != _this._data.days.length - 1)
                        _this.tipManager.markAction("dayChanged");
                    _this.updateDayData();
                    _this._specialDates.current.date = new Date(_this._data.days[value].date);
                    _this.updateChart();
                });
                this._mapSvg = document.getElementsByTagName("svg").item(0);
                this._mapSvg.addEventListener("click", function (e) { return _this.onMapClick(e); });
                this.days = [];
                for (var i = 0; i < this._data.days.length; i++)
                    this.days.push({ number: i, value: new Date(this._data.days[i].date), text: WebApp.DateUtils.format(this._data.days[i].date, $string("$(date-format-short)")) });
                var areaTabs = M.Tabs.init(document.getElementById("areaTabs"));
                areaTabs.options.onShow = function (el) {
                    _this.setViewMode(el.dataset["viewMode"]);
                };
                var topCasesView = M.Collapsible.init(document.getElementById("topCases"));
                topCasesView.options.onOpenStart = function () {
                    if (!_this._daysData)
                        _this.updateTopAreas();
                    _this._topAreasVisible = true;
                    _this.tipManager.markAction("topAreasOpened");
                };
                topCasesView.options.onCloseEnd = function () {
                    _this._topAreasVisible = false;
                };
                this.indicators = ko.computed(function () { return WebApp.linq(_this._dataSet.indicators)
                    .where(function (a) { return !a.validFor || a.validFor.indexOf(_this.viewMode()) != -1; })
                    .toArray(); });
                this.factors = ko.computed(function () { return WebApp.linq(_this._dataSet.factors)
                    .where(function (a) { return !a.validFor || a.validFor.indexOf(_this.viewMode()) != -1; })
                    .toArray(); });
                this.selectedIndicator.subscribe(function (value) {
                    if (!value)
                        return;
                    _this.updateIndicator();
                    if (value.id != "totalPositive")
                        _this.tipManager.markAction("indicatorChanged", value.id);
                });
                this.selectedFactor.subscribe(function (value) {
                    if (!value)
                        return;
                    _this.updateIndicator();
                    if (value.id != "none")
                        _this.tipManager.markAction("factorChanged", value.id);
                    setTimeout(function () { return M.FormSelect.init(document.querySelectorAll(".row-chart-group select")); });
                });
                this.autoMaxFactor.subscribe(function (value) {
                    if (value) {
                        _this.updateMaxFactor();
                        _this.updateMap();
                    }
                    _this.updateUrl();
                });
                this.maxFactor.subscribe(function (value) {
                    if (!_this.autoMaxFactor()) {
                        _this.updateMap();
                        _this.tipManager.markAction("maxFactorChanged", value.toString());
                    }
                    _this.updateUrl();
                });
                this.isDayDelta.subscribe(function (value) {
                    _this.computeStartDayForGroup();
                    _this.updateIndicator();
                    if (value)
                        _this.tipManager.markAction("deltaSelected");
                });
                this.isLogScale.subscribe(function (value) {
                    _this.updateChart();
                    _this.updateUrl();
                    if (value)
                        _this.tipManager.markAction("scaleChanged");
                });
                this.isZoomChart.subscribe(function (value) {
                    _this.updateChart();
                });
                this.groupSize.subscribe(function (value) {
                    _this.computeStartDayForGroup();
                    _this.updateChart();
                    _this.updateUrl();
                    if (value > 1)
                        _this.tipManager.markAction("groupChanged", value.toString());
                });
                this.startDay.subscribe(function (value) {
                    _this.updateChart();
                    _this.updateUrl();
                });
                var urlParams = new URLSearchParams(window.location.search);
                var stateRaw = urlParams.get("state");
                this._keepState = urlParams.get("keepState") == "true";
                this.loadPreferences();
                this.tipManager = new WebApp.TipManager(this._tips, function () { return _this._preferences; }, function () { return _this.savePreferences(); });
                this.tipManager.engageUser();
                var state;
                if (stateRaw && this._keepState)
                    state = JSON.parse(atob(stateRaw));
                else
                    state = {};
                setTimeout(function () { return _this.loadState(state); }, 0);
                if (!this._debugMode)
                    window.addEventListener("beforeunload", function () { return _this.savePreferences(); });
                //Templating.template(document.querySelector("#template"), "TestComponent", Templating.model({ isChecked: false }));
            }
            /****************************************/
            GeoPlotPage.prototype.isDefaultState = function (state) {
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
            };
            /****************************************/
            GeoPlotPage.prototype.loadState = function (state) {
                var e_8, _a;
                if (!state.view)
                    state.view = "region";
                var viewTabs = M.Tabs.getInstance(document.getElementById("areaTabs"));
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
                    try {
                        for (var _b = __values(state.excludedArea), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var areaId = _c.value;
                            this._execludedArea.set(areaId, this._geo.areas[areaId.toLowerCase()]);
                        }
                    }
                    catch (e_8_1) { e_8 = { error: e_8_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_8) throw e_8.error; }
                    }
                }
                if (state.indicator)
                    this.selectedIndicator(WebApp.linq(this._dataSet.indicators).first(function (a) { return a.id == state.indicator; }));
                if (state.factor)
                    this.selectedFactor(WebApp.linq(this._dataSet.factors).first(function (a) { return a.id == state.factor; }));
                if (state.area)
                    this.selectedArea = this._geo.areas[state.area.toLowerCase()];
            };
            /****************************************/
            GeoPlotPage.prototype.saveStata = function () {
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
            };
            /****************************************/
            GeoPlotPage.prototype.loadPreferences = function () {
                var json = localStorage.getItem("preferences");
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
            };
            /****************************************/
            GeoPlotPage.prototype.getDefaultPreferences = function () {
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
            };
            /****************************************/
            GeoPlotPage.prototype.savePreferences = function () {
                this._preferences.isFirstView = false;
                localStorage.setItem("preferences", JSON.stringify(this._preferences));
            };
            /****************************************/
            GeoPlotPage.prototype.toggleChartZoom = function () {
                this._preferences.actions.chartActionExecuted++;
                this.isZoomChart(!this.isZoomChart());
            };
            /****************************************/
            GeoPlotPage.prototype.copyMap = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var element, svgText, blob, svgImage_1, element_1;
                    return __generator(this, function (_a) {
                        element = document.querySelector("svg.map");
                        svgText = element.outerHTML;
                        blob = new Blob([svgText], { type: "image/svg+xml" });
                        if (navigator["clipboard"] && navigator["clipboard"]["write"]) {
                            svgImage_1 = document.createElement('img');
                            svgImage_1.style.width = element.clientWidth + "px";
                            svgImage_1.style.height = element.clientHeight + "px";
                            svgImage_1.onload = function () {
                                var _this = this;
                                var canvas = document.createElement("canvas");
                                canvas.width = element.clientWidth;
                                canvas.height = element.clientHeight;
                                var ctx = canvas.getContext("2d");
                                ctx.fillStyle = "white";
                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                                ctx.drawImage(svgImage_1, 0, 0);
                                canvas.toBlob(function (pngBlob) { return __awaiter(_this, void 0, void 0, function () {
                                    var item;
                                    var _a;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                item = new ClipboardItem((_a = {}, _a[pngBlob.type] = pngBlob, _a));
                                                return [4 /*yield*/, navigator.clipboard.write([item])];
                                            case 1:
                                                _b.sent();
                                                M.toast({ html: $string("$(msg-map-copied)") });
                                                return [2 /*return*/];
                                        }
                                    });
                                }); });
                            };
                            svgImage_1.src = window.URL.createObjectURL(blob);
                        }
                        else {
                            element_1 = document.createElement("a");
                            element_1.href = window.URL.createObjectURL(blob);
                            element_1.target = "_blan";
                            element_1.download = "map.svg";
                            element_1.click();
                            M.toast({ html: $string("$(msg-no-copy)") });
                        }
                        return [2 /*return*/];
                    });
                });
            };
            /****************************************/
            GeoPlotPage.prototype.copyChart = function () {
                var _this = this;
                this._chart.canvas.toBlob(function (blob) { return __awaiter(_this, void 0, void 0, function () {
                    var item, url, element;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (!(navigator["clipboard"] && navigator["clipboard"]["write"])) return [3 /*break*/, 2];
                                item = new ClipboardItem((_a = {}, _a[blob.type] = blob, _a));
                                return [4 /*yield*/, navigator.clipboard.write([item])];
                            case 1:
                                _b.sent();
                                M.toast({ html: $string("$(msg-chart-copied)") });
                                return [3 /*break*/, 3];
                            case 2:
                                url = window.URL.createObjectURL(blob);
                                element = document.createElement("a");
                                element.href = url;
                                element.target = "_blan";
                                element.download = this._chart.options.title.text + ".png";
                                element.click();
                                M.toast({ html: $string("$(msg-no-copy)") });
                                _b.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
                this.tipManager.markAction("chartActionExecuted", "copy");
            };
            /****************************************/
            GeoPlotPage.prototype.copySerie = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var data, text, i;
                    return __generator(this, function (_a) {
                        data = this._chart.data.datasets[0].data;
                        text = "";
                        for (i = 0; i < data.length; i++)
                            text += WebApp.DateUtils.format(data[i].x, $string("$(date-format)")) + "\t" + i + "\t" + WebApp.MathUtils.round(data[i].y, 1) + "\n";
                        WebApp.DomUtils.copyText(text);
                        M.toast({ html: $string("$(msg-serie-copied)") });
                        this.tipManager.markAction("chartActionExecuted", "copySerie");
                        return [2 /*return*/];
                    });
                });
            };
            /****************************************/
            GeoPlotPage.prototype.copySerieForStudio = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var obj;
                    return __generator(this, function (_a) {
                        obj = {
                            type: "serie",
                            version: 1,
                            color: this.selectedIndicator().colorLight,
                            serie: {
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
                        return [2 /*return*/];
                    });
                });
            };
            /****************************************/
            GeoPlotPage.prototype.play = function () {
                if (this.dayNumber() == this._data.days.length - 1)
                    this.dayNumber(0);
                this.isPlaying(true);
                this.nextFrame();
            };
            /****************************************/
            GeoPlotPage.prototype.pause = function () {
                this.isPlaying(false);
            };
            /****************************************/
            GeoPlotPage.prototype.setViewMode = function (mode) {
                if (mode != "region")
                    this.tipManager.markAction("viewChanged", mode);
                this.viewMode(mode);
                var districtGroup = document.getElementById("group_district");
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
                setTimeout(function () {
                    return M.FormSelect.init(document.querySelectorAll(".row-indicator select"));
                });
            };
            Object.defineProperty(GeoPlotPage.prototype, "selectedArea", {
                /****************************************/
                get: function () {
                    return this._selectedArea;
                },
                set: function (value) {
                    if (value == this._selectedArea)
                        return;
                    if (this._selectedArea) {
                        var element = document.getElementById(this._selectedArea.id.toUpperCase());
                        if (element)
                            element.classList.remove("selected");
                    }
                    this._selectedArea = value;
                    if (this._selectedArea) {
                        var element = document.getElementById(this._selectedArea.id.toUpperCase());
                        if (element) {
                            element.classList.add("selected");
                            var parent_1 = element.parentElement;
                            element.remove();
                            parent_1.appendChild(element);
                        }
                    }
                    this.changeArea();
                },
                enumerable: true,
                configurable: true
            });
            /****************************************/
            GeoPlotPage.prototype.getFactorValue = function (dayNumberOrGroup, areaOrId) {
                return this._calculator.getFactorValue({
                    dayNumberOrGroup: dayNumberOrGroup,
                    areaOrId: areaOrId,
                    factorId: this.selectedFactor().id,
                    indicatorId: this.selectedIndicator().id,
                    isDayDelta: this.isDayDelta(),
                    execludedAreas: WebApp.linq(this._execludedArea.keys()).toArray()
                });
            };
            /****************************************/
            GeoPlotPage.prototype.getIndicatorValue = function (dayNumber, areaOrId, indicatorId) {
                return this._calculator.getIndicatorValue({
                    dayNumber: dayNumber,
                    areaOrId: areaOrId,
                    indicatorId: indicatorId,
                    isDayDelta: this.isDayDelta(),
                    execludedAreas: WebApp.linq(this._execludedArea.keys()).toArray()
                });
            };
            /****************************************/
            GeoPlotPage.prototype.computeStartDayForGroup = function () {
                var totDays = this.days.length - this.startDay();
                var module = (totDays % this.groupSize());
                if (module != 0) {
                    var invModule = this.groupSize() - module;
                    if (this.startDay() - invModule >= 0)
                        this.startDay(this.startDay() - invModule);
                    else if (this.startDay() + module < this.days.length - 1)
                        this.startDay(this.startDay() + module);
                    M.FormSelect.init(document.querySelectorAll(".row-chart-group select"));
                }
            };
            /****************************************/
            GeoPlotPage.prototype.onMapClick = function (e) {
                var item = e.target;
                var areaId = item.parentElement.id;
                var area = this._geo.areas[areaId.toLowerCase()];
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
            };
            /****************************************/
            GeoPlotPage.prototype.nextFrame = function () {
                var _this = this;
                if (!this.isPlaying())
                    return;
                if (this.dayNumber() >= this._data.days.length - 1)
                    this.pause();
                else
                    this.dayNumber(parseInt(this.dayNumber().toString()) + 1);
                setTimeout(function () { return _this.nextFrame(); }, 1000);
            };
            /****************************************/
            GeoPlotPage.prototype.changeArea = function () {
                if (this._selectedArea == null)
                    this.currentArea(null);
                else {
                    var isEmptyArea = !this.currentArea();
                    var area = new AreaViewModel();
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
            };
            /****************************************/
            GeoPlotPage.prototype.updateAreaIndicators = function () {
                var e_9, _a, e_10, _b;
                var _this = this;
                if (!this.currentArea())
                    return;
                if (!this.currentArea().indicators()) {
                    var items = [];
                    var _loop_1 = function (indicator) {
                        var item = new IndicatorViewModel();
                        item.indicator = indicator;
                        item.select = function () {
                            _this.tipManager.markAction("indicatorSelected", item.indicator.id);
                            _this.selectedIndicator(indicator);
                            setTimeout(function () {
                                return M.FormSelect.init(document.querySelectorAll(".row-indicator select"));
                            });
                        };
                        items.push(item);
                    };
                    try {
                        for (var _c = __values(this.indicators()), _d = _c.next(); !_d.done; _d = _c.next()) {
                            var indicator = _d.value;
                            _loop_1(indicator);
                        }
                    }
                    catch (e_9_1) { e_9 = { error: e_9_1 }; }
                    finally {
                        try {
                            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                        }
                        finally { if (e_9) throw e_9.error; }
                    }
                    this.currentArea().indicators(items);
                }
                var areaId = this.currentArea().value.id.toLowerCase();
                try {
                    for (var _e = __values(this.currentArea().indicators()), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var item = _f.value;
                        item.value(this.getIndicatorValue(this.dayNumber(), areaId, item.indicator.id));
                    }
                }
                catch (e_10_1) { e_10 = { error: e_10_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_10) throw e_10.error; }
                }
            };
            /****************************************/
            GeoPlotPage.prototype.updateFactorDescription = function () {
                var e_11, _a;
                var desc = "";
                if (this.isDayDelta())
                    desc = "$(new) ";
                desc += this.selectedFactor().description.replace("[indicator]", this.selectedIndicator().name);
                if (this.currentArea())
                    desc += " - " + this.currentArea().value.name;
                if (this._execludedArea.size > 0) {
                    desc += " - $(except) (";
                    var i = 0;
                    try {
                        for (var _b = __values(this._execludedArea.keys()), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var key = _c.value;
                            if (i > 0)
                                desc += ", ";
                            desc += this._execludedArea.get(key).name;
                            i++;
                        }
                    }
                    catch (e_11_1) { e_11 = { error: e_11_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_11) throw e_11.error; }
                    }
                    desc += ")";
                }
                this.factorDescription($string(desc));
            };
            /****************************************/
            GeoPlotPage.prototype.updateIndicator = function () {
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
            };
            /****************************************/
            GeoPlotPage.prototype.updateMaxFactor = function () {
                if (!this.selectedFactor() || !this.selectedIndicator() || !this.autoMaxFactor())
                    return;
                var result = Number.NEGATIVE_INFINITY;
                var curView = GeoPlot.ViewModes[this.viewMode()];
                for (var i = 0; i < this._data.days.length; i++) {
                    var day = this._data.days[i];
                    for (var areaId in day.values) {
                        if (!curView.validateId(areaId))
                            continue;
                        var factor = this.getFactorValue(i, areaId);
                        if (factor > result && factor != Number.POSITIVE_INFINITY)
                            result = factor;
                    }
                }
                this.maxFactor(parseFloat(result.toFixed(1)));
            };
            /****************************************/
            GeoPlotPage.prototype.initChart = function () {
                var _this = this;
                var canvas = document.querySelector("#areaGraph");
                var referencesPlugIn = {
                    afterDraw: function (chart) {
                        var data = chart.data.datasets[0].data;
                        if (!data || data.length == 0)
                            return;
                        var xScale = chart["scales"]["x-axis-0"];
                        var ctx = chart.ctx;
                        for (var key in _this._specialDates) {
                            var item = _this._specialDates[key];
                            if (!item.date || item.visible === false)
                                continue;
                            var offset = xScale["getPixelForValue"]({ x: item.date });
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
                                label: function (t, d) {
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
            };
            /****************************************/
            GeoPlotPage.prototype.updateChart = function () {
                if (!this.selectedIndicator() || !this.currentArea() || !this.selectedFactor())
                    return;
                if (this._chart == null)
                    this.initChart();
                var area = this.currentArea().value;
                var areaId = area.id.toLowerCase();
                var field = this.selectedIndicator().id;
                this._chart.data.datasets[0].label = this.factorDescription();
                this._chart.options.title.text = this._chart.data.datasets[0].label;
                if (this.isLogScale())
                    this._chart.options.scales.yAxes[0].type = "logarithmic";
                else
                    this._chart.options.scales.yAxes[0].type = "linear";
                this._chart.data.datasets[0].borderColor = this.selectedIndicator().colorDark;
                this._chart.data.datasets[0].backgroundColor = this.selectedIndicator().colorLight;
                this._chart.data.datasets[0].data = this._calculator.getSerie({
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
            };
            /****************************************/
            GeoPlotPage.prototype.updateArea = function (value, dayNumber) {
                if (!value || !this.selectedIndicator() || !this.selectedFactor())
                    return;
                if (dayNumber == undefined)
                    dayNumber = this.dayNumber();
                var id = value.value.id.toLowerCase();
                var area = value.value;
                var day = this._data.days[dayNumber];
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
            };
            /****************************************/
            GeoPlotPage.prototype.updateTopAreas = function () {
                var _this = this;
                this._daysData = [];
                var _loop_2 = function (i) {
                    var day = this_1._data.days[i];
                    var item = {};
                    var isInArea = GeoPlot.ViewModes[this_1.viewMode()].validateId;
                    item.topAreas = WebApp.linq(day.values).select(function (a) { return ({
                        factor: _this.getFactorValue(i, a.key),
                        value: a
                    }); })
                        .orderByDesc(function (a) { return a.factor; }).where(function (a) { return isInArea(a.value.key); }).select(function (a) {
                        var area = new AreaViewModel();
                        area.value = _this._geo.areas[a.value.key.toLowerCase()];
                        area.select = function () { return _this.selectedArea = area.value; };
                        _this.updateArea(area, i);
                        return area;
                    }).take(25).toArray();
                    this_1._daysData.push(item);
                };
                var this_1 = this;
                for (var i = 0; i < this._data.days.length; i++) {
                    _loop_2(i);
                }
                this.topAreas(this._daysData[this.dayNumber()].topAreas);
            };
            /****************************************/
            GeoPlotPage.prototype.updateDayData = function () {
                var day = this._data.days[this.dayNumber()];
                this.currentData(WebApp.DateUtils.format(day.date, $string("$(date-format)")));
                this.updateMap();
                this.updateArea(this.currentArea());
                this.updateAreaIndicators();
                if (this._daysData && this._topAreasVisible)
                    this.topAreas(this._daysData[this.dayNumber()].topAreas);
                this.updateUrl();
            };
            /****************************************/
            GeoPlotPage.prototype.updateUrl = function () {
                if (!this._keepState)
                    return;
                var state = this.saveStata();
                var url = WebApp.app.baseUrl + "Overview";
                if (!this.isDefaultState(state))
                    url += "?state=" + encodeURIComponent(btoa(JSON.stringify(state))) + "&keepState=true";
                history.replaceState(null, null, url);
            };
            /****************************************/
            GeoPlotPage.prototype.clearMap = function () {
                var day = this._data.days[this.dayNumber()];
                for (var key in day.values) {
                    var element = document.getElementById(key.toUpperCase());
                    if (element) {
                        //element.style.fillOpacity = "1";
                        element.style.removeProperty("fill");
                    }
                }
            };
            /****************************************/
            GeoPlotPage.prototype.updateMap = function () {
                var _this = this;
                if (!this.selectedIndicator() || !this.selectedFactor())
                    return;
                if (this.viewMode() != "country") {
                    var day = this._data.days[this.dayNumber()];
                    var gradient = new WebApp.LinearGradient("#fff", this.selectedIndicator().colorDark);
                    for (var key in day.values) {
                        var element = document.getElementById(key.toUpperCase());
                        if (element) {
                            var area = this._geo.areas[key];
                            if (area.type != GeoPlot.ViewModes[this.viewMode()].areaType)
                                continue;
                            var factor = this.getFactorValue(this.dayNumber(), area);
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
                                var value = WebApp.MathUtils.discretize(WebApp.MathUtils.exponential(factor), 20);
                                //element.style.fillOpacity = value.toString();
                                element.style.fill = gradient.valueAt(0.15 + (factor * 0.85)).toString();
                            }
                        }
                    }
                }
                else {
                    WebApp.linq(document.querySelectorAll("g.region")).foreach(function (element) {
                        if (_this._execludedArea.has(element.id))
                            element.style.fill = "#444";
                        else
                            element.style.fill = "#FFF";
                    });
                }
            };
            return GeoPlotPage;
        }());
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
        var ParameterViewModel = /** @class */ (function () {
            function ParameterViewModel(config) {
                this.min = ko.observable();
                this.max = ko.observable();
                this.step = ko.observable();
                this.isSelected = ko.observable(true);
                this.value = config.value;
                this.name = config.name;
            }
            return ParameterViewModel;
        }());
        /****************************************/
        /* Regression
        /****************************************/
        var GraphContext = /** @class */ (function () {
            function GraphContext() {
                this.vars = {};
            }
            GraphContext.prototype.setExpressions = function (values) {
                var e_12, _a, e_13, _b, e_14, _c, e_15, _d;
                var state = this.calculator.getState();
                var _loop_3 = function (value) {
                    var e_16, _a;
                    var curExp = WebApp.linq(state.expressions.list).first(function (a) { return a.id == value.id; });
                    if (!curExp)
                        state.expressions.list.push(value);
                    else {
                        try {
                            for (var _b = (e_16 = void 0, __values(Object.getOwnPropertyNames(value))), _c = _b.next(); !_c.done; _c = _b.next()) {
                                var prop = _c.value;
                                curExp[prop] = value[prop];
                            }
                        }
                        catch (e_16_1) { e_16 = { error: e_16_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                            }
                            finally { if (e_16) throw e_16.error; }
                        }
                    }
                };
                try {
                    for (var values_1 = __values(values), values_1_1 = values_1.next(); !values_1_1.done; values_1_1 = values_1.next()) {
                        var value = values_1_1.value;
                        _loop_3(value);
                    }
                }
                catch (e_12_1) { e_12 = { error: e_12_1 }; }
                finally {
                    try {
                        if (values_1_1 && !values_1_1.done && (_a = values_1.return)) _a.call(values_1);
                    }
                    finally { if (e_12) throw e_12.error; }
                }
                var groups = WebApp.linq(state.expressions.list).where(function (a) { return a.type != "folder"; }).groupBy(function (a) { return a.folderId ? a.folderId : ""; }).toDictionary(function (a) { return a.key; }, function (a) { return a.values.toArray(); });
                var newList = [];
                try {
                    for (var _e = __values(WebApp.linq(state.expressions.list).where(function (a) { return a.type == "folder"; })), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var folder = _f.value;
                        newList.push(folder);
                        var items_5 = groups[folder.id];
                        if (items_5)
                            try {
                                for (var items_3 = (e_14 = void 0, __values(items_5)), items_3_1 = items_3.next(); !items_3_1.done; items_3_1 = items_3.next()) {
                                    var item = items_3_1.value;
                                    newList.push(item);
                                }
                            }
                            catch (e_14_1) { e_14 = { error: e_14_1 }; }
                            finally {
                                try {
                                    if (items_3_1 && !items_3_1.done && (_c = items_3.return)) _c.call(items_3);
                                }
                                finally { if (e_14) throw e_14.error; }
                            }
                    }
                }
                catch (e_13_1) { e_13 = { error: e_13_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_13) throw e_13.error; }
                }
                var items = groups[""];
                if (items)
                    try {
                        for (var items_4 = __values(items), items_4_1 = items_4.next(); !items_4_1.done; items_4_1 = items_4.next()) {
                            var item = items_4_1.value;
                            newList.push(item);
                        }
                    }
                    catch (e_15_1) { e_15 = { error: e_15_1 }; }
                    finally {
                        try {
                            if (items_4_1 && !items_4_1.done && (_d = items_4.return)) _d.call(items_4);
                        }
                        finally { if (e_15) throw e_15.error; }
                    }
                state.expressions.list = newList;
                this.calculator.setState(state);
            };
            /****************************************/
            GraphContext.prototype.setColor = function (id, color) {
                this.calculator.controller.dispatch({ type: "set-item-color", id: id, color: color });
            };
            /****************************************/
            GraphContext.prototype.updateTable = function (id, values) {
                var exp = WebApp.linq(this.calculator.getExpressions()).where(function (a) { return a.id == id; }).first();
                if (exp) {
                    exp.columns[0].values = WebApp.linq(values).select(function (a) { return a.x.toString(); }).toArray();
                    exp.columns[1].values = WebApp.linq(values).select(function (a) { return a.y.toString(); }).toArray();
                    this.calculator.setExpression(exp);
                }
            };
            /****************************************/
            GraphContext.prototype.updateExpression = function (value) {
                var exp = WebApp.linq(this.calculator.getExpressions()).where(function (a) { return a.id == value.id; }).first();
                /*if (exp) {
                    for (let prop of Object.getOwnPropertyNames(value))
                        exp[prop] = value[prop];
                    this.calculator.setExpression(exp);
                }*/
                this.calculator.setExpression(value);
            };
            /****************************************/
            GraphContext.prototype.updateVariable = function (id, varName, value) {
                if (!varName)
                    return;
                this.updateExpression({ id: id, latex: varName + "=" + value.toString() });
            };
            /****************************************/
            GraphContext.prototype.expressionZoomFit = function (id) {
                this.calculator.controller.dispatch({ type: "expression-zoom-fit", id: id });
            };
            /****************************************/
            GraphContext.prototype.setItemVisibile = function (id, value) {
                this.updateExpression({ id: id, hidden: !value });
                //this.calculator.controller._setItemHidden(id, !value);
                //this.calculator.updateSettings({});
            };
            /****************************************/
            GraphContext.prototype.generateVars = function (map) {
                for (var key in map) {
                    if (!map[key])
                        map[key] = this.generateVar(key);
                }
            };
            /****************************************/
            GraphContext.prototype.generateVar = function (prefix) {
                if (prefix === void 0) { prefix = "a"; }
                if (!this.vars[prefix[0]])
                    this.vars[prefix[0]] = 0;
                this.vars[prefix[0]]++;
                return prefix[0] + "_{" + this.vars[prefix[0]] + "}";
            };
            return GraphContext;
        }());
        /****************************************/
        var BaseItem = /** @class */ (function () {
            function BaseItem() {
                this.canDrag = false;
                this.name = ko.observable();
                this.time = ko.observable(0);
                this.color = ko.observable();
                this.parameters = ko.observableArray();
            }
            /****************************************/
            BaseItem.prototype.createActions = function (result) {
                var _this = this;
                result.push(WebApp.apply(new ActionViewModel(), function (action) {
                    action.text = $string("$(delete)");
                    action.icon = "delete";
                    action.execute = function () { return _this.remove(); };
                }));
            };
            /****************************************/
            BaseItem.prototype.canAccept = function (value) {
                return false;
            };
            /****************************************/
            BaseItem.prototype.canReadData = function (transfer) {
                return false;
            };
            /****************************************/
            BaseItem.prototype.readData = function (transfer) {
            };
            /****************************************/
            BaseItem.prototype.writeData = function (transfer) {
                return false;
            };
            /****************************************/
            BaseItem.prototype.setState = function (state) {
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
            };
            /****************************************/
            BaseItem.prototype.getState = function () {
                return {
                    name: this.name(),
                    visible: this.node.isVisible(),
                    folderId: this.folderId,
                    color: this.color(),
                    opened: this.node.isExpanded()
                };
            };
            /****************************************/
            BaseItem.prototype.getVar = function (name) {
                return this._varsMap[name];
            };
            /****************************************/
            BaseItem.prototype.remove = function (recursive) {
                if (recursive === void 0) { recursive = true; }
                if (this._graphCtx) {
                    this._graphCtx.calculator.removeExpression({ id: this.getGraphId("private") });
                    this._graphCtx.calculator.removeExpression({ id: this.getGraphId("public") });
                }
                this.node.remove();
                if (recursive)
                    this.children.foreach(function (a) { return a.remove(); });
            };
            /****************************************/
            BaseItem.prototype.attachNode = function (node) {
                var _this = this;
                this.node = node;
                this.node.isVisible.subscribe(function (value) { return _this.updateGraphVisibility(); });
                this.node.isSelected.subscribe(function (value) {
                    if (value)
                        _this.onSelected();
                });
                var actions = [];
                this.createActions(actions);
                this.node.actions(actions);
            };
            /****************************************/
            BaseItem.prototype.attachGraph = function (ctx) {
                var _this = this;
                this._graphCtx = ctx;
                this._graphCtx.calculator.observe("expressionAnalysis", function () { return _this.onGraphChanged(); });
                this.color.subscribe(function (value) { return _this.updateColor(); });
            };
            /****************************************/
            BaseItem.prototype.isFullVisible = function () {
                var curNode = this.node;
                while (curNode) {
                    if (!curNode.isVisible())
                        return false;
                    curNode = curNode.parentNode;
                }
                return true;
            };
            /****************************************/
            BaseItem.prototype.updateGraphVisibility = function (recorsive) {
                if (recorsive === void 0) { recorsive = true; }
                var visible = this.isFullVisible();
                this._graphCtx.setItemVisibile(this.getGraphId("public"), visible);
                this._graphCtx.setItemVisibile(this.getGraphId("private"), visible);
                if (recorsive)
                    this.children.foreach(function (a) { return a.updateGraphVisibility(); });
                return visible;
            };
            /****************************************/
            BaseItem.prototype.updateGraph = function (recursive) {
                if (recursive === void 0) { recursive = true; }
                if (!this._graphCtx)
                    return;
                if (!this.folderId)
                    this.folderId = WebApp.StringUtils.uuidv4();
                var values = this.getExpressions();
                this._graphCtx.setExpressions(values);
                this.updateGraphWork();
                this.updateGraphVisibility();
                this.updateParameters();
                if (recursive)
                    this.children.foreach(function (a) { return a.updateGraph(recursive); });
            };
            /****************************************/
            BaseItem.prototype.onParentChanged = function () {
                this.updateGraphVisibility();
            };
            Object.defineProperty(BaseItem.prototype, "parent", {
                /****************************************/
                get: function () {
                    return this.node.parentNode.value();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(BaseItem.prototype, "children", {
                /****************************************/
                get: function () {
                    return WebApp.linq(this.node.nodes()).select(function (a) { return a.value(); });
                },
                enumerable: true,
                configurable: true
            });
            /****************************************/
            BaseItem.prototype.replaceVars = function (value) {
                for (var item in this._varsMap) {
                    var reg = new RegExp("\\$" + item, "g");
                    value = value.replace(reg, this._varsMap[item]);
                }
                return value;
            };
            /****************************************/
            BaseItem.prototype.getGraphId = function (section) {
                return this.folderId + "/" + section;
            };
            /****************************************/
            BaseItem.prototype.addChildrenWork = function (value, updateGraph) {
                if (updateGraph === void 0) { updateGraph = true; }
                var node = new TreeNodeViewModel(value);
                this.node.addNode(node);
                value.attachNode(node);
                value.attachGraph(this._graphCtx);
                if (updateGraph)
                    value.updateGraph();
                value.onParentChanged();
                return value;
            };
            /****************************************/
            BaseItem.prototype.createParameters = function (result) {
                return false;
            };
            /****************************************/
            BaseItem.prototype.updateParameters = function () {
                var _this = this;
                var values = [];
                if (this.createParameters(values)) {
                    this.parameters.removeAll();
                    values.forEach(function (a) { return _this.parameters.push(a); });
                }
            };
            /****************************************/
            BaseItem.prototype.updateGraphWork = function () {
            };
            /****************************************/
            BaseItem.prototype.setChildrenStateWork = function (state) {
            };
            /****************************************/
            BaseItem.prototype.onSelected = function () {
            };
            /****************************************/
            BaseItem.prototype.onGraphChanged = function () {
            };
            /****************************************/
            BaseItem.prototype.updateColor = function () {
            };
            return BaseItem;
        }());
        /****************************************/
        var RegressionFunctionViewModel = /** @class */ (function () {
            function RegressionFunctionViewModel() {
                this.vars = ko.observable();
            }
            RegressionFunctionViewModel.prototype.select = function () {
            };
            return RegressionFunctionViewModel;
        }());
        /****************************************/
        var RegressionFunctionVarViewModel = /** @class */ (function () {
            function RegressionFunctionVarViewModel() {
                this.curValue = ko.observable();
                this.autoCompute = ko.observable();
                this.min = ko.observable();
                this.max = ko.observable();
                this.step = ko.observable();
            }
            return RegressionFunctionVarViewModel;
        }());
        /****************************************/
        var StudioSerieRegression = /** @class */ (function (_super) {
            __extends(StudioSerieRegression, _super);
            /****************************************/
            function StudioSerieRegression(config) {
                var _this = _super.call(this) || this;
                _this._varsMap = {};
                _this.selectedFunction = ko.observable();
                _this.showIntegration = ko.observable(true);
                _this.maxDay = ko.observable();
                _this.endDay = ko.observable();
                _this._varsMap = {
                    "fun": null,
                    "sum": null,
                    "n1": null,
                    "n2": null,
                    "value": null,
                    "time": null,
                    "tend": null,
                    "xp": null
                };
                _this.itemType = "regression";
                _this.icon = "show_chart";
                _this.optionsTemplateName = "RegressionOptionsTemplate";
                _this.functions = [];
                _this.addFunction({
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
                _this.addFunction({
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
                _this.addFunction({
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
                _this.addFunction({
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
                _this.showIntegration.subscribe(function () {
                    _this._graphCtx.setItemVisibile(_this.getGraphId("sum-serie"), _this.isFullVisible() && _this.showIntegration());
                    _this._graphCtx.setItemVisibile(_this.getGraphId("sum-point"), _this.isFullVisible() && _this.showIntegration());
                });
                _this.selectedFunction.subscribe(function (a) {
                    if (!_this.name() && a)
                        return _this.name(a.value.name);
                });
                _this.endDay.subscribe(function (a) { return _this.updateEndDay(); });
                _this.maxDay.subscribe(function (a) { return _this.updateEndDay(); });
                _this.selectedFunction(_this.functions[0]);
                if (config)
                    _this.setState(config);
                return _this;
            }
            /****************************************/
            StudioSerieRegression.prototype.addFunction = function (value) {
                var e_17, _a;
                var _this = this;
                var model = new RegressionFunctionViewModel();
                model.value = value;
                model.select = function () {
                    _this.selectedFunction(model);
                    _this.name(model.value.name);
                    _this.updateGraph();
                };
                var vars = [];
                var _loop_4 = function (item) {
                    var vModel = new RegressionFunctionVarViewModel();
                    vModel.value = item;
                    vModel.curValue(item.value);
                    vModel.autoCompute(item.autoCompute);
                    vModel.min(item.minValue);
                    vModel.max(item.maxValue);
                    vModel.step(item.step);
                    vModel.min.subscribe(function (a) { return item.minValue = a; });
                    vModel.max.subscribe(function (a) { return item.maxValue = a; });
                    vModel.step.subscribe(function (a) { return item.step = a; });
                    vModel.curValue.subscribe(function (a) { return item.value = a; });
                    vModel.autoCompute.subscribe(function (a) {
                        item.autoCompute = a;
                        _this.updateGraph();
                    });
                    vModel.curValue.subscribe(function (value) {
                        if (!vModel.autoCompute()) {
                            _this._graphCtx.updateVariable(_this.getGraphId(item.name + "-value"), _this.getVar(item.name), value);
                        }
                    });
                    vars.push(vModel);
                };
                try {
                    for (var _b = __values(value.vars), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var item = _c.value;
                        _loop_4(item);
                    }
                }
                catch (e_17_1) { e_17 = { error: e_17_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_17) throw e_17.error; }
                }
                model.vars(vars);
                this.functions.push(model);
                return model;
            };
            /****************************************/
            StudioSerieRegression.prototype.onGraphChanged = function () {
                /*
                const item = this._graphCtx.calculator.expressionAnalysis[this.getGraphId("end-day")];
                if (item && item.evaluation)
                    this.endDay(item.evaluation.value);*/
                this.updateRegressionVars();
            };
            /****************************************/
            StudioSerieRegression.prototype.updateRegressionVars = function () {
                var e_18, _a;
                var model = this._graphCtx.calculator.controller.getItemModel(this.getGraphId("main"));
                if (model && model.regressionParameters) {
                    try {
                        for (var _b = __values(this.selectedFunction().vars()), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var item = _c.value;
                            var varName = this.getVar(item.value.name).replace("{", "").replace("}", "");
                            var value = model.regressionParameters[varName];
                            if (value != undefined) {
                                if (item.value.precision != undefined)
                                    value = WebApp.MathUtils.round(value, item.value.precision);
                                item.curValue(value);
                            }
                        }
                    }
                    catch (e_18_1) { e_18 = { error: e_18_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_18) throw e_18.error; }
                    }
                }
            };
            /****************************************/
            StudioSerieRegression.prototype.createParameters = function (result) {
                var _this = this;
                result.push(WebApp.apply(new ParameterViewModel({ value: this.endDay, name: $string("$(reg-days)") }), function (p) {
                    p.max = _this.maxDay;
                    p.min(0);
                    p.step(1);
                }));
                return true;
            };
            /****************************************/
            StudioSerieRegression.prototype.setStateWork = function (state) {
                var e_19, _a;
                if (state.function) {
                    var func = WebApp.linq(this.functions).first(function (a) { return a.value.type == state.function.type; });
                    if (func) {
                        var _loop_5 = function (item) {
                            var funcVar = WebApp.linq(func.vars()).first(function (a) { return a.value.name == item.name; });
                            if (funcVar) {
                                funcVar.autoCompute(item.autoCompute);
                                funcVar.max(item.maxValue);
                                funcVar.min(item.minValue);
                                funcVar.step(item.step);
                                funcVar.curValue(item.value);
                            }
                        };
                        try {
                            for (var _b = __values(state.function.vars), _c = _b.next(); !_c.done; _c = _b.next()) {
                                var item = _c.value;
                                _loop_5(item);
                            }
                        }
                        catch (e_19_1) { e_19 = { error: e_19_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                            }
                            finally { if (e_19) throw e_19.error; }
                        }
                        this.selectedFunction(func);
                    }
                }
                if (state.showIntegration != undefined)
                    this.showIntegration(state.showIntegration);
            };
            /****************************************/
            StudioSerieRegression.prototype.getState = function () {
                var e_20, _a;
                var state = _super.prototype.getState.call(this);
                state.function = this.selectedFunction().value;
                state.showIntegration = this.showIntegration();
                try {
                    for (var _b = __values(this.selectedFunction().vars()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var item = _c.value;
                        item.value.value = item.curValue();
                        item.value.maxValue = item.max();
                        item.value.minValue = item.min();
                        item.value.step = item.step();
                        item.value.autoCompute = item.autoCompute();
                    }
                }
                catch (e_20_1) { e_20 = { error: e_20_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_20) throw e_20.error; }
                }
                return state;
            };
            /****************************************/
            StudioSerieRegression.prototype.onParentChanged = function () {
                _super.prototype.onParentChanged.call(this);
                this.color(this.parent.color());
                this.maxDay(WebApp.linq(this.parent.values).max(function (a) { return a.x; }));
                if (this.endDay() == undefined)
                    this.endDay(this.maxDay());
            };
            /****************************************/
            StudioSerieRegression.prototype.updateEndDay = function () {
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
            };
            /****************************************/
            StudioSerieRegression.prototype.updateColor = function () {
                this._graphCtx.setColor(this.getGraphId("main-func"), this.color());
                this._graphCtx.setColor(this.getGraphId("sum-serie"), this.color());
                this._graphCtx.setColor(this.getGraphId("sum-point"), this.color());
                this._graphCtx.setColor(this.getGraphId("end-day-line"), this.color());
            };
            /****************************************/
            StudioSerieRegression.prototype.updateGraphWork = function () {
                this.updateRegressionVars();
            };
            /****************************************/
            StudioSerieRegression.prototype.getExpressions = function () {
                var e_21, _a, e_22, _b;
                var values = [];
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
                var func = this.selectedFunction().value;
                this._varsMap["x"] = "";
                this._varsMap["y"] = this.parent.getVar("y");
                this._varsMap["time"] = this.parent.parent.getVar("time");
                try {
                    for (var _c = __values(func.vars), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var item = _d.value;
                        if (!this._varsMap[item.name])
                            this._varsMap[item.name] = null;
                    }
                }
                catch (e_21_1) { e_21 = { error: e_21_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_21) throw e_21.error; }
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
                try {
                    for (var _e = __values(this.selectedFunction().vars()), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var item = _f.value;
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
                }
                catch (e_22_1) { e_22 = { error: e_22_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                    }
                    finally { if (e_22) throw e_22.error; }
                }
                return values;
            };
            return StudioSerieRegression;
        }(BaseItem));
        /****************************************/
        var StudioSerie = /** @class */ (function (_super) {
            __extends(StudioSerie, _super);
            function StudioSerie(config) {
                var _this = _super.call(this) || this;
                /****************************************/
                _this.color = ko.observable();
                _this.offsetX = ko.observable(0);
                _this.canDrag = true;
                _this.itemType = "serie";
                _this.icon = "insert_chart";
                _this.optionsTemplateName = "StudioOptionsTemplate";
                _this._varsMap = {
                    "x": null,
                    "y": null,
                    "ofs": null,
                    "xofs": null,
                };
                if (config) {
                    _this.setState(config);
                }
                return _this;
            }
            /****************************************/
            StudioSerie.prototype.writeData = function (transfer) {
                var data = {
                    version: 1,
                    type: "serieState",
                    state: this.getState()
                };
                transfer.setData("application/json+studio", JSON.stringify(data));
                transfer.setData("text/html+id", this.node.element.id);
                return true;
            };
            /****************************************/
            StudioSerie.prototype.createActions = function (result) {
                var _this = this;
                _super.prototype.createActions.call(this, result);
                result.push(WebApp.apply(new ActionViewModel(), function (action) {
                    action.text = $string("$(update)"),
                        action.icon = "autorenew";
                    action.execute = function () { return _this.updateSerie(); };
                }));
                result.push(WebApp.apply(new ActionViewModel(), function (action) {
                    action.text = $string("$(new-regression)"),
                        action.icon = "add_box";
                    action.execute = function () {
                        var reg = _this.addRegression(null, false);
                        reg.updateGraph();
                        _this.node.isExpanded(true);
                        reg.node.isSelected(true);
                    };
                }));
                result.push(WebApp.apply(new ActionViewModel(), function (action) {
                    action.text = $string("$(zoom)"),
                        action.icon = "zoom_in";
                    action.execute = function () {
                        _this.zoom();
                    };
                }));
            };
            /****************************************/
            StudioSerie.fromText = function (text) {
                try {
                    var obj = JSON.parse(text);
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
            };
            /****************************************/
            StudioSerie.prototype.getExpressions = function () {
                if (!this.color())
                    this.color("#0000ff");
                this._graphCtx.generateVars(this._varsMap);
                var values = [
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
            };
            /****************************************/
            StudioSerie.prototype.createParameters = function (result) {
                var _this = this;
                result.push(WebApp.apply(new ParameterViewModel({ value: this.offsetX, name: $string("$(shift)") }), function (p) {
                    p.max(_this.values.length);
                    p.min(-_this.values.length);
                    p.step(1);
                }));
                return true;
            };
            /****************************************/
            StudioSerie.prototype.updateGraphWork = function () {
                this._graphCtx.updateTable(this.getGraphId("table"), this.values);
            };
            /****************************************/
            StudioSerie.prototype.onGraphChanged = function () {
                /*
                const item = this._graphCtx.calculator.expressionAnalysis[this.getGraphId("offset")];
                if (item && item.evaluation)
                    this.offsetX(item.evaluation.value);*/
            };
            /****************************************/
            StudioSerie.prototype.onSelected = function () {
                this._graphCtx.expressionZoomFit(this.getGraphId("table"));
            };
            /****************************************/
            StudioSerie.prototype.updateColor = function () {
                this._graphCtx.setColor(this.getGraphId("offset-x-serie"), this.color());
                this.children.foreach(function (a) { return a.onParentChanged(); });
            };
            /****************************************/
            StudioSerie.prototype.attachGraph = function (ctx) {
                var _this = this;
                _super.prototype.attachGraph.call(this, ctx);
                this.offsetX.subscribe(function (value) {
                    return _this._graphCtx.updateVariable(_this.getGraphId("offset"), _this._varsMap["ofs"], value);
                });
            };
            /****************************************/
            StudioSerie.prototype.setChildrenStateWork = function (state) {
                var _this = this;
                if (state.children != undefined) {
                    this.children.foreach(function (a) { return a.remove(); });
                    state.children.forEach(function (a) {
                        var reg = _this.addRegression(null, false);
                        reg.setState(a);
                    });
                }
            };
            /****************************************/
            StudioSerie.prototype.setStateWork = function (state) {
                if (state.offsetX != undefined)
                    this.offsetX(state.offsetX);
                if (state.source)
                    this.source = state.source;
                if (state.values != undefined)
                    this.values = state.values;
            };
            /****************************************/
            StudioSerie.prototype.getState = function () {
                var state = _super.prototype.getState.call(this);
                state.offsetX = this.offsetX();
                state.source = this.source;
                state.values = this.values;
                state.children = this.children.select(function (a) { return a.getState(); }).toArray();
                return state;
            };
            /****************************************/
            StudioSerie.prototype.addRegression = function (configOrState, updateGraph) {
                if (updateGraph === void 0) { updateGraph = true; }
                return this.addChildrenWork(configOrState instanceof StudioSerieRegression ? configOrState : new StudioSerieRegression(configOrState), updateGraph);
            };
            /****************************************/
            StudioSerie.prototype.updateSerie = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var model;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!!this._graphCtx.serieCalculator) return [3 /*break*/, 2];
                                M.toast({ html: $string("$(msg-downloading-data)") });
                                return [4 /*yield*/, GeoPlot.Api.loadStudioData()];
                            case 1:
                                model = _a.sent();
                                this._graphCtx.serieCalculator = new GeoPlot.IndicatorCalculator(model.data, GeoPlot.InfectionDataSet, model.geo);
                                _a.label = 2;
                            case 2:
                                this.values = this._graphCtx.serieCalculator.getSerie(this.source);
                                this._graphCtx.updateTable(this.getGraphId("table"), this.values);
                                this.children.foreach(function (a) { return a.onParentChanged(); });
                                M.toast({ html: $string("$(msg-update-complete)") });
                                return [2 /*return*/];
                        }
                    });
                });
            };
            /****************************************/
            StudioSerie.prototype.zoom = function () {
                var minX = WebApp.linq(this.values).min(function (a) { return a.x; });
                var minY = WebApp.linq(this.values).min(function (a) { return a.y; });
                var maxX = WebApp.linq(this.values).max(function (a) { return a.x; });
                var maxY = WebApp.linq(this.values).max(function (a) { return a.y; });
                this._graphCtx.calculator.setMathBounds({
                    top: maxY + (maxY - minY) * 0.1,
                    right: maxX + (maxX - minX) * 0.1,
                    bottom: minY - (maxY - minY) * 0.1,
                    left: minX - (maxX - minX) * 0.1,
                });
            };
            return StudioSerie;
        }(BaseItem));
        /****************************************/
        var StudioProject = /** @class */ (function (_super) {
            __extends(StudioProject, _super);
            function StudioProject(config) {
                var _this = _super.call(this) || this;
                /****************************************/
                _this.time = ko.observable(0);
                _this.itemType = "project";
                _this.icon = "folder";
                _this.optionsTemplateName = "ProjectOptionsTemplate";
                _this._varsMap = {
                    "time": null
                };
                if (config)
                    _this.setState(config);
                return _this;
            }
            /****************************************/
            StudioProject.prototype.canAccept = function (value) {
                return (value instanceof StudioSerie);
            };
            /****************************************/
            StudioProject.prototype.canReadData = function (transfer) {
                return transfer.types.indexOf("application/json+studio") != -1;
            };
            /****************************************/
            StudioProject.prototype.readData = function (transfer) {
                var textData = transfer.getData("application/json+studio");
                var serie = StudioSerie.fromText(textData);
                if (serie) {
                    this.addSerie(serie);
                    this.node.isExpanded(true);
                }
            };
            /****************************************/
            StudioProject.prototype.getExpressions = function () {
                this._graphCtx.generateVars(this._varsMap);
                var values = [
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
            };
            /****************************************/
            StudioProject.prototype.createParameters = function (result) {
                result.push(WebApp.apply(new ParameterViewModel({ value: this.time, name: $string("$(day)") }), function (p) {
                    p.max(100);
                    p.min(0);
                    p.step(1);
                }));
                return true;
            };
            /****************************************/
            StudioProject.prototype.setStateWork = function (state) {
                if (state.time != undefined)
                    this.time(state.time);
            };
            /****************************************/
            StudioProject.prototype.setChildrenStateWork = function (state) {
                var _this = this;
                if (state.children != undefined) {
                    this.children.foreach(function (a) { return a.remove(); });
                    state.children.forEach(function (a) {
                        var item = _this.addSerie(null, false);
                        item.setState(a);
                    });
                }
            };
            /****************************************/
            StudioProject.prototype.getState = function () {
                var state = _super.prototype.getState.call(this);
                state.time = this.time();
                state.children = this.children.select(function (a) { return a.getState(); }).toArray();
                return state;
            };
            /****************************************/
            StudioProject.prototype.onGraphChanged = function () {
                /*
                const item = this._graphCtx.calculator.expressionAnalysis[this.getGraphId("time")];
                if (item)
                    this.time(item.evaluation.value);*/
            };
            /****************************************/
            StudioProject.prototype.attachGraph = function (ctx) {
                var _this = this;
                _super.prototype.attachGraph.call(this, ctx);
                this.time.subscribe(function (value) {
                    return _this._graphCtx.updateVariable(_this.getGraphId("time"), _this._varsMap["time"], _this.time());
                });
            };
            /****************************************/
            StudioProject.prototype.addSerie = function (configOrSerie, updateGraph) {
                if (updateGraph === void 0) { updateGraph = true; }
                return this.addChildrenWork(configOrSerie instanceof StudioSerie ? configOrSerie : new StudioSerie(configOrSerie), updateGraph);
            };
            return StudioProject;
        }(BaseItem));
        /****************************************/
        var ActionViewModel = /** @class */ (function () {
            function ActionViewModel() {
            }
            ActionViewModel.prototype.execute = function () {
            };
            return ActionViewModel;
        }());
        /****************************************/
        var TreeNodeViewModel = /** @class */ (function () {
            function TreeNodeViewModel(value) {
                var _this = this;
                this._dargEnterCount = 0;
                /****************************************/
                this.nodes = ko.observableArray();
                this.value = ko.observable();
                this.isSelected = ko.observable(false);
                this.isVisible = ko.observable(true);
                this.isExpanded = ko.observable(false);
                this.actions = ko.observable();
                this.value(value);
                this.isSelected.subscribe(function (a) {
                    if (a)
                        _this._treeView.select(_this);
                });
            }
            Object.defineProperty(TreeNodeViewModel.prototype, "element", {
                /****************************************/
                get: function () {
                    return this._element;
                },
                enumerable: true,
                configurable: true
            });
            /****************************************/
            TreeNodeViewModel.prototype.attachNode = function (element) {
                var _this = this;
                this._element = element;
                this._element.id = WebApp.DomUtils.generateId();
                this._element["$model"] = this;
                var header = this._element.querySelector("header");
                header.ondragstart = function (ev) { return _this.onDrag(ev); };
                header.ondragover = function (ev) { return _this.onDragOver(ev); };
                header.ondragenter = function (ev) { return _this.onDragEnter(ev); };
                header.ondragleave = function (ev) { return _this.onDragLeave(ev); };
                header.ondrop = function (ev) { return _this.onDrop(ev); };
            };
            /****************************************/
            TreeNodeViewModel.prototype.onDrag = function (ev) {
                if (!this.value().writeData(ev.dataTransfer) || !this.value().canDrag) {
                    ev.preventDefault();
                    return false;
                }
            };
            /****************************************/
            TreeNodeViewModel.prototype.onDragEnter = function (ev) {
                this._dargEnterCount++;
            };
            /****************************************/
            TreeNodeViewModel.prototype.onDragLeave = function (ev) {
                this._dargEnterCount--;
                if (this._dargEnterCount == 0)
                    WebApp.DomUtils.removeClass(this._element, "drop");
            };
            /****************************************/
            TreeNodeViewModel.prototype.onDragOver = function (ev) {
                ev.preventDefault();
                if (this._dargEnterCount == 1) {
                    var canDrop = true;
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
            };
            /****************************************/
            TreeNodeViewModel.prototype.onDrop = function (ev) {
                ev.preventDefault();
                this._dargEnterCount = 0;
                WebApp.DomUtils.removeClass(this._element, "drop");
                var elId = ev.dataTransfer.getData("text/html+id");
                if (elId) {
                    var element = document.getElementById(elId);
                    var node = element["$model"];
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
            };
            /****************************************/
            TreeNodeViewModel.prototype.remove = function () {
                if (this._parentNode)
                    this._parentNode.nodes.remove(this);
                if (this._treeView.selectedNode() == this)
                    this._treeView.select(null);
            };
            /****************************************/
            TreeNodeViewModel.prototype.addNode = function (node) {
                node.attach(this._treeView, this);
                this.nodes.push(node);
            };
            /****************************************/
            TreeNodeViewModel.prototype.attach = function (treeView, parent) {
                var e_23, _a;
                this._treeView = treeView;
                this._parentNode = parent;
                try {
                    for (var _b = __values(this.nodes()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var childNode = _c.value;
                        childNode.attach(treeView);
                    }
                }
                catch (e_23_1) { e_23 = { error: e_23_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_23) throw e_23.error; }
                }
            };
            Object.defineProperty(TreeNodeViewModel.prototype, "parentNode", {
                /****************************************/
                get: function () {
                    return this._parentNode;
                },
                enumerable: true,
                configurable: true
            });
            /****************************************/
            TreeNodeViewModel.prototype.toggleVisible = function () {
                this.isVisible(!this.isVisible());
            };
            /****************************************/
            TreeNodeViewModel.prototype.toggleSelection = function () {
                this.isSelected(!this.isSelected());
            };
            /****************************************/
            TreeNodeViewModel.prototype.expandCollapse = function () {
                this.isExpanded(!this.isExpanded());
            };
            return TreeNodeViewModel;
        }());
        /****************************************/
        var TreeViewModel = /** @class */ (function () {
            function TreeViewModel() {
                /****************************************/
                this.root = ko.observable();
                this.selectedNode = ko.observable();
            }
            /****************************************/
            TreeViewModel.prototype.select = function (node) {
                if (this.selectedNode() == node)
                    return;
                if (this.selectedNode())
                    this.selectedNode().isSelected(false);
                this.selectedNode(node);
                if (this.selectedNode())
                    this.selectedNode().isSelected(true);
            };
            /****************************************/
            TreeViewModel.prototype.setRoot = function (node) {
                node.attach(this);
                this.root(node);
            };
            return TreeViewModel;
        }());
        GeoPlot.TreeViewModel = TreeViewModel;
        /****************************************/
        var StudioPage = /** @class */ (function () {
            function StudioPage(projectId) {
                var _this = this;
                /****************************************/
                this.items = new TreeViewModel();
                this.maxX = ko.observable();
                this.maxY = ko.observable();
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
                var actions = [];
                actions.push(WebApp.apply(new ActionViewModel(), function (action) {
                    action.text = $string("$(new-project)"),
                        action.icon = "create_new_folder";
                    action.execute = function () { return _this.newProject(); };
                }));
                actions.push(WebApp.apply(new ActionViewModel(), function (action) {
                    action.text = $string("$(save)"),
                        action.icon = "save";
                    action.execute = function () { return _this.saveState(); };
                }));
                actions.push(WebApp.apply(new ActionViewModel(), function (action) {
                    action.text = $string("$(options)"),
                        action.icon = "settings";
                    action.execute = function () { return _this.showOptions(); };
                }));
                actions.push(WebApp.apply(new ActionViewModel(), function (action) {
                    action.text = $string("$(share) Studio"),
                        action.icon = "share";
                    action.execute = function () { return _this.share(); };
                }));
                var root = new TreeNodeViewModel();
                root.actions(actions);
                this.items.setRoot(root);
                document.body.addEventListener("paste", function (ev) {
                    if (_this.onPaste(ev.clipboardData))
                        ev.preventDefault();
                });
                document.body.addEventListener("keydown", function (ev) {
                    _this.onKeyDown(ev);
                });
                M.Modal.init(document.getElementById("options"), {
                    onCloseEnd: function () { return _this.updateOptions(); }
                });
                setTimeout(function () { return _this.init(); });
            }
            /****************************************/
            StudioPage.prototype.updateOptions = function () {
                var maxX = parseInt(this.maxX());
                var maxY = parseInt(this.maxY());
                this._graphCtx.calculator.setMathBounds({
                    bottom: -maxY / 10,
                    left: -maxX / 10,
                    right: maxX,
                    top: maxY
                });
            };
            /****************************************/
            StudioPage.prototype.share = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var projectId, url;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                projectId = WebApp.StringUtils.uuidv4();
                                return [4 /*yield*/, GeoPlot.Api.saveState(projectId, this.getState())];
                            case 1:
                                _a.sent();
                                url = WebApp.Uri.absolute("~/" + $language.split("-")[0] + "/Studio/" + projectId);
                                return [4 /*yield*/, WebApp.DomUtils.copyText(url)];
                            case 2:
                                _a.sent();
                                M.toast({ html: $string("$(msg-shared)") });
                                return [2 /*return*/];
                        }
                    });
                });
            };
            /****************************************/
            StudioPage.prototype.showOptions = function () {
                var bounds = this._graphCtx.calculator.graphpaperBounds;
                this.maxX(Math.round(bounds.mathCoordinates.width));
                this.maxY(Math.round(bounds.mathCoordinates.height));
                var dialog = M.Modal.getInstance(document.getElementById("options"));
                dialog.open();
            };
            /****************************************/
            StudioPage.prototype.removeSelected = function () {
                if (!this.items.selectedNode())
                    return;
                var value = this.items.selectedNode().value();
                value.remove();
            };
            /****************************************/
            StudioPage.prototype.getSelectedProject = function () {
                if (!this.items.selectedNode())
                    return;
                var value = this.items.selectedNode().value();
                if (value.itemType == "project")
                    return value;
                if (value.itemType == "serie")
                    return value.parent;
                if (value.itemType == "regression")
                    return value.parent.parent;
            };
            /****************************************/
            StudioPage.prototype.newProject = function () {
                var proj = this.addProject({ name: "Project " + (this.projects.count() + 1) });
                proj.node.isSelected(true);
                return proj;
            };
            /****************************************/
            StudioPage.prototype.addProject = function (config, updateGraph) {
                if (updateGraph === void 0) { updateGraph = true; }
                var project = new StudioProject(config);
                var node = new TreeNodeViewModel(project);
                this.items.root().addNode(node);
                project.attachNode(node);
                project.attachGraph(this._graphCtx);
                if (updateGraph)
                    project.updateGraph();
                return project;
            };
            /****************************************/
            StudioPage.prototype.getState = function () {
                var result = { version: 2 };
                result.graphState = this._graphCtx.calculator.getState();
                result.vars = this._graphCtx.vars;
                result.projects = this.projects.select(function (a) { return a.getState(); }).toArray();
                return result;
            };
            /****************************************/
            StudioPage.prototype.setState = function (value) {
                var _this = this;
                if (!value)
                    return;
                if (value.graphState) {
                    value.graphState.expressions.list = [];
                    this._graphCtx.calculator.setState(value.graphState);
                }
                if (value.projects != undefined) {
                    this.projects.toArray().forEach(function (a) { return a.remove(); });
                    value.projects.forEach(function (a) {
                        var proj = _this.addProject(null, false);
                        proj.setState(a);
                    });
                }
            };
            /****************************************/
            StudioPage.prototype.loadState = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var result, json;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!this._projectId) return [3 /*break*/, 2];
                                return [4 /*yield*/, GeoPlot.Api.loadState(this._projectId)];
                            case 1:
                                result = _a.sent();
                                this.setState(result);
                                return [3 /*break*/, 3];
                            case 2:
                                json = localStorage.getItem("studio");
                                if (json)
                                    this.setState(JSON.parse(json));
                                _a.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                });
            };
            /****************************************/
            StudioPage.prototype.saveState = function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!this._projectId) return [3 /*break*/, 2];
                                return [4 /*yield*/, GeoPlot.Api.saveState(this._projectId, this.getState())];
                            case 1:
                                _a.sent();
                                M.toast({ html: $string("$(msg-saved)") });
                                return [3 /*break*/, 3];
                            case 2:
                                localStorage.setItem("studio", JSON.stringify(this.getState()));
                                M.toast({ html: $string("$(msg-saved-device)") });
                                _a.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                });
            };
            /****************************************/
            StudioPage.prototype.demo = function () {
                var proj = this.addProject({ name: "Project 1" });
                this.addProject({ name: "Project 2" });
                this.addProject({ name: "Project 3" });
                proj.addSerie({
                    name: "Serie 1"
                });
            };
            /****************************************/
            StudioPage.prototype.onKeyDown = function (ev) {
                if (ev.keyCode == 46 && ev.target.tagName != "INPUT") {
                    ev.preventDefault();
                    this.removeSelected();
                }
            };
            /****************************************/
            StudioPage.prototype.onPaste = function (data) {
                var project = this.getSelectedProject();
                if (!project && !this.projects.any())
                    project = this.newProject();
                if (project) {
                    var text = data.getData("text/plain").toString();
                    if (text) {
                        var serie = StudioSerie.fromText(text);
                        if (serie) {
                            project.addSerie(serie);
                            project.node.isExpanded(true);
                            serie.node.isExpanded(true);
                            serie.zoom();
                            var reg = serie.addRegression(null, false);
                            reg.updateGraph();
                            reg.node.isSelected(true);
                            return true;
                        }
                    }
                }
                else
                    M.toast({ html: $string("$(msg-select-project)") });
            };
            Object.defineProperty(StudioPage.prototype, "projects", {
                /****************************************/
                get: function () {
                    function items() {
                        var _a, _b, node, e_24_1;
                        var e_24, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _d.trys.push([0, 5, 6, 7]);
                                    _a = __values(this.items.root().nodes()), _b = _a.next();
                                    _d.label = 1;
                                case 1:
                                    if (!!_b.done) return [3 /*break*/, 4];
                                    node = _b.value;
                                    return [4 /*yield*/, node.value()];
                                case 2:
                                    _d.sent();
                                    _d.label = 3;
                                case 3:
                                    _b = _a.next();
                                    return [3 /*break*/, 1];
                                case 4: return [3 /*break*/, 7];
                                case 5:
                                    e_24_1 = _d.sent();
                                    e_24 = { error: e_24_1 };
                                    return [3 /*break*/, 7];
                                case 6:
                                    try {
                                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                                    }
                                    finally { if (e_24) throw e_24.error; }
                                    return [7 /*endfinally*/];
                                case 7: return [2 /*return*/];
                            }
                        });
                    }
                    return WebApp.linq(items.apply(this));
                },
                enumerable: true,
                configurable: true
            });
            /****************************************/
            StudioPage.prototype.init = function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        this.loadState();
                        return [2 /*return*/];
                    });
                });
            };
            /****************************************/
            StudioPage.prototype.test = function () {
                return __awaiter(this, void 0, void 0, function () {
                    var adapter, text;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                adapter = new GeoPlot.TextTableDataAdapter({});
                                return [4 /*yield*/, WebApp.Http.getStringAsync("https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-regioni/dpc-covid19-ita-regioni.csv")];
                            case 1:
                                text = _a.sent();
                                adapter.parse(text);
                                return [2 /*return*/];
                        }
                    });
                });
            };
            return StudioPage;
        }());
        GeoPlot.StudioPage = StudioPage;
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
})(WebApp || (WebApp = {}));
//# sourceMappingURL=app.js.map