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
        return DomUtils;
    }());
    GeoPlot.DomUtils = DomUtils;
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
var GeoPlot;
(function (GeoPlot) {
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
                var keySelector = key;
                this.foreach(function (item) {
                    var itemKey = keySelector(item);
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
    var AreaViewModel = /** @class */ (function () {
        function AreaViewModel() {
            this.dayData = ko.observable();
            this.dayFactor = ko.observable();
        }
        AreaViewModel.prototype.select = function () {
        };
        return AreaViewModel;
    }());
    /****************************************/
    var GeoPlotPage = /** @class */ (function () {
        function GeoPlotPage(data, geo) {
            var _this = this;
            this._updateDayData = false;
            /****************************************/
            this.dayNumber = ko.observable(0);
            this.totalDays = ko.observable(0);
            this.currentData = ko.observable();
            this.isPlaying = ko.observable(false);
            this.ageGroup = ko.observable("total");
            this.currentArea = ko.observable();
            this.topAreas = ko.observable();
            var svg = document.getElementsByTagName("svg").item(0);
            svg.addEventListener("click", function (e) { return _this.onMapClick(e); });
            this._data = data;
            this._geo = geo;
            this.totalDays(this._data.days.length - 1);
            this.dayNumber.subscribe(function (a) { return _this.updateDayData(); });
            this.ageGroup.subscribe(function (a) { return _this.updateMap(); });
            this.updateDayData();
            var instance = M.Collapsible.getInstance(document.getElementById("topCases"));
            instance.options.onOpenStart = function () {
                if (!_this._daysData)
                    _this.computeDayData();
                _this._updateDayData = true;
            };
            instance.options.onCloseEnd = function () {
                _this._updateDayData = false;
            };
        }
        /****************************************/
        GeoPlotPage.prototype.onMapClick = function (e) {
            var item = e.target;
            if (item.parentElement.classList.contains("district")) {
                var area = this._geo.areas[item.parentElement.id.toLowerCase()];
                this.selectedArea = area;
            }
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
        Object.defineProperty(GeoPlotPage.prototype, "selectedArea", {
            /****************************************/
            get: function () {
                return this._selectedArea;
            },
            set: function (value) {
                if (value == this._selectedArea)
                    return;
                if (this._selectedArea) {
                    var element = document.getElementById(value.id.toUpperCase());
                    element.classList.remove("selected");
                }
                this._selectedArea = value;
                if (this._selectedArea) {
                    var element = document.getElementById(value.id.toUpperCase());
                    element.classList.add("selected");
                }
                this.changeArea();
            },
            enumerable: true,
            configurable: true
        });
        /****************************************/
        GeoPlotPage.prototype.changeArea = function () {
            if (this._selectedArea == null)
                this.currentArea(null);
            else {
                var area = new AreaViewModel();
                var day = this._data.days[this.dayNumber()];
                area.value = this._selectedArea;
                this.updateArea(area);
                this.currentArea(area);
                if (this._chart == null)
                    this.initChart();
                this.updateChart();
            }
        };
        /****************************************/
        GeoPlotPage.prototype.updateChart = function () {
            var _this = this;
            var day = [this.dayNumber()];
            this._chart.data.datasets[0].data = GeoPlot.linq(this._data.days).select(function (a) { return ({
                x: new Date(a.data),
                y: a.values[_this.currentArea().value.id.toLowerCase()].totalPositive
            }); }).toArray();
            this._chart.update();
        };
        /****************************************/
        GeoPlotPage.prototype.initChart = function () {
            var canvas = document.querySelector("#areaGraph");
            this._chart = new Chart(canvas, {
                type: "line",
                data: {
                    datasets: [
                        {
                            label: "Infetti",
                            lineTension: 0,
                            data: [],
                            backgroundColor: "#5cd6d3",
                            borderColor: "#00a59d",
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    legend: {
                        display: false
                    },
                    scales: {
                        xAxes: [{
                                type: "time",
                                distribution: "linear",
                                time: {
                                    unit: "day",
                                    bounds: "ticks",
                                    tooltipFormat: "DD/MMM"
                                }
                            }],
                    }
                }
            });
        };
        /****************************************/
        GeoPlotPage.prototype.updateArea = function (viewModel) {
            if (!viewModel)
                return;
            var id = viewModel.value.id.toLowerCase();
            var area = viewModel.value;
            var day = this._data.days[this.dayNumber()];
            viewModel.dayData(day.values[id]);
            viewModel.dayFactor({
                total: Math.round((day.values[id].totalPositive / area.demography.total) * 100000 * 10) / 10,
                old: Math.round((day.values[id].totalPositive / area.demography.old) * 100000 * 10) / 10,
            });
        };
        /****************************************/
        GeoPlotPage.prototype.computeDayData = function () {
            var _this = this;
            this._daysData = [];
            for (var i = 0; i < this._data.days.length; i++) {
                var day = this._data.days[i];
                var item = {};
                item.topAreas = GeoPlot.linq(day.values).orderByDesc(function (a) { return a.value.totalPositive; }).select(function (a) {
                    var area = new AreaViewModel();
                    area.value = _this._geo.areas[a.key.toLowerCase()];
                    area.select = function () { return _this.selectedArea = area.value; };
                    _this.updateArea(area);
                    return area;
                }).take(10).toArray();
                this._daysData.push(item);
            }
        };
        /****************************************/
        GeoPlotPage.prototype.updateDayData = function () {
            var day = this._data.days[this.dayNumber()];
            this.currentData(GeoPlot.DateUtils.format(day.data, "{DD}/{MM}/{YYYY}"));
            this.updateMap();
            this.updateArea(this.currentArea());
            if (this._daysData && this._updateDayData)
                this.topAreas(this._daysData[this.dayNumber()].topAreas);
        };
        /****************************************/
        GeoPlotPage.prototype.updateMap = function () {
            var day = this._data.days[this.dayNumber()];
            for (var key in day.values) {
                var element = document.getElementById(key.toUpperCase());
                if (element) {
                    var area = this._geo.areas[key];
                    var factor1 = (day.values[key].totalPositive / area.demography[this.ageGroup()]) / this._data.maxFactor.total;
                    if (day.values[key].totalPositive == 0) {
                        element.style.fill = "#fff";
                        element.style.fillOpacity = "1";
                    }
                    else {
                        factor1 = 1 - Math.pow(1 - factor1, 3);
                        var value = Math.ceil(factor1 * 20) / 20;
                        element.style.fill = "#b71c1c";
                        element.style.fillOpacity = (value).toString();
                    }
                }
            }
        };
        return GeoPlotPage;
    }());
    GeoPlot.GeoPlotPage = GeoPlotPage;
})(GeoPlot || (GeoPlot = {}));
//# sourceMappingURL=app.js.map