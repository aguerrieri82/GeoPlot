var GeoPlot;
(function (GeoPlot) {
    var Http = /** @class */ (function () {
        function Http() {
        }
        Http.getStringAsync = function (url) {
            return GeoPlot.Services.httpClient.requestAsync({
                url: url,
                method: "GET",
            });
        };
        /****************************************/
        Http.postStringAsync = function (url, data) {
            return GeoPlot.Services.httpClient.requestAsync({
                url: url,
                method: "POST",
                data: data,
            });
        };
        /****************************************/
        Http.getJsonAsync = function (url) {
            return GeoPlot.Services.httpClient.requestAsync({
                url: url,
                method: "GET",
                responseType: "application/json",
            });
        };
        /****************************************/
        Http.postJsonAsync = function (url, data) {
            return GeoPlot.Services.httpClient.requestAsync({
                url: url,
                method: "POST",
                responseType: "application/json",
                data: data,
            });
        };
        /****************************************/
        Http.postBinaryAsync = function (url, data, onProgress) {
            return GeoPlot.Services.httpClient.requestAsync({
                url: url,
                method: "POST",
                responseType: "application/json",
                dataType: "application/octet-stream",
                data: data,
                onProgress: onProgress
            });
        };
        return Http;
    }());
    GeoPlot.Http = Http;
    /****************************************/
    var XHRHttpClient = /** @class */ (function () {
        function XHRHttpClient() {
        }
        XHRHttpClient.prototype.requestAsync = function (config) {
            return new Promise(function (resolve, reject) {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function (ev) {
                    if (xmlhttp.readyState == XMLHttpRequest.DONE) {
                        if (xmlhttp.status == 200) {
                            var data_1 = xmlhttp.responseText;
                            var isJson = config.responseType == "application/json";
                            if (isJson)
                                data_1 = JSON.parse(data_1);
                            resolve(data_1);
                        }
                        else
                            reject(xmlhttp.status);
                    }
                };
                if (config.onProgress)
                    xmlhttp.upload.onprogress = config.onProgress;
                xmlhttp.open(config.method, GeoPlot.Uri.absolute(config.url), true);
                var contentType = config.dataType;
                var data = config.data;
                if (config.data) {
                    var isJson = contentType == "application/json" || typeof config.data == "object";
                    var isObj = contentType == "application/octet-stream";
                    if (isJson && !isObj) {
                        contentType = "application/json";
                        if (data && typeof config.data != "string")
                            data = JSON.stringify(data);
                    }
                }
                if (contentType)
                    xmlhttp.setRequestHeader("Content-type", contentType);
                if (config.headers) {
                    for (var header in config.headers)
                        xmlhttp.setRequestHeader(header, config.headers[header]);
                }
                xmlhttp.send(data);
            });
        };
        return XHRHttpClient;
    }());
    GeoPlot.XHRHttpClient = XHRHttpClient;
})(GeoPlot || (GeoPlot = {}));
var GeoPlot;
(function (GeoPlot) {
    var Services;
    (function (Services) {
    })(Services = GeoPlot.Services || (GeoPlot.Services = {}));
})(GeoPlot || (GeoPlot = {}));
/// <reference path="Framework/HttpClient.ts" />
/// <reference path="Framework/Services.ts" />
var GeoPlot;
(function (GeoPlot) {
    var Application = /** @class */ (function () {
        function Application() {
        }
        /****************************************/
        Application.prototype.initServices = function () {
            GeoPlot.Services.httpClient = new GeoPlot.XHRHttpClient();
        };
        return Application;
    }());
    /****************************************/
    GeoPlot.app = new Application();
})(GeoPlot || (GeoPlot = {}));
var GeoPlot;
(function (GeoPlot) {
    var GeoAreaType;
    (function (GeoAreaType) {
        GeoAreaType[GeoAreaType["Country"] = 0] = "Country";
        GeoAreaType[GeoAreaType["State"] = 1] = "State";
        GeoAreaType[GeoAreaType["Region"] = 2] = "Region";
        GeoAreaType[GeoAreaType["District"] = 3] = "District";
    })(GeoAreaType = GeoPlot.GeoAreaType || (GeoPlot.GeoAreaType = {}));
})(GeoPlot || (GeoPlot = {}));
var GeoPlot;
(function (GeoPlot) {
    var DateUtils = /** @class */ (function () {
        function DateUtils() {
        }
        /****************************************/
        DateUtils.parse = function (value) {
            if (value instanceof Date)
                return value;
            return new Date(value);
        };
        /****************************************/
        DateUtils.equalsDate = function (a, b) {
            return this.trucateTime(a).getTime() == this.trucateTime(b).getTime();
        };
        /****************************************/
        DateUtils.trucateTime = function (date) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        };
        /****************************************/
        DateUtils.addDays = function (date, value) {
            return this.add(date, GeoPlot.TimeSpan.fromDays(value));
        };
        /****************************************/
        DateUtils.add = function (date, value) {
            date = this.parse(date);
            return new Date(date.getTime() + value.ticks);
        };
        /****************************************/
        DateUtils.diff = function (date1, date2) {
            return new GeoPlot.TimeSpan(this.parse(date1).getTime() - this.parse(date2).getTime());
        };
        /****************************************/
        DateUtils.now = function () {
            return new Date();
        };
        /****************************************/
        DateUtils.today = function () {
            return this.truncateTime(this.now());
        };
        /****************************************/
        DateUtils.truncateTime = function (date) {
            date = this.parse(date);
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        };
        /****************************************/
        DateUtils.timeOfDay = function (date) {
            date = this.parse(date);
            return new GeoPlot.TimeSpan(date.getTime() - this.truncateTime(date).getTime());
        };
        /****************************************/
        DateUtils.format = function (date, format) {
            var _this = this;
            date = this.parse(date);
            return GeoPlot.Format.replaceArgs(format, function (arg) { return _this.formatArgument(date, arg); });
        };
        /****************************************/
        DateUtils.formatDate = function (date) {
            if (!date)
                return null;
            return this.format(date, "{YYYY}-{MM}-{DD}");
        };
        /****************************************/
        DateUtils.formatArgument = function (value, arg) {
            value = this.parse(value);
            switch (arg) {
                case "D":
                    return value.getDate().toString();
                case "DD":
                    return GeoPlot.StringUtils.padLeft(value.getDate().toString(), 2, "0");
                case "W":
                    return this.WEEK_DAYS[(value.getDay() + 6) % 7].substr(0, 3);
                case "WW":
                    return this.WEEK_DAYS[(value.getDay() + 6) % 7];
                case "M":
                    return value.getMonth().toString();
                case "MM":
                    return GeoPlot.StringUtils.padLeft((value.getMonth() + 1).toString(), 2, "0");
                case "MMM":
                    return this.MONTHS[value.getMonth()].substr(0, 3);
                case "MMMM":
                    return this.MONTHS[value.getMonth()];
                case "YYYY":
                    return value.getFullYear().toString();
                case "h":
                    return value.getHours().toString();
                case "hh":
                    return GeoPlot.StringUtils.padLeft(value.getHours().toString(), 2, "0");
                case "m":
                    return value.getMinutes().toString();
                case "mm":
                    return GeoPlot.StringUtils.padLeft(value.getMinutes().toString(), 2, "0");
                case "s":
                    return value.getSeconds().toString();
                case "ss":
                    return GeoPlot.StringUtils.padLeft(value.getSeconds().toString(), 2, "0");
                case "f":
                    return (value.getMilliseconds() / 100).toString();
                case "ff":
                    return (value.getMilliseconds() / 10).toString();
                case "fff":
                    return value.getMilliseconds().toString();
            }
            return arg;
        };
        DateUtils.WEEK_DAYS = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
        DateUtils.MONTHS = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
        return DateUtils;
    }());
    GeoPlot.DateUtils = DateUtils;
})(GeoPlot || (GeoPlot = {}));
var GeoPlot;
(function (GeoPlot) {
    var DomUtils = /** @class */ (function () {
        function DomUtils() {
        }
        DomUtils.isParentOrSelf = function (element, parent) {
            var curElement = element;
            while (curElement) {
                if (curElement == parent)
                    return true;
                curElement = curElement.parentElement;
            }
            return false;
        };
        /****************************************/
        DomUtils.removeClass = function (element, className) {
            if (element.classList.contains(className))
                element.classList.remove(className);
        };
        /****************************************/
        DomUtils.addClass = function (element, className) {
            if (!element.classList.contains(className))
                element.classList.add(className);
        };
        return DomUtils;
    }());
    GeoPlot.DomUtils = DomUtils;
})(GeoPlot || (GeoPlot = {}));
var GeoPlot;
(function (GeoPlot) {
    var Format;
    (function (Format) {
        function price(value) {
            return (Math.round(value * 100) / 100).toFixed(2);
        }
        Format.price = price;
        function replaceArgs(value, args) {
            if (!value)
                return;
            var map;
            if (typeof (args) != "function")
                map = function (key) { return args[key]; };
            else
                map = args;
            var state = 0;
            var result = "";
            var curName = "";
            for (var i = 0; i < value.length; i++) {
                var c = value[i];
                switch (state) {
                    case 0:
                        if (c == "{") {
                            curName = "";
                            state = 1;
                        }
                        else
                            result += c;
                        break;
                    case 1:
                        if (c == "}" || c == ":" || c == "=") {
                            state = 0;
                            if (args)
                                result += map(curName);
                            if (c == ":" || c == "=")
                                state = 2;
                            else
                                state = 0;
                        }
                        else if (c != "?")
                            curName += c;
                        break;
                    case 2:
                        if (c == "}")
                            state = 0;
                        break;
                }
            }
            return result;
        }
        Format.replaceArgs = replaceArgs;
        /****************************************/
        function replaceArgs2(value, args) {
            if (!value)
                return value;
            var map;
            if (typeof (args) != "function")
                map = function (key) { return args[key]; };
            else
                map = args;
            var result = "";
            var paramName = "";
            var state = 0;
            for (var i = 0; i < value.length; i++) {
                var c = value[i];
                switch (state) {
                    case 0:
                        if (c == '$')
                            state = 1;
                        else
                            result += c;
                        break;
                    case 1:
                        if (c == '(') {
                            state = 2;
                            paramName = "";
                        }
                        else {
                            result += "$" + c;
                            state = 0;
                        }
                        break;
                    case 2:
                        if (c == ')') {
                            var paramValue = map(paramName);
                            result += JSON.stringify(paramValue);
                            state = 0;
                        }
                        else
                            paramName += c;
                        break;
                }
            }
            return result;
        }
        Format.replaceArgs2 = replaceArgs2;
        /****************************************/
        function linkify(value) {
            if (!value)
                return "";
            var replacedText, replacePattern1, replacePattern2, replacePattern3;
            //URLs starting with http://, https://, or ftp://
            replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
            replacedText = value.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
            //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
            replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
            replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
            //Change email addresses to mailto:: links.
            replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
            replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
            return replacedText;
        }
        Format.linkify = linkify;
    })(Format = GeoPlot.Format || (GeoPlot.Format = {}));
})(GeoPlot || (GeoPlot = {}));
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
})(GeoPlot || (GeoPlot = {}));
function formatNumber(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
/****************************************/
function capitalizeFirst(value) {
    return value.substr(0, 1).toUpperCase() + value.substr(1);
}
var GeoPlot;
(function (GeoPlot) {
    /****************************************/
    var LinearGradient = /** @class */ (function () {
        function LinearGradient() {
            var values = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                values[_i] = arguments[_i];
            }
            if (values.length > 0) {
                if (typeof values[0] == "string")
                    this.colors = GeoPlot.linq(values).select(function (a) { return new RgbColor(a); }).toArray();
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
            c3.r = Math.round(c1.r + (c2.r - c1.r) * minOfs);
            c3.g = Math.round(c1.g + (c2.g - c1.g) * minOfs);
            c3.b = Math.round(c1.b + (c2.b - c1.b) * minOfs);
            return c3;
        };
        return LinearGradient;
    }());
    GeoPlot.LinearGradient = LinearGradient;
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
    GeoPlot.RgbColor = RgbColor;
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
    GeoPlot.Graphics = Graphics;
})(GeoPlot || (GeoPlot = {}));
var GeoPlot;
(function (GeoPlot) {
    /****************************************/
    var EmptyEnumerator = /** @class */ (function () {
        function EmptyEnumerator() {
        }
        Object.defineProperty(EmptyEnumerator.prototype, "current", {
            get: function () {
                return undefined;
            },
            enumerable: true,
            configurable: true
        });
        /****************************************/
        EmptyEnumerator.prototype.moveNext = function () {
            return false;
        };
        /****************************************/
        EmptyEnumerator.prototype.reset = function () {
        };
        /****************************************/
        EmptyEnumerator.prototype.count = function () {
            return 0;
        };
        return EmptyEnumerator;
    }());
    /****************************************/
    var DistinctEnumerator = /** @class */ (function () {
        /****************************************/
        function DistinctEnumerator(source, selector) {
            this._selector = selector;
            this._source = source;
            if (!this._selector)
                this._selector = function (a) { return a; };
            this.reset();
        }
        Object.defineProperty(DistinctEnumerator.prototype, "current", {
            /****************************************/
            get: function () {
                return this._current;
            },
            enumerable: true,
            configurable: true
        });
        /****************************************/
        DistinctEnumerator.prototype.moveNext = function () {
            while (this._source.moveNext()) {
                var item = this._selector(this._source.current);
                if (this._foundItems.indexOf(item) == -1) {
                    this._foundItems.push(item);
                    this._current = item;
                    return true;
                }
            }
            return false;
        };
        /****************************************/
        DistinctEnumerator.prototype.reset = function () {
            this._source.reset();
            this._foundItems = [];
            this._current = undefined;
        };
        return DistinctEnumerator;
    }());
    /****************************************/
    var DictionaryEnumerator = /** @class */ (function () {
        /****************************************/
        function DictionaryEnumerator(value) {
            this._keyList = Object.getOwnPropertyNames(value);
            this._value = value;
            this.reset();
        }
        Object.defineProperty(DictionaryEnumerator.prototype, "current", {
            /****************************************/
            get: function () {
                return {
                    key: this._keyList[this._curIndex],
                    value: this._value[this._keyList[this._curIndex]]
                };
            },
            enumerable: true,
            configurable: true
        });
        /****************************************/
        DictionaryEnumerator.prototype.moveNext = function () {
            this._curIndex++;
            return this._curIndex < this._keyList.length;
        };
        /****************************************/
        DictionaryEnumerator.prototype.reset = function () {
            this._curIndex = -1;
        };
        /****************************************/
        DictionaryEnumerator.prototype.first = function () {
            return {
                key: this._keyList[0],
                value: this._value[this._keyList[0]]
            };
        };
        /****************************************/
        DictionaryEnumerator.prototype.last = function () {
            return {
                key: this._keyList[this._keyList.length - 1],
                value: this._value[this._keyList[this._keyList.length - 1]]
            };
        };
        /****************************************/
        DictionaryEnumerator.prototype.count = function () {
            return this._keyList.length;
        };
        return DictionaryEnumerator;
    }());
    /****************************************/
    var ArrayEnumerator = /** @class */ (function () {
        /****************************************/
        function ArrayEnumerator(value) {
            this._value = value;
            this.reset();
        }
        Object.defineProperty(ArrayEnumerator.prototype, "current", {
            /****************************************/
            get: function () {
                return this._value[this._curIndex];
            },
            enumerable: true,
            configurable: true
        });
        /****************************************/
        ArrayEnumerator.prototype.toArray = function () {
            return this._value;
        };
        /****************************************/
        ArrayEnumerator.prototype.moveNext = function () {
            this._curIndex++;
            return this._curIndex < this._value.length;
        };
        /****************************************/
        ArrayEnumerator.prototype.reset = function () {
            this._curIndex = -1;
        };
        /****************************************/
        ArrayEnumerator.prototype.first = function () {
            return this._value[0];
        };
        /****************************************/
        ArrayEnumerator.prototype.last = function () {
            return this._value[this._value.length - 1];
        };
        /****************************************/
        ArrayEnumerator.prototype.count = function () {
            return this._value.length;
        };
        return ArrayEnumerator;
    }());
    /****************************************/
    var CollectionEnumerator = /** @class */ (function () {
        /****************************************/
        function CollectionEnumerator(value) {
            this._value = value;
            this.reset();
        }
        Object.defineProperty(CollectionEnumerator.prototype, "current", {
            /****************************************/
            get: function () {
                return this._value.item(this._curIndex);
            },
            enumerable: true,
            configurable: true
        });
        /****************************************/
        CollectionEnumerator.prototype.moveNext = function () {
            this._curIndex++;
            return this._curIndex < this._value.length;
        };
        /****************************************/
        CollectionEnumerator.prototype.reset = function () {
            this._curIndex = -1;
        };
        /****************************************/
        CollectionEnumerator.prototype.first = function () {
            return this._value.item(0);
        };
        /****************************************/
        CollectionEnumerator.prototype.last = function () {
            return this._value.item(this._value.length - 1);
        };
        /****************************************/
        CollectionEnumerator.prototype.count = function () {
            return this._value.length;
        };
        return CollectionEnumerator;
    }());
    /****************************************/
    var SelectEnumerator = /** @class */ (function () {
        /****************************************/
        function SelectEnumerator(source, selector) {
            this._selector = selector;
            this._source = source;
            this.reset();
        }
        Object.defineProperty(SelectEnumerator.prototype, "current", {
            /****************************************/
            get: function () {
                return this._selector(this._source.current);
            },
            enumerable: true,
            configurable: true
        });
        /****************************************/
        SelectEnumerator.prototype.moveNext = function () {
            return this._source.moveNext();
        };
        /****************************************/
        SelectEnumerator.prototype.reset = function () {
            this._source.reset();
        };
        return SelectEnumerator;
    }());
    /****************************************/
    var WhereEnumerator = /** @class */ (function () {
        /****************************************/
        function WhereEnumerator(source, condition) {
            this._condition = condition;
            this._source = source;
            this.reset();
        }
        Object.defineProperty(WhereEnumerator.prototype, "current", {
            /****************************************/
            get: function () {
                return this._source.current;
            },
            enumerable: true,
            configurable: true
        });
        /****************************************/
        WhereEnumerator.prototype.moveNext = function () {
            while (this._source.moveNext()) {
                if (this._condition(this._source.current))
                    return true;
            }
            return false;
        };
        /****************************************/
        WhereEnumerator.prototype.reset = function () {
            this._source.reset();
        };
        return WhereEnumerator;
    }());
    /****************************************/
    var SkipEnumerator = /** @class */ (function () {
        /****************************************/
        function SkipEnumerator(source, count) {
            this._count = count;
            this._source = source;
            this.reset();
        }
        Object.defineProperty(SkipEnumerator.prototype, "current", {
            /****************************************/
            get: function () {
                return this._source.current;
            },
            enumerable: true,
            configurable: true
        });
        /****************************************/
        SkipEnumerator.prototype.moveNext = function () {
            if (!this._skipped) {
                var elCount = 0;
                while (elCount < this._count) {
                    if (!this._source.moveNext())
                        return false;
                    elCount++;
                }
                this._skipped = true;
            }
            return this._source.moveNext();
        };
        /****************************************/
        SkipEnumerator.prototype.reset = function () {
            this._source.reset();
            this._skipped = false;
        };
        return SkipEnumerator;
    }());
    /****************************************/
    var TakeEnumerator = /** @class */ (function () {
        /****************************************/
        function TakeEnumerator(source, count) {
            this._count = count;
            this._source = source;
            this.reset();
        }
        Object.defineProperty(TakeEnumerator.prototype, "current", {
            /****************************************/
            get: function () {
                return this._source.current;
            },
            enumerable: true,
            configurable: true
        });
        /****************************************/
        TakeEnumerator.prototype.moveNext = function () {
            if (this._taken >= this._count)
                return false;
            if (!this._source.moveNext())
                return false;
            this._taken++;
            return true;
        };
        /****************************************/
        TakeEnumerator.prototype.reset = function () {
            this._source.reset();
            this._taken = 0;
        };
        return TakeEnumerator;
    }());
    /****************************************/
    var IteratorEnumerator = /** @class */ (function () {
        /****************************************/
        function IteratorEnumerator(source) {
            this._source = source;
        }
        Object.defineProperty(IteratorEnumerator.prototype, "current", {
            /****************************************/
            get: function () {
                return this._current;
            },
            enumerable: true,
            configurable: true
        });
        /****************************************/
        IteratorEnumerator.prototype.moveNext = function () {
            var result = this._source.next();
            if (result.done)
                return false;
            this._current = result.value;
            return true;
        };
        /****************************************/
        IteratorEnumerator.prototype.reset = function () {
        };
        return IteratorEnumerator;
    }());
    /****************************************/
    var Linq = /** @class */ (function () {
        /****************************************/
        function Linq(value) {
            this._enumerator = value;
        }
        /****************************************/
        Linq.prototype.select = function (selector) {
            return linq(new SelectEnumerator(this._enumerator, selector));
        };
        /****************************************/
        Linq.prototype.where = function (condition) {
            return linq(new WhereEnumerator(this._enumerator, condition));
        };
        /****************************************/
        Linq.prototype.first = function (condition) {
            if (condition)
                return this.where(condition).first();
            if (this._enumerator.first)
                return this._enumerator.first();
            this._enumerator.reset();
            if (this._enumerator.moveNext())
                return this._enumerator.current;
        };
        /****************************************/
        Linq.prototype.last = function () {
            if (this._enumerator.last)
                return this._enumerator.last();
            this._enumerator.reset();
            var lastItem;
            while (this._enumerator.moveNext())
                lastItem = this._enumerator.current;
            return lastItem;
        };
        /****************************************/
        Linq.prototype.sum = function (selector) {
            if (selector)
                return this.select(selector).sum();
            var result = 0;
            this.foreach(function (a) {
                result += parseFloat(a);
            });
            return result;
        };
        /****************************************/
        Linq.prototype.max = function (selector) {
            if (selector)
                return this.select(selector).max();
            var result = Number.NEGATIVE_INFINITY;
            this.foreach(function (a) {
                var number = parseFloat(a);
                if (number > result)
                    result = number;
            });
            return result;
        };
        /****************************************/
        Linq.prototype.avg = function (selector) {
            if (selector)
                return this.select(selector).avg();
            var result = 0;
            var count = 0;
            this.foreach(function (a) {
                result += parseFloat(a);
                count++;
            });
            if (count)
                return result / count;
            return NaN;
        };
        /****************************************/
        Linq.prototype.count = function (condition) {
            if (condition)
                return this.where(condition).count();
            if (this._enumerator.count)
                return this._enumerator.count();
            this._enumerator.reset();
            var count = 0;
            while (this._enumerator.moveNext())
                count++;
            return count;
        };
        /****************************************/
        Linq.prototype.concat = function (separator, selector) {
            var result = "";
            var index = 0;
            if (!selector)
                selector = function (a) { return a.toString(); };
            this.foreach(function (a) {
                if (index > 0)
                    result += separator;
                result += selector(a);
                index++;
            });
            return result;
        };
        /****************************************/
        Linq.prototype.orderBy = function (selector) {
            var result = this.toArray();
            result.sort(function (a, b) {
                var itemA = selector(a);
                var itemB = selector(b);
                return itemA - itemB;
            });
            return linq(result);
        };
        /****************************************/
        Linq.prototype.orderByDesc = function (selector) {
            var result = this.toArray();
            result.sort(function (a, b) {
                var itemA = selector(a);
                var itemB = selector(b);
                return itemB - itemA;
            });
            return linq(result);
        };
        /****************************************/
        Linq.prototype.distinct = function (selector) {
            return linq(new DistinctEnumerator(this._enumerator, selector));
        };
        Linq.prototype.groupBy = function (key) {
            var keys = {};
            var result = [];
            if (typeof key == "function") {
                var keySelector_1 = key;
                this.foreach(function (item) {
                    var itemKey = keySelector_1(item);
                    var groupItem = linq(result).first(function (a) { return a.key == itemKey; });
                    if (!groupItem) {
                        groupItem = {
                            key: itemKey,
                            values: linq(new ArrayEnumerator([]))
                        };
                        result.push(groupItem);
                    }
                    groupItem.values._enumerator.toArray().push(item);
                });
            }
            return linq(result);
        };
        /****************************************/
        Linq.prototype.indexOf = function (condition) {
            var index = 0;
            this._enumerator.reset();
            while (this._enumerator.moveNext()) {
                if (condition(this._enumerator.current))
                    return index;
                index++;
            }
        };
        /****************************************/
        Linq.prototype.foreach = function (action) {
            this._enumerator.reset();
            while (this._enumerator.moveNext())
                action(this._enumerator.current);
        };
        /****************************************/
        Linq.prototype.any = function (condition) {
            if (!condition)
                return this._enumerator.moveNext();
            return this.where(condition).any();
        };
        /****************************************/
        Linq.prototype.contains = function (item, comparer) {
            if (!comparer)
                comparer = function (a, b) { return a == b; };
            this._enumerator.reset();
            while (this._enumerator.moveNext())
                if (comparer(this._enumerator.current, item))
                    return true;
            return false;
        };
        /****************************************/
        Linq.prototype.all = function (condition) {
            return !this.where(function (a) { return !condition(a); }).any();
        };
        /****************************************/
        Linq.prototype.take = function (count) {
            return linq(new TakeEnumerator(this._enumerator, count));
        };
        /****************************************/
        Linq.prototype.skip = function (count) {
            return linq(new SkipEnumerator(this._enumerator, count));
        };
        /****************************************/
        Linq.prototype.replace = function (condition, newItem) {
            if (!(this._enumerator instanceof ArrayEnumerator))
                throw "Invalid enumerator, expected array";
            var items = this._enumerator.toArray();
            for (var i = 0; i < items.length; i++) {
                if (condition[items[i]])
                    items[i] == newItem;
            }
        };
        /****************************************/
        Linq.prototype.toArray = function () {
            if (this._enumerator.toArray)
                return this._enumerator.toArray();
            var result = [];
            this.foreach(function (a) { return result.push(a); });
            return result;
        };
        /****************************************/
        Linq.prototype.getEnumerator = function () {
            return this._enumerator;
        };
        return Linq;
    }());
    GeoPlot.Linq = Linq;
    function linq(value) {
        var enumerator;
        if (!value)
            enumerator = new EmptyEnumerator();
        else if (Array.isArray(value))
            enumerator = new ArrayEnumerator(value);
        else if ("getEnumerator" in value)
            enumerator = value.getEnumerator();
        else if ("item" in value)
            enumerator = new CollectionEnumerator(value);
        else if ("next" in value && typeof (value["next"]) == "function")
            enumerator = new IteratorEnumerator(value);
        else if ("current" in value && "reset" in value && "moveNext" in value)
            enumerator = value;
        else
            return new Linq(new DictionaryEnumerator(value));
        return new Linq(enumerator);
    }
    GeoPlot.linq = linq;
})(GeoPlot || (GeoPlot = {}));
var GeoPlot;
(function (GeoPlot) {
    var MathUtils = /** @class */ (function () {
        function MathUtils() {
        }
        MathUtils.discretize = function (value, steps) {
            return Math.round(value * steps) / steps;
        };
        /****************************************/
        MathUtils.round = function (value, digits) {
            return Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
        };
        /****************************************/
        MathUtils.exponential = function (value, weight) {
            if (weight === void 0) { weight = 2; }
            return 1 - Math.pow(1 - value, weight);
        };
        return MathUtils;
    }());
    GeoPlot.MathUtils = MathUtils;
})(GeoPlot || (GeoPlot = {}));
var GeoPlot;
(function (GeoPlot) {
    var StringUtils = /** @class */ (function () {
        function StringUtils() {
        }
        StringUtils.random = function (length) {
            var result = "";
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < length; i++)
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            return result;
        };
        /****************************************/
        StringUtils.repeat = function (value, count) {
            var result = "";
            for (var i = 0; i < count; i++)
                result += value;
            return result;
        };
        /****************************************/
        StringUtils.padLeft = function (value, count, char) {
            if (value == null)
                return;
            if (value.length >= count)
                return value;
            return this.repeat(char, count - value.length) + value;
        };
        /****************************************/
        StringUtils.padRight = function (value, count, char) {
            if (value == null)
                return;
            if (value.length >= count)
                return value;
            return value + this.repeat(char, count - value.length);
        };
        return StringUtils;
    }());
    GeoPlot.StringUtils = StringUtils;
})(GeoPlot || (GeoPlot = {}));
var GeoPlot;
(function (GeoPlot) {
    var TimeSpan = /** @class */ (function () {
        function TimeSpan(ticks) {
            if (ticks === void 0) { ticks = 0; }
            this.ticks = ticks;
        }
        Object.defineProperty(TimeSpan.prototype, "totalDays", {
            /****************************************/
            get: function () {
                return this.ticks / (1000 * 60 * 60 * 24);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TimeSpan.prototype, "totalHours", {
            /****************************************/
            get: function () {
                return this.ticks / (1000 * 60 * 60);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TimeSpan.prototype, "totalMinutes", {
            /****************************************/
            get: function () {
                return this.ticks / (1000 * 60);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TimeSpan.prototype, "totalSeconds", {
            /****************************************/
            get: function () {
                return this.ticks / (1000);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TimeSpan.prototype, "totalMilliseconds", {
            /****************************************/
            get: function () {
                return this.ticks;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TimeSpan.prototype, "days", {
            /****************************************/
            get: function () {
                return Math.floor(this.ticks / (1000 * 60 * 60 * 24));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TimeSpan.prototype, "hours", {
            /****************************************/
            get: function () {
                return Math.floor(this.ticks / (1000 * 60 * 60)) % 24;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TimeSpan.prototype, "minutes", {
            /****************************************/
            get: function () {
                return Math.floor(this.ticks / (1000 * 60)) % 60;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TimeSpan.prototype, "seconds", {
            /****************************************/
            get: function () {
                return Math.floor(this.ticks / (1000)) % 60;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TimeSpan.prototype, "milliseconds", {
            /****************************************/
            get: function () {
                return this.ticks % 1000;
            },
            enumerable: true,
            configurable: true
        });
        /****************************************/
        TimeSpan.prototype.format = function (format) {
            var _this = this;
            return GeoPlot.Format.replaceArgs(format, function (arg) { return TimeSpan.formatArgument(_this, arg); });
        };
        /****************************************/
        TimeSpan.prototype.toString = function () {
            return this.format("{hh}:{mm}:{ss}");
        };
        /****************************************/
        TimeSpan.zero = function () {
            return new TimeSpan(0);
        };
        /****************************************/
        TimeSpan.fromMilliseconds = function (value) {
            return new TimeSpan(value);
        };
        /****************************************/
        TimeSpan.fromSeconds = function (value) {
            return new TimeSpan(value * 1000);
        };
        /****************************************/
        TimeSpan.fromMinutes = function (value) {
            return new TimeSpan(value * 1000 * 60);
        };
        /****************************************/
        TimeSpan.fromHours = function (value) {
            return new TimeSpan(value * 1000 * 60 * 60);
        };
        /****************************************/
        TimeSpan.fromDays = function (value) {
            return new TimeSpan(value * 1000 * 60 * 60 * 24);
        };
        /****************************************/
        TimeSpan.create = function (days, hours, minutes, seconds, milliseconds) {
            if (days === void 0) { days = 0; }
            if (hours === void 0) { hours = 0; }
            if (minutes === void 0) { minutes = 0; }
            if (seconds === void 0) { seconds = 0; }
            if (milliseconds === void 0) { milliseconds = 0; }
            return new TimeSpan((days * 1000 * 60 * 60 * 24) +
                (hours * 1000 * 60 * 60) +
                (minutes * 1000 * 60) +
                (seconds * 1000) +
                (milliseconds));
        };
        /****************************************/
        TimeSpan.formatArgument = function (value, arg) {
            switch (arg) {
                case "d":
                    return value.days.toString();
                case "dd":
                    return GeoPlot.StringUtils.padLeft(value.days.toString(), 2, "0");
                case "h":
                    return value.hours.toString();
                case "hh":
                    return GeoPlot.StringUtils.padLeft(value.hours.toString(), 2, "0");
                case "m":
                    return value.minutes.toString();
                case "mm":
                    return GeoPlot.StringUtils.padLeft(value.minutes.toString(), 2, "0");
                case "s":
                    return value.seconds.toString();
                case "ss":
                    return GeoPlot.StringUtils.padLeft(value.seconds.toString(), 2, "0");
                case "f":
                    return (value.milliseconds / 100).toString();
                case "ff":
                    return (value.milliseconds / 10).toString();
                case "fff":
                    return value.milliseconds.toString();
            }
            return arg;
        };
        return TimeSpan;
    }());
    GeoPlot.TimeSpan = TimeSpan;
})(GeoPlot || (GeoPlot = {}));
var GeoPlot;
(function (GeoPlot) {
    var Uri = /** @class */ (function () {
        function Uri() {
        }
        /****************************************/
        Uri.absolute = function (uri) {
            if (uri.substr(0, 2) == "./" || uri.substr(0, 2) == "~/")
                return this.getAbsoluteSegment(document.URL) + this.appRoot.substr(1) + uri.substr(2);
            else if (uri.substr(0, 1) == "/")
                return this.getAbsoluteSegment(document.URL) + uri.substr(1);
            else if (this.isAbsolute(uri))
                return uri;
            return this.getRelativeSegment(document.URL) + uri.substr(1);
        };
        /****************************************/
        Uri.isAbsolute = function (uri) {
            return uri.indexOf("://") != -1;
        };
        /****************************************/
        Uri.getRelativeSegment = function (uri) {
            if (!this._relativeSegment) {
                this._relativeSegment = "";
                var index = uri.lastIndexOf("/");
                if (index != -1)
                    this._relativeSegment = uri.substr(0, index + 1);
            }
            return this._relativeSegment;
        };
        /****************************************/
        Uri.getAbsoluteSegment = function (uri) {
            if (!this._absoluteSegment) {
                this._absoluteSegment = "";
                var index = uri.indexOf("://");
                if (index != -1) {
                    index = uri.indexOf("/", index + 4);
                    if (index != -1)
                        this._absoluteSegment = uri.substr(0, index + 1);
                }
            }
            return this._absoluteSegment;
        };
        Uri.appRoot = "";
        return Uri;
    }());
    GeoPlot.Uri = Uri;
})(GeoPlot || (GeoPlot = {}));
var GeoPlot;
(function (GeoPlot) {
    /****************************************/
    var AreaViewModel = /** @class */ (function () {
        function AreaViewModel() {
            this.data = ko.observable();
            this.factor = ko.observable();
            this.indicator = ko.observable();
            this.reference = ko.observable();
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
            this._gradient = new GeoPlot.LinearGradient("#18ffff", "#ffff00", "#ff3d00");
            this.VIEW_MODES = {
                "district": {
                    label: {
                        singular: "provincia",
                        plural: "province"
                    },
                    mapGroup: "group_district",
                    tab: "districtTab",
                    areaType: GeoPlot.GeoAreaType.District,
                    validateId: function (id) { return id[0].toLowerCase() == 'd'; }
                },
                "region": {
                    label: {
                        singular: "regione",
                        plural: "regioni"
                    },
                    mapGroup: "group_dregion",
                    tab: "regionTab",
                    areaType: GeoPlot.GeoAreaType.Region,
                    validateId: function (id) { return id[0].toLowerCase() == 'r'; }
                },
            };
            this.INDICATORS = [
                {
                    id: "totalPositive",
                    name: "Positivi Totali"
                },
                {
                    id: "currentPositive",
                    name: "Attuali Positivi",
                    validFor: ["region"]
                },
                {
                    id: "totalDeath",
                    name: "Deceduti",
                    validFor: ["region"]
                },
                {
                    id: "totalSevere",
                    name: "Gravi",
                    validFor: ["region"]
                },
                {
                    id: "totalHospedalized",
                    name: "Ricoverati",
                    validFor: ["region"]
                },
                {
                    id: "totalHealed",
                    name: "Guariti",
                    validFor: ["region"]
                },
                {
                    id: "toatlTests",
                    name: "Tamponi",
                    validFor: ["region"]
                },
            ];
            this.FACTORS = [
                {
                    id: "none",
                    name: "Nessuno",
                    compute: function (v, a, i) { return i; },
                    reference: function (v, a) { return "N/A"; },
                    description: "[indicator]"
                },
                {
                    id: "population",
                    name: "Popolazione",
                    compute: function (v, a, i) { return (i / a.demography.total) * 100000; },
                    reference: function (v, a) { return formatNumber(a.demography.total); },
                    description: "[indicator] ogni 100.000 abitanti"
                },
                {
                    id: "totalPositive",
                    name: "Positivi Totali",
                    validFor: ["region"],
                    compute: function (v, a, i) { return !v.totalPositive ? 0 : (i / v.totalPositive) * 100; },
                    reference: function (v, a) { return !v.totalPositive ? "N/A" : formatNumber(v.totalPositive); },
                    description: "% [indicator] su positivi totali"
                },
                {
                    id: "severe",
                    name: "Gravi",
                    validFor: ["region"],
                    compute: function (v, a, i) { return !v.totalSevere ? 0 : (i / v.totalSevere) * 100; },
                    reference: function (v, a) { return !v.totalSevere ? "N/A" : formatNumber(v.totalSevere); },
                    description: "% [indicator] sui gravi totali"
                },
                {
                    id: "test",
                    name: "Tamponi",
                    validFor: ["region"],
                    compute: function (v, a, i) { return !v.toatlTests ? 0 : (i / v.toatlTests) * 100; },
                    reference: function (v, a) { return !v.toatlTests ? "N/A" : formatNumber(v.toatlTests); },
                    description: "% [indicator] sui tamponi eseguiti"
                }
            ];
            /****************************************/
            this.dayNumber = ko.observable(0);
            this.totalDays = ko.observable(0);
            this.currentData = ko.observable();
            this.isPlaying = ko.observable(false);
            this.currentArea = ko.observable();
            this.topAreas = ko.observable();
            this.viewMode = ko.observable("district");
            this.selectedIndicator = ko.observable();
            this.selectedFactor = ko.observable();
            this.autoMaxFactor = ko.observable(true);
            this.maxFactor = ko.observable();
            this.isLogScale = ko.observable(false);
            this.isGraphDelta = ko.observable(false);
            this.isZoomChart = ko.observable(false);
            this.groupSize = ko.observable(1);
            this.startDay = ko.observable(0);
            this.isNoFactorSelected = ko.computed(function () {
                return _this.selectedFactor() && _this.selectedFactor().id == 'none';
            });
            this.groupDays = [1, 2, 3, 4, 5, 6, 7];
            this.factorDescription = ko.observable();
            this._data = model.data;
            this._geo = model.geo;
            this.totalDays(this._data.days.length - 1);
            this.dayNumber.subscribe(function (a) { return _this.updateDayData(); });
            this._mapSvg = document.getElementsByTagName("svg").item(0);
            this._mapSvg.addEventListener("click", function (e) { return _this.onMapClick(e); });
            this.days = [];
            for (var i = 0; i < this._data.days.length; i++)
                this.days.push({ number: i, value: new Date(this._data.days[i].date), text: GeoPlot.DateUtils.format(this._data.days[i].date, "{DD}/{MM}") });
            M.Tooltip.init(document.querySelectorAll(".tooltipped"));
            M.Sidenav.init(document.getElementById("mobile-menu"));
            var areaTabs = M.Tabs.init(document.getElementById("areaTabs"));
            areaTabs.options.onShow = function (el) {
                _this.setViewMode(el.dataset["viewMode"]);
            };
            var topCases = M.Collapsible.init(document.getElementById("topCases"));
            topCases.options.onOpenStart = function () {
                if (!_this._daysData)
                    _this.updateTopAreas();
                _this._topAreasVisible = true;
            };
            topCases.options.onCloseEnd = function () {
                _this._topAreasVisible = false;
            };
            this.indicators = ko.computed(function () { return GeoPlot.linq(_this.INDICATORS)
                .where(function (a) { return !a.validFor || a.validFor.indexOf(_this.viewMode()) != -1; })
                .toArray(); });
            this.factors = ko.computed(function () { return GeoPlot.linq(_this.FACTORS)
                .where(function (a) { return !a.validFor || a.validFor.indexOf(_this.viewMode()) != -1; })
                .toArray(); });
            this.selectedIndicator.subscribe(function (value) {
                if (!value)
                    return;
                _this.updateIndicator();
            });
            this.selectedFactor.subscribe(function (value) {
                if (!value)
                    return;
                _this.updateIndicator();
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
                if (!_this.autoMaxFactor())
                    _this.updateMap();
                _this.updateUrl();
            });
            this.isGraphDelta.subscribe(function () {
                _this.computeStartDayForGroup();
                _this.updateChart();
                _this.updateUrl();
            });
            this.isLogScale.subscribe(function () {
                _this.updateChart();
                _this.updateUrl();
            });
            this.isZoomChart.subscribe(function () {
                _this.updateChart();
                _this.updateUrl();
            });
            this.groupSize.subscribe(function (value) {
                _this.computeStartDayForGroup();
                _this.updateChart();
                _this.updateUrl();
            });
            this.startDay.subscribe(function () {
                _this.updateChart();
                _this.updateUrl();
            });
            var urlParams = new URLSearchParams(window.location.search);
            var stateRaw = urlParams.get("state");
            var state;
            if (stateRaw)
                state = JSON.parse(atob(stateRaw));
            else
                state = {};
            setTimeout(function () { return _this.loadState(state); }, 0);
        }
        /****************************************/
        GeoPlotPage.prototype.isDefaultState = function (state) {
            return (!state.day || state.day == this._data.days.length - 1) &&
                (!state.view || state.view == "district") &&
                !state.area &&
                (!state.indicator || state.indicator == "totalPositive") &&
                (!state.factor || state.factor == "none") &&
                !state.maxFactor &&
                !state.graphDelta &&
                !state.logScale &&
                (!state.groupSize || state.groupSize == 1) &&
                (state.startDay == undefined || state.startDay == 0);
        };
        /****************************************/
        GeoPlotPage.prototype.toggleChartZoom = function () {
            this.isZoomChart(!this.isZoomChart());
        };
        /****************************************/
        GeoPlotPage.prototype.loadState = function (state) {
            if (!state.view)
                state.view = "district";
            var viewTabs = M.Tabs.getInstance(document.getElementById("areaTabs"));
            viewTabs.select(this.VIEW_MODES[state.view].tab);
            document.body.scrollTop = 0;
            if (state.logScale != undefined)
                this.isLogScale(state.logScale);
            if (state.groupSize)
                this.groupSize(state.groupSize);
            if (state.startDay != undefined)
                this.startDay(state.startDay);
            if (state.graphDelta != undefined)
                this.isGraphDelta(state.graphDelta);
            if (state.maxFactor) {
                this.autoMaxFactor(false);
                this.maxFactor(state.maxFactor);
            }
            this.dayNumber(state.day != undefined ? state.day : this._data.days.length - 1);
            if (state.indicator)
                this.selectedIndicator(GeoPlot.linq(this.INDICATORS).first(function (a) { return a.id == state.indicator; }));
            if (state.factor)
                this.selectedFactor(GeoPlot.linq(this.FACTORS).first(function (a) { return a.id == state.factor; }));
            if (state.area)
                this.selectedArea = this._geo.areas[state.area.toLowerCase()];
        };
        /****************************************/
        GeoPlotPage.prototype.saveStata = function () {
            return {
                view: this.viewMode(),
                indicator: this.selectedIndicator() ? this.selectedIndicator().id : undefined,
                factor: this.selectedFactor() ? this.selectedFactor().id : undefined,
                graphDelta: this.isGraphDelta(),
                maxFactor: this.autoMaxFactor() ? undefined : this.maxFactor(),
                day: this.dayNumber(),
                area: this.selectedArea ? this.selectedArea.id : undefined,
                groupSize: this.groupSize(),
                startDay: this.startDay(),
                logScale: this.isLogScale()
            };
        };
        /****************************************/
        GeoPlotPage.prototype.play = function () {
            this.isPlaying(true);
            this.nextFrame();
        };
        /****************************************/
        GeoPlotPage.prototype.pause = function () {
            this.isPlaying(false);
        };
        /****************************************/
        GeoPlotPage.prototype.setViewMode = function (mode) {
            this.viewMode(mode);
            var districtGroup = document.getElementById("group_district");
            if (mode == "district")
                districtGroup.style.removeProperty("display");
            else
                districtGroup.style.display = "none";
            this.selectedArea = null;
            this._chart = null;
            this.updateMaxFactor();
            this.updateDayData();
            if (this._topAreasVisible)
                this.updateTopAreas();
            else
                this._daysData = undefined;
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
                    element.classList.remove("selected");
                }
                this._selectedArea = value;
                if (this._selectedArea) {
                    var element = document.getElementById(this._selectedArea.id.toUpperCase());
                    element.classList.add("selected");
                    var parent_1 = element.parentElement;
                    element.remove();
                    parent_1.appendChild(element);
                }
                this.changeArea();
            },
            enumerable: true,
            configurable: true
        });
        /****************************************/
        GeoPlotPage.prototype.computeStartDayForGroup = function () {
            var totDays = this.days.length - this.startDay();
            if (this.isGraphDelta())
                totDays--;
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
            if (item.parentElement.classList.contains(this.viewMode())) {
                var area = this._geo.areas[item.parentElement.id.toLowerCase()];
                this.selectedArea = area;
            }
        };
        /****************************************/
        GeoPlotPage.prototype.nextFrame = function () {
            var _this = this;
            if (!this.isPlaying())
                return;
            if (this.dayNumber() >= this._data.days.length - 1)
                this.dayNumber(0);
            else
                this.dayNumber(parseInt(this.dayNumber().toString()) + 1);
            setTimeout(function () { return _this.nextFrame(); }, 300);
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
                this.updateChart();
                if (isEmptyArea) {
                    M.FormSelect.init(document.querySelectorAll(".row-chart-group select"));
                    M.Tooltip.init(document.querySelectorAll(".row-chart-group .tooltipped"));
                }
            }
            this.updateUrl();
        };
        /****************************************/
        GeoPlotPage.prototype.initChart = function () {
            var canvas = document.querySelector("#areaGraph");
            this._chart = new Chart(canvas, {
                type: "line",
                data: {
                    datasets: [
                        {
                            lineTension: 0,
                            data: [],
                            backgroundColor: "#5cd6d3",
                            borderColor: "#00a59d",
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    maintainAspectRatio: false,
                    legend: {
                        display: false
                    },
                    tooltips: {
                        callbacks: {
                            label: function (t, d) {
                                return t.xLabel + ": " + GeoPlot.MathUtils.round(parseFloat(t.value), 1);
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
        GeoPlotPage.prototype.updateIndicator = function () {
            if (!this.selectedIndicator() || !this.selectedFactor())
                return;
            this.factorDescription(this.selectedFactor().description.replace("[indicator]", this.selectedIndicator().name));
            if (this.selectedFactor().id != "none") {
                if (this.groupSize() != 1)
                    this.groupSize(1);
                if (this.isGraphDelta())
                    this.isGraphDelta(false);
            }
            this.updateMaxFactor();
            this.updateDayData();
            this.updateChart();
            if (this._topAreasVisible)
                this.updateTopAreas();
        };
        /****************************************/
        GeoPlotPage.prototype.updateMaxFactor = function () {
            var _this = this;
            if (!this.selectedFactor() || !this.selectedIndicator() || !this.autoMaxFactor())
                return;
            var max = GeoPlot.linq(this._data.days)
                .select(function (a) { return GeoPlot.linq(a.values).where(function (a) { return _this.VIEW_MODES[_this.viewMode()].validateId(a.key); })
                .select(function (b) { return _this.selectedFactor().compute(b.value, _this._geo.areas[b.key], b.value[_this.selectedIndicator().id]); }).max(); }).max();
            this.maxFactor(parseFloat(max.toFixed(1)));
        };
        /****************************************/
        GeoPlotPage.prototype.updateChart = function () {
            var _this = this;
            if (!this.selectedIndicator() || !this.currentArea() || !this.selectedFactor())
                return;
            if (this._chart == null)
                this.initChart();
            var area = this.currentArea().value;
            var areaId = area.id.toLowerCase();
            var field = this.selectedIndicator().id;
            this._chart.data.datasets[0].label = this.factorDescription();
            if (this.isLogScale())
                this._chart.options.scales.yAxes[0].type = "logarithmic";
            else
                this._chart.options.scales.yAxes[0].type = "linear";
            if (this.isGraphDelta()) {
                this._chart.data.datasets[0].data = [];
                for (var i = 1 + this.startDay(); i < this._data.days.length; i++) {
                    var day = this._data.days[i];
                    var prevDay = this._data.days[i - 1];
                    var item = {
                        x: new Date(day.date),
                        y: this.selectedFactor().compute(day.values[areaId], area, day.values[areaId][field]) -
                            this.selectedFactor().compute(prevDay.values[areaId], area, prevDay.values[areaId][field])
                    };
                    this._chart.data.datasets[0].data.push(item);
                }
            }
            else {
                this._chart.data.datasets[0].data = GeoPlot.linq(this._data.days).skip(this.startDay()).select(function (a) { return ({
                    x: new Date(a.date),
                    y: _this.selectedFactor().compute(a.values[areaId], area, a.values[areaId][field])
                }); }).toArray();
            }
            if (this.groupSize() > 1) {
                var newData = [];
                var data = this._chart.data.datasets[0].data;
                var count = this.groupSize();
                var curPoint = { y: 0 };
                for (var i = 0; i < data.length; i++) {
                    curPoint.y += data[i].y;
                    count--;
                    if (count == 0) {
                        curPoint.x = data[i].x;
                        newData.unshift(curPoint);
                        curPoint = { y: 0 };
                        count = this.groupSize();
                    }
                }
                this._chart.data.datasets[0].data = newData;
            }
            this._chart.update();
        };
        /****************************************/
        GeoPlotPage.prototype.updateArea = function (viewModel, dayNumber) {
            if (!viewModel || !this.selectedIndicator() || !this.selectedFactor())
                return;
            if (dayNumber == undefined)
                dayNumber = this.dayNumber();
            var id = viewModel.value.id.toLowerCase();
            var area = viewModel.value;
            var day = this._data.days[dayNumber];
            viewModel.data(day.values[id]);
            viewModel.indicator(day.values[id][this.selectedIndicator().id]);
            viewModel.factor(GeoPlot.MathUtils.discretize(this.selectedFactor().compute(day.values[id], area, viewModel.indicator()), 10));
            viewModel.reference(this.selectedFactor().reference(day.values[id], area));
        };
        /****************************************/
        GeoPlotPage.prototype.updateTopAreas = function () {
            var _this = this;
            this._daysData = [];
            var _loop_1 = function (i) {
                var day = this_1._data.days[i];
                var item = {};
                var isInArea = this_1.VIEW_MODES[this_1.viewMode()].validateId;
                item.topAreas = GeoPlot.linq(day.values).select(function (a) { return ({
                    factor: _this.selectedFactor().compute(a.value, _this._geo.areas[a.key.toLowerCase()], a.value[_this.selectedIndicator().id]),
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
                _loop_1(i);
            }
            this.topAreas(this._daysData[this.dayNumber()].topAreas);
        };
        /****************************************/
        GeoPlotPage.prototype.updateDayData = function () {
            var day = this._data.days[this.dayNumber()];
            this.currentData(GeoPlot.DateUtils.format(day.date, "{DD}/{MM}/{YYYY}"));
            this.updateMap();
            this.updateArea(this.currentArea());
            if (this._daysData && this._topAreasVisible)
                this.topAreas(this._daysData[this.dayNumber()].topAreas);
            this.updateUrl();
        };
        /****************************************/
        GeoPlotPage.prototype.updateUrl = function () {
            var state = this.saveStata();
            var url = GeoPlot.Uri.appRoot + "Overview";
            if (!this.isDefaultState(state))
                url += "?state=" + encodeURIComponent(btoa(JSON.stringify(state)));
            history.replaceState(null, null, url);
        };
        /****************************************/
        GeoPlotPage.prototype.updateMap = function () {
            if (!this.selectedIndicator() || !this.selectedFactor())
                return;
            var day = this._data.days[this.dayNumber()];
            for (var key in day.values) {
                var element = document.getElementById(key.toUpperCase());
                if (element) {
                    var area = this._geo.areas[key];
                    if (area.type != this.VIEW_MODES[this.viewMode()].areaType)
                        continue;
                    var field = this.selectedIndicator().id;
                    var factor = this.selectedFactor().compute(day.values[key], area, day.values[key][field]);
                    factor = Math.min(1, factor / this.maxFactor());
                    if (day.values[key][field] == 0 || isNaN(factor)) {
                        if (element.classList.contains("valid"))
                            element.classList.remove("valid");
                        element.style.fillOpacity = "1";
                        element.style.removeProperty("fill");
                    }
                    else {
                        if (!element.classList.contains("valid"))
                            element.classList.add("valid");
                        var value = GeoPlot.MathUtils.discretize(GeoPlot.MathUtils.exponential(factor), 20);
                        element.style.fillOpacity = value.toString();
                        //element.style.fill = this._gradient.valueAt(value).toString();
                    }
                }
            }
        };
        return GeoPlotPage;
    }());
    GeoPlot.GeoPlotPage = GeoPlotPage;
})(GeoPlot || (GeoPlot = {}));
//# sourceMappingURL=app.js.map