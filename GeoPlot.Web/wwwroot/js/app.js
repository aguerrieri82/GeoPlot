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
var WebApp;
(function (WebApp) {
    var GeoPlotApplication = /** @class */ (function () {
        function GeoPlotApplication() {
        }
        /****************************************/
        GeoPlotApplication.prototype.initServices = function () {
            WebApp.Services.httpClient = new WebApp.XHRHttpClient();
        };
        return GeoPlotApplication;
    }());
    /****************************************/
    WebApp.app = (new GeoPlotApplication());
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
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
    WebApp.Geo = Geo;
})(WebApp || (WebApp = {}));
var itNumberFormat = new Intl.NumberFormat("it-IT", {});
function formatNumber(value) {
    if (!value)
        return "";
    return itNumberFormat.format(value);
}
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
    WebApp.ConstIndicatorFunction = ConstIndicatorFunction;
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
    WebApp.SimpleIndicatorFunction = SimpleIndicatorFunction;
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
    WebApp.SimpleFactorFunction = SimpleFactorFunction;
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
    WebApp.DoubleFactorFunction = DoubleFactorFunction;
    var IndicatorCalculator = /** @class */ (function () {
        function IndicatorCalculator(data, dataSet, geo) {
            this._data = data;
            this._dataSet = dataSet;
            this._geo = geo;
        }
        /****************************************/
        IndicatorCalculator.prototype.getFactorValue = function (options) {
            var e_1, _a;
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
                        for (var exAreaId in options.execludedAreas) {
                            curExMain.push(dataAtDay(dayNumber, exAreaId.toLowerCase()));
                            if (options.isDayDelta)
                                curExDelta.push(dataAtDay(dayNumber - 1, exAreaId.toLowerCase()));
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
                for (var exAreaId in options.execludedAreas) {
                    exMain.push(dataAtDay(options.dayNumber, exAreaId.toLowerCase()));
                    if (options.isDayDelta)
                        exDelta.push(dataAtDay(options.dayNumber - 1, exAreaId.toLowerCase()));
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
                                dayNumberOrGroup: group,
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
    WebApp.IndicatorCalculator = IndicatorCalculator;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    var AggregationFunc;
    (function (AggregationFunc) {
        AggregationFunc[AggregationFunc["SUm"] = 0] = "SUm";
        AggregationFunc[AggregationFunc["Avg"] = 1] = "Avg";
    })(AggregationFunc = WebApp.AggregationFunc || (WebApp.AggregationFunc = {}));
    var GeoAreaType;
    (function (GeoAreaType) {
        GeoAreaType[GeoAreaType["Country"] = 0] = "Country";
        GeoAreaType[GeoAreaType["State"] = 1] = "State";
        GeoAreaType[GeoAreaType["Region"] = 2] = "Region";
        GeoAreaType[GeoAreaType["District"] = 3] = "District";
    })(GeoAreaType = WebApp.GeoAreaType || (WebApp.GeoAreaType = {}));
})(WebApp || (WebApp = {}));
/// <reference path="../indicators.ts" />
var WebApp;
(function (WebApp) {
    /****************************************/
    WebApp.InfectionDataSet = {
        name: "COVID-19",
        indicators: [
            {
                id: "totalPositive",
                name: "Positivi Totali",
                colorLight: "#f44336",
                colorDark: "#b71c1c",
                compute: new WebApp.SimpleIndicatorFunction(function (a) { return a.totalPositive; })
            },
            {
                id: "currentPositive",
                name: "Attuali Positivi",
                validFor: ["region", "country"],
                colorLight: "#e91e63",
                colorDark: "#880e4f",
                compute: new WebApp.SimpleIndicatorFunction(function (a) { return a.currentPositive; })
            },
            {
                id: "totalDeath",
                name: "Deceduti",
                validFor: ["region", "country"],
                colorLight: "#9c27b0",
                colorDark: "#4a148c",
                compute: new WebApp.SimpleIndicatorFunction(function (a) { return a.totalDeath; })
            },
            {
                id: "totalSevere",
                name: "Gravi",
                validFor: ["region", "country"],
                colorLight: "#ff9800",
                colorDark: "#e65100",
                compute: new WebApp.SimpleIndicatorFunction(function (a) { return a.totalSevere; })
            },
            {
                id: "totalHospedalized",
                name: "Ricoverati",
                validFor: ["region", "country"],
                colorLight: "#fdd835",
                colorDark: "#fbc02d",
                compute: new WebApp.SimpleIndicatorFunction(function (a) { return a.totalHospedalized; })
            },
            {
                id: "totalHealed",
                name: "Guariti",
                validFor: ["region", "country"],
                colorLight: "#4caf50",
                colorDark: "#1b5e20",
                compute: new WebApp.SimpleIndicatorFunction(function (a) { return a.totalHealed; })
            },
            {
                id: "toatlTests",
                name: "Tamponi",
                validFor: ["region", "country"],
                colorLight: "#03a9f4",
                colorDark: "#01579b",
                compute: new WebApp.SimpleIndicatorFunction(function (a) { return a.toatlTests; })
            },
            {
                id: "surface",
                name: "Superfice (Geo)",
                validFor: ["region", "district"],
                colorLight: "#777",
                colorDark: "#222",
                compute: new WebApp.ConstIndicatorFunction(function (v, a) { return WebApp.MathUtils.round(a.surface, 0); })
            },
            {
                id: "density",
                name: "Densita (Geo)",
                validFor: ["region", "district"],
                colorLight: "#777",
                colorDark: "#222",
                compute: new WebApp.ConstIndicatorFunction(function (v, a) { return WebApp.MathUtils.round(a.demography.total / a.surface, 0); })
            },
            {
                id: "population",
                name: "Popolazione (Geo)",
                validFor: ["region", "district"],
                colorLight: "#777",
                colorDark: "#222",
                compute: new WebApp.ConstIndicatorFunction(function (v, a) { return a.demography.total; })
            },
            {
                id: "populationOld",
                name: "Popolazione +65 (Geo)",
                validFor: ["region", "district"],
                colorLight: "#777",
                colorDark: "#222",
                compute: new WebApp.ConstIndicatorFunction(function (v, a) { return a.demography.over65; })
            },
        ],
        factors: [
            {
                id: "none",
                name: "Nessuno",
                compute: new WebApp.SimpleFactorFunction(function (i, v, a) { return i; }),
                format: function (a) { return formatNumber(a); },
                reference: function (v, a) { return "N/A"; },
                description: "[indicator]"
            },
            {
                id: "population",
                name: "Popolazione",
                compute: new WebApp.SimpleFactorFunction(function (i, v, a) { return (i / a.demography.total) * 100000; }),
                format: function (a) { return formatNumber(a); },
                reference: function (v, a) { return formatNumber(a.demography.total); },
                description: "[indicator] ogni 100.000 abitanti"
            },
            {
                id: "population",
                name: "Popolazione +65",
                compute: new WebApp.SimpleFactorFunction(function (i, v, a) { return (i / a.demography.over65) * 100000; }),
                format: function (a) { return formatNumber(WebApp.MathUtils.round(a, 1)); },
                reference: function (v, a) { return formatNumber(a.demography.over65); },
                description: "[indicator] ogni 100.000 abitanti +65"
            },
            {
                id: "density",
                name: "Densità",
                compute: new WebApp.SimpleFactorFunction(function (i, v, a) { return (i / (a.demography.total / a.surface)) * 100000; }),
                format: function (a) { return formatNumber(WebApp.MathUtils.round(a, 1)); },
                reference: function (v, a) { return formatNumber(WebApp.MathUtils.round(a.demography.total / a.surface, 1)); },
                description: "[indicator] rispetto densità territorio"
            },
            {
                id: "totalPositive",
                name: "Positivi Totali",
                validFor: ["region", "country"],
                compute: new WebApp.DoubleFactorFunction(function (i, f) { return !i ? 0 : (i / f) * 100; }, new WebApp.SimpleIndicatorFunction(function (v) { return v.totalPositive; })),
                format: function (a) { return WebApp.MathUtils.round(a, 1) + "%"; },
                reference: function (v, a) { return !v.totalPositive ? "N/A" : formatNumber(v.totalPositive); },
                description: "% [indicator] su positivi totali"
            },
            {
                id: "severe",
                name: "Gravi",
                validFor: ["region", "country"],
                compute: new WebApp.DoubleFactorFunction(function (i, f) { return !i ? 0 : (i / f) * 100; }, new WebApp.SimpleIndicatorFunction(function (v) { return v.totalSevere; })),
                format: function (a) { return WebApp.MathUtils.round(a, 1) + "%"; },
                reference: function (v, a) { return !v.totalSevere ? "N/A" : formatNumber(v.totalSevere); },
                description: "% [indicator] sui gravi totali"
            },
            {
                id: "test",
                name: "Tamponi",
                validFor: ["region", "country"],
                compute: new WebApp.DoubleFactorFunction(function (i, f) { return !i ? 0 : (i / f) * 100; }, new WebApp.SimpleIndicatorFunction(function (v) { return v.toatlTests; })),
                format: function (a) { return WebApp.MathUtils.round(a, 1) + "%"; },
                reference: function (v, a) { return !v.toatlTests ? "N/A" : formatNumber(v.toatlTests); },
                description: "% [indicator] sui tamponi eseguiti"
            }
        ]
    };
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    WebApp.ViewModes = {
        "district": {
            label: {
                singular: "provincia",
                plural: "province"
            },
            mapGroup: "group_district",
            tab: "districtTab",
            areaType: WebApp.GeoAreaType.District,
            validateId: function (id) { return id[0].toLowerCase() == 'd'; }
        },
        "region": {
            label: {
                singular: "regione",
                plural: "regioni"
            },
            mapGroup: "group_region",
            tab: "regionTab",
            areaType: WebApp.GeoAreaType.Region,
            validateId: function (id) { return id[0].toLowerCase() == 'r'; }
        },
        "country": {
            label: {
                singular: "italiana",
                plural: "italiane"
            },
            mapGroup: "group_country",
            tab: "italyTab",
            areaType: WebApp.GeoAreaType.Country,
            validateId: function (id) { return id.toLowerCase() == 'it'; }
        }
    };
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
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
        TipViewModel.prototype.executeAction = function () {
            var _this = this;
            if (this.value.showAction)
                this.value.showAction();
            setTimeout(function () { return _this.startPulse(); });
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
    /****************************************/
    var GeoPlotPage = /** @class */ (function () {
        function GeoPlotPage(model) {
            var _this = this;
            this._topAreasVisible = false;
            this._execludedArea = new Map();
            this._dataSet = WebApp.InfectionDataSet;
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
                    html: "Puo cambiare da scala logaritmica a scala lineare.",
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
            this.tip = ko.observable();
            this.factorDescription = ko.observable();
            this._data = model.data;
            this._geo = model.geo;
            this._debugMode = model.debugMode;
            this._calculator = new WebApp.IndicatorCalculator(this._data, this._dataSet, this._geo);
            this.totalDays(this._data.days.length - 1);
            this.dayNumber.subscribe(function (value) {
                if (value != _this._data.days.length - 1)
                    _this._preferences.actions.dayChanged++;
                _this.updateDayData();
                _this._specialDates.current.date = new Date(_this._data.days[value].date);
                _this.updateChart();
            });
            this._mapSvg = document.getElementsByTagName("svg").item(0);
            this._mapSvg.addEventListener("click", function (e) { return _this.onMapClick(e); });
            this.days = [];
            for (var i = 0; i < this._data.days.length; i++)
                this.days.push({ number: i, value: new Date(this._data.days[i].date), text: WebApp.DateUtils.format(this._data.days[i].date, "{DD}/{MM}") });
            M.Tooltip.init(document.querySelectorAll(".tooltipped"));
            M.Sidenav.init(document.getElementById("mobile-menu"));
            var areaTabs = M.Tabs.init(document.getElementById("areaTabs"));
            areaTabs.options.onShow = function (el) {
                _this.setViewMode(el.dataset["viewMode"]);
            };
            var topCasesView = M.Collapsible.init(document.getElementById("topCases"));
            topCasesView.options.onOpenStart = function () {
                if (!_this._daysData)
                    _this.updateTopAreas();
                _this._topAreasVisible = true;
                _this._preferences.actions.topAreasOpened++;
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
                    _this._preferences.actions.indicatorChanged++;
            });
            this.selectedFactor.subscribe(function (value) {
                if (!value)
                    return;
                _this.updateIndicator();
                if (value.id != "none")
                    _this._preferences.actions.factorChanged++;
                setTimeout(function () { return M.FormSelect.init(document.querySelectorAll(".row-chart-group select")); });
            });
            this.autoMaxFactor.subscribe(function (value) {
                if (value) {
                    _this.updateMaxFactor();
                    _this.updateMap();
                }
                _this.updateUrl();
            });
            this.maxFactor.subscribe(function () {
                if (!_this.autoMaxFactor()) {
                    _this.updateMap();
                    _this._preferences.actions.maxFactorChanged++;
                }
                _this.updateUrl();
            });
            this.isDayDelta.subscribe(function (value) {
                _this.computeStartDayForGroup();
                _this.updateIndicator();
                if (value)
                    _this._preferences.actions.deltaSelected++;
            });
            this.isLogScale.subscribe(function (value) {
                _this.updateChart();
                _this.updateUrl();
                if (value)
                    _this._preferences.actions.scaleChanged++;
            });
            this.isZoomChart.subscribe(function (value) {
                _this.updateChart();
            });
            this.groupSize.subscribe(function (value) {
                _this.computeStartDayForGroup();
                _this.updateChart();
                _this.updateUrl();
                if (value > 1)
                    _this._preferences.actions.groupChanged++;
            });
            this.startDay.subscribe(function (value) {
                _this.updateChart();
                _this.updateUrl();
            });
            var urlParams = new URLSearchParams(window.location.search);
            var stateRaw = urlParams.get("state");
            this._keepState = urlParams.get("keepState") == "true";
            this.loadPreferences();
            this.engageUser();
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
        GeoPlotPage.prototype.engageUser = function () {
            var _this = this;
            if (this._preferences.showTips != undefined && !this._preferences.showTips)
                return;
            var nextTip = WebApp.linq(this._tips).where(function (a) { return a.value.showAfter > 0 && _this._preferences.actions[a.key] == 0; }).first();
            if (!this.showTip(nextTip.key, {
                onClose: function () { return _this.engageUser(); },
                timeout: nextTip.value.showAfter,
            })) {
                this.engageUser();
            }
        };
        /****************************************/
        GeoPlotPage.prototype.showTip = function (tipId, options) {
            var _this = this;
            if (this._preferences.showTips != undefined && !this._preferences.showTips)
                return false;
            if ((!options || !options.override) && this.tip() && this.tip().isVisible())
                return false;
            if ((!options || !options.force) && this._preferences.actions[tipId])
                return false;
            var tip = this._tips[tipId];
            var model = new TipViewModel(tip);
            model.dontShowAgain = function () {
                _this._preferences.showTips = false;
                _this.savePreferences();
                model.close();
            };
            model.understood = function () {
                _this._preferences.actions[tipId]++;
                _this.savePreferences();
                model.close();
            };
            model.onClose = function () {
                //this.tip(null);
                if (options && options.onClose)
                    options.onClose();
            };
            var nextTip = WebApp.linq(this._tips).where(function (a) { return a.value.order > tip.order && _this._preferences.actions[a.key] == 0; }).first();
            if (nextTip) {
                model.next = function () {
                    model.close();
                    _this._preferences.actions[tipId]++;
                    _this.showTip(nextTip.key);
                };
            }
            else
                model.next = null;
            this.tip(model);
            setTimeout(function () { return model.show(); }, options && options.timeout ? options.timeout * 1000 : 0);
            return true;
        };
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
            var e_2, _a;
            if (!state.view)
                state.view = "region";
            var viewTabs = M.Tabs.getInstance(document.getElementById("areaTabs"));
            viewTabs.select(WebApp.ViewModes[state.view].tab);
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
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_2) throw e_2.error; }
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
                                            M.toast({ html: "Mappa copiata negli appunti." });
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
                        M.toast({ html: "Funzionalità non supportata, download in corso." });
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
                            M.toast({ html: "Grafico copiato negli appunti." });
                            return [3 /*break*/, 3];
                        case 2:
                            url = window.URL.createObjectURL(blob);
                            element = document.createElement("a");
                            element.href = url;
                            element.target = "_blan";
                            element.download = this._chart.options.title.text + ".png";
                            element.click();
                            M.toast({ html: "Funzionalità non supportata, download in corso." });
                            _b.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            this._preferences.actions.chartActionExecuted++;
        };
        /****************************************/
        GeoPlotPage.prototype.copySerie = function () {
            return __awaiter(this, void 0, void 0, function () {
                var data, text, i;
                return __generator(this, function (_a) {
                    data = this._chart.data.datasets[0].data;
                    text = "";
                    for (i = 0; i < data.length; i++)
                        text += WebApp.DateUtils.format(data[i].x, "{YYYY}-{MM}-{DD}") + "\t" + i + "\t" + WebApp.MathUtils.round(data[i].y, 1) + "\n";
                    WebApp.DomUtils.copyText(text);
                    M.toast({ html: "Serie copiata sugli appunti." });
                    this._preferences.actions.chartActionExecuted++;
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
                    M.toast({ html: "Serie copiata sugli appunti." });
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
                this._preferences.actions.viewChanged++;
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
                this.showTip("regionExcluded", { timeout: 5 });
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
                    M.toast({ html: "Regione " + area.name + " esclusa dai conteggi." });
                }
                this.updateIndicator();
            }
            else {
                if (item.parentElement.classList.contains(this.viewMode()))
                    this.selectedArea = area;
            }
            this._preferences.actions.areaSelected++;
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
            var e_3, _a, e_4, _b;
            var _this = this;
            if (!this.currentArea())
                return;
            if (!this.currentArea().indicators()) {
                var items = [];
                var _loop_1 = function (indicator) {
                    var item = new IndicatorViewModel();
                    item.indicator = indicator;
                    item.select = function () {
                        _this._preferences.actions.indicatorSelected++;
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
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                    }
                    finally { if (e_3) throw e_3.error; }
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
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_4) throw e_4.error; }
            }
        };
        /****************************************/
        GeoPlotPage.prototype.updateFactorDescription = function () {
            var e_5, _a;
            var desc = "";
            if (this.isDayDelta())
                desc = "Nuovi ";
            desc += this.selectedFactor().description.replace("[indicator]", this.selectedIndicator().name);
            if (this.currentArea())
                desc += " - " + this.currentArea().value.name;
            if (this._execludedArea.size > 0) {
                desc += " - Escluso (";
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
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                desc += ")";
            }
            this.factorDescription(desc);
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
            var curView = WebApp.ViewModes[this.viewMode()];
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
                M.toast({ html: "Dati non disponibili" });
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
                var isInArea = WebApp.ViewModes[this_1.viewMode()].validateId;
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
            this.currentData(WebApp.DateUtils.format(day.date, "{DD}/{MM}/{YYYY}"));
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
                    element.style.fillOpacity = "1";
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
                        if (area.type != WebApp.ViewModes[this.viewMode()].areaType)
                            continue;
                        var factor = this.getFactorValue(this.dayNumber(), area);
                        if (factor == Number.POSITIVE_INFINITY)
                            factor = NaN;
                        factor = Math.min(1, factor / this.maxFactor());
                        if (isNaN(factor)) {
                            if (element.classList.contains("valid"))
                                element.classList.remove("valid");
                            element.style.fillOpacity = "1";
                            element.style.removeProperty("fill");
                        }
                        else {
                            if (!element.classList.contains("valid"))
                                element.classList.add("valid");
                            var value = WebApp.MathUtils.discretize(WebApp.MathUtils.exponential(factor), 20);
                            //element.style.fillOpacity = value.toString();
                            element.style.fill = gradient.valueAt(factor).toString();
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
    WebApp.GeoPlotPage = GeoPlotPage;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    /****************************************/
    /* Regression
    /****************************************/
    var GraphContext = /** @class */ (function () {
        function GraphContext() {
            this.vars = {};
        }
        GraphContext.prototype.setExpressions = function (values) {
            var e_6, _a, e_7, _b, e_8, _c, e_9, _d, e_10, _e;
            var state = this.calculator.getState();
            try {
                for (var values_1 = __values(values), values_1_1 = values_1.next(); !values_1_1.done; values_1_1 = values_1.next()) {
                    var value = values_1_1.value;
                    /*
                    if (value.type != "folder")
                        continue;*/
                    var curExp = WebApp.linq(state.expressions.list).first(function (a) { return a.id == value.id; });
                    if (!curExp)
                        state.expressions.list.push(value);
                    else {
                        try {
                            for (var _f = (e_7 = void 0, __values(Object.getOwnPropertyNames(value))), _g = _f.next(); !_g.done; _g = _f.next()) {
                                var prop = _g.value;
                                curExp[prop] = value[prop];
                            }
                        }
                        catch (e_7_1) { e_7 = { error: e_7_1 }; }
                        finally {
                            try {
                                if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                            }
                            finally { if (e_7) throw e_7.error; }
                        }
                    }
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (values_1_1 && !values_1_1.done && (_a = values_1.return)) _a.call(values_1);
                }
                finally { if (e_6) throw e_6.error; }
            }
            var groups = WebApp.linq(state.expressions.list).where(function (a) { return a.type != "folder"; }).groupBy(function (a) { return a.folderId ? a.folderId : ""; }).toDictionary(function (a) { return a.key; }, function (a) { return a.values.toArray(); });
            var newList = [];
            try {
                for (var _h = __values(WebApp.linq(state.expressions.list).where(function (a) { return a.type == "folder"; })), _j = _h.next(); !_j.done; _j = _h.next()) {
                    var folder = _j.value;
                    newList.push(folder);
                    var items_3 = groups[folder.id];
                    if (items_3)
                        try {
                            for (var items_1 = (e_9 = void 0, __values(items_3)), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
                                var item = items_1_1.value;
                                newList.push(item);
                            }
                        }
                        catch (e_9_1) { e_9 = { error: e_9_1 }; }
                        finally {
                            try {
                                if (items_1_1 && !items_1_1.done && (_d = items_1.return)) _d.call(items_1);
                            }
                            finally { if (e_9) throw e_9.error; }
                        }
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                }
                finally { if (e_8) throw e_8.error; }
            }
            var items = groups[""];
            if (items)
                try {
                    for (var items_2 = __values(items), items_2_1 = items_2.next(); !items_2_1.done; items_2_1 = items_2.next()) {
                        var item = items_2_1.value;
                        newList.push(item);
                    }
                }
                catch (e_10_1) { e_10 = { error: e_10_1 }; }
                finally {
                    try {
                        if (items_2_1 && !items_2_1.done && (_e = items_2.return)) _e.call(items_2);
                    }
                    finally { if (e_10) throw e_10.error; }
                }
            state.expressions.list = newList;
            this.calculator.setState(state);
            /*
            for (var value of values) {
                if (value.type == "folder")
                    continue;
                this.calculator.setExpression(value);
            }*/
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
            var e_11, _a;
            var exp = WebApp.linq(this.calculator.getExpressions()).where(function (a) { return a.id == value.id; }).first();
            if (exp) {
                try {
                    for (var _b = __values(Object.getOwnPropertyNames(value)), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var prop = _c.value;
                        exp[prop] = value[prop];
                    }
                }
                catch (e_11_1) { e_11 = { error: e_11_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_11) throw e_11.error; }
                }
                this.calculator.setExpression(exp);
            }
        };
        /****************************************/
        GraphContext.prototype.updateVariable = function (id, varName, value) {
            this.updateExpression({ id: id, latex: varName + "=" + value.toString() });
        };
        /****************************************/
        GraphContext.prototype.expressionZoomFit = function (id) {
            this.calculator.controller.dispatch({ type: "expression-zoom-fit", id: id });
        };
        /****************************************/
        GraphContext.prototype.setItemVisibile = function (id, value) {
            this.calculator.controller._setItemHidden(id, !value);
            this.calculator.updateSettings({});
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
        }
        return RegressionFunctionVarViewModel;
    }());
    /****************************************/
    var StudioSerieRegression = /** @class */ (function () {
        /****************************************/
        function StudioSerieRegression(config) {
            var _this = this;
            this._varsMap = {
                "fun": null,
                "sum": null,
                "n1": null,
                "n2": null,
                "value": null,
                "time": null
            };
            this.selectedFunction = ko.observable();
            this.name = ko.observable();
            this.time = ko.observable(0);
            this.itemType = "regression";
            this.icon = "show_chart";
            this.optionsTemplateName = "RegressionOptionsTemplate";
            this.actions = [];
            this.functions = [];
            this.addFunction({
                name: "Normale",
                type: "normal",
                value: "$y\\ \\sim $c\\cdot\\frac{ e^ {-\\frac{ \\left(\\ln\\ \\left($x - $a\\right) \\ -$u\\right)^ { 2}} { 2$o^ { 2} }}}{ \\left($x - $a\\right) \\sqrt{ 2\\pi } $o }",
                vars: [{
                        name: "a",
                        label: "Scostamento",
                        autoCompute: true
                    },
                    {
                        name: "c",
                        label: "Totale",
                        autoCompute: true
                    },
                    {
                        name: "o",
                        label: "Incremento",
                        autoCompute: true
                    },
                    {
                        name: "u",
                        label: "Picco",
                        autoCompute: true
                    }]
            });
            this.selectedFunction.subscribe(function (a) {
                if (!_this.name() && a)
                    return _this.name(a.value.name);
            });
            this.selectedFunction(this.functions[0]);
            if (config)
                this.setState(config);
        }
        /****************************************/
        StudioSerieRegression.prototype.addFunction = function (value) {
            var model = new RegressionFunctionViewModel();
            model.value = value;
            model.select = function () {
            };
            this.functions.push(model);
            return model;
        };
        /****************************************/
        StudioSerieRegression.prototype.getGraphId = function (section) {
            return this.folderId + "/" + section;
        };
        /****************************************/
        StudioSerieRegression.prototype.setState = function (state) {
            if (state.name)
                this.name(state.name);
            if (state.visible != undefined)
                this.node.isVisible(state.visible);
            if (state.folderId)
                this.folderId = state.folderId;
            this.updateGraph();
        };
        /****************************************/
        StudioSerieRegression.prototype.getState = function () {
            return {
                name: this.name(),
                visible: this.node.isVisible(),
                folderId: this.folderId
            };
        };
        /****************************************/
        StudioSerieRegression.prototype.remove = function () {
            if (this._graphCtx) {
                this._graphCtx.calculator.removeExpression({ id: this.getGraphId("private") });
                this._graphCtx.calculator.removeExpression({ id: this.getGraphId("public") });
            }
            this.node.remove();
        };
        /****************************************/
        StudioSerieRegression.prototype.attachNode = function (node) {
            var _this = this;
            this.node = node;
            this.node.isVisible.subscribe(function (value) { return _this.updateGraphVisibility(); });
        };
        /****************************************/
        StudioSerieRegression.prototype.attachGraph = function (ctx) {
            this._graphCtx = ctx;
        };
        /****************************************/
        StudioSerieRegression.prototype.updateGraphVisibility = function () {
            var isVisible = this.node.isVisible() && this.serie.node.isVisible() && this.serie.project.node.isVisible();
            this._graphCtx.setItemVisibile(this.getGraphId("public"), isVisible);
            this._graphCtx.setItemVisibile(this.getGraphId("private"), isVisible);
        };
        /****************************************/
        StudioSerieRegression.prototype.updateGraph = function () {
            var e_12, _a;
            if (!this._graphCtx)
                return;
            if (!this.folderId)
                this.folderId = WebApp.StringUtils.uuidv4();
            var values = [];
            values.push({
                type: "folder",
                id: this.getGraphId("public"),
                title: this.serie.name() + " - " + this.name(),
            });
            values.push({
                type: "folder",
                id: this.getGraphId("private"),
                secret: true,
                title: this.serie.name() + " - " + this.name(),
            });
            var func = this.selectedFunction().value;
            this._varsMap["x"] = this.serie.getVar("xofs");
            this._varsMap["y"] = this.serie.getVar("y");
            this._varsMap["time"] = this.serie.project.getVar("time");
            try {
                for (var _b = __values(func.vars), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var item = _c.value;
                    if (!this._varsMap[item.name])
                        this._varsMap[item.name] = null;
                }
            }
            catch (e_12_1) { e_12 = { error: e_12_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_12) throw e_12.error; }
            }
            this._graphCtx.generateVars(this._varsMap);
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
                latex: this.replaceVars(func.value.replace("$y\\ \\sim ", "$fun\\left(x\\right)=").replace(/\$x/g, "x")),
                color: this.serie.color(),
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
                color: this.serie.color(),
                lines: true,
                points: false,
                lineStyle: Desmos.Styles.POINT
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
                latex: this.replaceVars("\\left($time,$value\\right)"),
                color: this.serie.color(),
                label: this.serie.name(),
                dragMode: "XY",
                showLabel: true
            });
            this._graphCtx.setExpressions(values);
            this.updateGraphVisibility();
        };
        /****************************************/
        StudioSerieRegression.prototype.replaceVars = function (value) {
            for (var item in this._varsMap) {
                var reg = new RegExp("\\$" + item, "g");
                value = value.replace(reg, this._varsMap[item]);
            }
            return value;
        };
        Object.defineProperty(StudioSerieRegression.prototype, "serie", {
            /****************************************/
            get: function () {
                return this.node.parentNode.value();
            },
            enumerable: true,
            configurable: true
        });
        return StudioSerieRegression;
    }());
    /****************************************/
    var StudioSerie = /** @class */ (function () {
        /****************************************/
        function StudioSerie(config) {
            var _this = this;
            this._varsMap = {
                "x": null,
                "y": null,
                "ofs": null,
                "xofs": null,
            };
            /****************************************/
            this.name = ko.observable();
            this.color = ko.observable();
            this.offsetX = ko.observable(0);
            this.itemType = "serie";
            this.icon = "insert_chart";
            this.optionsTemplateName = "StudioOptionsTemplate";
            this.actions = [];
            if (config) {
                this.setState(config);
            }
            this.actions.push(WebApp.apply(new ActionViewModel(), function (action) {
                action.text = "Elimina";
                action.icon = "delete";
                action.execute = function () { return _this.remove(); };
            }));
            this.actions.push(WebApp.apply(new ActionViewModel(), function (action) {
                action.text = "Aggiorna";
                action.icon = "autorenew";
                action.execute = function () { return _this.updateSerie(); };
            }));
            this.actions.push(WebApp.apply(new ActionViewModel(), function (action) {
                action.text = "Regressione";
                action.icon = "add_box";
                action.execute = function () {
                    var reg = _this.addRegression();
                    _this.node.isExpanded(true);
                    reg.node.isSelected(true);
                };
            }));
        }
        /****************************************/
        StudioSerie.fromText = function (text) {
            try {
                var obj = JSON.parse(text);
                if (obj && obj.type == "serie")
                    return new StudioSerie({
                        name: obj.title,
                        values: obj.values,
                        source: obj.serie,
                        color: obj.color
                    });
            }
            catch (_a) {
            }
        };
        /****************************************/
        StudioSerie.prototype.getVar = function (name) {
            return this._varsMap[name];
        };
        /****************************************/
        StudioSerie.prototype.addRegression = function (configOrValue, updateGraph) {
            if (updateGraph === void 0) { updateGraph = true; }
            var reg = configOrValue instanceof StudioSerieRegression ? configOrValue : new StudioSerieRegression(configOrValue);
            var node = new TreeNodeViewModel(reg);
            this.node.addNode(node);
            reg.attachNode(node);
            reg.attachGraph(this._graphCtx);
            if (updateGraph)
                reg.updateGraph();
            return reg;
        };
        /****************************************/
        StudioSerie.prototype.setState = function (state) {
            var _this = this;
            if (state.name)
                this.name(state.name);
            if (state.color)
                this.color(state.color);
            if (state.offsetX != undefined)
                this.offsetX(state.offsetX);
            if (state.source)
                this.source = state.source;
            if (state.values != undefined)
                this.values = state.values;
            if (state.folderId != undefined)
                this.folderId = state.folderId;
            if (state.opened != undefined)
                this.node.isExpanded(state.opened);
            /*
            if (state.varsMap) {
                for (var key in state.varsMap)
                    this._varsMap[key] = state.varsMap[key];
            }*/
            if (state.visible != undefined)
                this.node.isVisible(state.visible);
            this.updateGraph();
            if (state.regressions != undefined) {
                this.regressions.foreach(function (a) { return a.remove(); });
                state.regressions.forEach(function (a) {
                    var reg = _this.addRegression(null, false);
                    reg.setState(a);
                });
            }
        };
        /****************************************/
        StudioSerie.prototype.getState = function () {
            return {
                color: this.color(),
                name: this.name(),
                offsetX: this.offsetX(),
                source: this.source,
                values: this.values,
                folderId: this.folderId,
                varsMap: this._varsMap,
                visible: this.node.isVisible(),
                opened: this.node.isExpanded(),
                regressions: this.regressions.select(function (a) { return a.getState(); }).toArray(),
            };
        };
        /****************************************/
        StudioSerie.prototype.updateSerie = function () {
            this.values = this._graphCtx.serieCalculator.getSerie(this.source);
            this._graphCtx.updateTable(this.getGraphId("table"), this.values);
        };
        /****************************************/
        StudioSerie.prototype.remove = function () {
            if (this._graphCtx) {
                this._graphCtx.calculator.removeExpression({ id: this.getGraphId("private") });
                this._graphCtx.calculator.removeExpression({ id: this.getGraphId("public") });
            }
            this.node.remove();
        };
        /****************************************/
        StudioSerie.prototype.attachNode = function (node) {
            var _this = this;
            this.node = node;
            this.node.isVisible.subscribe(function (value) { return _this.updateGraphVisibility(); });
            this.node.isSelected.subscribe(function (value) {
                if (value)
                    _this.onSelected();
            });
        };
        /****************************************/
        StudioSerie.prototype.attachGraph = function (ctx) {
            var _this = this;
            this._graphCtx = ctx;
            this._graphCtx.calculator.observe("expressionAnalysis", function () {
                var anal = _this._graphCtx.calculator.expressionAnalysis[_this.getGraphId("offset")];
                _this.offsetX(anal.evaluation.value);
            });
            this.color.subscribe(function (value) {
                _this._graphCtx.setColor(_this.getGraphId("offset-x-serie"), value);
            });
        };
        /****************************************/
        StudioSerie.prototype.onSelected = function () {
            this._graphCtx.expressionZoomFit(this.getGraphId("table"));
        };
        /****************************************/
        StudioSerie.prototype.getGraphId = function (section) {
            return this.folderId + "/" + section;
        };
        /****************************************/
        StudioSerie.prototype.updateGraphVisibility = function (recusrive) {
            if (recusrive === void 0) { recusrive = true; }
            var isVisible = this.node.isVisible() && this.project.node.isVisible();
            this._graphCtx.setItemVisibile(this.getGraphId("public"), isVisible);
            this._graphCtx.setItemVisibile(this.getGraphId("private"), isVisible);
            if (recusrive)
                this.regressions.foreach(function (a) { return a.updateGraphVisibility(); });
        };
        /****************************************/
        StudioSerie.prototype.updateGraph = function (recursive) {
            if (recursive === void 0) { recursive = false; }
            if (!this._graphCtx)
                return;
            if (!this.folderId)
                this.folderId = WebApp.StringUtils.uuidv4();
            if (!this.color())
                this.color("#0000ff");
            this._graphCtx.generateVars(this._varsMap);
            this._graphCtx.setExpressions([
                {
                    type: "folder",
                    id: this.getGraphId("public"),
                    title: this.project.name() + " - " + this.name(),
                }, {
                    type: "folder",
                    id: this.getGraphId("private"),
                    title: this.project.name() + " - " + this.name(),
                    secret: true
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
            ]);
            this._graphCtx.updateTable(this.getGraphId("table"), this.values);
            this.updateGraphVisibility();
        };
        Object.defineProperty(StudioSerie.prototype, "regressions", {
            /****************************************/
            get: function () {
                function items() {
                    var _a, _b, node, e_13_1;
                    var e_13, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _d.trys.push([0, 5, 6, 7]);
                                _a = __values(this.node.nodes()), _b = _a.next();
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
                                e_13_1 = _d.sent();
                                e_13 = { error: e_13_1 };
                                return [3 /*break*/, 7];
                            case 6:
                                try {
                                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                                }
                                finally { if (e_13) throw e_13.error; }
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
        Object.defineProperty(StudioSerie.prototype, "project", {
            /****************************************/
            get: function () {
                return this.node.parentNode.value();
            },
            enumerable: true,
            configurable: true
        });
        return StudioSerie;
    }());
    /****************************************/
    var StudioProject = /** @class */ (function () {
        function StudioProject(config) {
            var _this = this;
            this._varsMap = {
                "time": null
            };
            /****************************************/
            this.name = ko.observable();
            this.time = ko.observable(0);
            this.itemType = "project";
            this.icon = "folder";
            this.optionsTemplateName = "ProjectOptionsTemplate";
            this.actions = [];
            if (config)
                this.setState(config);
            this.actions.push(WebApp.apply(new ActionViewModel(), function (action) {
                action.text = "Elimina";
                action.icon = "delete";
                action.execute = function () { return _this.remove(); };
            }));
        }
        /****************************************/
        StudioProject.prototype.getVar = function (name) {
            return this._varsMap[name];
        };
        /****************************************/
        StudioProject.prototype.getGraphId = function (section) {
            return this.folderId + "/" + section;
        };
        /****************************************/
        StudioProject.prototype.setState = function (state) {
            var _this = this;
            if (state.name)
                this.name(state.name);
            if (state.visible != undefined)
                this.node.isVisible(state.visible);
            if (state.opened != undefined)
                this.node.isExpanded(state.opened);
            if (state.time != undefined)
                this.time(state.time);
            this.updateGraph(false);
            if (state.series != undefined) {
                this.series.foreach(function (a) { return a.remove(); });
                state.series.forEach(function (a) {
                    var serie = _this.addSerie(null, false);
                    serie.setState(a);
                });
            }
        };
        /****************************************/
        StudioProject.prototype.getState = function () {
            return {
                name: this.name(),
                series: this.series.select(function (a) { return a.getState(); }).toArray(),
                visible: this.node.isVisible(),
                opened: this.node.isExpanded(),
                time: this.time()
            };
        };
        /****************************************/
        StudioProject.prototype.remove = function () {
            if (this._graphCtx) {
                this._graphCtx.calculator.removeExpression({ id: this.getGraphId("public") });
            }
            this.series.foreach(function (a) { return a.remove(); });
            this.node.remove();
        };
        /****************************************/
        StudioProject.prototype.attachNode = function (node) {
            var _this = this;
            this.node = node;
            this.node.isVisible.subscribe(function (value) { return _this.series.foreach(function (a) { return a.updateGraphVisibility(); }); });
        };
        /****************************************/
        StudioProject.prototype.attachGraph = function (ctx) {
            var _this = this;
            this._graphCtx = ctx;
            this._graphCtx.calculator.observe("expressionAnalysis", function () {
                var item = _this._graphCtx.calculator.expressionAnalysis[_this.getGraphId("time")];
                _this.time(item.evaluation.value);
            });
            this.time.subscribe(function (value) {
                return _this._graphCtx.updateVariable(_this.getGraphId("time"), _this._varsMap["time"], _this.time());
            });
        };
        /****************************************/
        StudioProject.prototype.updateGraph = function (recursive) {
            if (recursive === void 0) { recursive = false; }
            if (!this._graphCtx)
                return;
            this._graphCtx.generateVars(this._varsMap);
            this._graphCtx.setExpressions([
                {
                    type: "folder",
                    id: this.getGraphId("public"),
                    title: this.name(),
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
            ]);
            if (recursive)
                this.series.foreach(function (a) { return a.updateGraph(recursive); });
        };
        /****************************************/
        StudioProject.prototype.addSerie = function (configOrSerie, updateGraph) {
            if (updateGraph === void 0) { updateGraph = true; }
            var serie = configOrSerie instanceof StudioSerie ? configOrSerie : new StudioSerie(configOrSerie);
            var node = new TreeNodeViewModel(serie);
            this.node.addNode(node);
            serie.attachNode(node);
            serie.attachGraph(this._graphCtx);
            if (updateGraph)
                serie.updateGraph();
            return serie;
        };
        Object.defineProperty(StudioProject.prototype, "series", {
            /****************************************/
            get: function () {
                function items() {
                    var _a, _b, node, e_14_1;
                    var e_14, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _d.trys.push([0, 5, 6, 7]);
                                _a = __values(this.node.nodes()), _b = _a.next();
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
                                e_14_1 = _d.sent();
                                e_14 = { error: e_14_1 };
                                return [3 /*break*/, 7];
                            case 6:
                                try {
                                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                                }
                                finally { if (e_14) throw e_14.error; }
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
        return StudioProject;
    }());
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
            /****************************************/
            this.nodes = ko.observableArray();
            this.value = ko.observable();
            this.isSelected = ko.observable(false);
            this.isVisible = ko.observable(true);
            this.isExpanded = ko.observable(false);
            this.actions = ko.observableArray();
            this.value(value);
            this.isSelected.subscribe(function (a) {
                if (a)
                    _this._treeView.select(_this);
            });
        }
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
            var e_15, _a;
            this._treeView = treeView;
            this._parentNode = parent;
            try {
                for (var _b = __values(this.nodes()), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var childNode = _c.value;
                    childNode.attach(treeView);
                }
            }
            catch (e_15_1) { e_15 = { error: e_15_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_15) throw e_15.error; }
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
    WebApp.TreeViewModel = TreeViewModel;
    /****************************************/
    var StudioPage = /** @class */ (function () {
        function StudioPage(model) {
            var _this = this;
            this._dataSet = WebApp.InfectionDataSet;
            /****************************************/
            this.items = new TreeViewModel();
            this._data = model.data;
            this._geo = model.geo;
            this._graphCtx = new GraphContext();
            this._graphCtx.serieCalculator = new WebApp.IndicatorCalculator(this._data, this._dataSet, this._geo);
            this._graphCtx.calculator = Desmos.GraphingCalculator(document.getElementById("calculator"), {
                //xAxisArrowMode: Desmos.AxisArrowModes.BOTH,
                pasteGraphLink: false,
                pasteTableData: false,
                //lockViewport: false,
                restrictedFunctions: true,
                //restrictGridToFirstQuadrant: true,
                //administerSecretFolders: true,
                authorIDE: true,
                advancedStyling: true
            });
            this.items.setRoot(new TreeNodeViewModel());
            //window.addEventListener("beforeunload", () => this.saveState());
            document.body.addEventListener("paste", function (ev) {
                ev.preventDefault();
                _this.onPaste(ev.clipboardData);
            });
            document.body.addEventListener("keydown", function (ev) {
                _this.onKeyDown(ev);
            });
            setTimeout(function () { return _this.init(); });
        }
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
                return value.project;
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
                //console.log(JSON.stringify(value.graphState, null, "  "));
                value.graphState.expressions.list = [];
                this._graphCtx.calculator.setState(value.graphState);
            }
            /*
            if (value.vars)
                this._graphCtx.vars = value.vars;*/
            if (value.projects != undefined) {
                this.projects.toArray().forEach(function (a) { return a.remove(); });
                value.projects.forEach(function (a) {
                    var proj = _this.addProject();
                    proj.setState(a);
                });
            }
        };
        /****************************************/
        StudioPage.prototype.loadState = function () {
            var json = localStorage.getItem("studio");
            if (json)
                this.setState(JSON.parse(json));
        };
        /****************************************/
        StudioPage.prototype.saveState = function () {
            localStorage.setItem("studio", JSON.stringify(this.getState()));
            M.toast({ html: "Studio salvato" });
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
                        serie.node.isSelected(true);
                    }
                }
            }
        };
        Object.defineProperty(StudioPage.prototype, "projects", {
            /****************************************/
            get: function () {
                function items() {
                    var _a, _b, node, e_16_1;
                    var e_16, _c;
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
                                e_16_1 = _d.sent();
                                e_16 = { error: e_16_1 };
                                return [3 /*break*/, 7];
                            case 6:
                                try {
                                    if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                                }
                                finally { if (e_16) throw e_16.error; }
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
            this.loadState();
            //this.demo();
        };
        return StudioPage;
    }());
    WebApp.StudioPage = StudioPage;
})(WebApp || (WebApp = {}));
//# sourceMappingURL=app.js.map