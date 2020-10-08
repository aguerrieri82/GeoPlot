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
    function isAndroidApp() {
        return "android" in window;
    }
    WebApp.isAndroidApp = isAndroidApp;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class EmptyEnumerator {
        get current() {
            return undefined;
        }
        moveNext() {
            return false;
        }
        reset() {
        }
        count() {
            return 0;
        }
    }
    class DistinctEnumerator {
        constructor(source, selector) {
            this._selector = selector;
            this._source = source;
            if (!this._selector)
                this._selector = a => a;
            this.reset();
        }
        get current() {
            return this._current;
        }
        moveNext() {
            while (this._source.moveNext()) {
                const item = this._selector(this._source.current);
                if (this._foundItems.indexOf(item) == -1) {
                    this._foundItems.push(item);
                    this._current = item;
                    return true;
                }
            }
            return false;
        }
        reset() {
            this._source.reset();
            this._foundItems = [];
            this._current = undefined;
        }
    }
    class DictionaryEnumerator {
        constructor(value) {
            this._keyList = Object.getOwnPropertyNames(value);
            this._value = value;
            this.reset();
        }
        get current() {
            return {
                key: this._keyList[this._curIndex],
                value: this._value[this._keyList[this._curIndex]]
            };
        }
        moveNext() {
            this._curIndex++;
            return this._curIndex < this._keyList.length;
        }
        reset() {
            this._curIndex = -1;
        }
        first() {
            return {
                key: this._keyList[0],
                value: this._value[this._keyList[0]]
            };
        }
        last() {
            return {
                key: this._keyList[this._keyList.length - 1],
                value: this._value[this._keyList[this._keyList.length - 1]]
            };
        }
        count() {
            return this._keyList.length;
        }
    }
    class ArrayEnumerator {
        constructor(value) {
            this._value = value;
            this.reset();
        }
        get current() {
            return this._value[this._curIndex];
        }
        toArray() {
            return this._value;
        }
        moveNext() {
            this._curIndex++;
            return this._curIndex < this._value.length;
        }
        reset() {
            this._curIndex = -1;
        }
        first() {
            return this._value[0];
        }
        last() {
            return this._value[this._value.length - 1];
        }
        count() {
            return this._value.length;
        }
    }
    class CollectionEnumerator {
        constructor(value) {
            this._value = value;
            this.reset();
        }
        get current() {
            return this._value.item(this._curIndex);
        }
        moveNext() {
            this._curIndex++;
            return this._curIndex < this._value.length;
        }
        reset() {
            this._curIndex = -1;
        }
        first() {
            return this._value.item(0);
        }
        last() {
            return this._value.item(this._value.length - 1);
        }
        count() {
            return this._value.length;
        }
    }
    class SelectManyEnumerator {
        constructor(source, selector) {
            this._selector = selector;
            this._source = source;
            this.reset();
        }
        get current() {
            var _a;
            return (_a = this._curGroup) === null || _a === void 0 ? void 0 : _a.current;
        }
        moveNext() {
            var _a;
            while (true) {
                while (!this._curGroup) {
                    if (!this._source.moveNext())
                        return false;
                    this._curGroup = (_a = this._selector(this._source.current, this._index)) === null || _a === void 0 ? void 0 : _a.getEnumerator();
                }
                if (this._curGroup) {
                    if (!this._curGroup.moveNext())
                        this._curGroup = null;
                    else {
                        this._index++;
                        return true;
                    }
                }
            }
        }
        reset() {
            this._curGroup = null;
            this._index = -1;
            this._source.reset();
        }
    }
    class SelectEnumerator {
        constructor(source, selector) {
            this._selector = selector;
            this._source = source;
            this.reset();
        }
        get current() {
            return this._selector(this._source.current, this._index);
        }
        moveNext() {
            this._index++;
            return this._source.moveNext();
        }
        reset() {
            this._index = -1;
            this._source.reset();
        }
    }
    class WhereEnumerator {
        constructor(source, condition) {
            this._condition = condition;
            this._source = source;
            this.reset();
        }
        get current() {
            return this._source.current;
        }
        moveNext() {
            while (this._source.moveNext()) {
                if (this._condition(this._source.current))
                    return true;
            }
            return false;
        }
        reset() {
            this._source.reset();
        }
    }
    class SkipEnumerator {
        constructor(source, count) {
            this._count = count;
            this._source = source;
            this.reset();
        }
        get current() {
            return this._source.current;
        }
        moveNext() {
            if (!this._skipped) {
                let elCount = 0;
                while (elCount < this._count) {
                    if (!this._source.moveNext())
                        return false;
                    elCount++;
                }
                this._skipped = true;
            }
            return this._source.moveNext();
        }
        reset() {
            this._source.reset();
            this._skipped = false;
        }
    }
    class TakeEnumerator {
        constructor(source, count) {
            this._count = count;
            this._source = source;
            this.reset();
        }
        get current() {
            return this._source.current;
        }
        moveNext() {
            if (this._taken >= this._count)
                return false;
            if (!this._source.moveNext())
                return false;
            this._taken++;
            return true;
        }
        reset() {
            this._source.reset();
            this._taken = 0;
        }
    }
    class IteratorEnumerator {
        constructor(source) {
            this._source = source;
        }
        get current() {
            return this._current;
        }
        moveNext() {
            const result = this._source.next();
            if (result.done)
                return false;
            this._current = result.value;
            return true;
        }
        reset() {
        }
    }
    class Linq {
        constructor(value) {
            this._enumerator = value;
        }
        selectMany(selector) {
            return linq(new SelectManyEnumerator(this._enumerator, selector));
        }
        select(selector) {
            return linq(new SelectEnumerator(this._enumerator, selector));
        }
        ofType(typeCheck) {
            return linq(new WhereEnumerator(this._enumerator, typeCheck));
        }
        where(condition) {
            return linq(new WhereEnumerator(this._enumerator, condition));
        }
        first(condition) {
            if (condition)
                return this.where(condition).first();
            if (this._enumerator.first)
                return this._enumerator.first();
            this._enumerator.reset();
            if (this._enumerator.moveNext())
                return this._enumerator.current;
        }
        last() {
            if (this._enumerator.last)
                return this._enumerator.last();
            this._enumerator.reset();
            let lastItem;
            while (this._enumerator.moveNext())
                lastItem = this._enumerator.current;
            return lastItem;
        }
        sum(selector) {
            if (selector)
                return this.select(selector).sum();
            let result = 0;
            this.foreach(a => {
                result += parseFloat(a);
            });
            return result;
        }
        min(selector) {
            if (selector)
                return this.select(selector).min();
            let result = Number.POSITIVE_INFINITY;
            this.foreach(a => {
                const number = parseFloat(a);
                if (number < result)
                    result = number;
            });
            return result;
        }
        max(selector) {
            if (selector)
                return this.select(selector).max();
            let result = Number.NEGATIVE_INFINITY;
            this.foreach(a => {
                const number = parseFloat(a);
                if (number > result)
                    result = number;
            });
            return result;
        }
        avg(selector) {
            if (selector)
                return this.select(selector).avg();
            let result = 0;
            let count = 0;
            this.foreach(a => {
                result += parseFloat(a);
                count++;
            });
            if (count)
                return result / count;
            return NaN;
        }
        count(condition) {
            if (condition)
                return this.where(condition).count();
            if (this._enumerator.count)
                return this._enumerator.count();
            this._enumerator.reset();
            let count = 0;
            while (this._enumerator.moveNext())
                count++;
            return count;
        }
        concat(separator, selector) {
            let result = "";
            let index = 0;
            if (!selector)
                selector = a => a.toString();
            this.foreach(a => {
                if (index > 0)
                    result += separator;
                result += selector(a);
                index++;
            });
            return result;
        }
        orderBy(selector) {
            const result = this.toArray();
            result.sort((a, b) => {
                const itemA = selector(a);
                const itemB = selector(b);
                return itemA - itemB;
            });
            return linq(result);
        }
        orderByDesc(selector) {
            const result = this.toArray();
            result.sort((a, b) => {
                const itemA = selector(a);
                const itemB = selector(b);
                return itemB - itemA;
            });
            return linq(result);
        }
        distinct(selector) {
            return linq(new DistinctEnumerator(this._enumerator, selector));
        }
        groupBy(key, comparer) {
            const keys = {};
            const result = [];
            if (!comparer)
                comparer = (a, b) => a == b;
            if (typeof key == "function") {
                const keySelector = key;
                this.foreach(item => {
                    const itemKey = keySelector(item);
                    let groupItem = linq(result).first(a => comparer(a.key, itemKey));
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
        }
        indexOf(condition) {
            let index = 0;
            this._enumerator.reset();
            while (this._enumerator.moveNext()) {
                if (condition(this._enumerator.current))
                    return index;
                index++;
            }
        }
        foreach(action) {
            this._enumerator.reset();
            let index = 0;
            while (this._enumerator.moveNext()) {
                action(this._enumerator.current, index);
                index++;
            }
            return this;
        }
        foreachAsync(action, chunkSize = 1) {
            return __awaiter(this, void 0, void 0, function* () {
                this._enumerator.reset();
                let index = 0;
                while (this._enumerator.moveNext()) {
                    yield action(this._enumerator.current, index);
                    index++;
                }
                return this;
            });
        }
        any(condition) {
            if (!condition)
                return this._enumerator.moveNext();
            return this.where(condition).any();
        }
        contains(item, comparer) {
            if (!comparer)
                comparer = (a, b) => a == b;
            this._enumerator.reset();
            while (this._enumerator.moveNext())
                if (comparer(this._enumerator.current, item))
                    return true;
            return false;
        }
        all(condition) {
            return !this.where(a => !condition(a)).any();
        }
        take(count) {
            return linq(new TakeEnumerator(this._enumerator, count));
        }
        skip(count) {
            return linq(new SkipEnumerator(this._enumerator, count));
        }
        replace(condition, newItem) {
            if (!(this._enumerator instanceof ArrayEnumerator))
                throw "Invalid enumerator, expected array";
            const items = this._enumerator.toArray();
            for (let i = 0; i < items.length; i++) {
                if (condition(items[i]))
                    items[i] == newItem;
            }
        }
        toGenerator() {
            function* generator(self) {
                self._enumerator.reset();
                while (self._enumerator.moveNext())
                    yield self._enumerator.current;
            }
            return generator(this);
        }
        toArrayAsync(chunkSize = 1) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this._enumerator.toArray)
                    return this._enumerator.toArray();
                let array = [];
                let index = 0;
                for (let item of this.toGenerator()) {
                    array.push(item);
                    if (index % chunkSize == 0)
                        yield WebApp.PromiseUtils.delay(0);
                    index++;
                }
                return array;
            });
        }
        toArray() {
            if (this._enumerator.toArray)
                return this._enumerator.toArray();
            const result = [];
            this.foreach(a => result.push(a));
            return result;
        }
        toDictionary(keySelector, valueSelector) {
            if (!valueSelector)
                valueSelector = a => a;
            const result = {};
            this.foreach(a => result[keySelector(a)] = valueSelector(a));
            return result;
        }
        getEnumerator() {
            return this._enumerator;
        }
        [Symbol.iterator]() {
            this._enumerator.reset();
            return ({
                next: (value) => {
                    const isDone = !this._enumerator.moveNext();
                    return {
                        done: isDone,
                        value: this._enumerator.current
                    };
                }
            });
        }
    }
    WebApp.Linq = Linq;
    function linq(value) {
        let enumerator;
        if (!value)
            enumerator = new EmptyEnumerator();
        else if (Array.isArray(value))
            enumerator = new ArrayEnumerator(value);
        else if ("getEnumerator" in value)
            enumerator = value.getEnumerator();
        else if (WebApp.TypeCheck.isList(value))
            enumerator = new ArrayEnumerator(value.toArray());
        else if ("item" in value)
            enumerator = new CollectionEnumerator(value);
        else if ("next" in value && typeof (value["next"]) == "function")
            enumerator = new IteratorEnumerator(value);
        else if ("current" in value && "reset" in value && "moveNext" in value)
            enumerator = value;
        else
            enumerator = new DictionaryEnumerator(value);
        return new Linq(enumerator);
    }
    WebApp.linq = linq;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class StringTable {
        static getKey(config) {
            let key = config.language;
            if (config.sector)
                key += "|" + config.sector;
            return key;
        }
        static get(config) {
            if (!config)
                config = this._currentConfig;
            let result = StringTable._tables[this.getKey(config)];
            if (!result && config.sector)
                result = StringTable._tables[this.getKey({ language: config.language })];
            return result;
        }
        static add(value, config) {
            this._tables[this.getKey(config)] = value;
        }
        static get currentConfig() {
            return this._currentConfig;
        }
        static set currentConfig(value) {
            this._currentConfig = value;
            WebApp.Strings = StringTable.get();
        }
    }
    StringTable._tables = {};
    WebApp.StringTable = StringTable;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let OperationType;
    (function (OperationType) {
        OperationType[OperationType["Global"] = 0] = "Global";
        OperationType[OperationType["Local"] = 1] = "Local";
    })(OperationType = WebApp.OperationType || (WebApp.OperationType = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let Format;
    (function (Format) {
        function join(separator, ...args) {
            let result = "";
            for (let arg of args) {
                if (!arg)
                    continue;
                if (result.length > 0)
                    result += separator;
                result += WebApp.DynamicString.getValue(arg);
            }
            return result;
        }
        Format.join = join;
        function text(value, ...args) {
            return WebApp.DynamicString.getValue(value, { params: args });
        }
        Format.text = text;
        function title(value, ...args) {
            return WebApp.DynamicString.getValue(value, { params: args, usage: WebApp.StringUsage.Title });
        }
        Format.title = title;
        function action(value, ...args) {
            return WebApp.DynamicString.getValue(value, { params: args, usage: WebApp.StringUsage.Action });
        }
        Format.action = action;
        function message(value, ...args) {
            return WebApp.DynamicString.getValue(value, { params: args, usage: WebApp.StringUsage.Message });
        }
        Format.message = message;
        function currency(value, symbol = "€. ") {
            if (value == null || value == undefined)
                return "";
            return symbol + " " + value.toFixed(2);
        }
        Format.currency = currency;
        function replaceArgs(value, args) {
            if (!value)
                return;
            let map;
            if (typeof (args) != "function")
                map = key => args[key];
            else
                map = args;
            let state = 0;
            let result = "";
            let curName = "";
            for (let i = 0; i < value.length; i++) {
                const c = value[i];
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
        function replaceArgs2(value, args) {
            if (!value)
                return value;
            let map;
            if (typeof (args) != "function")
                map = key => args[key];
            else
                map = args;
            let result = "";
            let paramName = "";
            let state = 0;
            for (let i = 0; i < value.length; i++) {
                let c = value[i];
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
                            const paramValue = map(paramName);
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
        function linkify(value) {
            if (!value)
                return "";
            let replacedText, replacePattern1, replacePattern2, replacePattern3;
            replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
            replacedText = value.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
            replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
            replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
            replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
            replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
            return replacedText;
        }
        Format.linkify = linkify;
    })(Format = WebApp.Format || (WebApp.Format = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    function apply(item, block) {
        block(item);
        return item;
    }
    WebApp.apply = apply;
    function injectProxy(proxy, propName, value) {
        proxy[propName] = value;
        return proxy[propName];
    }
    WebApp.injectProxy = injectProxy;
    function safeCall(block, errorHandler) {
        try {
            return block();
        }
        catch (e) {
            if (errorHandler)
                return errorHandler(e);
        }
    }
    WebApp.safeCall = safeCall;
    function safeCallAsync(block, errorHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield block();
            }
            catch (e) {
                if (errorHandler)
                    return Promise.resolve(errorHandler(e));
            }
        });
    }
    WebApp.safeCallAsync = safeCallAsync;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let Http;
    (function (Http) {
        function getStringAsync(url) {
            return WebApp.Services.httpClient.requestAsync({
                url: url,
                method: "GET",
            });
        }
        Http.getStringAsync = getStringAsync;
        function postStringAsync(url, data) {
            return WebApp.Services.httpClient.requestAsync({
                url: url,
                method: "POST",
                data: data,
            });
        }
        Http.postStringAsync = postStringAsync;
        function getJsonAsync(url) {
            return WebApp.Services.httpClient.requestAsync({
                url: url,
                method: "GET",
                responseType: "application/json",
            });
        }
        Http.getJsonAsync = getJsonAsync;
        function postJsonAsync(url, data) {
            return WebApp.Services.httpClient.requestAsync({
                url: url,
                method: "POST",
                responseType: "application/json",
                data: data,
            });
        }
        Http.postJsonAsync = postJsonAsync;
        function postBinaryAsync(url, data, onProgress) {
            return WebApp.Services.httpClient.requestAsync({
                url: url,
                method: "POST",
                responseType: "application/json",
                dataType: "application/octet-stream",
                data: data,
                onProgress: onProgress
            });
        }
        Http.postBinaryAsync = postBinaryAsync;
    })(Http = WebApp.Http || (WebApp.Http = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let Services;
    (function (Services) {
    })(Services = WebApp.Services || (WebApp.Services = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let TypeCheck;
    (function (TypeCheck) {
        function isList(obj) {
            return obj && typeof obj == "object" && "add" in obj && "get" in obj && "count" in obj;
        }
        TypeCheck.isList = isList;
        function isCloneable(obj) {
            return obj && typeof obj == "object" && "clone" in obj && typeof obj["clone"] == "function";
        }
        TypeCheck.isCloneable = isCloneable;
        function isObservableList(obj) {
            return TypeCheck.isList(obj) && "subscribe" in obj;
        }
        TypeCheck.isObservableList = isObservableList;
        function isString(obj) {
            return typeof obj == "string";
        }
        TypeCheck.isString = isString;
        function isFunction(obj) {
            return typeof obj == "function";
        }
        TypeCheck.isFunction = isFunction;
        function isObject(obj) {
            return typeof obj == "object";
        }
        TypeCheck.isObject = isObject;
        function isStateManager(obj) {
            return obj && typeof obj == "object" && "setState" in obj && "getState" in obj;
        }
        TypeCheck.isStateManager = isStateManager;
    })(TypeCheck = WebApp.TypeCheck || (WebApp.TypeCheck = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let Uri;
    (function (Uri) {
        var _relativeSegment;
        var _absoluteSegment;
        function absolute(uri) {
            if (uri.substr(0, 2) == "./" || uri.substr(0, 2) == "~/")
                return getAbsoluteSegment(document.URL) + WebApp.app.baseUrl.substr(1) + uri.substr(2);
            else if (uri.substr(0, 1) == "/")
                return getAbsoluteSegment(document.URL) + uri.substr(1);
            else if (isAbsolute(uri))
                return uri;
            return getRelativeSegment(document.URL) + uri.substr(1);
        }
        Uri.absolute = absolute;
        function isAbsolute(uri) {
            return uri.indexOf("://") != -1;
        }
        Uri.isAbsolute = isAbsolute;
        function getRelativeSegment(uri) {
            if (!_relativeSegment) {
                _relativeSegment = "";
                let index = uri.lastIndexOf("/");
                if (index != -1)
                    _relativeSegment = uri.substr(0, index + 1);
            }
            return _relativeSegment;
        }
        Uri.getRelativeSegment = getRelativeSegment;
        function getAbsoluteSegment(uri) {
            if (!_absoluteSegment) {
                _absoluteSegment = "";
                let index = uri.indexOf("://");
                if (index != -1) {
                    index = uri.indexOf("/", index + 4);
                    if (index != -1)
                        _absoluteSegment = uri.substr(0, index + 1);
                }
            }
            return _absoluteSegment;
        }
        Uri.getAbsoluteSegment = getAbsoluteSegment;
    })(Uri = WebApp.Uri || (WebApp.Uri = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class DbStorage {
        constructor() {
        }
        openAsync(name) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((res, rej) => {
                    const request = indexedDB.open(name, 2);
                    request.onerror = ev => rej();
                    request.onsuccess = ev => {
                        this._database = request.result;
                        res(true);
                    };
                    request.onupgradeneeded = ev => {
                        if (!request.result.objectStoreNames.contains("object"))
                            request.result.createObjectStore("object");
                        res(true);
                    };
                });
            });
        }
        openReadWrite() {
            return this._database.transaction("object", "readwrite").objectStore("object");
        }
        openRead() {
            return this._database.transaction("object", "readonly").objectStore("object");
        }
        setItem(key, value) {
            return new Promise((res, rej) => {
                const request = this.openReadWrite().put(JSON.stringify(value), key);
                request.onerror = ev => rej();
                request.onsuccess = ev => res(request.result);
            });
        }
        getItem(key) {
            return new Promise((res, rej) => {
                const request = this.openRead().get(key);
                request.onerror = ev => rej();
                request.onsuccess = ev => {
                    res(JSON.parse(request.result));
                };
            });
        }
        removeItem(key) {
            return new Promise((res, rej) => {
                const request = this.openReadWrite().delete(key);
                request.onerror = ev => rej();
                request.onsuccess = ev => res();
            });
        }
        clear(key) {
            return new Promise((res, rej) => {
                const request = this.openReadWrite().clear();
                request.onerror = ev => rej();
                request.onsuccess = ev => res();
            });
        }
    }
    WebApp.DbStorage = DbStorage;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class LocalStorageCache {
        read(key) {
            let entryJson = localStorage.getItem("cache:" + key);
            if (entryJson) {
                let entry = JSON.parse(entryJson);
                entry.readCount++;
                entry.lastReadTime = WebApp.DateUtils.now();
                localStorage.setItem("cache:" + key, JSON.stringify(entry));
                return entry;
            }
            return null;
        }
        update(key, value) {
            let entry = this.read(key);
            if (!entry) {
                entry = {
                    creationTime: WebApp.DateUtils.now(),
                    key: key,
                    lastReadTime: null,
                    lastWriteTime: null,
                    value: value,
                    readCount: 0,
                    writeCount: 0
                };
            }
            else {
                entry.writeCount++;
                entry.lastWriteTime = WebApp.DateUtils.now();
                entry.value = value;
            }
            localStorage.setItem("cache:" + key, JSON.stringify(entry));
            return entry;
        }
        remove(key) {
            localStorage.removeItem("cache:" + key);
        }
        clear() {
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key.startsWith("cache:"))
                    localStorage.removeItem(key);
            }
        }
        contains(key) {
            return localStorage.getItem("cache:" + key) != null;
        }
    }
    WebApp.LocalStorageCache = LocalStorageCache;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class Exception extends Error {
        constructor(message, innerException) {
            super();
            this.message = message;
            this.innerException = innerException;
        }
    }
    WebApp.Exception = Exception;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class HttpException extends WebApp.Exception {
        constructor(request, status, innerException) {
            super("HTTP error, status code: " + status, innerException);
            this.request = request;
        }
    }
    WebApp.HttpException = HttpException;
    class XHRHttpClient {
        onNewRequest(config) {
        }
        requestAsync(config) {
            this.onNewRequest(config);
            return new Promise((resolve, reject) => {
                const xmlhttp = new XMLHttpRequest();
                let curOperation;
                if (WebApp.Operation) {
                    curOperation = WebApp.Operation.begin({
                        message: config.method + " " + config.url,
                        type: WebApp.OperationType.Local
                    });
                }
                xmlhttp.onreadystatechange = ev => {
                    if (xmlhttp.readyState == XMLHttpRequest.DONE) {
                        if (curOperation)
                            curOperation.end();
                        if (xmlhttp.status == 200) {
                            let data = xmlhttp.responseText;
                            const isJson = config.responseType == "application/json";
                            if (isJson)
                                data = JSON.parse(data);
                            resolve(data);
                        }
                        else
                            reject(new HttpException(config, xmlhttp.status));
                    }
                };
                if (config.onProgress)
                    xmlhttp.upload.onprogress = config.onProgress;
                xmlhttp.open(config.method, WebApp.Uri.absolute(config.url), true);
                let contentType = config.dataType;
                let data = config.data;
                if (config.data) {
                    const isJson = contentType == "application/json" || typeof config.data == "object";
                    const isObj = contentType == "application/octet-stream";
                    if (isJson && !isObj) {
                        contentType = "application/json";
                        if (data && typeof config.data != "string")
                            data = JSON.stringify(data);
                    }
                }
                if (contentType)
                    xmlhttp.setRequestHeader("Content-type", contentType);
                if (config.headers) {
                    for (let header in config.headers)
                        xmlhttp.setRequestHeader(header, config.headers[header]);
                }
                xmlhttp.send(data);
            });
        }
    }
    WebApp.XHRHttpClient = XHRHttpClient;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let WordNumber;
    (function (WordNumber) {
        WordNumber[WordNumber["Singular"] = 0] = "Singular";
        WordNumber[WordNumber["Plural"] = 1] = "Plural";
    })(WordNumber = WebApp.WordNumber || (WebApp.WordNumber = {}));
    let WordGender;
    (function (WordGender) {
        WordGender[WordGender["Male"] = 0] = "Male";
        WordGender[WordGender["Female"] = 1] = "Female";
    })(WordGender = WebApp.WordGender || (WebApp.WordGender = {}));
    let StringUsage;
    (function (StringUsage) {
        StringUsage[StringUsage["General"] = 0] = "General";
        StringUsage[StringUsage["Label"] = 1] = "Label";
        StringUsage[StringUsage["Column"] = 2] = "Column";
        StringUsage[StringUsage["Action"] = 3] = "Action";
        StringUsage[StringUsage["Message"] = 4] = "Message";
        StringUsage[StringUsage["Question"] = 5] = "Question";
        StringUsage[StringUsage["Title"] = 6] = "Title";
        StringUsage[StringUsage["Tooltip"] = 7] = "Tooltip";
    })(StringUsage = WebApp.StringUsage || (WebApp.StringUsage = {}));
    ;
    class DynamicStringManager {
        format(Strings) {
            return cfg => {
                let curValue = Strings(cfg);
                if (cfg) {
                    if (cfg.usage === StringUsage.Column ||
                        cfg.usage === StringUsage.Label ||
                        cfg.usage === StringUsage.Action ||
                        cfg.usage === StringUsage.Title ||
                        cfg.usage === StringUsage.Question ||
                        cfg.usage === StringUsage.Tooltip ||
                        cfg.usage === StringUsage.Message)
                        curValue = curValue.substr(0, 1).toUpperCase() + curValue.substr(1);
                    if (cfg.usage === StringUsage.Label)
                        curValue += ":";
                    if (cfg.usage === StringUsage.Message)
                        curValue += ".";
                    if (cfg.usage === StringUsage.Question)
                        curValue += "?";
                }
                return curValue;
            };
        }
        getValue(value, usageOrConfig) {
            if (typeof value == "function") {
                let cfg;
                if (usageOrConfig) {
                    if (StringUsage[usageOrConfig])
                        cfg = {
                            usage: usageOrConfig
                        };
                    else
                        cfg = usageOrConfig;
                }
                return value(cfg);
            }
            else {
                if (value && WebApp.Strings && value in WebApp.Strings)
                    return this.getValue(WebApp.Strings[value], usageOrConfig);
            }
            return value;
        }
        complex(value) {
            return WebApp.DynamicString.format(cfg => {
                let state = 0;
                let result = "";
                let curName = "";
                let curNameParams = null;
                let curNameParamsDeep = 0;
                if (!cfg)
                    cfg = {};
                if (!cfg.gender && cfg.params) {
                    cfg.params.forEach(a => {
                        if (typeof a === "function")
                            a(Object.assign(Object.assign({}, cfg), { params: [] }));
                    });
                }
                for (let i = 0; i < value.length; i++) {
                    let c = value[i];
                    switch (state) {
                        case 0:
                            if (c == "{") {
                                curName = "";
                                curNameParams = null;
                                state = 1;
                            }
                            else
                                result += c;
                            break;
                        case 1:
                            if (c == "}") {
                                state = 3;
                                i--;
                                break;
                            }
                            else if (c == ":") {
                                curNameParams = "";
                                curNameParamsDeep = 0;
                                state = 2;
                            }
                            else
                                curName += c;
                            break;
                        case 2:
                            if (c == "{")
                                curNameParamsDeep++;
                            if (c == "}") {
                                curNameParamsDeep--;
                                if (curNameParamsDeep < 0) {
                                    state = 3;
                                    i--;
                                }
                                else
                                    curNameParams += c;
                            }
                            else
                                curNameParams += c;
                            break;
                        case 3:
                            let paramCfg;
                            if (curNameParams)
                                paramCfg = JSON.parse(curNameParams.trim());
                            else
                                paramCfg = {};
                            let flagFound = true;
                            while (flagFound) {
                                flagFound = false;
                                if (curName.startsWith("*")) {
                                    paramCfg.number = WordNumber.Plural;
                                    curName = curName.substr(1);
                                    flagFound = true;
                                }
                                if (curName.startsWith("!")) {
                                    paramCfg.useArticle = true;
                                    curName = curName.substr(1);
                                    flagFound = true;
                                }
                                if (curName.startsWith(".")) {
                                    paramCfg.useArticleInd = true;
                                    curName = curName.substr(1);
                                    flagFound = true;
                                }
                            }
                            if (cfg.gender && !paramCfg.gender)
                                paramCfg.gender = cfg.gender;
                            if (cfg.cardinality && !paramCfg.cardinality)
                                paramCfg.cardinality = cfg.cardinality;
                            if (cfg.number && !paramCfg.number)
                                paramCfg.number = cfg.number;
                            if (cfg.useArticle !== undefined && paramCfg.useArticle === undefined)
                                paramCfg.useArticle = cfg.useArticle;
                            const number = parseInt(curName);
                            if (!isNaN(number)) {
                                if (cfg.params && number < cfg.params.length) {
                                    const param = cfg.params[number];
                                    result += this.getValue(param, paramCfg);
                                }
                            }
                            else
                                result += WebApp.Strings[curName](paramCfg);
                            if (paramCfg.gender)
                                cfg.gender = paramCfg.gender;
                            state = 0;
                            break;
                    }
                }
                return result;
            });
        }
        adverb(advCfg) {
            return this.format(cfg => {
                return cfg && cfg.gender == WordGender.Female ? advCfg.female : advCfg.male;
            });
        }
        appendArticle(article, name) {
            let result = article;
            if (result.charAt(result.length - 1) != "'")
                result += " ";
            return result + name;
        }
        adjective(adjCfg) {
            return this.format(cfg => {
                const gender = cfg && cfg.gender == WordGender.Female ? adjCfg.female : adjCfg.male;
                const fullName = cfg && (cfg.number == WordNumber.Plural || cfg.cardinality > 1) ? gender.plural : gender.singular;
                if (cfg && cfg.useArticle)
                    return this.appendArticle(fullName.detArticle, fullName.name);
                if (cfg && cfg.useArticleInd)
                    return this.appendArticle(fullName.undetArticle, fullName.name);
                return fullName.name;
            });
        }
        noun(nameCfg) {
            return this.format(cfg => {
                if (!cfg)
                    cfg = {};
                if (nameCfg.gender)
                    cfg.gender = nameCfg.gender;
                const fullName = (cfg.number == WordNumber.Plural || cfg.cardinality > 1) ? nameCfg.plural : nameCfg.singular;
                if (cfg && cfg.useArticle)
                    return this.appendArticle(fullName.detArticle, fullName.name);
                if (cfg && cfg.useArticleInd)
                    return this.appendArticle(fullName.undetArticle, fullName.name);
                return fullName.name;
            });
        }
        map(selector) {
            return cfg => selector(WebApp.Strings)(cfg);
        }
        simple(value) {
            return this.format(() => value);
        }
    }
    WebApp.DynamicString = new DynamicStringManager();
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class AppEvent {
        add(handler) {
            if (!this._handlers)
                this._handlers = [];
            if (this._handlers.indexOf(handler) == -1)
                this._handlers.push(handler);
        }
        remove(handler) {
            if (this._handlers) {
                const index = this._handlers.indexOf(handler);
                if (index != -1)
                    this._handlers.splice(index, 1);
            }
        }
        raise(sender, data) {
            if (this._handlers)
                this._handlers.forEach(a => a(sender, data));
        }
    }
    WebApp.AppEvent = AppEvent;
    function event() {
        return new AppEvent();
    }
    WebApp.event = event;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class Signal {
        constructor(isSet = false) {
            this._waitHandlers = [];
            this._isSet = isSet;
        }
        set() {
            this._isSet = true;
            this._waitHandlers.forEach(handler => handler(true));
            this._waitHandlers = [];
        }
        reset() {
            this._isSet = false;
        }
        waitFor(timeout) {
            if (this._isSet)
                return Promise.resolve(true);
            return new Promise((res, rej) => {
                if (timeout) {
                    setTimeout(() => {
                        const index = this._waitHandlers.indexOf(res);
                        if (index != -1) {
                            this._waitHandlers.splice(index, 1);
                            res(false);
                        }
                    }, timeout.totalMilliseconds);
                }
                this._waitHandlers.push(res);
            });
        }
        get isSet() {
            return this._isSet;
        }
    }
    WebApp.Signal = Signal;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let TimePart;
    (function (TimePart) {
        TimePart[TimePart["Milliseconds"] = 0] = "Milliseconds";
        TimePart[TimePart["Seconds"] = 1] = "Seconds";
        TimePart[TimePart["Minutes"] = 2] = "Minutes";
        TimePart[TimePart["Hours"] = 3] = "Hours";
        TimePart[TimePart["Days"] = 4] = "Days";
    })(TimePart = WebApp.TimePart || (WebApp.TimePart = {}));
    class TimeSpan {
        constructor(ticks = 0) {
            this.ticks = ticks;
        }
        get totalDays() {
            return this.ticks / (1000 * 60 * 60 * 24);
        }
        get totalHours() {
            return this.ticks / (1000 * 60 * 60);
        }
        get totalMinutes() {
            return this.ticks / (1000 * 60);
        }
        get totalSeconds() {
            return this.ticks / (1000);
        }
        get totalMilliseconds() {
            return this.ticks;
        }
        get days() {
            return Math.floor(this.ticks / (1000 * 60 * 60 * 24));
        }
        get hours() {
            return Math.floor(this.ticks / (1000 * 60 * 60)) % 24;
        }
        get minutes() {
            return Math.floor(this.ticks / (1000 * 60)) % 60;
        }
        get seconds() {
            return Math.floor(this.ticks / (1000)) % 60;
        }
        get milliseconds() {
            return this.ticks % 1000;
        }
        format(format) {
            return WebApp.Format.replaceArgs(format, arg => TimeSpan.formatArgument(this, arg));
        }
        toString() {
            return this.format("{hh}:{mm}:{ss}");
        }
        static zero() {
            return new TimeSpan(0);
        }
        static fromMilliseconds(value) {
            return new TimeSpan(value);
        }
        static fromSeconds(value) {
            return new TimeSpan(value * 1000);
        }
        static fromMinutes(value) {
            return new TimeSpan(value * 1000 * 60);
        }
        static fromHours(value) {
            return new TimeSpan(value * 1000 * 60 * 60);
        }
        static fromDays(value) {
            return new TimeSpan(value * 1000 * 60 * 60 * 24);
        }
        static create(days = 0, hours = 0, minutes = 0, seconds = 0, milliseconds = 0) {
            return new TimeSpan((days * 1000 * 60 * 60 * 24) +
                (hours * 1000 * 60 * 60) +
                (minutes * 1000 * 60) +
                (seconds * 1000) +
                (milliseconds));
        }
        static formatArgument(value, arg) {
            switch (arg) {
                case "d":
                    return value.days.toString();
                case "dd":
                    return WebApp.StringUtils.padLeft(value.days.toString(), 2, "0");
                case "h":
                    return value.hours.toString();
                case "hh":
                    return WebApp.StringUtils.padLeft(value.hours.toString(), 2, "0");
                case "m":
                    return value.minutes.toString();
                case "mm":
                    return WebApp.StringUtils.padLeft(value.minutes.toString(), 2, "0");
                case "s":
                    return value.seconds.toString();
                case "ss":
                    return WebApp.StringUtils.padLeft(value.seconds.toString(), 2, "0");
                case "f":
                    return (value.milliseconds / 100).toString();
                case "ff":
                    return (value.milliseconds / 10).toString();
                case "fff":
                    return value.milliseconds.toString();
            }
            return arg;
        }
    }
    WebApp.TimeSpan = TimeSpan;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let ArrayUtils;
    (function (ArrayUtils) {
        function merge(...arrays) {
            const result = [];
            arrays.forEach(a => {
                if (a) {
                    a.forEach(b => {
                        if (result.indexOf(b) == -1)
                            result.push(b);
                    });
                }
            });
            return result;
        }
        ArrayUtils.merge = merge;
        function equals(a, b) {
            if (!Array.isArray(a) || !Array.isArray(b))
                return false;
            if (a.length != b.length)
                return false;
            for (let i = 0; i < a.length; i++) {
                if (!WebApp.ObjectUtils.equals(a[i], b[i]))
                    return false;
            }
            return true;
        }
        ArrayUtils.equals = equals;
        function forEachAsync(items, chunkSize, action) {
            return __awaiter(this, void 0, void 0, function* () {
                let index = 0;
                for (let item of items) {
                    action(item, index);
                    if (index % chunkSize == 0)
                        yield WebApp.PromiseUtils.delay(0);
                    index++;
                }
            });
        }
        ArrayUtils.forEachAsync = forEachAsync;
    })(ArrayUtils = WebApp.ArrayUtils || (WebApp.ArrayUtils = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let DateUtils;
    (function (DateUtils) {
        DateUtils.WEEK_DAYS = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
        DateUtils.MONTHS = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
        function parse(value) {
            if (value instanceof Date)
                return value;
            return new Date(value);
        }
        DateUtils.parse = parse;
        function addDays(date, value) {
            return add(date, WebApp.TimeSpan.fromDays(value));
        }
        DateUtils.addDays = addDays;
        function add(date, value) {
            date = parse(date);
            return new Date(date.getTime() + value.ticks);
        }
        DateUtils.add = add;
        function diff(date1, date2) {
            return new WebApp.TimeSpan(parse(date1).getTime() - parse(date2).getTime());
        }
        DateUtils.diff = diff;
        function now() {
            return new Date();
        }
        DateUtils.now = now;
        function today() {
            return truncateTime(now());
        }
        DateUtils.today = today;
        function truncateTime(date) {
            date = parse(date);
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        }
        DateUtils.truncateTime = truncateTime;
        function timeOfDay(date) {
            date = parse(date);
            return new WebApp.TimeSpan(date.getTime() - truncateTime(date).getTime());
        }
        DateUtils.timeOfDay = timeOfDay;
        function format(date, format) {
            date = parse(date);
            return WebApp.Format.replaceArgs(WebApp.DynamicString.getValue(format), arg => formatArgument(date, arg));
        }
        DateUtils.format = format;
        function formatArgument(value, arg) {
            value = parse(value);
            switch (arg) {
                case "D":
                    return value.getDate().toString();
                case "DD":
                    return WebApp.StringUtils.padLeft(value.getDate().toString(), 2, "0");
                case "W":
                    return DateUtils.WEEK_DAYS[(value.getDay() + 6) % 7].substr(0, 3);
                case "WW":
                    return DateUtils.WEEK_DAYS[(value.getDay() + 6) % 7];
                case "M":
                    return value.getMonth().toString();
                case "MM":
                    return WebApp.StringUtils.padLeft((value.getMonth() + 1).toString(), 2, "0");
                case "MMM":
                    return DateUtils.MONTHS[value.getMonth()].substr(0, 3);
                case "MMMM":
                    return DateUtils.MONTHS[value.getMonth()];
                case "YYYY":
                    return value.getFullYear().toString();
                case "h":
                    return value.getHours().toString();
                case "hh":
                    return WebApp.StringUtils.padLeft(value.getHours().toString(), 2, "0");
                case "m":
                    return value.getMinutes().toString();
                case "mm":
                    return WebApp.StringUtils.padLeft(value.getMinutes().toString(), 2, "0");
                case "s":
                    return value.getSeconds().toString();
                case "ss":
                    return WebApp.StringUtils.padLeft(value.getSeconds().toString(), 2, "0");
                case "f":
                    return (value.getMilliseconds() / 100).toString();
                case "ff":
                    return (value.getMilliseconds() / 10).toString();
                case "fff":
                    return value.getMilliseconds().toString();
            }
            return arg;
        }
        DateUtils.formatArgument = formatArgument;
    })(DateUtils = WebApp.DateUtils || (WebApp.DateUtils = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class LinqNode {
        constructor(node) {
            this.node = node;
        }
        get childNodes() {
            return WebApp.linq(this.node.childNodes).select(a => new LinqNode(a));
        }
        descendsFrom(target) {
            let curItem = this.node;
            while (curItem != null) {
                if (curItem == target)
                    return true;
                curItem = curItem.parentNode;
            }
            return false;
        }
        hasClass(className) {
            if ("classList" in this.node)
                return this.node.classList.contains(className);
            return false;
        }
        get discendants() {
            function* iterator(node) {
                for (let child of this.node.childNodes) {
                    yield new LinqNode(child);
                    for (let innerChild of iterator(child))
                        yield innerChild;
                }
                ;
            }
            return WebApp.linq(iterator(this.node));
        }
        get parentNodesOrSelf() {
            function* iterator(node) {
                let curItem = node;
                while (curItem != null) {
                    yield new LinqNode(curItem);
                    curItem = curItem.parentNode;
                }
            }
            return WebApp.linq(iterator(this.node));
        }
        get parentNodes() {
            return this.parentNodesOrSelf.skip(1);
        }
        get name() {
            return this.node.nodeName;
        }
    }
    let DomUtils;
    (function (DomUtils) {
        function parentOfClass(src, className) {
            return DomUtils.node(src).parentNodes.where(a => a.hasClass(className)).select(a => a.node).first();
        }
        DomUtils.parentOfClass = parentOfClass;
        function node(src) {
            return new LinqNode(src);
        }
        DomUtils.node = node;
        function isParentOrSelf(element, parent) {
            let curElement = element;
            while (curElement) {
                if (curElement == parent)
                    return true;
                curElement = curElement.parentElement;
            }
            return false;
        }
        DomUtils.isParentOrSelf = isParentOrSelf;
        function generateId(base = "id_") {
            while (true) {
                const curId = base + WebApp.StringUtils.random(8);
                if (!document.getElementById(curId))
                    return curId;
            }
        }
        DomUtils.generateId = generateId;
        function removeClass(element, className) {
            if (element.classList.contains(className))
                element.classList.remove(className);
        }
        DomUtils.removeClass = removeClass;
        function addClass(element, className) {
            if (!element.classList.contains(className))
                element.classList.add(className);
        }
        DomUtils.addClass = addClass;
        function isSmallDevice() {
            return window.innerWidth < 610;
        }
        DomUtils.isSmallDevice = isSmallDevice;
        function copyText(value) {
            return __awaiter(this, void 0, void 0, function* () {
                if (navigator["clipboard"])
                    yield navigator.clipboard.writeText(value);
                else {
                    const input = document.createElement("textarea");
                    document.body.appendChild(input);
                    input.value = value;
                    input.select();
                    document.execCommand("copy");
                    document.body.removeChild(input);
                }
            });
        }
        DomUtils.copyText = copyText;
        function centerElement(element, always = true) {
            const topOfPage = document.documentElement.scrollTop;
            const heightOfPage = window.innerHeight;
            let elY = 0;
            let elH = 0;
            for (let p = element; p && p != document.body; p = p.offsetParent)
                elY += p.offsetTop;
            elH = element.offsetHeight;
            if (always || elY + elH > topOfPage + heightOfPage || elY < topOfPage)
                document.documentElement.scrollTop = Math.max(0, elY - (heightOfPage - elH) / 2);
            return elY - document.documentElement.scrollTop;
        }
        DomUtils.centerElement = centerElement;
    })(DomUtils = WebApp.DomUtils || (WebApp.DomUtils = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class Identifier {
        static generate(base) {
            if (!base)
                base = "item";
            if (this._map[base] === undefined)
                this._map[base] = 0;
            this._map[base]++;
            if (this._map[base] == 1)
                return base;
            return base + this._map[base];
        }
    }
    Identifier._map = {};
    WebApp.Identifier = Identifier;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let MathUtils;
    (function (MathUtils) {
        function discretize(value, steps) {
            if (isNaNOrNull(value))
                return undefined;
            return Math.round(value * steps) / steps;
        }
        MathUtils.discretize = discretize;
        function round(value, digits) {
            if (isNaNOrNull(value))
                return undefined;
            return Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
        }
        MathUtils.round = round;
        function exponential(value, weight = 2) {
            if (isNaNOrNull(value))
                return undefined;
            return 1 - Math.pow(1 - value, weight);
        }
        MathUtils.exponential = exponential;
        function isNaNOrNull(a) {
            return isNaN(a) || a === null;
        }
        MathUtils.isNaNOrNull = isNaNOrNull;
        function sumNull(a, b) {
            if (isNaNOrNull(a) && isNaNOrNull(b))
                return undefined;
            if (isNaNOrNull(b))
                return a;
            if (isNaNOrNull(a))
                return b;
            return a + b;
        }
        MathUtils.sumNull = sumNull;
        function divideNull(a, b) {
            if (isNaNOrNull(a) || isNaNOrNull(b) || b == 0)
                return undefined;
            return a / b;
        }
        MathUtils.divideNull = divideNull;
    })(MathUtils = WebApp.MathUtils || (WebApp.MathUtils = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let ObjectUtils;
    (function (ObjectUtils) {
        function isEmpty(value) {
            return value === undefined || value === null || (Array.isArray(value) && value.length == 0);
        }
        ObjectUtils.isEmpty = isEmpty;
        function equals(valueA, valueB) {
            if (Array.isArray(valueA) || Array.isArray(valueB))
                return WebApp.ArrayUtils.equals(valueA, valueB);
            return valueA == valueB;
        }
        ObjectUtils.equals = equals;
        function createInstance(typeName, ...args) {
            const parts = typeName.split(".");
            let curType = window;
            for (let part of parts)
                curType = curType[part];
            return new curType(...args);
        }
        ObjectUtils.createInstance = createInstance;
        function hasProp(obj, propName) {
            return (propName in obj);
        }
        ObjectUtils.hasProp = hasProp;
        function isInstanceOf(obj, type) {
            if (!obj)
                return;
            let curType = ObjectUtils.getType(obj);
            while (curType != null) {
                if (curType == type)
                    return true;
                curType = ObjectUtils.getBaseType(curType);
            }
            return false;
        }
        ObjectUtils.isInstanceOf = isInstanceOf;
        function getOrCreate(obj, propName, value) {
            let desc = Object.getOwnPropertyDescriptor(obj, propName);
            if (!desc) {
                ObjectUtils.createProperty(obj, propName, value);
                return value;
            }
            return ObjectUtils.get(obj, propName);
        }
        ObjectUtils.getOrCreate = getOrCreate;
        function createProperty(obj, propName, value) {
            if (propName.substr(0, 1) == "@") {
                Object.defineProperty(obj, propName, {
                    writable: true,
                    enumerable: false,
                    value: value
                });
            }
            else {
                Object.defineProperty(obj, propName, {
                    value: value
                });
            }
        }
        ObjectUtils.createProperty = createProperty;
        function get(obj, propName, defValue) {
            if (!obj)
                return defValue;
            const value = obj[propName];
            if (value === undefined || value === null)
                return defValue;
            return value;
        }
        ObjectUtils.get = get;
        function set(obj, propName, value) {
            if (propName.substr(0, 1) == "@") {
                const desc = Object.getOwnPropertyDescriptor(obj, propName);
                if (!desc)
                    ObjectUtils.createProperty(obj, propName, value);
                else
                    obj[propName] = value;
            }
            else
                obj[propName] = value;
        }
        ObjectUtils.set = set;
        function setTypeName(obj, name) {
            if (WebApp.TypeCheck.isObject(obj))
                ObjectUtils.set(obj, "@typeName", name);
            else
                ObjectUtils.set(Object.getPrototypeOf(obj), "@typeName", name);
        }
        ObjectUtils.setTypeName = setTypeName;
        function getTypeName(obj) {
            if (!obj)
                return undefined;
            let name = obj["@typeName"];
            if (!name) {
                name = typeof obj;
                if (name == "function")
                    return ObjectUtils.getFunctionName(obj);
                if (name == "object") {
                    const constFunc = obj.constructor;
                    if (constFunc)
                        return ObjectUtils.getTypeName(constFunc);
                }
            }
            return name;
        }
        ObjectUtils.getTypeName = getTypeName;
        function getBaseType(objOrFun) {
            let proto;
            if (WebApp.TypeCheck.isFunction(objOrFun))
                proto = objOrFun.prototype;
            else
                proto = Object.getPrototypeOf(objOrFun);
            return Object.getPrototypeOf(proto).constructor;
        }
        ObjectUtils.getBaseType = getBaseType;
        function getType(typeOrName) {
            if (WebApp.TypeCheck.isString(typeOrName)) {
                const parts = typeOrName.split(".");
                let curObj = self;
                parts.forEach(part => {
                    curObj = curObj[part];
                    if (!curObj)
                        return null;
                });
                return curObj;
            }
            return typeOrName.constructor;
        }
        ObjectUtils.getType = getType;
        function getFunctionName(func) {
            let curName = func["name"];
            if (!curName) {
                const funcNameRegex = /function\s([^(]{1,})\(/;
                const results = (funcNameRegex).exec(func.toString());
                curName = (results && results.length > 1) ? results[1].trim() : "";
            }
            return curName;
        }
        ObjectUtils.getFunctionName = getFunctionName;
        function clone(obj) {
            if (WebApp.TypeCheck.isCloneable(obj))
                return obj.clone();
            return JSON.parse(JSON.stringify(obj));
        }
        ObjectUtils.clone = clone;
    })(ObjectUtils = WebApp.ObjectUtils || (WebApp.ObjectUtils = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let PromiseUtils;
    (function (PromiseUtils) {
        function delay(milliseconds) {
            return new Promise(res => setTimeout(res, milliseconds));
        }
        PromiseUtils.delay = delay;
        ;
    })(PromiseUtils = WebApp.PromiseUtils || (WebApp.PromiseUtils = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let StringUtils;
    (function (StringUtils) {
        function random(length, chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789") {
            let result = "";
            for (let i = 0; i < length; i++)
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            return result;
        }
        StringUtils.random = random;
        function isUpperCase(value) {
            return value.toUpperCase() === value;
        }
        StringUtils.isUpperCase = isUpperCase;
        function repeat(value, count) {
            let result = "";
            for (let i = 0; i < count; i++)
                result += value;
            return result;
        }
        StringUtils.repeat = repeat;
        function padLeft(value, count, char) {
            if (value == null)
                return;
            if (value.length >= count)
                return value;
            return this.repeat(char, count - value.length) + value;
        }
        StringUtils.padLeft = padLeft;
        function padRight(value, count, char) {
            if (value == null)
                return;
            if (value.length >= count)
                return value;
            return value + this.repeat(char, count - value.length);
        }
        StringUtils.padRight = padRight;
        function uuidv4() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        StringUtils.uuidv4 = uuidv4;
    })(StringUtils = WebApp.StringUtils || (WebApp.StringUtils = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class BindableObject {
        prop(propName) {
            return WebApp.Properties.getOrCreate(this, propName);
        }
        static bindValue(value) {
            if (WebApp.Properties.isProperty(value))
                return value.get();
            return value;
        }
        bindConfig(propName, config, converter, onValueChanged) {
            this.bind(propName, config && propName in config ? config[propName] : undefined, converter, onValueChanged);
        }
        bindConfigString(propName, config, configOrUsage, onValueChanged) {
            this.bindString(propName, config && propName in config ? config[propName] : undefined, configOrUsage, onValueChanged);
        }
        computed(propName, compute) {
            return WebApp.Properties.create(this, propName, this.createComputed(compute, propName));
        }
        createComputed(compute, name) {
            if (!this._computedBinder)
                this._computedBinder = new WebApp.Binder(this);
            const prop = new WebApp.ComputedProperty(() => compute(this), name);
            this._computedBinder.bind(compute, () => prop.notifyChanged());
            return prop;
        }
        bind(propName, value, converter, onValueChanged) {
            const prop = WebApp.Properties.getOrCreate(this, propName);
            if (onValueChanged)
                prop.subscribe(onValueChanged);
            if (value !== undefined)
                WebApp.Properties.bind(prop, value, converter);
        }
        bindString(propName, value, configOrUsage, onValueChanged) {
            return this.bind(propName, value, {
                convertTo: a => WebApp.DynamicString.getValue(a, configOrUsage),
                convertFrom: a => a
            }, onValueChanged);
        }
        apply(block) {
            block(this);
            return this;
        }
    }
    WebApp.BindableObject = BindableObject;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class BingMapItem {
        constructor(manager, options) {
            this._manager = manager;
            this.id = options.id;
            this.title = options.title;
            this.description = options.description;
            this.location = options.location;
            this.shape = options.shape;
            this.icon = options.icon;
            this.color = options.color;
        }
        openInfo() {
            this.infoWindow.setOptions({
                visible: true,
                location: this.marker.getLocation()
            });
        }
        closeInfo() {
            this.infoWindow.setOptions({
                visible: false
            });
        }
    }
    WebApp.BingMapItem = BingMapItem;
    class BingMapManager extends WebApp.BindableObject {
        constructor(apiKey) {
            super();
            this._items = [];
            this.isReady = false;
            this.selectedItem = null;
            this.selectionColor = "#000000";
            this._apiKey = apiKey;
            this.prop("selectedItem").subscribe((newVal, oldVal) => {
                if (newVal)
                    newVal.marker.setOptions({ color: this.selectionColor });
                if (oldVal)
                    oldVal.marker.setOptions({ color: oldVal.color });
                this.onSelectionChanged();
            });
        }
        updateSize() {
            let currentCenter = this._map.getCenter();
            this._map.setView({
                center: currentCenter
            });
        }
        staticMap(options) {
            let result = "https://dev.virtualearth.net/REST/v1/Imagery/Map/Road";
            if (options.center) {
                result += "/" + options.center.latitude + "," + options.center.longitude;
                result += "/" + (options.zoomLevel ? options.zoomLevel : 15);
            }
            result += "?";
            if (options.size)
                result += "mapSize=" + options.size.width + "," + options.size.height + "&";
            if (options.pins) {
                options.pins.forEach(pin => {
                    result += "pushpin=" + pin.center.latitude + "," + pin.center.longitude + ";";
                    result += (pin.icon ? pin.icon : 5) + ";";
                    if (pin.name)
                        result += encodeURIComponent(pin.name);
                    result += "&";
                });
            }
            result += "format=PNG&key=" + encodeURIComponent(this._apiKey);
            return result;
        }
        attach(element) {
            this.loadModuleAsync("Microsoft.Maps.SpatialMath");
            this._map = new Microsoft.Maps.Map(element, {
                credentials: this._apiKey,
                zoom: 16,
                showMapTypeSelector: false,
                liteMode: true
            });
            this.isReady = true;
            this.onAttached();
        }
        onAttached() {
        }
        onSelectionChanged() {
        }
        zoomToItems() {
            if (this._items.length == 1) {
                this.centerTo(this._items[0].location);
            }
            else if (this._items.length > 1) {
                const locations = [];
                this._items.forEach(item => locations.push(new Microsoft.Maps.Location(item.location.latitude, item.location.longitude)));
                this._map.setView({
                    bounds: Microsoft.Maps.LocationRect.fromLocations(locations)
                });
            }
        }
        centerToCurrent() {
            if (!navigator.geolocation)
                return;
            navigator.geolocation.getCurrentPosition(pos => {
                this.centerTo({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                });
            });
        }
        centerTo(location) {
            this._map.setView({
                center: new Microsoft.Maps.Location(location.latitude, location.longitude)
            });
        }
        getSearchManagerAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this._searchManager) {
                    yield this.loadModuleAsync("Microsoft.Maps.Search");
                    this._searchManager = new Microsoft.Maps.Search.SearchManager(this._map);
                }
                return this._searchManager;
            });
        }
        getAddressAsync(location) {
            return __awaiter(this, void 0, void 0, function* () {
                let sm = yield this.getSearchManagerAsync();
                return new Promise((res, rej) => {
                    sm.reverseGeocode({
                        location: new Microsoft.Maps.Location(location.latitude, location.longitude),
                        callback: r => {
                            if (r && r.address)
                                res(r.address.formattedAddress);
                            else
                                res(undefined);
                        }
                    });
                });
            });
        }
        getLocationAsync(address) {
            return __awaiter(this, void 0, void 0, function* () {
                let sm = yield this.getSearchManagerAsync();
                return new Promise((res, rej) => {
                    sm.geocode({
                        where: address,
                        bounds: this._map.getBounds(),
                        callback: r => {
                            if (r && r.results && r.results.length > 0)
                                res({ latitude: r.results[0].location.latitude, longitude: r.results[0].location.longitude });
                            else
                                res(undefined);
                        }
                    });
                });
            });
        }
        addItems(itemsOptions) {
            let items = [];
            let entities = [];
            itemsOptions.forEach(options => {
                let item = new BingMapItem(this, options);
                item.marker = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(options.location.latitude, options.location.longitude), {
                    title: options.title,
                    icon: options.icon,
                    color: options.color
                });
                if (options.shape) {
                    if (options.shape.type == WebApp.MapShapeType.Circle) {
                        let shape = Microsoft.Maps.SpatialMath.getRegularPolygon(new Microsoft.Maps.Location(options.location.latitude, options.location.longitude), options.shape.radius ? options.shape.radius : 1, 36, Microsoft.Maps.SpatialMath.DistanceUnits.Meters);
                        let stroke, fill;
                        if (options.shape.style) {
                            stroke = options.shape.style.strokeColor ? Microsoft.Maps.Color.fromHex(options.shape.style.strokeColor) : undefined;
                            if (stroke && options.shape.style.opacity)
                                stroke.a = options.shape.style.opacity * 255;
                            fill = options.shape.style.fillColor ? Microsoft.Maps.Color.fromHex(options.shape.style.fillColor) : undefined;
                            if (fill && options.shape.style.opacity)
                                fill.a = options.shape.style.opacity * 255;
                        }
                        let poly = new Microsoft.Maps.Polygon(shape, {
                            strokeColor: stroke,
                            fillColor: fill,
                            strokeThickness: options.shape.style && options.shape.style.strokeSize ? options.shape.style.strokeSize : undefined,
                        });
                        item.shapeObj = poly;
                    }
                }
                Microsoft.Maps.Events.addHandler(item.marker, "click", () => {
                    this.selectedItem = item;
                });
                entities.push(item.marker);
                if (item.shapeObj)
                    entities.push(item.shapeObj);
                this._items.push(item);
                items.push(item);
            });
            this._map.entities.add(entities);
            return items;
        }
        clear() {
            this._items = [];
            this.map.entities.clear();
        }
        getItemById(id) {
            return WebApp.linq(this._items).first(a => a.id == id);
        }
        removeItem(item) {
            this._items.splice(this._items.indexOf(item), 1);
            this._map.entities.remove(item.marker);
            if (item.infoWindow)
                item.infoWindow.setMap(null);
            if (item.shapeObj)
                this._map.entities.remove(item.shapeObj);
        }
        loadModuleAsync(name) {
            return new Promise((res, rej) => Microsoft.Maps.loadModule(name, () => res()));
        }
        get map() {
            return this._map;
        }
    }
    WebApp.BingMapManager = BingMapManager;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class Binder {
        constructor(model) {
            this._bindings = [];
            this._modelBinders = [];
            this._depBinders = [];
            this.model = model;
        }
        register(binder) {
            this._modelBinders.push(binder);
        }
        registerDependant(binder) {
            this._depBinders.push(binder);
        }
        unregisterDependant(binder) {
            const index = this._depBinders.indexOf(binder);
            if (index != -1)
                this._depBinders.splice(index, 1);
        }
        getBindValue(value) {
            if (typeof value == "function")
                return value(this.model);
            return value;
        }
        bind(value, action) {
            if (typeof value == "function") {
                const binding = {
                    value: value,
                    action: action,
                    subscriptions: [],
                    lastValue: undefined
                };
                this._bindings.push(binding);
                binding.value(this.createProxy(this.model, (obj, propName) => {
                    this.subscribe(obj, propName, binding);
                    return true;
                }));
                const bindValue = binding.value(this.model);
                binding.action(bindValue, undefined, false);
                binding.lastValue = bindValue;
            }
            else
                action(value, undefined, false);
        }
        unsubscribe(binding, cleanValue) {
            binding.subscriptions.forEach(sub => {
                if (WebApp.TypeCheck.isObservableList(sub.source))
                    sub.source.unsubscribe(sub.handler);
                else
                    sub.property.unsubscribe(sub.handler);
            });
            if (cleanValue && binding.lastValue) {
                binding.action(null, binding.lastValue, true, true);
                binding.lastValue = null;
            }
            binding.subscriptions = [];
        }
        subscribe(obj, propName, binding) {
            for (let i = 0; i < binding.subscriptions.length; i++) {
                const sub = binding.subscriptions[i];
                if (sub.source == obj && sub.property.name == propName)
                    return;
            }
            if (WebApp.TypeCheck.isObservableList(obj)) {
                const handler = {
                    onChanged: () => {
                        const bindValue = binding.value(this.model);
                        if (bindValue == binding.lastValue)
                            return;
                        binding.action(bindValue, binding.lastValue, true);
                        binding.lastValue = bindValue;
                    }
                };
                obj.subscribe(handler);
                binding.subscriptions.push({
                    source: obj,
                    property: null,
                    handler: handler
                });
            }
            else {
                const propDesc = Object.getOwnPropertyDescriptor(obj, propName);
                if (!propDesc || (!propDesc.writable && !propDesc.set)) {
                    console.warn("Property ", propName, " for object ", obj, " not exists or is not writeable.");
                    return;
                }
                const prop = WebApp.Properties.getOrCreate(obj, propName);
                const handler = (value, oldValue) => {
                    const bindValue = binding.value(this.model);
                    if (bindValue == binding.lastValue)
                        return;
                    this.unsubscribe(binding, false);
                    binding.value(this.createProxy(this.model, (obj, propName) => {
                        this.subscribe(obj, propName, binding);
                        return true;
                    }));
                    binding.action(bindValue, binding.lastValue, true);
                    binding.lastValue = bindValue;
                };
                prop.subscribe(handler);
                binding.subscriptions.push({
                    source: obj,
                    property: prop,
                    handler: handler
                });
            }
        }
        getBindingProperty(value) {
            if (typeof value != "function")
                return null;
            let lastProp;
            value(this.createProxy(this.model, (obj, propName) => {
                lastProp = {
                    obj: obj,
                    propName: propName
                };
                return true;
            }));
            if (lastProp && lastProp.obj)
                return WebApp.Properties.getOrCreate(lastProp.obj, lastProp.propName);
        }
        createProxy(obj, action) {
            if (!obj || typeof (obj) != "object")
                return obj;
            let propList = [];
            const proxy = {};
            if (WebApp.TypeCheck.isObservableList(obj)) {
                const listProxy = proxy;
                propList.push("count");
                listProxy._innerProxies = {};
                listProxy.get = (index) => {
                    if (!(index in listProxy._innerProxies)) {
                        if (action(obj, index.toString()))
                            listProxy._innerProxies[index] = this.createProxy(obj.get(index), action);
                        else
                            listProxy._innerProxies[index] = obj.get(index);
                    }
                    return listProxy._innerProxies[index];
                };
            }
            else {
                for (let propName in obj) {
                    propList.push(propName);
                }
            }
            for (let propName of propList) {
                let innerProxy;
                let isInit = false;
                let lastValueSet;
                Object.defineProperty(proxy, propName, {
                    get: () => {
                        if (!isInit) {
                            if (action(obj, propName))
                                innerProxy = this.createProxy(obj[propName], action);
                            else
                                innerProxy = obj[propName];
                            isInit = true;
                        }
                        return innerProxy;
                    },
                    set: value => {
                        if (lastValueSet == value)
                            return;
                        if (action(obj, propName))
                            innerProxy = this.createProxy(value, action);
                        else
                            innerProxy = value;
                        lastValueSet = value;
                        isInit = true;
                    }
                });
            }
            return proxy;
        }
        cleanBindings(cleanValue) {
            this._bindings.forEach(binding => this.unsubscribe(binding, cleanValue));
            this._modelBinders.forEach(binder => binder.cleanBindings(cleanValue));
            this._depBinders.forEach(binder => binder.cleanBindings(cleanValue));
            this._modelBinders = [];
            this._bindings = [];
            this._depBinders = [];
        }
        updateModel(model) {
            this.model = model;
            forEachRev(this._bindings, binding => {
                const value = binding.value(model);
                if (binding.lastValue == value)
                    return;
                binding.action(value, binding.lastValue, true);
                binding.lastValue = value;
            });
            forEachRev(this._modelBinders, binder => binder.updateModel(model));
        }
    }
    WebApp.Binder = Binder;
    function forEachRev(items, action) {
        if (!items || items.length == 0)
            return;
        for (let i = items.length - 1; i >= 0; i--)
            action(items[i]);
    }
    WebApp.forEachRev = forEachRev;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ComputedProperty {
        constructor(getter, name) {
            this.isReadOnly = true;
            this.get = getter;
            this.name = name;
        }
        get() {
            throw "Not implemented";
        }
        set(value) {
        }
        notifyChanged() {
            const value = this.get();
            WebApp.forEachRev(this._handlers, handler => handler(value, undefined));
        }
        subscribe(handler) {
            if (!this._handlers)
                this._handlers = [];
            const index = this._handlers.indexOf(handler);
            if (index == -1)
                this._handlers.push(handler);
            return handler;
        }
        unsubscribe(handler) {
            if (!this._handlers)
                return;
            const index = this._handlers.indexOf(handler);
            if (index != -1)
                this._handlers.splice(index, 1);
        }
    }
    WebApp.ComputedProperty = ComputedProperty;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    function model(obj) {
        WebApp.Properties.createAll(obj);
        return obj;
    }
    WebApp.model = model;
    function template(root, template, model) {
        root.innerHTML = "";
        const builder = new WebApp.TemplateBuilder(model, root);
        builder.begin();
        builder.loadTemplate(template)(builder);
        builder.end();
    }
    WebApp.template = template;
    function setEnumerable(obj, propName, proto) {
        const desc = Object.getOwnPropertyDescriptor(proto, propName);
        if (!desc.enumerable) {
            desc.enumerable = true;
            Object.defineProperty(obj, propName, desc);
        }
    }
    WebApp.setEnumerable = setEnumerable;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ObservableList {
        constructor(items, equalityComparer) {
            this._items = [];
            this._items = items || [];
            this.equalityComparer = equalityComparer;
        }
        add(item) {
            this._items.push(item);
            this.invoke(a => a.onItemAdded ? a.onItemAdded(item, this._items.length - 1, "add") : undefined);
            this.invoke(a => a.onChanged ? a.onChanged() : undefined);
            return item;
        }
        addRange(items) {
            for (let item of items) {
                this._items.push(item);
                this.invoke(a => a.onItemAdded ? a.onItemAdded(item, this._items.length - 1, "add") : undefined);
            }
            this.invoke(a => a.onChanged ? a.onChanged() : undefined);
        }
        insert(index, item) {
            this._items.splice(index, 0, item);
            this.invoke(a => a.onItemAdded ? a.onItemAdded(item, index, "insert") : undefined);
            this.invoke(a => a.onChanged ? a.onChanged() : undefined);
            return item;
        }
        remove(item) {
            const index = this.indexOf(item);
            if (index != -1)
                this.removeAt(index);
        }
        removeWhen(condition) {
            for (let i = this._items.length - 1; i >= 0; i--) {
                if (condition(this._items[i]))
                    this.removeAt(i);
            }
        }
        removeRange(startIndex, count) {
            const items = this._items.splice(startIndex, count);
            let isChanged = false;
            for (let i = items.length - 1; i >= 0; i--) {
                this.invoke(a => a.onItemRemoved ? a.onItemRemoved(items[i], startIndex + i, "remove") : undefined);
                isChanged = true;
            }
            if (isChanged)
                this.invoke(a => a.onChanged ? a.onChanged() : undefined);
            return items;
        }
        removeAt(index) {
            const item = this._items.splice(index, 1)[0];
            this.invoke(a => a.onItemRemoved ? a.onItemRemoved(item, index, "remove") : undefined);
            this.invoke(a => a.onChanged ? a.onChanged() : undefined);
            return item;
        }
        clear() {
            if (this._items.length == 0)
                return;
            for (let i = this._items.length - 1; i >= 0; i--)
                this.invoke(a => a.onItemRemoved ? a.onItemRemoved(this._items[i], i, "clear") : undefined);
            this._items.splice(0, this._items.length);
            this.invoke(a => a.onClear ? a.onClear() : undefined);
            this.invoke(a => a.onChanged ? a.onChanged() : undefined);
        }
        contains(item) {
            return this.indexOf(item) != -1;
        }
        indexOf(item) {
            if (this.equalityComparer) {
                for (let i = 0; i < this._items.length; i++) {
                    if (this.equalityComparer(item, this._items[i]))
                        return i;
                }
                return -1;
            }
            return this._items.indexOf(item);
        }
        *[Symbol.iterator]() {
            for (let item of this._items)
                yield item;
        }
        toArray() {
            return this._items;
        }
        get(index) {
            return this._items[index];
        }
        set(index, value) {
            const oldItem = this._items[index];
            if (oldItem == value)
                return;
            this.invoke(a => a.onItemRemoved ? a.onItemRemoved(oldItem, index, "replace") : undefined);
            this._items[index] = value;
            this.invoke(a => a.onItemAdded ? a.onItemAdded(value, index, "replace") : undefined);
            this.invoke(a => a.onItemReplaced ? a.onItemReplaced(value, oldItem, index) : undefined);
            this.invoke(a => a.onChanged ? a.onChanged() : undefined);
        }
        swap(index, newIndex) {
            const temp = this._items[newIndex];
            this._items[newIndex] = this._items[index];
            this._items[index] = temp;
            this.invoke(a => a.onItemSwap ? a.onItemSwap(index, newIndex) : undefined);
            this.invoke(a => a.onChanged ? a.onChanged() : undefined);
        }
        subscribe(handler) {
            if (!this._handlers)
                this._handlers = [];
            const index = this._handlers.indexOf(handler);
            if (index == -1)
                this._handlers.push(handler);
            return handler;
        }
        unsubscribe(handler) {
            if (!this._handlers)
                return;
            const index = this._handlers.indexOf(handler);
            if (index != -1)
                this._handlers.splice(index, 1);
        }
        forEach(action) {
            let index = 0;
            for (let item of this) {
                action(item, index);
                index++;
            }
        }
        invoke(action) {
            if (!this._handlers)
                return;
            this._handlers.forEach(handler => action(handler));
        }
        get count() {
            return this._items.length;
        }
    }
    WebApp.ObservableList = ObservableList;
})(WebApp || (WebApp = {}));
function listOf(items) {
    return new WebApp.ObservableList(items);
}
function observableListOf(items, equalityComparer) {
    return new WebApp.ObservableList(items, equalityComparer);
}
var WebApp;
(function (WebApp) {
    class ObservableProperty {
        constructor(desc, name) {
            this._descriptor = desc;
            this.name = name;
        }
        get() {
            if (this._descriptor.get)
                return this._descriptor.get();
            return this._descriptor.value;
        }
        set(value) {
            const oldValue = this.get();
            if (this._descriptor.set)
                this._descriptor.set(value);
            else
                this._descriptor.value = value;
            if (oldValue != value && this._handlers) {
                WebApp.forEachRev(this._handlers, handler => handler(value, oldValue));
            }
        }
        notifyChanged() {
            const value = this.get();
            WebApp.forEachRev(this._handlers, handler => handler(value, undefined));
        }
        subscribe(handler) {
            if (!this._handlers)
                this._handlers = [];
            const index = this._handlers.indexOf(handler);
            if (index == -1)
                this._handlers.push(handler);
            return handler;
        }
        unsubscribe(handler) {
            if (!this._handlers)
                return;
            const index = this._handlers.indexOf(handler);
            if (index != -1)
                this._handlers.splice(index, 1);
        }
    }
    WebApp.ObservableProperty = ObservableProperty;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let Properties;
    (function (Properties) {
        function converter(obj, propName, convert, convertBack) {
            let conValue;
            return {
                get: () => {
                    if (conValue == undefined)
                        conValue = convert(obj[propName]);
                    return conValue;
                },
                set: value => {
                    conValue = value;
                    if (convertBack)
                        obj[propName] = convertBack(value);
                },
                name: propName
            };
        }
        Properties.converter = converter;
        function create(obj, propName, property) {
            let desc = Object.getOwnPropertyDescriptor(obj, propName);
            if (!desc) {
                console.warn("'", propName, "' not defined in ", WebApp.ObjectUtils.getTypeName(obj));
                desc = {};
            }
            if (!property)
                property = new WebApp.ObservableProperty(desc, propName);
            WebApp.ObjectUtils.getOrCreate(obj, "@props", {})[propName] = property;
            Object.defineProperty(obj, propName, {
                get: () => property.get(),
                set: (newValue) => property.set(newValue)
            });
            return property;
        }
        Properties.create = create;
        function createAll(obj) {
            const props = Object.getOwnPropertyNames(obj);
            props.forEach(propName => {
                if (propName[0] == "_" || propName[0] == "$")
                    return;
                const propDesc = Object.getOwnPropertyDescriptor(obj, propName);
                if (propDesc && !propDesc.writable)
                    return;
                create(obj, propName);
            });
            return obj;
        }
        Properties.createAll = createAll;
        function get(obj, propName) {
            if (WebApp.ObjectUtils.hasProp(obj, "@props")) {
                const prop = obj["@props"][propName];
                if (prop)
                    return prop;
            }
            return undefined;
        }
        Properties.get = get;
        function getOrCreate(obj, propName, property) {
            const prop = get(obj, propName);
            if (prop)
                return prop;
            return create(obj, propName, property);
        }
        Properties.getOrCreate = getOrCreate;
        function isProperty(obj) {
            return (obj && typeof obj == "object" && typeof obj["get"] == "function" && obj["get"].length == 0 && typeof obj["set"] == "function" && obj["set"].length == 1);
        }
        Properties.isProperty = isProperty;
        function isObservableProperty(obj) {
            return obj instanceof WebApp.ObservableProperty || obj instanceof WebApp.ComputedProperty;
        }
        Properties.isObservableProperty = isObservableProperty;
        function bind(dest, src, converter) {
            let value;
            if (isProperty(src)) {
                if (isObservableProperty(src)) {
                    src.subscribe(value => {
                        if (converter)
                            dest.set(converter.convertTo(value));
                        else
                            dest.set(value);
                    });
                }
                dest.subscribe(value => {
                    if (converter)
                        src.set(converter.convertFrom(value));
                    else
                        src.set(value);
                });
                value = src.get();
            }
            else
                value = src;
            if (converter)
                dest.set(converter.convertTo(value));
            else
                dest.set(value);
            return undefined;
        }
        Properties.bind = bind;
    })(Properties = WebApp.Properties || (WebApp.Properties = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class TemplateBuilder extends WebApp.Binder {
        constructor(model, element, parent) {
            super(model);
            this._childCount = 0;
            this._updateCount = 0;
            this._updateNode = null;
            this.element = null;
            this.parent = null;
            this.isInline = false;
            this.inlineMode = "never";
            this.index = 0;
            this.parent = parent;
            this.element = element;
        }
        beginTemplate(model, refNode, refNodePos = "after", marker) {
            const innerBuilder = new TemplateBuilder(model, this.element, this);
            innerBuilder._lastElement = this._lastElement;
            innerBuilder.begin(refNode, refNodePos, marker);
            if (this.inlineMode == "explicit") {
                innerBuilder.isInline = this.isInline;
                innerBuilder.inlineMode = "inherit";
            }
            return innerBuilder;
        }
        endTemplate(childBuilder) {
            childBuilder.end();
            if (childBuilder.element == this.element)
                this._lastElement = childBuilder._lastElement;
        }
        beginUpdate() {
            if (this._updateCount == 0 && this.element.parentNode) {
                this._updateNode = document.createTextNode("");
                this.element.parentNode.replaceChild(this._updateNode, this.element);
            }
            this._updateCount++;
        }
        endUpdate() {
            this._updateCount--;
            if (this._updateCount == 0 && this._updateNode) {
                this._updateNode.parentNode.replaceChild(this.element, this._updateNode);
                this._updateNode = null;
            }
        }
        begin(refNode, refNodePos, marker) {
            this._startElement = marker ? document.createComment("begin-" + marker) : document.createTextNode("");
            if (refNode) {
                if (refNodePos == "after") {
                    if (!refNode.nextSibling)
                        refNode.parentNode.appendChild(this._startElement);
                    else
                        refNode.parentNode.insertBefore(this._startElement, refNode.nextSibling);
                }
                else if (refNodePos == "before")
                    refNode.parentNode.insertBefore(this._startElement, refNode);
                else if (refNodePos == "inside")
                    refNode.appendChild(this._startElement);
            }
            else
                this.appendChild(this._startElement);
            this._lastElement = this._startElement;
            return this;
        }
        end() {
            if (this._endElement)
                return;
            if (this._startElement.nodeType == Node.COMMENT_NODE)
                this._endElement = document.createComment(this._startElement.textContent.replace("begin-", "end-"));
            else
                this._endElement = document.createTextNode("");
            this.appendChild(this._endElement);
            return this;
        }
        clear(remove = false) {
            this._childCount = 0;
            if (!this._endElement) {
                console.warn("Missing end element: " + this.model);
                this.end();
            }
            let curNode = this._endElement;
            while (true) {
                let mustDelete = true;
                if ((curNode == this._startElement || curNode == this._endElement) && !remove)
                    mustDelete = false;
                const prev = curNode.previousSibling;
                if (mustDelete) {
                    if (mustDelete)
                        curNode.parentNode.removeChild(curNode);
                }
                if (curNode == this._startElement)
                    break;
                curNode = prev;
            }
            if (remove) {
                this._endElement = null;
                this._startElement = null;
                this._lastElement = null;
            }
            else
                this._lastElement = this._startElement;
            this.cleanBindings(true);
            return this;
        }
        appendChild(node) {
            if (!this._lastElement || !this._lastElement.parentNode)
                this.element.appendChild(node);
            else {
                if (this._lastElement.nextSibling)
                    this._lastElement.parentNode.insertBefore(node, this._lastElement.nextSibling);
                else
                    this._lastElement.parentNode.appendChild(node);
            }
            this._lastElement = node;
            return this;
        }
        foreach(selector, templateOrName) {
            const value = this.getBindValue(selector);
            if (Array.isArray(value) || !value)
                this.foreachArray(selector, templateOrName);
            else
                this.foreachList(selector, templateOrName);
            return this;
        }
        foreachList(selector, templateOrName) {
            let itemsBuilders = [];
            const template = this.loadTemplate(templateOrName);
            const marker = document.createTextNode("");
            this.appendChild(marker);
            let handler = {
                onClear: () => {
                    itemsBuilders.forEach(a => a.clear(true));
                    itemsBuilders = [];
                },
                onItemRemoved: (item, index, reason) => {
                    if (reason == "replace" || reason == "clear")
                        return;
                    itemsBuilders[index].clear(true);
                    itemsBuilders.splice(index, 1);
                },
                onItemSwap: (index, newIndex) => {
                },
                onItemReplaced: (newItem, oldItem, index) => {
                    itemsBuilders[index].updateModel(newItem);
                },
                onItemAdded: (item, index, reason) => {
                    if (reason == "replace")
                        return;
                    let itemBuilder;
                    if (index == itemsBuilders.length) {
                        if (index == 0)
                            itemBuilder = this.beginTemplate(item, marker, "after", this.createMarker(item));
                        else
                            itemBuilder = this.beginTemplate(item, itemsBuilders[index - 1]._endElement, "after", this.createMarker(item));
                        itemsBuilders.push(itemBuilder);
                    }
                    else {
                        itemBuilder = this.beginTemplate(item, itemsBuilders[index]._startElement, "before", this.createMarker(item));
                        itemsBuilders.splice(index, 0, itemBuilder);
                    }
                    itemBuilder.index = index;
                    template(itemBuilder);
                    this.endTemplate(itemBuilder);
                }
            };
            this.bind(selector, (value, oldValue, isUpdate, isClear) => {
                if (isClear)
                    return;
                this.beginUpdate();
                if (isUpdate)
                    handler.onClear();
                if (oldValue)
                    oldValue.unsubscribe(handler);
                if (value) {
                    value.subscribe(handler);
                    for (let i = 0; i < value.count; i++)
                        handler.onItemAdded(value.get(i), i, "add");
                }
                this.endUpdate();
            });
            return this;
        }
        foreachArray(selector, templateOrName) {
            let itemsBuilders = [];
            const template = this.loadTemplate(templateOrName);
            const marker = document.createTextNode("");
            this.appendChild(marker);
            this.bind(selector, (value, oldValue, isUpdate, isClear) => {
                if (isClear)
                    return;
                if (isUpdate) {
                    itemsBuilders.forEach(a => a.clear());
                    itemsBuilders = [];
                }
                if (value) {
                    this._lastElement = marker;
                    this.beginUpdate();
                    value.forEach(item => {
                        const itemBuilder = this.beginTemplate(item);
                        itemBuilder.index = itemsBuilders.length;
                        template(itemBuilder);
                        this.endTemplate(itemBuilder);
                        itemsBuilders.push(itemBuilder);
                    });
                    this.endUpdate();
                }
            });
            return this;
        }
        if(condition, trueTemplate, falseTemplate) {
            const childBuilder = this.beginTemplate(this.model);
            this.register(childBuilder);
            this.bind(condition, (value, oldValue, isUpdate, isClear) => {
                if (isClear)
                    return;
                if (isUpdate)
                    childBuilder.clear();
                if (value)
                    childBuilder.template(trueTemplate);
                else if (falseTemplate)
                    childBuilder.template(falseTemplate);
            });
            this.endTemplate(childBuilder);
            return this;
        }
        replaceContent(nodes) {
            if (this.isInline)
                throw "'replaceContent' not supported in inline elements";
            this.clear();
            for (let node of nodes)
                this.appendChild(node);
        }
        extractContent() {
            const result = [];
            for (let child of WebApp.linq(this.element.childNodes)) {
                if (child != this._startElement && child != this._endElement)
                    result.push(child);
            }
            return result;
        }
        content(content, inline = false) {
            const childBuilder = this.beginTemplate(undefined, undefined, undefined, this.createMarker(content));
            childBuilder.isInline = inline;
            childBuilder.inlineMode = "explicit";
            this.bind(content, (value, oldValue, isUpdate, isClear) => {
                if (isClear)
                    return;
                this.beginUpdate();
                if (!childBuilder.isInline && WebApp.TypeCheck.isHTMLContainer(value) && value.nodes && value.isCacheEnabled === true)
                    childBuilder.replaceContent(value.nodes);
                else {
                    if (oldValue && value && oldValue.template == value.template)
                        childBuilder.updateModel(value);
                    else {
                        if (isUpdate)
                            childBuilder.clear();
                        if (value) {
                            const template = this.templateFor(value);
                            if (!template)
                                throw "Template '" + value.template + "' not found.";
                            childBuilder.updateModel(value);
                            template(childBuilder);
                        }
                    }
                    if (WebApp.TypeCheck.isHTMLContainer(value) && value.isCacheEnabled === true)
                        value.nodes = this.extractContent();
                }
                this.endUpdate();
            });
            this.endTemplate(childBuilder);
            return this;
        }
        templateFor(value) {
            if (typeof value == "string" || typeof value == "number")
                return this.loadTemplate("Text");
            if (typeof value == "object" && "template" in value)
                return this.loadTemplate(value.template);
            throw "cannot determine template for model";
        }
        loadTemplate(templateOrName) {
            if (typeof templateOrName == "string") {
                const result = WebApp.templateCatalog[templateOrName];
                if (!result)
                    console.error("Template ", templateOrName, " not found.");
                return result;
            }
            return templateOrName;
        }
        template(templateOrName, model) {
            const template = this.loadTemplate(templateOrName);
            if (model) {
                const childBuilder = this.beginTemplate(undefined, undefined, undefined, this.createMarker(model, "template"));
                this.bind(model, (value, oldValue, isUpdate, isClear) => {
                    if (isClear)
                        return;
                    childBuilder.updateModel(value);
                    if (!isUpdate)
                        template(childBuilder);
                });
                this.endTemplate(childBuilder);
            }
            else
                template(this);
            return this;
        }
        exec(action) {
            action(this);
            return this;
        }
        beginChild(name) {
            if (this.isInline && this._childCount > 0)
                throw "In inline mode you must have a single root element for your template";
            const childElement = this.isInline && name.toUpperCase() == this.element.tagName ? this.element : document.createElement(name);
            const childBuilder = new ChildTemplateBuilder(this.model, childElement, this);
            if (childElement == this.element)
                childBuilder._lastElement = this._lastElement;
            this.register(childBuilder);
            this._childCount++;
            return childBuilder;
        }
        child(name, builderOrAttributes) {
            const childBuilder = new TemplateBuilder(this.model, document.createElement(name), this);
            this.register(childBuilder);
            if (typeof builderOrAttributes == "function")
                builderOrAttributes(childBuilder);
            else
                childBuilder.attribs(builderOrAttributes);
            this.appendChild(childBuilder.element);
            return this;
        }
        set(attribute, value) {
            this.bind(value, a => {
                if (a !== null && a !== undefined)
                    this.element.setAttribute(attribute, a);
                else
                    this.element.removeAttribute(attribute);
            });
            return this;
        }
        on(event, handler) {
            this.element.addEventListener(event, ev => handler(this.model, ev));
            return this;
        }
        class(name, condition) {
            if (condition) {
                const nameParts = name ? name.split(" ") : [];
                this.bind(condition, value => {
                    if (value)
                        nameParts.forEach(a => this.element.classList.add(a));
                    else
                        nameParts.forEach(a => this.element.classList.remove(a));
                });
            }
            else
                this.bind(name, (value, oldValue) => {
                    if (oldValue)
                        oldValue.split(" ").forEach(item => this.element.classList.remove(item));
                    if (value)
                        value.split(" ").forEach(item => this.element.classList.add(item));
                });
            return this;
        }
        visible(value) {
            this.bind(value, (newValue, oldValue, isUpdate, isClear) => {
                if (isClear)
                    return;
                if (newValue) {
                    this.element.classList.add("visible");
                    this.element.classList.remove("hidden");
                }
                else {
                    this.element.classList.add("hidden");
                    this.element.classList.remove("visible");
                }
            });
            return this;
        }
        text(value) {
            const textNode = document.createTextNode("");
            this.appendChild(textNode);
            this.bind(value, a => textNode.textContent = a);
            return this;
        }
        html(value) {
            this.bind(value, a => this.element.innerHTML = a);
            return this;
        }
        focus(value) {
            const valueProp = this.getBindingProperty(value);
            if (valueProp) {
                this.element.addEventListener("focus", ev => valueProp.set(true));
                this.element.addEventListener("focusout", ev => valueProp.set(false));
            }
            this.bind(value, a => {
                if (a && document.activeElement != this.element)
                    this.element.focus();
            });
            return this;
        }
        value(value) {
            const element = this.element;
            const valueProp = this.getBindingProperty(value);
            if (valueProp) {
                if (element.tagName == "INPUT" || element.tagName == "TEXTAREA") {
                    if (element.type == "checkbox" || element.type == "radio")
                        element.addEventListener("change", ev => {
                            valueProp.set(element.checked);
                        });
                    else {
                        element.addEventListener("keyup", ev => {
                            valueProp.set(element.value);
                        });
                        element.addEventListener("change", ev => {
                            valueProp.set(element.value);
                        });
                    }
                }
                else if (element.tagName == "SELECT") {
                    element.addEventListener("change", ev => {
                        valueProp.set(element.value);
                    });
                }
            }
            if (element.tagName == "INPUT" || element.tagName == "TEXTAREA" || element.tagName == "SELECT") {
                if (element.type == "checkbox" || element.type == "radio")
                    this.bind(value, (a) => element.checked = a);
                else
                    this.bind(value, (a) => a ? element.value = a : element.value = null);
            }
            return this;
        }
        style(name, value) {
            this.bind(value, a => this.element.style[name] = a);
            return this;
        }
        behavoir(nameOrValue) {
            if (typeof nameOrValue == "string")
                WebApp.behavoirCatalog[nameOrValue]().attach(this.element, this.model);
            else
                nameOrValue.attach(this.element, this.model);
            return this;
        }
        styles(value) {
            for (let name in value)
                this.bind(value[name], a => this.element.style[name] = a);
            return this;
        }
        attribs(value) {
            for (let name in value)
                this.set(name, value[name]);
            return this;
        }
        debugger() {
            debugger;
            return this;
        }
        createMarker(obj, baseName = "") {
            return undefined;
            if (typeof obj == "function")
                return this.createMarker(obj(this.model), baseName);
            if (typeof obj == "string")
                return baseName + obj;
            if (obj == null)
                return baseName + "null";
            return this.createMarker(WebApp.ObjectUtils.getTypeName(obj), baseName);
        }
    }
    WebApp.TemplateBuilder = TemplateBuilder;
    class ChildTemplateBuilder extends TemplateBuilder {
        constructor(model, element, parent) {
            super(model, element, parent);
        }
        endChild() {
            if (this.parent.element != this.element)
                this.parent.appendChild(this.element);
            else {
                if (this._lastElement)
                    this.parent["_lastElement"] = this._lastElement;
            }
            return this.parent;
        }
    }
    WebApp.templateCatalog = {};
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    WebApp.behavoirCatalog = {};
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class BaseSearch {
        searchAsync(query, chunkSize = 25) {
            if (!query)
                query = "";
            let queryParts = WebApp.linq(query.toLowerCase().split(" ")).select(a => a.trim()).where(a => a != "").toArray();
            let result = [];
            if (queryParts.length > 0)
                this.doSearch(queryParts, result);
            return WebApp.linq(result).orderByDesc(a => a.rank).select(a => a.value).toArrayAsync(chunkSize);
        }
        macthWeight(keyword, text) {
            if (!text)
                return 0;
            if (typeof text != "string")
                text = text.toString();
            text = text.toLowerCase();
            const index = text.indexOf(keyword);
            if (index == -1)
                return 0;
            return (text.length == keyword.length ? 1 : (text.length - keyword.length - index) / (text.length - keyword.length)) +
                (text.length - keyword.length) / text.length;
        }
        matchValue(value, queryParts) {
            var _a;
            if (queryParts.length == 0)
                return 1;
            let totWeight = 0;
            for (let qPart of queryParts) {
                let partWeight = 0;
                for (let valuePart of this.getSearchParts(value))
                    partWeight += (_a = this.macthWeight(qPart, valuePart.text) * valuePart.weight) !== null && _a !== void 0 ? _a : 1;
                if (partWeight == 0)
                    return 0;
                totWeight += partWeight;
            }
            return totWeight;
        }
    }
    WebApp.BaseSearch = BaseSearch;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class HistoryPageHost {
        constructor(innerHost) {
            this._isSyncing = false;
            this._backSignal = new WebApp.Signal();
            this.innerHost = innerHost;
            this._startHistoryIndex = window.history.length;
            this._sessionId = new Date().getTime().toString();
            window.addEventListener("popstate", ev => this.onPopState(ev.state));
        }
        onPopState(state) {
            return __awaiter(this, void 0, void 0, function* () {
                console.debug("begin popState: ", state, " isSyncing: ", this._isSyncing);
                if (this._isSyncing)
                    return;
                if (state)
                    yield this.goToAsync(state.index);
                this._backSignal.set();
                console.debug("end popState: ", state);
            });
        }
        onStateChanged(page) {
            if (this._isSyncing)
                return;
            if (page == this.current)
                this.updateState();
        }
        updateState(isNew = false) {
            const title = WebApp.app.formatTitle(this.current.title);
            const url = this.current.url ? WebApp.Uri.absolute(WebApp.Format.replaceArgs(this.current.url, WebApp.app.startupArgs)) : null;
            if (isNew) {
                const curState = {
                    sessionId: this._sessionId,
                    index: this.currentIndex
                };
                window.history.pushState(curState, title, url);
            }
            else
                window.history.replaceState(window.history.state, title, url);
            document.title = title;
        }
        clearAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.innerHost.clearAsync();
                yield this.syncHistoryAsync();
                this._isSyncing = true;
                window.history.pushState(null, null, null);
                window.history.go(-1);
                this._isSyncing = false;
            });
        }
        get(index) {
            return this.innerHost.get(index);
        }
        goBackAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.pageCount > 1) {
                    console.debug("begin goBack");
                    this._backSignal.reset();
                    window.history.back();
                    const waitRes = yield this._backSignal.waitFor(WebApp.TimeSpan.fromMilliseconds(500));
                    console.debug("end goBack: ", waitRes);
                }
                else {
                    yield this.clearAsync();
                    yield WebApp.app.mainAsync();
                }
            });
        }
        goForwardAsync() {
            window.history.forward();
            return Promise.resolve();
        }
        goToAsync(index) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.innerHost.goToAsync(index);
                this.updateState();
            });
        }
        syncHistoryAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this._isSyncing)
                    return;
                this._isSyncing = true;
                try {
                    let curState = window.history.state;
                    while (curState && curState.sessionId == this._sessionId && curState.index > 0) {
                        yield this.goBackAsync();
                        curState = window.history.state;
                    }
                    let curIndex = 0;
                    while (curIndex < this.pageCount) {
                        const curPage = this.get(curIndex);
                        const title = WebApp.app.formatTitle(curPage.title);
                        const url = curPage.url ? WebApp.Uri.absolute(WebApp.Format.replaceArgs(curPage.url, WebApp.app.startupArgs)) : null;
                        curState = {
                            sessionId: this._sessionId,
                            index: curIndex
                        };
                        if (curIndex == 0)
                            window.history.replaceState(curState, title, url);
                        else
                            window.history.pushState(curState, title, url);
                        if (curIndex == this.currentIndex)
                            document.title = title;
                        curIndex++;
                    }
                    const delta = this.currentIndex - (this.pageCount - 1);
                    if (delta < 0)
                        window.history.go(delta);
                }
                finally {
                    this._isSyncing = false;
                }
            });
        }
        loadAsync(page, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const curState = window.history.state;
                const inSync = curState && curState.sessionId == this._sessionId && curState.index == this.currentIndex;
                yield this.innerHost.loadAsync(page, options);
                page.prop("title").subscribe(a => this.onStateChanged(page));
                page.prop("url").subscribe(a => this.onStateChanged(page));
                page.host = this;
                if (inSync)
                    this.updateState(true);
                else
                    yield this.syncHistoryAsync();
                return page;
            });
        }
        find(nameOrType) {
            return this.innerHost.find(nameOrType);
        }
        bringFrontAsync(page) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.innerHost.bringFrontAsync(page);
                yield this.syncHistoryAsync();
            });
        }
        get currentIndex() {
            return this.innerHost.currentIndex;
        }
        set setCurrentIndex(value) {
            this.innerHost.currentIndex = value;
            this.syncHistoryAsync();
        }
        get current() {
            return this.innerHost.current;
        }
        get pageCount() {
            return this.innerHost.pageCount;
        }
        get canGoBack() {
            return this.innerHost.canGoBack || WebApp.app.hasMain;
        }
    }
    WebApp.HistoryPageHost = HistoryPageHost;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class View extends WebApp.BindableObject {
        constructor(config) {
            super();
            this.template = null;
            this.parentView = null;
            this.bindConfig("template", config);
            if (!this.template)
                this.template = WebApp.ObjectUtils.getTypeName(this);
            if (config) {
                if (config.parentView)
                    this.parentView = config.parentView;
            }
        }
    }
    WebApp.View = View;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class OperationView extends WebApp.View {
        constructor(config) {
            super(config);
            this.subOperations = listOf();
            this.message = null;
            this.parentOperation = null;
            this.bindConfig("message", config);
            if (!config.type)
                this._type = WebApp.OperationType.Global;
            else
                this._type = config.type;
            this.parentOperation = config.parentOperation;
        }
        end() {
            WebApp.Operation.end(this);
        }
        get type() {
            return this._type;
        }
        get progress() {
            return this._progress;
        }
        set progress(value) {
            this._progress = value;
            if (this._progress) {
                console.log(this.getProgressDescription(this._progress));
                if (this._progress.message)
                    this.message = this._progress.message;
            }
            else
                this.message = undefined;
        }
        addSubOperation(operation) {
            this.subOperations.add(operation);
        }
        removeSubOperation(operation) {
            this.subOperations.remove(operation);
        }
        getProgressDescription(value) {
            let msg = "Progress: ";
            if (value.message)
                msg += "'" + value.message + "'";
            if (value.current != null && value.totCount != null)
                msg += " - " + value.current + "/" + value.totCount + " (" + Math.round(100 / value.totCount * value.current) + "%)";
            return msg;
        }
    }
    class OperationManager {
        constructor() {
            this._localCount = 0;
            this.operations = listOf();
            this.onBegin = WebApp.event();
            this.onEnd = WebApp.event();
            this.onProgress = WebApp.event();
        }
        progress(progress) {
            if (WebApp.TypeCheck.isString(progress))
                progress = { message: progress };
            if (this.current)
                this.current.progress = progress;
        }
        begin(configOrMessge) {
            if (WebApp.TypeCheck.isString(configOrMessge))
                configOrMessge = { message: configOrMessge };
            const operation = new OperationView(configOrMessge);
            console.group("Begin operation: ", WebApp.DynamicString.getValue(operation.message));
            operation.progress = configOrMessge;
            if (operation.parentOperation === undefined)
                operation.parentOperation = this.current;
            this.operations.add(operation);
            if (operation.parentOperation)
                operation.parentOperation.addSubOperation(operation);
            if (operation.type == WebApp.OperationType.Local)
                this._localCount++;
            else
                WebApp.app.block();
            return operation;
        }
        end(operation) {
            console.groupEnd();
            console.log("End operation: ", WebApp.DynamicString.getValue(operation.message));
            this.operations.remove(operation);
            if (operation.parentOperation)
                operation.parentOperation.removeSubOperation(operation);
            if (operation.type == WebApp.OperationType.Local)
                this._localCount--;
            else
                WebApp.app.unblock();
        }
        get current() {
            return this.operations.count > 0 ? this.operations.get(this.operations.count - 1) : null;
        }
    }
    WebApp.Operation = new OperationManager();
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class SelectionManager extends WebApp.BindableObject {
        constructor() {
            super();
            this.selectedItems = observableListOf();
            this.actions = observableListOf();
            this.selectionText = null;
            this.isActive = false;
            this.selectedItems.subscribe({
                onChanged: () => {
                    this.updateView();
                    if (this.selectedItems.count == 0)
                        this.close();
                }
            });
        }
        close() {
            this.isActive = false;
            for (var i = this.selectedItems.count - 1; i >= 0; i--)
                this.selectedItems.get(i).isSelected = false;
            this.selectedItems.clear();
            this.actions.clear();
            this.updateView();
        }
        open() {
            this.isActive = true;
        }
        addAction(action) {
            const result = WebApp.ActionView.fromItemAction(action, () => this.selectedItems.toArray());
            this.actions.add(result);
            return result;
        }
        updateView() {
            this.selectionText = WebApp.DynamicString.getValue("selection-count", { params: [this.selectedItems.count], cardinality: this.selectedItems.count });
        }
    }
    WebApp.SelectionManager = SelectionManager;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ViewApplication extends WebApp.BindableObject {
        constructor() {
            super();
            this._blockCount = 0;
            this.pageHost = null;
            this.appName = null;
            this.view = null;
            this.language = null;
            this.prop("language").subscribe(() => this.updateLanguage());
        }
        runAsync(baseUrl, args) {
            return __awaiter(this, void 0, void 0, function* () {
                window.addEventListener("error", ev => this.handleError(ev.srcElement, ev.error, ev.message));
                this._startupArgs = args;
                this._baseUrl = baseUrl;
                if (this._baseUrl.length == 0 || this._baseUrl[this._baseUrl.length - 1] != "/")
                    this._baseUrl += "/";
                this.initServices();
                yield this.configureServicesAsync();
                if (this.isSelfHosted) {
                    this.pageHost = new WebApp.SelfHostedPageHost();
                    this.view = this.pageHost;
                }
                else {
                    this.pageHost = new WebApp.HistoryPageHost(this.createPageHost());
                    this.view = this.pageHost.innerHost;
                }
                WebApp.Services.pageHost = this.pageHost;
                document.title = this.appName;
                WebApp.template(document.body, this.view.template, this.view);
                this.onStarted();
            });
        }
        updateLanguage() {
            document.documentElement.lang = this.language;
            WebApp.StringTable.currentConfig = {
                language: this.language
            };
        }
        onStarted() {
        }
        handleError(source, error, message) {
            console.error("Source: ", source, "Error: ", error, "Message: ", message);
        }
        formatTitle(title) {
            if (this.appName && title)
                return this.appName + " - " + title;
            if (title)
                return title;
            return this.appName;
        }
        createPageHost() {
            return new WebApp.SlidePageHost();
        }
        initServices() {
            WebApp.Services.application = this;
            WebApp.Services.pageManager = new WebApp.DynamicPageManager();
            WebApp.Services.httpClient = new WebApp.XHRHttpClient();
            WebApp.Services.cache = new WebApp.LocalStorageCache();
            WebApp.Services.itemsObserver = new WebApp.ItemsObserver();
            WebApp.Services.dbStorage = new WebApp.DbStorage();
            WebApp.behavoirCatalog["attach"] = () => WebApp.AttachBehavoir.instance;
            WebApp.behavoirCatalog["ripple"] = () => WebApp.RippleClickBehavoir.instance;
            WebApp.behavoirCatalog["vibrate"] = () => WebApp.VibrateClickBehavoir.instance;
            WebApp.behavoirCatalog["scroll-check"] = () => WebApp.ScrollCheckBehavoir.instance;
            WebApp.behavoirCatalog["long-press"] = () => new WebApp.LongPressBehavoir();
        }
        configureServicesAsync() {
            return Promise.resolve();
        }
        block() {
            this._blockCount++;
            if (!this._blocker) {
                this._blocker = new WebApp.Blocker();
                setTimeout(() => this.restoreBlock());
            }
            else
                this.restoreBlock();
        }
        restoreBlock() {
            if (this._blockCount > 0 && this._blocker.status != "show" && this._blocker.status != "showing")
                this._blocker.showAsync();
        }
        unblock(force = false) {
            if (!this._blocker)
                return;
            if (force) {
                if (this._blocker.status == "show" || this._blocker.status == "showing")
                    this._blocker.hideAsync();
            }
            else {
                if (--this._blockCount <= 0)
                    this._blocker.hideAsync();
            }
        }
        mainAsync() {
            return Promise.resolve(null);
        }
        get baseUrl() {
            return this._baseUrl;
        }
        set baseUrl(value) {
            this._baseUrl = value;
        }
        get startupArgs() {
            return this._startupArgs;
        }
        get isSelfHosted() {
            return window.parent != window && window.parent["WebApp"] && window.parent["WebApp"]["app"];
        }
        get hasMain() {
            return false;
        }
    }
    WebApp.ViewApplication = ViewApplication;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let ActionPriority;
    (function (ActionPriority) {
        ActionPriority[ActionPriority["Primary"] = 0] = "Primary";
        ActionPriority[ActionPriority["Secondary"] = 1] = "Secondary";
        ActionPriority[ActionPriority["Evidence"] = 2] = "Evidence";
    })(ActionPriority = WebApp.ActionPriority || (WebApp.ActionPriority = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let MapShapeType;
    (function (MapShapeType) {
        MapShapeType[MapShapeType["None"] = 0] = "None";
        MapShapeType[MapShapeType["Circle"] = 1] = "Circle";
    })(MapShapeType = WebApp.MapShapeType || (WebApp.MapShapeType = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let PageHostMode;
    (function (PageHostMode) {
        PageHostMode[PageHostMode["Default"] = 0] = "Default";
        PageHostMode[PageHostMode["WebView"] = 1] = "WebView";
    })(PageHostMode = WebApp.PageHostMode || (WebApp.PageHostMode = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class Page extends WebApp.BindableObject {
        constructor(config) {
            super();
            this.url = null;
            this.host = null;
            this.view = null;
            this.title = null;
            this.subTitle = null;
            this.name = null;
            this.status = "notloaded";
            this.args = null;
            this.bindConfig("url", config);
            this.bindConfigString("title", config);
            this.bindConfigString("subTitle", config);
            this.bindConfig("view", config);
            if (config) {
                if (config.name)
                    this.name = config.name;
            }
        }
        getState() {
            return {};
        }
        setState(state) {
        }
        handleError(source, error) {
            WebApp.app.handleError(source, error);
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.status == "notloaded" || this.status == "error") {
                    let op = WebApp.Operation.begin({ message: "Loading page: " + (this.title ? this.title : (this.url ? this.url : WebApp.ObjectUtils.getTypeName(this))) });
                    this.status = "loading";
                    try {
                        yield this.loadWorkAsync();
                    }
                    catch (e) {
                        this.status = "error";
                        WebApp.app.handleError(this, e);
                    }
                    finally {
                        op.end();
                        this.status = "loaded";
                    }
                }
            });
        }
        loadWorkAsync() {
            return Promise.resolve();
        }
        refreshAsync() {
            return Promise.resolve();
        }
        closeAsync(result) {
            return __awaiter(this, void 0, void 0, function* () {
                if ("goBackAsync" in this.host)
                    yield this.host.goBackAsync();
                this.status = "closed";
                return true;
            });
        }
    }
    WebApp.Page = Page;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class Activity extends WebApp.Page {
        constructor(config) {
            super(config);
            this._viewItems = [];
            this.view = new WebApp.Panel({ name: WebApp.ViewUtils.formatForCss(WebApp.ObjectUtils.getTypeName(this)), styles: ["vertical", "activity", "page", "relative"] });
            if (this.name)
                this.view.styles.push(this.name);
        }
        get result() {
            return new Promise(res => this._resultResolve = res);
        }
        activateAsync() {
            return Promise.resolve();
        }
        deactivateAsync() {
            return Promise.resolve();
        }
        closeAsync(result) {
            return __awaiter(this, void 0, void 0, function* () {
                const closeResult = yield WebApp.Page.prototype.closeAsync.call(this, result);
                if (this._resultResolve)
                    this._resultResolve(result);
                return closeResult;
            });
        }
        loadWorkAsync() {
            return this.createAsync();
        }
        createAsync() {
            return Promise.resolve();
        }
        static isActivity(obj) {
            return WebApp.ObjectUtils.isInstanceOf(obj, Activity);
        }
    }
    WebApp.Activity = Activity;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let ContentSelector;
    (function (ContentSelector) {
        ContentSelector[ContentSelector["Manual"] = 1] = "Manual";
        ContentSelector[ContentSelector["Tabs"] = 2] = "Tabs";
        ContentSelector[ContentSelector["BottomNav"] = 3] = "BottomNav";
    })(ContentSelector = WebApp.ContentSelector || (WebApp.ContentSelector = {}));
    class ContentActivity extends WebApp.Activity {
        constructor(config) {
            super(config);
            this._isContentLoaded = false;
            this._selector = ContentSelector.Tabs;
            this.activeContent = null;
            this.activeContentProvider = null;
            this.providers = [];
            this.menu = null;
            this.actions = [];
            this.floatingStyle = ["vertical", "item-absolute", "bottom", "fill-h", "center-items-h"];
            this.contentStyle = ["vertical", "scroll"];
            this.bindConfig("activeContent", config);
            if (config) {
                if (config.providers)
                    this.providers = config.providers;
                if (config.menu)
                    this.menu = config.menu;
                if (config.selector)
                    this._selector = config.selector;
                if (config.actions)
                    this.actions = config.actions;
            }
            this.prop("host").subscribe(() => {
                var _a, _b;
                if (((_a = this._actionBar) === null || _a === void 0 ? void 0 : _a.mainAction) == "none" && ((_b = this.host) === null || _b === void 0 ? void 0 : _b.canGoBack))
                    this._actionBar.mainAction = "back";
            });
        }
        closeAsync(result) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                if ((_a = this.activeContentProvider) === null || _a === void 0 ? void 0 : _a.deactivateAsync)
                    yield this.activeContentProvider.deactivateAsync();
                return yield WebApp.Activity.prototype.closeAsync.call(this, result);
            });
        }
        activateAsync() {
            var _a, _b;
            if (!this._isContentLoaded)
                return this.refreshAsync();
            if ((_a = this.activeContentProvider) === null || _a === void 0 ? void 0 : _a.activateAsync)
                return (_b = this.activeContentProvider) === null || _b === void 0 ? void 0 : _b.activateAsync("refresh");
            return Promise.resolve();
        }
        deactivateAsync() {
            var _a;
            if ((_a = this.activeContentProvider) === null || _a === void 0 ? void 0 : _a.deactivateAsync)
                return this.activeContentProvider.deactivateAsync();
            return Promise.resolve();
        }
        refreshAsync() {
            if (this.activeContentProvider)
                return this.loadContentAsync(this.activeContentProvider, true);
            return this.loadActiveContentAsync(true);
        }
        notifyContentChanged(provider) {
            this.loadContentAsync(provider, true);
        }
        startSelection() {
            return this._actionBar.startSelection();
        }
        loadActiveContentAsync(force) {
            this.activeContentProvider = WebApp.linq(this.providers).first(a => a.info.name == this.activeContent);
            return this.loadContentAsync(this.activeContentProvider, force);
        }
        loadWorkAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.createAsync();
                if (this.activeContentProvider)
                    this.activeContent = this.activeContentProvider.info.name;
            });
        }
        loadContentAsync(provider, force) {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                const isContentChanged = this.activeContentProvider != provider;
                if (!isContentChanged && !force)
                    return;
                if (isContentChanged && ((_a = this.activeContentProvider) === null || _a === void 0 ? void 0 : _a.deactivateAsync))
                    (_b = this.activeContentProvider) === null || _b === void 0 ? void 0 : _b.deactivateAsync();
                this.activeContentProvider = provider;
                if (!force && (this.status == "notloaded" || this.status == "loading" || this.status == "closed")) {
                    console.debug("Skip loading content: " + provider.info.name);
                    return;
                }
                const op = WebApp.Operation.begin({ message: "Loading content: " + provider.info.name });
                try {
                    const content = yield provider.getContentAsync(this);
                    this.title = this.formatTitle(WebApp.DynamicString.getValue(content.title, WebApp.StringUsage.Title));
                    this._contentView.clear();
                    if (content.styles)
                        this._contentView.styles = content.styles;
                    else
                        this._contentView.styles = this.contentStyle;
                    if (content.views)
                        content.views.forEach(a => this._contentView.addView(a));
                    this._contentView.name = provider.info.name;
                    this._contentView.buildStyles();
                    this._actionBar.actions.clear();
                    if (this._floatingView)
                        this._floatingView.clear();
                    if (content.actions) {
                        content.actions.forEach(action => {
                            if (action.priority == null || action.priority == WebApp.ActionPriority.Secondary)
                                this._actionBar.actions.add(this.createActionView(action));
                            else if (action.priority == WebApp.ActionPriority.Primary) {
                                this._floatingView.visible = true;
                                this._floatingView.addView(this.createActionView(action, { styles: WebApp.ArrayUtils.merge(["floating"], action.styles) }));
                            }
                        });
                    }
                    this._floatingView.visible = this._floatingView.content.count > 0;
                    this.actions.forEach(a => this._actionBar.actions.add(a));
                    yield this._contentView.loadAsync();
                    if (provider === null || provider === void 0 ? void 0 : provider.activateAsync)
                        yield provider.activateAsync("loading");
                    this.onContentChanged(provider);
                    this._isContentLoaded = true;
                }
                catch (e) {
                    this.handleError(this, e);
                }
                finally {
                    op.end();
                }
            });
        }
        formatTitle(value) {
            return value;
        }
        createAsync() {
            if (this.menu) {
                this._actionBar = this.view.addView(new WebApp.ActionBar({
                    title: this.prop("title"),
                    mainAction: "menu",
                    navigationMenu: this.menu
                }));
            }
            else {
                this._actionBar = this.view.addView(new WebApp.ActionBar({
                    onBack: () => this.closeAsync(),
                    title: this.prop("title"),
                    mainAction: this.host.canGoBack ? "back" : "none"
                }));
            }
            if (this.providers.length > 1) {
                if (this._selector == ContentSelector.Manual) {
                    this.prop("activeContent").subscribe(() => this.loadActiveContentAsync(false));
                }
                else {
                    let navStyle;
                    let itemTemplate;
                    let itemBehavoirs;
                    switch (this._selector) {
                        case ContentSelector.Tabs:
                            navStyle = "tab-view";
                            itemTemplate = "TextView";
                            itemBehavoirs = ["ripple"];
                            break;
                        case ContentSelector.BottomNav:
                            navStyle = "bottom-nav";
                            itemTemplate = "IconTextView";
                            itemBehavoirs = ["ripple"];
                            break;
                    }
                    this._navBar = new WebApp.NavBar({
                        styles: [navStyle],
                        itemTemplate: itemTemplate,
                        onItemSelected: a => this.loadContentAsync(a.content, false),
                        selectedItem: this.prop("activeContent"),
                        itemBehavoirs: itemBehavoirs,
                        items: WebApp.linq(this.providers).select(a => ({
                            name: a.info.name,
                            icon: a.info.icon,
                            text: a.info.displayName,
                            content: a
                        })).toArray()
                    });
                }
            }
            if (this._navBar && this._selector == ContentSelector.Tabs)
                this.view.addView(this._navBar);
            const contentWrapper = this.view.addView(new WebApp.Panel({ name: "content" }));
            this._contentView = contentWrapper.addView(new WebApp.Panel({ name: "scroll-container", styles: this.contentStyle }));
            this._floatingView = contentWrapper.addView(new WebApp.Panel({ name: "floating-container", template: "ItemsViewWrapped", visible: false, styles: this.floatingStyle }));
            if (this._navBar && this._selector == ContentSelector.BottomNav)
                this.view.addView(this._navBar);
            if (this.providers.length == 1)
                this.activeContentProvider = this.providers[0];
            this.status = "created";
            return Promise.resolve();
        }
        createActionView(action, config) {
            return WebApp.ActionView.fromAction(action, config);
        }
        onContentChanged(newContent) {
        }
    }
    WebApp.ContentActivity = ContentActivity;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class SearchActivity extends WebApp.Activity {
        constructor(config) {
            super(config);
            this.searchText = null;
            this.tooltip = null;
            this.pageSize = 0;
            this.listStyles = ["vertical", "scroll", "compact"];
            this.noMatchingText = null;
            this.bindConfigString("tooltip", config);
            this.bindConfig("pageSize", config);
            this.bindConfig("noMatchingText", config);
            if (config) {
                if (config.createItemView)
                    this.createItemView = config.createItemView;
                if (config.searchAsync)
                    this.searchWorkAsync = config.searchAsync;
                if (config.query)
                    this.searchText = config.query;
                if (config.listStyles)
                    config.listStyles.forEach(a => this.listStyles.push(a));
            }
        }
        refreshAsync() {
            return this._listView.refreshAsync();
        }
        createAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                this._actionBar = this.view.addView(new WebApp.ActionBar({
                    onBack: () => this.closeAsync(),
                    title: this.prop("title"),
                    mainAction: "back"
                }));
                this._searchView = new WebApp.SearchView({
                    name: "search-expanded",
                    tooltip: this.prop("tooltip"),
                    isExpanded: true,
                    searchText: this.prop("searchText"),
                    searchAsync: text => this._listView.refreshAsync()
                });
                this._actionBar.actions.add(this._searchView);
                this._emptyView = new WebApp.IconTextView({
                    styles: ["empty-view"],
                    visible: false
                });
                this._listView = this.view.addView(new WebApp.ListView(Object.assign({ name: "content", styles: this.listStyles, template: "ListViewInline", header: [this._emptyView], itemsSource: new WebApp.ItemsSource({
                        getItemsAsync: () => __awaiter(this, void 0, void 0, function* () {
                            const searchText = this.searchText;
                            const items = yield this.searchWorkAsync(searchText);
                            this.updateView((items === null || items === void 0 ? void 0 : items.length) > 0, searchText);
                            return items;
                        })
                    }), itemsLoader: this.pageSize ? new WebApp.PagedItemsLoader({
                        getFilter: (offset, pageSize) => this.getFilter(this.searchText, offset, pageSize),
                        pageSize: this.pageSize
                    }) : undefined, createItemView: item => this.createItemView(item) }, this.configureListView())));
                setTimeout(() => this._searchView.hasFocus = true, 500);
                yield this.refreshAsync();
            });
        }
        updateView(hasItems, searchText) {
            if (!hasItems) {
                this._emptyView.visible = true;
                if (!this.searchText) {
                    this._emptyView.icon = "fas fa-microscope";
                    this._emptyView.text = "";
                }
                else {
                    this._emptyView.icon = "far fa-sad-cry";
                    if (this.noMatchingText)
                        this._emptyView.text = WebApp.DynamicString.getValue(this.noMatchingText, { params: [searchText] });
                }
            }
            else
                this._emptyView.visible = false;
        }
        configureListView() {
            return {};
        }
        createItemView(item) {
            throw "Not Implemented";
        }
        searchWorkAsync(query, offset, pageSize) {
            throw "Not Implemented";
        }
        getFilter(query, offset, pageSize) {
            return {};
        }
    }
    WebApp.SearchActivity = SearchActivity;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class SelectMultipleItemsActivity extends WebApp.SearchActivity {
        constructor(config) {
            super(config);
            this.canAdd = false;
            this.showEmptyItem = false;
            this.emptyLabel = "[None]";
            this.itemsSource = null;
            this.addLabel = "Add New";
            this.filters = observableListOf();
            this.selectedItems = observableListOf();
            this.bindConfig("canAdd", config);
            this.bindConfigString("emptyLabel", config, WebApp.StringUsage.Title);
            this.bindConfig("showEmptyItem", config);
            this.bindConfig("itemsSource", config);
            this.bindConfigString("addLabel", config);
            if (config) {
                if (config.createItemView)
                    this.createItemContentView = config.createItemContentView;
                if (config.createItemListView)
                    this.createItemListView = config.createItemListView;
                if (config.createItemEditor)
                    this.createItemEditor = config.createItemEditor;
                if (config.filters)
                    this.filters.addRange(config.filters);
                if (config.selectedItems)
                    this.setSelectedItems(config.selectedItems);
            }
            if (!(config === null || config === void 0 ? void 0 : config.tooltip))
                this.tooltip = WebApp.Strings["select-item"]({ params: [this.itemsSource.displayName], number: WebApp.WordNumber.Plural, usage: WebApp.StringUsage.Tooltip });
            if (!(config === null || config === void 0 ? void 0 : config.addLabel))
                this.addLabel = WebApp.Strings["new-item"]({ params: [this.itemsSource.displayName], usage: WebApp.StringUsage.Action });
        }
        setSelectedItems(items) {
            this.selectedItems.clear();
            if (items) {
                items.forEach(a => this.addSelection(a));
            }
        }
        createAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                yield WebApp.SearchActivity.prototype["createAsync"].call(this);
                this._actionBar.addAction({
                    name: "confirm",
                    icon: "fas fa-check",
                    displayName: "confirm",
                    executeAsync: () => this.confirmAsync(),
                    priority: WebApp.ActionPriority.Primary
                });
                this._bottomSheet = new WebApp.BottomSheet({
                    headHeight: 50,
                    content: new WebApp.ItemsView({
                        styles: ["padding", "horizontal-wrap"],
                        content: this.selectedItems
                    })
                });
                this.view.addView(this._bottomSheet);
                this.updateView();
            });
        }
        confirmAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.closeAsync(WebApp.linq(this.selectedItems).select(a => a.item).toArray());
            });
        }
        configureListView() {
            const header = [];
            if (this.canAdd)
                header.push(WebApp.ActionView.fromAction({
                    name: "add-item",
                    icon: "fas fa-plus",
                    operation: WebApp.OperationType.Local,
                    executeAsync: () => this.addItemAsync(),
                    displayName: this.addLabel,
                }));
            if (this.showEmptyItem) {
                this._emptyItem = new WebApp.SelectableItemView({
                    content: new WebApp.TextView({ content: this.emptyLabel }),
                    item: null,
                });
                this._emptyItem.toggle = () => this.closeAsync([]);
                header.push(this._emptyItem);
            }
            const result = {
                header: header,
                selectionMode: "multiple"
            };
            if (this.pageSize > 0)
                result.itemsSource = this.itemsSource;
            return result;
        }
        searchWorkAsync(query) {
            return this.itemsSource.getItemsAsync(this.getFilter(query));
        }
        getFilter(query, offset, pageSize) {
            let filter = this.itemsSource.getFilter(query, offset, pageSize);
            if (this.filters.count == 1)
                filter = Object.assign(Object.assign({}, filter), this.filters.get(0).content);
            return filter;
        }
        createItemListView(item) {
            return new WebApp.TextView({ content: this.itemsSource.getItemText(item) });
        }
        createItemContentView(item) {
            return new WebApp.TextView({ content: this.itemsSource.getItemText(item) });
        }
        createItemEditor() {
            throw "Not Supported";
        }
        createItemView(item) {
            const view = new WebApp.SelectableItemView({
                content: this.createItemListView(item),
                item: item
            });
            view.prop("isSelected").subscribe(value => this.updateSelection(view, item, value));
            const exItem = this.findItem(item);
            if (exItem != null)
                view.isSelected = true;
            return view;
        }
        updateSelection(selView, item, isSelected) {
            if (!isSelected)
                this.removeSelection(item);
            else
                this.addSelection(item, selView);
            this.updateView();
        }
        updateView() {
            if (this._bottomSheet) {
                if (this.selectedItems.count > 0)
                    this._bottomSheet.open();
                else
                    this._bottomSheet.close();
            }
        }
        removeSelection(item) {
            const exItem = this.findItem(item);
            if (exItem)
                this.selectedItems.remove(exItem);
        }
        addSelection(item, selView) {
            const exItem = this.findItem(item);
            if (exItem)
                return;
            const itemView = new WebApp.RemovableItemView({
                content: this.createItemContentView(item),
                removeAsync: () => {
                    this.selectedItems.remove(itemView);
                    const selItem = this.findSelectable(item);
                    if (selItem)
                        selItem.isSelected = false;
                    return Promise.resolve();
                },
                item: item
            });
            this.selectedItems.add(itemView);
            return itemView;
        }
        findItem(item) {
            return WebApp.linq(this.selectedItems).first(a => this.itemsSource.itemComparer(a.item, item));
        }
        findSelectable(item) {
            return WebApp.linq(this._listView.content).first(a => this.itemsSource.itemComparer(a.item, item));
        }
        addItemAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                const editor = this.createItemEditor();
                let editValue;
                if (WebApp.TypeCheck.isAsyncEditor(editor))
                    editValue = yield editor.editAsync(this.itemsSource.newItem());
                else {
                    const activity = new WebApp.ActivityEditor({
                        editor: editor,
                        title: this.addLabel
                    });
                    editValue = yield activity.editAsync(this.itemsSource.newItem());
                }
                if (!editValue)
                    return;
                const newItem = yield this.itemsSource.addItemAsync(editValue);
                if (!newItem)
                    return;
                const itemView = this.createItemView(newItem);
                itemView.isSelected = true;
                this._listView.content.insert(0, itemView);
            });
        }
    }
    WebApp.SelectMultipleItemsActivity = SelectMultipleItemsActivity;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class SelectSingleItemActivity extends WebApp.SearchActivity {
        constructor(config) {
            super(config);
            this.canAdd = false;
            this.itemsSource = null;
            this.addLabel = "Add New";
            this.filters = observableListOf();
            this.selectedValue = null;
            this.bindConfig("canAdd", config);
            this.bindConfig("itemsSource", config);
            this.bindConfig("selectedValue", config);
            this.bindConfigString("addLabel", config);
            if (config) {
                if (config.createItemView)
                    this.createItemContentView = config.createItemContentView;
                if (config.createItemEditor)
                    this.createItemEditor = config.createItemEditor;
                if (config.filters)
                    this.filters.addRange(config.filters);
            }
            if (!(config === null || config === void 0 ? void 0 : config.tooltip))
                this.tooltip = WebApp.Strings["select-item"]({ params: [this.itemsSource.displayName], usage: WebApp.StringUsage.Tooltip });
            if (!(config === null || config === void 0 ? void 0 : config.addLabel))
                this.addLabel = WebApp.Strings["new-item"]({ params: [this.itemsSource.displayName], usage: WebApp.StringUsage.Action });
        }
        createAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                yield WebApp.SearchActivity.prototype["createAsync"].call(this);
                this._actionBar.addAction({
                    name: "confirm",
                    icon: "fas fa-check",
                    displayName: "confirm",
                    executeAsync: () => this.confirmAsync(),
                    priority: WebApp.ActionPriority.Primary
                });
            });
        }
        confirmAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.closeAsync();
            });
        }
        configureListView() {
            const header = [];
            if (this.canAdd)
                header.push(WebApp.ActionView.fromAction({
                    name: "add-item",
                    icon: "fas fa-plus",
                    operation: WebApp.OperationType.Local,
                    executeAsync: () => this.addItemAsync(),
                    displayName: this.addLabel
                }));
            const result = {
                header: header,
            };
            if (this.pageSize > 0)
                result.itemsSource = this.itemsSource;
            return result;
        }
        searchWorkAsync(query) {
            return this.itemsSource.getItemsAsync(this.getFilter(query));
        }
        getFilter(query, offset, pageSize) {
            let filter = this.itemsSource.getFilter(query, offset, pageSize);
            if (this.filters.count == 1)
                filter = Object.assign(Object.assign({}, filter), this.filters.get(0).content);
            return filter;
        }
        createItemContentView(item) {
            return new WebApp.TextView({ content: this.itemsSource.getItemText(item) });
        }
        createItemEditor() {
            throw "Not Supported";
        }
        createItemView(item) {
            const view = new WebApp.SelectableItemView({
                content: this.createItemContentView(item),
                styles: ["single"],
                item: item
            });
            if (this.itemsSource.equals(this.itemsSource.getItemValue(item), this.selectedValue))
                view.isSelected = true;
            view.prop("isSelected").subscribe(value => {
                if (value)
                    this.setSelectionAsync(item);
            });
            return view;
        }
        setSelectionAsync(item) {
            return this.closeAsync(item);
        }
        addItemAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                const editor = this.createItemEditor();
                let editValue;
                if (WebApp.TypeCheck.isAsyncEditor(editor))
                    editValue = yield editor.editAsync(this.itemsSource.newItem());
                else {
                    const activity = new WebApp.ActivityEditor({
                        editor: editor,
                        title: this.addLabel
                    });
                    editValue = yield activity.editAsync(this.itemsSource.newItem());
                }
                if (!editValue)
                    return;
                const newItem = yield this.itemsSource.addItemAsync(editValue);
                if (newItem)
                    yield this.setSelectionAsync(newItem);
            });
        }
    }
    WebApp.SelectSingleItemActivity = SelectSingleItemActivity;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class AttachBehavoir {
        attach(element, viewModel) {
            if ("attach" in viewModel) {
                setTimeout(() => viewModel.attach(element));
            }
        }
        detach(element, viewModel) {
        }
    }
    AttachBehavoir.instance = new AttachBehavoir();
    WebApp.AttachBehavoir = AttachBehavoir;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class LongPressBehavoir {
        constructor() {
            this._isLongPress = false;
        }
        attach(element, viewModel) {
            this._handler = viewModel;
            this._element = element;
            this._cancelHandler = (ev) => this.cancelTimer(ev);
            element.addEventListener("touchstart", ev => this.startTimer(ev), { passive: true });
            element.addEventListener("mousedown", ev => this.startTimer(ev));
            element.addEventListener("selectstart", () => false);
        }
        detach(element) {
        }
        startTimer(ev) {
            this._isLongPress = false;
            this._element.addEventListener("touchmove", this._cancelHandler);
            this._element.addEventListener("touchend", this._cancelHandler);
            this._element.addEventListener("mousemove", this._cancelHandler);
            this._element.addEventListener("mouseup", this._cancelHandler);
            this._timer = window.setTimeout(() => {
                this._isLongPress = true;
                if ("vibrate" in navigator)
                    navigator.vibrate(50);
                this._handler.onLongPress(ev);
                this._timer = null;
            }, 490);
        }
        cancelTimer(ev) {
            if (this._isLongPress)
                ev.stopPropagation();
            if (this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }
            this._element.removeEventListener("touchmove", this._cancelHandler);
            this._element.removeEventListener("touchend", this._cancelHandler);
            this._element.removeEventListener("mousemove", this._cancelHandler);
            this._element.removeEventListener("mouseup", this._cancelHandler);
        }
    }
    WebApp.LongPressBehavoir = LongPressBehavoir;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class RippleClickBehavoir {
        attach(element) {
            element.addEventListener("mousedown", this.onClick);
            element.classList.add("ripple");
        }
        detach(element) {
            element.removeEventListener("mousedown", this.onClick);
        }
        onClick(e) {
            const curTarget = e.currentTarget;
            curTarget.classList.remove("activated");
            setTimeout(() => curTarget.classList.add("activated"));
        }
    }
    RippleClickBehavoir.instance = new RippleClickBehavoir();
    WebApp.RippleClickBehavoir = RippleClickBehavoir;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ScrollCheckBehavoir {
        attach(element, viewModel) {
            setTimeout(() => {
                const scrollParent = element.classList.contains("scroll") ? element : WebApp.DomUtils.parentOfClass(element, "scroll");
                function computeScroll() {
                    if (!viewModel.isScrollCheckActive)
                        return;
                    let curItem = element;
                    let found = false;
                    while (curItem != null) {
                        if (curItem == scrollParent) {
                            found = true;
                            break;
                        }
                        curItem = curItem.parentNode;
                    }
                    if (!found)
                        scrollParent.removeEventListener("scroll", computeScroll);
                    else {
                        viewModel.onScroll({
                            offsetTop: scrollParent.scrollTop,
                            offsetBottom: scrollParent.scrollHeight - (scrollParent.scrollTop + scrollParent.clientHeight),
                            pageBottom: (scrollParent.scrollHeight - (scrollParent.scrollTop + scrollParent.clientHeight)) / scrollParent.clientHeight,
                            pageTop: scrollParent.scrollTop / scrollParent.clientHeight,
                            totPages: scrollParent.scrollHeight / scrollParent.clientHeight
                        });
                    }
                }
                if (scrollParent != null) {
                    scrollParent.addEventListener("scroll", computeScroll, { passive: true });
                }
            });
        }
        detach(element, viewModel) {
        }
    }
    ScrollCheckBehavoir.instance = new ScrollCheckBehavoir();
    WebApp.ScrollCheckBehavoir = ScrollCheckBehavoir;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class VibrateClickBehavoir {
        attach(element) {
            element.addEventListener("click", this.onClick);
        }
        detach(element) {
            element.removeEventListener("click", this.onClick);
        }
        onClick(e) {
            if ("vibrate" in navigator)
                navigator.vibrate(50);
        }
    }
    VibrateClickBehavoir.instance = new VibrateClickBehavoir();
    WebApp.VibrateClickBehavoir = VibrateClickBehavoir;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ViewComponent extends WebApp.View {
        constructor(config) {
            super(config);
            this.enabled = true;
            this.visible = true;
            this.styles = [];
            this.name = null;
            this.nodes = null;
            this.isCacheEnabled = false;
            this.status = "";
            this.bindConfig("enabled", config);
            this.bindConfig("visible", config);
            if (config) {
                if (config.styles)
                    this.styles = config.styles;
                if (config.name)
                    this.name = config.name;
            }
            this.prop("styles").subscribe(() => this.buildStyles());
            this.buildStyles();
        }
        buildStyles() {
            let result = "";
            let curType = WebApp.ObjectUtils.getType(this);
            while (curType != ViewComponent) {
                let typeName = WebApp.ObjectUtils.getTypeName(curType);
                result += WebApp.ViewUtils.formatForCss(typeName) + " ";
                curType = WebApp.ObjectUtils.getBaseType(curType);
            }
            if (this.name)
                result += WebApp.ViewUtils.formatForCss(this.name) + " ";
            if (this.styles)
                result += this.styles.join(" ");
            this.className = result.trim();
        }
        get debugName() {
            return WebApp.ObjectUtils.getTypeName(this) + ": " + this.name;
        }
    }
    WebApp.ViewComponent = ViewComponent;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ActionBar extends WebApp.ViewComponent {
        constructor(config) {
            super(config);
            this.actions = observableListOf();
            this.mainAction = "none";
            this.navigationMenu = null;
            this.title = null;
            this.icon = null;
            this.selectionManager = null;
            this.bindConfig("mainAction", config);
            this.bindConfig("navigationMenu", config);
            this.bindConfigString("title", config, WebApp.StringUsage.Title);
            this.bindConfig("icon", config);
            this.actions.subscribe({
                onItemAdded: this.onActionAdded.bind(this),
                onItemRemoved: this.onActionRemoved.bind(this)
            });
            if (config) {
                if (config.actions)
                    config.actions.forEach(a => this.addAction(a));
                if (config.onBack)
                    this.back = config.onBack;
            }
        }
        onActionRemoved(action) {
            if (action && action.parentView == this)
                action.parentView = null;
        }
        onActionAdded(action) {
            if (action)
                action.parentView = this;
        }
        showNavigationMenu() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.navigationMenu)
                    yield this.navigationMenu.showAsync();
            });
        }
        addAction(action) {
            this.actions.add(WebApp.ActionView.fromActionIcon(action));
        }
        back() {
        }
        startSelection() {
            if (!this.selectionManager)
                this.selectionManager = new WebApp.SelectionManager();
            this.selectionManager.isActive = true;
            return this.selectionManager;
        }
    }
    WebApp.ActionBar = ActionBar;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ContentView extends WebApp.ViewComponent {
        constructor(config) {
            super(config);
            this.content = null;
            this.contentTemplate = null;
            this.bindConfig("content", config, null, () => this.onContentChanged());
            this.bindConfig("contentTemplate", config);
        }
        onContentChanged() {
            if (WebApp.TypeCheck.isView(this.content))
                this.content.parentView = this;
        }
    }
    WebApp.ContentView = ContentView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let AggregationMode;
    (function (AggregationMode) {
        AggregationMode[AggregationMode["None"] = 0] = "None";
        AggregationMode[AggregationMode["Parallel"] = 1] = "Parallel";
        AggregationMode[AggregationMode["Serial"] = 2] = "Serial";
    })(AggregationMode = WebApp.AggregationMode || (WebApp.AggregationMode = {}));
    class ActionView extends WebApp.ContentView {
        constructor(config) {
            super(Object.assign({ template: "ActionLink" }, config));
            this.tooltip = null;
            this.operation = WebApp.OperationType.Global;
            this.canAggregate = AggregationMode.None;
            this.subActions = observableListOf();
            this.bindConfigString("tooltip", config, WebApp.StringUsage.Tooltip);
            this.bindConfig("operation", config);
            this.bindConfig("canAggregate", config);
            if (config) {
                if (config.executeAsync)
                    this.executeWorkAsync = config.executeAsync;
                if (config.subActions)
                    config.subActions.forEach(sub => this.subActions.add(new ActionView(sub)));
            }
        }
        executeAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if (window.event)
                    window.event.stopPropagation();
                var op = WebApp.Operation.begin({ message: "Executing " + this.name, type: this.operation });
                this.status = "executing";
                try {
                    yield this.executeWorkAsync();
                    if (this.subActions.count > 0) {
                        let menu = new WebApp.ContextMenu();
                        this.subActions.forEach(a => menu.actions.add(a));
                        menu.showAsync(window.event.srcElement);
                    }
                }
                catch (ex) {
                    WebApp.app.handleError(this, ex);
                    throw ex;
                }
                finally {
                    this.status = "";
                    op.end();
                }
            });
        }
        executeWorkAsync() {
            return Promise.resolve();
        }
        static fromAction(action, config) {
            var _a;
            const result = new ActionView(Object.assign({ name: action.name, operation: action.operation, styles: action.styles, template: "ActionLink", content: new WebApp.IconTextView({
                    template: "IconTextViewInline",
                    text: WebApp.Format.action((_a = action.displayName) !== null && _a !== void 0 ? _a : action.name),
                    icon: action.icon
                }), executeAsync: action.executeAsync }, config));
            if (action.canExecute)
                WebApp.Properties.converter(result, "visible", () => action.canExecute());
            return result;
        }
        static fromItemAction(action, getItem, config) {
            var _a;
            const result = new ActionView(Object.assign({ name: action.name, operation: action.operation, styles: action.styles, content: new WebApp.IconTextView({
                    template: "IconTextViewInline",
                    text: WebApp.Format.action((_a = action.displayName) !== null && _a !== void 0 ? _a : action.name),
                    icon: action.icon
                }), executeAsync: () => action.executeAsync(getItem()) }, config));
            if (action.canExecute)
                result.bind("visible", result.createComputed(() => action.canExecute(getItem())));
            return result;
        }
        static fromActionIcon(action, config) {
            var _a;
            const result = new ActionView(Object.assign({ name: action.name, styles: action.styles, operation: action.operation, template: "ActionIcon", content: action.icon, tooltip: (_a = action.displayName) !== null && _a !== void 0 ? _a : action.name, executeAsync: action.executeAsync }, config));
            if (action.canExecute)
                result.bind("visible", result.createComputed(() => action.canExecute()));
            return result;
        }
    }
    WebApp.ActionView = ActionView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class BasePopUpMessage extends WebApp.View {
        constructor(config) {
            super(config);
            this._isVisible = false;
            this.className = null;
            this.bindConfig("className", config);
            this._container = document.createElement("DIV");
            this._container.className = this.className + "-container";
        }
        showAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this._isVisible)
                    return;
                this._isVisible = true;
                WebApp.app.unblock(true);
                const builder = new WebApp.TemplateBuilder(this, this._container);
                builder.template(this.template, a => a);
                document.body.appendChild(this._container);
                yield WebApp.PromiseUtils.delay(0);
                this._container.classList.add("visible");
                return new Promise(res => this._showResolve = res);
            });
        }
        hide(actionName) {
            if (!this._isVisible)
                return;
            this._isVisible = false;
            WebApp.app.restoreBlock();
            this._container.classList.remove("visible");
            if (this._showResolve) {
                this._showResolve(actionName);
                this._showResolve = null;
            }
            setTimeout(() => {
                if (!this._isVisible)
                    document.body.removeChild(this._container);
            }, 500);
        }
    }
    WebApp.BasePopUpMessage = BasePopUpMessage;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class Blocker extends WebApp.ViewComponent {
        constructor() {
            super();
            this.status = "hide";
            const builder = new WebApp.TemplateBuilder(this, document.body);
            builder.content(this);
        }
        attach(element) {
            this._element = element;
            element.onmousedown = e => e.preventDefault();
            element.ontouchstart = e => e.preventDefault();
            if (this.status == "hide")
                this._element.style.display = "none";
        }
        showAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this._element)
                    this._element.style.removeProperty("display");
                this.status = "showing";
                yield WebApp.PromiseUtils.delay(0);
                if (this.status == "showing")
                    this.status = "show";
            });
        }
        hideAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                this.status = "hiding";
                yield WebApp.PromiseUtils.delay(500);
                if (this.status == "hiding") {
                    this.status = "hide";
                    if (this._element)
                        this._element.style.display = "none";
                }
            });
        }
    }
    WebApp.Blocker = Blocker;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class BottomSheet extends WebApp.ContentView {
        constructor(config) {
            super(Object.assign({ template: "BottomSheet" }, config));
            this._margin = 20;
            this._isAnimating = 0;
            this.isShowOpener = false;
            this.headHeight = 100;
            this.headSelector = null;
            this.status = "close";
            this.bindConfig("headHeight", config);
            this.bindConfig("headSelector", config);
            this.bindConfig("isShowOpener", config);
        }
        attach(element) {
            this._element = element;
            let hammer = new Hammer(element, {
                recognizers: [[Hammer.Pan, { direction: Hammer.DIRECTION_VERTICAL }]]
            });
            let startHeight = 0;
            let oldStatus = this.status;
            let startScrollTop = 0;
            hammer.on("panstart", ev => {
                oldStatus = this.status;
                this.status = "moving";
                startScrollTop = element.scrollTop;
                startHeight = element.clientHeight;
            });
            hammer.on("panend", ev => {
                if (element.clientHeight < this.headHeight - this._margin)
                    this.close();
                else {
                    if (oldStatus == "open") {
                        if (ev.deltaY > this._margin && this._element.scrollTop <= 0)
                            this.head();
                        else
                            this.open();
                    }
                    else {
                        if (element.clientHeight > this.headHeight + this._margin)
                            this.open();
                        else
                            this.head();
                    }
                }
            });
            hammer.on("panmove", ev => {
                let deltaY = ev.deltaY;
                if (oldStatus == "open") {
                    let newScrollTop = startScrollTop - deltaY;
                    if (deltaY < 0) {
                        this._element.scrollTop = newScrollTop;
                        return;
                    }
                    else {
                        if (newScrollTop >= 0) {
                            this._element.scrollTop = newScrollTop;
                            return;
                        }
                        this._element.scrollTop = 0;
                        deltaY = -newScrollTop;
                    }
                }
                let newHeight = startHeight - deltaY;
                let panHeight = newHeight;
                let enableScrolling = false;
                if (newHeight < this._margin)
                    newHeight = 0;
                else if (newHeight > element.parentNode.clientHeight - this._margin && newHeight < this._element.scrollHeight) {
                    newHeight = element.parentNode.clientHeight;
                    enableScrolling = true;
                }
                else if (newHeight > this._element.scrollHeight)
                    newHeight = this._element.scrollHeight;
                else if (newHeight > this.headHeight - this._margin && newHeight < this.headHeight + this._margin)
                    newHeight = this.headHeight;
                element.style.height = newHeight + "px";
                if (panHeight - newHeight > 0 && enableScrolling)
                    this._element.scrollTop = panHeight - newHeight;
                else
                    this._element.scrollTop = 0;
            });
            switch (this.status) {
                case "head":
                    this.head();
                    break;
                case "open":
                    this.open();
                    break;
                case "close":
                    this.close();
                    break;
            }
        }
        setHeightAsync(value) {
            return __awaiter(this, void 0, void 0, function* () {
                this._isAnimating++;
                if (this._isAnimating == 1)
                    this._element.classList.add("animate");
                yield WebApp.PromiseUtils.delay(0);
                this._element.style.height = value.toString() + "px";
                yield WebApp.PromiseUtils.delay(500);
                this._isAnimating--;
                if (this._isAnimating == 0)
                    this._element.classList.remove("animate");
            });
        }
        toggle() {
            if (this.status == "open" || this.status == "close")
                this.head();
            else
                this.open();
        }
        open() {
            this.status = "open";
            if (this._element)
                this.setHeightAsync(this._element.scrollHeight);
        }
        head() {
            this.status = "head";
            if (this._element) {
                if (this.headSelector) {
                    let headEl = this._element.querySelector(this.headSelector);
                    if (headEl) {
                        this.headHeight = headEl.clientHeight;
                        if (this.isShowOpener)
                            this.headHeight += this._element.querySelector(".opener").clientHeight;
                    }
                }
                this.setHeightAsync(this.headHeight);
            }
        }
        close() {
            this.status = "close";
            if (this._element)
                this.setHeightAsync(0);
        }
    }
    WebApp.BottomSheet = BottomSheet;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ConsoleItem extends WebApp.View {
        constructor(args) {
            super();
            this.content = args;
        }
    }
    class ConsoleMessageView extends ConsoleItem {
        constructor(type, ...args) {
            super(args);
            this.type = type;
            this.template = "ConsoleMessageView";
        }
    }
    WebApp.ConsoleMessageView = ConsoleMessageView;
    class ConsoleGroupView extends ConsoleItem {
        constructor(...args) {
            super(args);
            this.items = observableListOf();
            this.template = "ConsoleGroupView";
        }
    }
    WebApp.ConsoleGroupView = ConsoleGroupView;
    class ConsoleView extends WebApp.ViewComponent {
        constructor() {
            super();
            this._groups = [];
            this._isCreated = false;
            this.root = new ConsoleGroupView();
            this._activeGroup = this.root;
        }
        show() {
            if (!this._isCreated) {
                var builder = new WebApp.TemplateBuilder(this, document.body);
                builder.content(this);
            }
            this.visible = true;
        }
        hide() {
            this.visible = false;
        }
        attach() {
            if (this._oldConsole)
                return;
            this._oldConsole = {};
            for (let key in console)
                this._oldConsole[key] = console[key];
            console.log = (...args) => this.write("log", args);
            console.warn = (...args) => this.write("warn", args);
            console.info = (...args) => this.write("info", args);
            console.trace = (...args) => this.write("trace", args);
            console.error = (...args) => this.write("error", args);
            console.debug = (...args) => this.write("debug", args);
            console.clear = () => this.clear();
            console.group = (...args) => this.group(args);
            console.groupEnd = () => this.groupEnd();
        }
        detach() {
            if (!this._oldConsole)
                return;
            for (let key in console)
                console[key] = this._oldConsole[key];
            this._oldConsole = null;
        }
        write(logType, args) {
            this._oldConsole[logType].apply(console, args);
            this._activeGroup.items.add(new ConsoleMessageView(logType, args));
            if (logType == "error")
                this._activeGroup.items.add(new ConsoleMessageView(logType, new Error().stack));
        }
        group(args) {
            this._oldConsole.group.apply(console, args);
            const newGroup = new ConsoleGroupView(args);
            this._activeGroup.items.add(newGroup);
            this._groups.push(newGroup);
            this._activeGroup = newGroup;
        }
        groupEnd() {
            this._oldConsole.groupEnd.apply(console);
            if (this._groups.length > 0)
                this._activeGroup = this._groups.pop();
        }
        clear() {
            this._oldConsole.clear.apply(console);
            this._groups = [];
            this.root.items.clear();
            this._activeGroup = this.root;
        }
    }
    WebApp.ConsoleView = ConsoleView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class Container extends WebApp.ContentView {
        constructor(config) {
            super(Object.assign({ template: "Container" }, config));
            this.title = "";
            this.isOverflow = true;
            this.canExpand = false;
            this.isExpanded = true;
            this.bindConfigString("title", config, WebApp.StringUsage.Title);
            this.bindConfig("isExpanded", config);
            this.bindConfig("canExpand", config);
            this.prop("content").subscribe(() => this.checkOverflow());
        }
        attach(element) {
            this._element = element;
            if (this.canExpand) {
                this._element.addEventListener("resize", () => this.checkOverflow());
                this.checkOverflow();
            }
        }
        checkOverflow() {
            if (this._element != null) {
                const wrapper = this._element.querySelector(".content-wrapper");
                if (wrapper != null) {
                    this.isOverflow = wrapper.scrollHeight > wrapper.clientHeight;
                    if (!this.isOverflow)
                        this.isExpanded = true;
                }
            }
        }
        onContentChanged() {
        }
        toggleExpand() {
            this.isExpanded = !this.isExpanded;
        }
    }
    WebApp.Container = Container;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ItemsView extends WebApp.ContentView {
        constructor(config) {
            super(Object.assign({ content: observableListOf() }, config));
            this._updateCount = 0;
            this.emptyView = null;
            this.content.subscribe({
                onItemAdded: (item) => {
                    if (this._updateCount == 0)
                        this.onItemAdded(item);
                },
                onItemRemoved: (item) => {
                    if (this._updateCount == 0)
                        this.onItemRemoved(item);
                }
            });
            this.bindConfig("emptyView", config);
        }
        initItems() {
            if (this.content)
                this.content.toArray().forEach(a => this.onItemAdded(a));
        }
        beginUpdate() {
            this._updateCount++;
        }
        endUpdate() {
            this._updateCount--;
        }
        onItemAdded(item) {
        }
        onItemRemoved(item) {
        }
    }
    WebApp.ItemsView = ItemsView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class Panel extends WebApp.ItemsView {
        constructor(config) {
            super(Object.assign({ template: "ItemsView" }, config));
            if (config === null || config === void 0 ? void 0 : config.viewContent) {
                if (Array.isArray(config.viewContent))
                    config.viewContent.forEach(a => this.addView(a));
                else
                    this.addView(config.viewContent);
            }
        }
        loadAsync() {
            return WebApp.ViewUtils.loadAllAsync(this.content);
        }
        clear() {
            this.content.clear();
        }
        addView(view) {
            this.content.add(view);
            return view;
        }
        removeView(view) {
            this.content.remove(view);
        }
        replaceView(oldView, newView) {
            let index;
            if (WebApp.TypeCheck.isString(oldView))
                index = WebApp.linq(this.content).indexOf(a => "name" in a && a.name == oldView);
            else
                index = this.content.indexOf(oldView);
            if (index != -1)
                this.content.set(index, newView);
        }
        onItemAdded(item) {
            if (item)
                item.parentView = this;
        }
        onItemRemoved(item) {
            if (item && item.parentView == this)
                item.parentView = null;
        }
    }
    WebApp.Panel = Panel;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ContentHostView extends WebApp.Panel {
        constructor(config) {
            super(Object.assign({}, config));
            this.title = null;
            this.actionTemplate = "ActionButton";
            this.contentProvider = null;
            this.bindConfig("contentProvider", config);
            this.bindConfig("actionTemplate", config);
            this._body = new WebApp.Panel({ name: "body" });
            this._actions = new WebApp.Panel({ name: "actions" });
            this.addView(this._body);
            this.addView(this._actions);
            this._body.emptyView = this.emptyView;
            this.emptyView = null;
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.contentProvider) {
                    yield this.closeAsync();
                    const content = yield this.contentProvider.getContentAsync(this);
                    if (content.styles)
                        this._body.styles = content.styles;
                    this.name = this.contentProvider.info.name;
                    this.title = WebApp.Format.title(content.title);
                    content.views.forEach(a => this._body.addView(a));
                    if (content.actions)
                        content.actions.forEach(a => this.addAction(a));
                    yield WebApp.Panel.prototype.loadAsync.call(this);
                    if (this.contentProvider.activateAsync)
                        yield this.contentProvider.activateAsync();
                }
                this._actions.visible = this._actions.content.count > 0;
            });
        }
        addAction(action) {
            this._actions.addView(WebApp.ActionView.fromAction(action, { template: this.actionTemplate }));
        }
        notifyContentChanged(provider) {
            this.loadAsync();
        }
        closeAsync(result) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                if ((_a = this.contentProvider) === null || _a === void 0 ? void 0 : _a.deactivateAsync)
                    yield this.contentProvider.deactivateAsync();
                this._body.clear();
                this._actions.clear();
                this.title = null;
                return true;
            });
        }
    }
    WebApp.ContentHostView = ContentHostView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ContextMenu extends WebApp.BindableObject {
        constructor(config) {
            super();
            this.actions = observableListOf();
            this.className = "context-menu";
            if (config) {
                if (config.actions)
                    config.actions.forEach(a => this.addAction(a));
            }
            this._menuContainer = document.createElement("DIV");
            this._menuContainer.className = "popup-container";
            this._clickHandler = this.onClick.bind(this);
        }
        addAction(action) {
            this.actions.add(WebApp.ActionView.fromAction(action));
        }
        showAsync(element, event) {
            return __awaiter(this, void 0, void 0, function* () {
                let curOfs = { x: 0, y: 0 };
                if (!element && event) {
                    element = event.srcElement;
                    curOfs.x = event.offsetX;
                    curOfs.y = event.offsetY;
                }
                const builder = new WebApp.TemplateBuilder(this, this._menuContainer);
                builder.template("ContextMenu", a => a);
                document.body.appendChild(this._menuContainer);
                yield WebApp.PromiseUtils.delay(0);
                window.addEventListener("mouseup", this._clickHandler);
                let curEl = element;
                let offsetEl = element;
                while (curEl) {
                    if (curEl == offsetEl) {
                        curOfs.y += curEl.offsetTop;
                        curOfs.x += curEl.offsetLeft;
                        offsetEl = curEl.offsetParent;
                    }
                    curOfs.y -= curEl.scrollTop;
                    curOfs.x -= curEl.scrollLeft;
                    curEl = curEl.parentElement;
                }
                let xTrans = "";
                let yTrans = "";
                if (curOfs.x + this._menuContainer.clientWidth > document.body.clientWidth) {
                    curOfs.x -= this._menuContainer.clientWidth;
                    xTrans = "right";
                }
                else
                    xTrans = "left";
                if (curOfs.y + this._menuContainer.clientHeight > document.body.clientHeight) {
                    curOfs.y -= this._menuContainer.clientHeight;
                    yTrans = "bottom";
                }
                else
                    yTrans = "top";
                this._menuContainer.style.top = curOfs.y + "px";
                this._menuContainer.style.left = curOfs.x + "px";
                this._menuContainer.style.transformOrigin = xTrans + " " + yTrans;
                yield WebApp.PromiseUtils.delay(0);
                this._menuContainer.classList.add("visible");
            });
        }
        hide() {
            this._menuContainer.classList.remove("visible");
            window.removeEventListener("mouseup", this._clickHandler);
            setTimeout(() => document.body.removeChild(this._menuContainer), 500);
        }
        onClick(e) {
            setTimeout(() => this.hide(), 0);
        }
    }
    WebApp.ContextMenu = ContextMenu;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class CounterView extends WebApp.ContentView {
        constructor(config) {
            super(Object.assign({ template: "CounterView" }, config));
            this.title = null;
            this.value = 0;
            this.bindConfig("value", config);
            this.bindConfig("title", config);
            this.prop("value").subscribe(() => this.animate());
            if (this.value != null)
                this.animate();
        }
        animate() {
            this.content = 0;
            let duration = this.value / 200;
            return WebApp.Animation.animate({
                timeFunction: WebApp.Animation.linear(),
                duration: isNaN(duration) || duration < 1 ? 1 : duration,
                stepTime: 1 / 20,
                step: t => this.content = Math.round(this.value * t)
            });
        }
    }
    WebApp.CounterView = CounterView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class DrawerGroup {
        constructor(host, config) {
            this.actions = observableListOf();
            this.label = null;
            this._host = host;
            if (config) {
                this.label = WebApp.DynamicString.getValue(config.label);
                config.actions.forEach(a => this.addAction(a));
            }
        }
        addAction(action) {
            const actionView = WebApp.ActionView.fromAction(action, {
                executeAsync: () => __awaiter(this, void 0, void 0, function* () {
                    this._host.hideAsync();
                    yield action.executeAsync();
                })
            });
            this.actions.add(actionView);
            return actionView;
        }
    }
    WebApp.DrawerGroup = DrawerGroup;
    class Drawer extends WebApp.View {
        constructor(config) {
            super(Object.assign({ template: "Drawer" }, config));
            this.status = "hidden";
            this.header = null;
            this.groups = observableListOf();
            this.bindConfig("header", config);
            if (config) {
                config.groups.forEach(a => this.addGroup(a));
            }
        }
        addGroup(config) {
            const group = new DrawerGroup(this, config);
            this.groups.add(group);
            return group;
        }
        attach(element) {
            let drawer = element.querySelector(".drawer");
            let hammer = new Hammer(drawer, {
                recognizers: [[Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL }]]
            });
            hammer.on("swipeleft", ev => {
                this.hideAsync();
            });
            element.addEventListener("click", e => {
                if (e.srcElement == e.currentTarget)
                    this.hideAsync();
            });
        }
        showAsync(ctx) {
            return __awaiter(this, void 0, void 0, function* () {
                this.status = "showing";
                yield WebApp.PromiseUtils.delay(0);
                this.status = "visible";
            });
        }
        hideAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                this.status = "hiding";
                yield WebApp.PromiseUtils.delay(500);
                if (this.status == "hiding")
                    this.status = "hidden";
            });
        }
    }
    WebApp.Drawer = Drawer;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class FileUploadView extends WebApp.ViewComponent {
        constructor(config) {
            super(config);
            this.progress = 0;
            this.text = null;
            this.progressText = null;
            this.status = "empty";
            this.error = null;
            this.isSelected = false;
            this._input = document.createElement("input");
            this._input.type = "file";
            this._input.addEventListener("change", () => {
                this.update();
                if (config === null || config === void 0 ? void 0 : config.onChanged)
                    config.onChanged();
            });
            this.update();
        }
        update() {
            let file = this._input.files[0];
            if (file) {
                this.text = file.name;
                this.status = "selected";
            }
            else {
                this.text = "Seleziona file";
                this.status = "empty";
            }
            this.isSelected = this._input.files[0] != null;
        }
        select() {
            this._input.click();
        }
        remove() {
        }
        uploadAsync(url) {
            return __awaiter(this, void 0, void 0, function* () {
                this.status = "uploading";
                let result = yield WebApp.Http.postBinaryAsync(url, this._input.files[0], ev => {
                    this.progress = ev.loaded / ev.total;
                });
                this.status = "uploaded";
                return result;
            });
        }
        get file() {
            if (!this._input.files || this._input.files.length == 0)
                return null;
            return this._input.files[0];
        }
    }
    WebApp.FileUploadView = FileUploadView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ListView extends WebApp.ItemsView {
        constructor(config) {
            super(Object.assign({ template: "ListView", styles: ["default"] }, config));
            this._isLoaded = false;
            this._itemViewMap = new Map();
            this.header = observableListOf();
            this.footer = observableListOf();
            this.itemsSource = null;
            this.itemsLoader = null;
            this.items = null;
            this.selectedItem = null;
            this.status = "";
            this.selectionMode = "none";
            this.showSeparator = false;
            this.filter = null;
            this.bindConfig("itemsSource", config);
            this.bindConfig("items", config);
            this.bindConfig("filter", config);
            this.bindConfig("selectionMode", config);
            if (config) {
                if (config.itemsLoader)
                    this.itemsLoader = config.itemsLoader;
                if (config.showSeparator !== undefined)
                    this.showSeparator = config.showSeparator;
                if (config.createItemView)
                    this.createItemViewWork = config.createItemView;
                if (config.header)
                    this.header.addRange(config.header);
                if (config.footer)
                    this.footer.addRange(config.footer);
            }
            if (!(config === null || config === void 0 ? void 0 : config.items))
                this.items = observableListOf();
            if (!this.itemsLoader && this.itemsSource)
                this.itemsLoader = WebApp.FullItemsLoader.instance;
            if (config && config.isAutoLoad)
                this.loadAsync();
            const itemsHandler = {
                onClear: () => {
                    this.selectedItem = null;
                    this._itemViewMap.clear();
                    this.content.clear();
                },
                onItemAdded: (item, index, reason) => {
                    if (reason != "replace")
                        this.content.insert(index, this.createItemView(item));
                },
                onItemRemoved: (item, index, reason) => {
                    if (reason == "remove")
                        this.content.removeAt(index);
                },
                onItemReplaced: (newItem, oldItem, index) => this.content.set(index, this.createItemView(newItem)),
                onItemSwap: (index, newIndex) => this.content.swap(index, newIndex),
            };
            this.prop("items").subscribe((value, oldValueX) => {
                if (oldValueX != null)
                    oldValueX.unsubscribe(itemsHandler);
                this.content.clear();
                if (value) {
                    value.subscribe(itemsHandler);
                    for (let item of value)
                        this.content.add(this.createItemView(item));
                    this.status = "loaded";
                }
            });
            this.prop("items").notifyChanged();
            this.prop("selectedItem").subscribe((value, oldValue) => {
                if (this.selectionMode == "single")
                    this.updateItemSelection(oldValue, false);
                if (this.selectionMode != "none") {
                    this.updateItemSelection(value, true);
                    if (config === null || config === void 0 ? void 0 : config.onSelectdItemChanged)
                        config.onSelectdItemChanged(value);
                }
            });
            if (config === null || config === void 0 ? void 0 : config.isListenerActive)
                this.activateListener();
        }
        activateListener() {
            var _a;
            if (!((_a = this.itemsSource) === null || _a === void 0 ? void 0 : _a.typeName))
                return;
            if (!this._listener)
                this._listener = {
                    onItemAdded: args => this.refreshAsync(),
                    onItemRemoved: args => {
                        if (args.value)
                            this.items.removeWhen(a => this.itemsSource.equals(this.itemsSource.getItemValue(a), args.value));
                    },
                    onItemChanged: (args) => __awaiter(this, void 0, void 0, function* () {
                        let index = WebApp.linq(this.items).indexOf(a => this.itemsSource.equals(this.itemsSource.getItemValue(a), args.value));
                        if (index != -1) {
                            const newItem = yield this.itemsSource.getItemByValueAsync(args.value);
                            if (newItem)
                                this.items.set(index, newItem);
                        }
                    })
                };
            WebApp.Services.itemsObserver.register(this.itemsSource.typeName, this._listener);
        }
        deactivateListener() {
            if (this._listener)
                WebApp.Services.itemsObserver.unregister(this.itemsSource.typeName, this._listener);
        }
        updateItemSelection(item, isSelected) {
            let view = this.findItemView(item);
            if (WebApp.TypeCheck.isSelectable(view))
                view.isSelected = isSelected;
        }
        findItemView(item) {
            if (!item)
                return null;
            return WebApp.linq(this._itemViewMap.entries()).where(a => a[1] == item).select(a => a[0]).first();
        }
        addItem(item) {
            this.items.add(item);
        }
        clear() {
            this.items.clear();
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this._isLoaded)
                    return;
                this.refreshAsync();
            });
        }
        refreshAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                let oldSelection = this.selectedItem;
                if (this.itemsLoader) {
                    this.beginUpdate();
                    yield this.itemsLoader.loadItemsAsync(this, 25);
                    this.endUpdate();
                }
                this._isLoaded = true;
                if (oldSelection && this.itemsSource)
                    this.selectedItem = WebApp.linq(this.items).first(a => this.itemsSource.itemComparer(a, oldSelection));
                else
                    this.selectedItem = null;
            });
        }
        onItemRemoved(itemView) {
            if (itemView) {
                if (itemView.parentView == this)
                    itemView.parentView = null;
                let item = this._itemViewMap.get(itemView);
                if (item == this.selectedItem)
                    this.selectedItem = null;
                this._itemViewMap.delete(itemView);
            }
        }
        createItemView(item) {
            let itemView = this.createItemViewWork(item);
            if (itemView) {
                itemView.parentView = this;
                this._itemViewMap.set(itemView, item);
                if (WebApp.TypeCheck.isSelectable(itemView))
                    itemView.prop("isSelected").subscribe(value => {
                        if (value)
                            this.selectedItem = item;
                    });
            }
            return itemView;
        }
        createItemViewWork(item) {
            let factory = WebApp.Services.views[WebApp.ObjectUtils.getTypeName(item)];
            if (factory)
                return factory(item);
            return new WebApp.TextView({ content: this.itemsSource ? this.itemsSource.getItemText(item) : item.toString() });
        }
        onScroll(data) {
            if ("onScroll" in this.itemsLoader)
                this.itemsLoader.onScroll(data);
        }
        get itemsCount() { return this.content.count; }
        get isScrollCheckActive() { return this.itemsLoader && "onScroll" in this.itemsLoader; }
    }
    WebApp.ListView = ListView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class GridView extends WebApp.ListView {
        constructor(config) {
            super(Object.assign({ styles: ["grid"] }, config));
            this.colsCount = 0;
            this.rowsCount = 0;
            this.bindConfig("colsCount", config);
            this.bindConfig("rowsCount", config);
        }
    }
    WebApp.GridView = GridView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class HeadedContentView extends WebApp.ContentView {
        constructor(config) {
            super(config);
            this.header = null;
            this.headerTemplate = null;
            this.bindConfig("header", config);
        }
    }
    WebApp.HeadedContentView = HeadedContentView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class HtmlView extends WebApp.ContentView {
        constructor(config) {
            super(Object.assign({ template: "Html" }, config));
        }
    }
    WebApp.HtmlView = HtmlView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class IconTextView extends WebApp.ViewComponent {
        constructor(config) {
            super(config);
            this.icon = null;
            this.text = null;
            this.bindConfig("icon", config);
            this.bindConfigString("text", config);
        }
    }
    WebApp.IconTextView = IconTextView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ImageView extends WebApp.ContentView {
        constructor(config) {
            super(Object.assign({ template: "Image" }, config));
        }
        loadAsync() {
            if (this.content)
                return WebApp.ImageLoader.loadAsync(this.content);
            return Promise.resolve();
        }
    }
    WebApp.ImageView = ImageView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ItemView extends WebApp.Panel {
        constructor(config) {
            super(Object.assign({ template: "ItemView" }, config));
            this.item = null;
            this.contextActions = [];
            this.mainActions = [];
            this.status = null;
            this.canOpen = false;
            this.hasActions = null;
            this.bindConfig("item", config);
            this.bindConfig("canOpen", config);
            if (config) {
                if (config.open)
                    this.openWork = config.open;
                if (config.actions)
                    config.actions.forEach(a => this.addAction(a));
                if (config.itemTemplate)
                    this.content.add(new WebApp.View({ template: t => t.template(config.itemTemplate, this) }));
            }
            this.computed("hasActions", m => WebApp.linq(m.contextActions).any(a => a.visible));
            this.create();
        }
        addAction(action) {
            const view = WebApp.ActionView.fromItemAction(action, () => this.item);
            if (action.priority == WebApp.ActionPriority.Primary) {
                if (this.mainActions.length >= 3) {
                    if (!this._otherAction) {
                        this._otherAction = WebApp.ActionView.fromAction({
                            name: "other",
                            icon: "fas fa-ellipsis-h",
                            operation: WebApp.OperationType.Local,
                            executeAsync: () => Promise.resolve()
                        });
                        this._otherAction.subActions.add(this.mainActions.pop());
                        this.mainActions.push(this._otherAction);
                    }
                    this._otherAction.subActions.add(view);
                }
                else
                    this.mainActions.push(view);
            }
            else {
                this.contextActions.push(view);
                this.prop("hasActions").notifyChanged();
            }
        }
        create() {
        }
        open() {
            if (this.canOpen)
                this.openWork();
        }
        openWork() {
        }
        showMenu() {
            let menu = new WebApp.ContextMenu();
            this.contextActions.forEach(a => menu.actions.add(a));
            menu.showAsync(window.event.srcElement);
        }
    }
    WebApp.ItemView = ItemView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class LocationView extends WebApp.ContentView {
        constructor(config) {
            super(Object.assign({ template: "LocationView" }, config));
            this.mapSize = { width: 1280, height: 720 };
            this.zoomLevel = 16;
            if (config) {
                if (config.mapSize)
                    this.mapSize = config.mapSize;
                if (config.zoomLevel)
                    this.zoomLevel = config.zoomLevel;
            }
            this.updateAsync();
        }
        onContentChanged() {
            this.updateAsync();
        }
        showMap() {
            WebApp.Actions.maps(this.content);
        }
        updateAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                let manager = WebApp.Services.mapManager();
                let pos = this.content.position;
                if (!pos)
                    pos = yield manager.getLocationAsync(this.content.address);
                this.map = manager.staticMap({
                    center: pos,
                    size: this.mapSize,
                    zoomLevel: this.zoomLevel,
                    pins: [{
                            center: pos,
                            icon: 113,
                            name: this.content.name
                        }]
                });
            });
        }
    }
    WebApp.LocationView = LocationView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class MapItemsView extends WebApp.ItemsView {
        constructor(config) {
            super(Object.assign({ template: "Attach" }, config));
            this.itemsSource = null;
            this.status = "";
            this.selectedItem = null;
            this.mapReady = new WebApp.Signal();
            this.bindConfig("itemsSource", config);
            if (config) {
                if (config.manager)
                    this._manager = config.manager;
                if (config.createMapItem)
                    this.createMapItem = config.createMapItem;
            }
            if (!this._manager)
                this._manager = WebApp.Services.mapManager();
            this.prop("selectedItem").subscribe(value => {
                if (!value)
                    this._manager.selectedItem = null;
                else
                    this._manager.selectedItem = value["@mapItem"];
                if (config && config.onItemSelected)
                    config.onItemSelected(value);
            });
            this._manager.onSelectionChanged = () => {
                if (this._manager.selectedItem)
                    this.selectedItem = this._manager.selectedItem["@item"];
                else
                    this.selectedItem = null;
            };
        }
        loadItemsAsync(filter) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.itemsSource)
                    return;
                this.beginUpdate();
                this.content.clear();
                this.status = "loading";
                let operation = WebApp.Operation.begin({ message: "Loading items", type: WebApp.OperationType.Local });
                try {
                    let items = yield this.itemsSource.getItemsAsync(filter);
                    if (items)
                        items.forEach(a => this.content.add(a));
                    if (this.mapReady.isSet)
                        this.initItems();
                }
                finally {
                    operation.end();
                    this.status = "";
                    this.endUpdate();
                }
            });
        }
        attach(element) {
            WebApp.Operation.progress("Map attacched");
            if (this._manager)
                this._manager.attach(element);
            this.mapReady.set();
            if (this.status != "loading")
                this.initItems();
        }
        initItems() {
            let mapOptions = WebApp.linq(this.content).select(a => this.createMapItem(a)).toArray();
            let mapItems = this._manager.addItems(mapOptions);
            for (let i = 0; i < mapItems.length; i++) {
                WebApp.ObjectUtils.set(this.content.get(i), "@mapItem", mapItems[i]);
                WebApp.ObjectUtils.set(mapItems[i], "@item", this.content.get(i));
            }
        }
        createMapItem(item) {
            return undefined;
        }
        onItemAdded(item) {
            if (!this.mapReady.isSet)
                return;
            let options = this.createMapItem(item);
            if (!options.location || isNaN(options.location.latitude) || isNaN(options.location.longitude)) {
                console.warn("Invalid location for " + options.title);
                return;
            }
            let mapItem = this._manager.addItems([options]);
            WebApp.ObjectUtils.set(item, "@mapItem", mapItem);
            WebApp.ObjectUtils.set(mapItem, "@item", item);
        }
        onItemRemoved(item) {
            if (!this.mapReady.isSet)
                return;
            let mapItem = WebApp.ObjectUtils.get(item, "@mapItem");
            if (mapItem)
                this._manager.removeItem(mapItem);
        }
        get manager() { return this._manager; }
    }
    WebApp.MapItemsView = MapItemsView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class MapView extends WebApp.ViewComponent {
        constructor(config) {
            super(Object.assign({ template: "Attach" }, config));
            this.mapReady = new WebApp.Signal();
            if (config) {
                if (config.onMapLoaded)
                    this.onMapLoaded = config.onMapLoaded;
                if (config.manager)
                    this.manager = config.manager;
            }
            if (!this.manager)
                this.manager = WebApp.Services.mapManager();
        }
        attach(element) {
            if (this.manager)
                this.manager.attach(element);
            this.mapReady.set();
            this.onMapLoaded();
        }
        onMapLoaded() {
        }
    }
    WebApp.MapView = MapView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class MediaView extends WebApp.ContentView {
        constructor(config) {
            super(Object.assign({ template: "MediaView" }, config));
            this._imageConfig = {};
            this._videoConfig = {};
            this.activeView = null;
            if (config) {
                if (config.image)
                    this._imageConfig = config.image;
                if (config.video)
                    this._videoConfig = config.video;
            }
            this.updateContent();
        }
        loadAsync() {
            if (this.activeView)
                return this.activeView.loadAsync();
            return Promise.resolve();
        }
        onContentChanged() {
            this.updateContent();
        }
        updateContent() {
            if (this.content && this.content.type == "image")
                this.activeView = new WebApp.ImageView(Object.assign(Object.assign({}, this._imageConfig), { content: this.content.src }));
            if (this.content && this.content.type == "video")
                this.activeView = new WebApp.VideoView(Object.assign(Object.assign({}, this._videoConfig), { content: this.content.src }));
        }
    }
    WebApp.MediaView = MediaView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class MessageBox extends WebApp.BasePopUpMessage {
        constructor(config) {
            super(Object.assign({ template: "MessageBox", className: "message-box" }, config));
            this.actions = observableListOf();
            this.message = null;
            this.title = null;
            this.icon = null;
            this.bindConfigString("title", config, WebApp.StringUsage.Title);
            this.bindConfigString("message", config, WebApp.StringUsage.Message);
            this.bindConfig("icon", config);
            if (config) {
                if (config.actions)
                    config.actions.forEach(a => this.addAction(a));
            }
        }
        addAction(action) {
            const styles = [];
            if (action.priority == WebApp.ActionPriority.Evidence)
                styles.push("primary");
            this.actions.add(WebApp.ActionView.fromAction(action, {
                template: "ActionButton",
                styles: styles,
                executeAsync: () => __awaiter(this, void 0, void 0, function* () {
                    yield action.executeAsync();
                    this.hide(action.name);
                })
            }));
        }
    }
    WebApp.MessageBox = MessageBox;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class NavBarItem extends WebApp.IconTextView {
        constructor(config) {
            super(config);
            this.name = null;
            this.status = "";
            this.badge = null;
            this.behavoirs = [];
            this.content = null;
            this.prop("status");
            this.bindConfig("badge", config);
            this.bindConfig("behavoirs", config);
            this.bindConfig("content", config);
            if (config)
                this.name = config.name;
        }
        select() {
            throw "Not implemented";
        }
    }
    WebApp.NavBarItem = NavBarItem;
    class NavBar extends WebApp.ItemsView {
        constructor(config) {
            super(config);
            this.selectedItem = null;
            this.itemTemplate = "IconTextView";
            this.itemBehavoirs = [];
            this.bindConfig("itemTemplate", config);
            this.bindConfig("itemBehavoirs", config);
            if (config) {
                if (config.items)
                    config.items.forEach(a => this.addItem(a));
                if (config.onItemSelected) {
                    this.onSelectedItemChanged = (a, b) => {
                        NavBar.prototype.onSelectedItemChanged.bind(this)(a, b);
                        config.onItemSelected(a);
                    };
                }
            }
            this.bindConfig("selectedItem", config, {
                convertTo: a => this.getItem(a),
                convertFrom: a => a ? a.name : undefined
            }, this.onSelectedItemChanged);
        }
        getItem(name) {
            return WebApp.linq(this.content).first(a => a.name == name);
        }
        selectItem(name) {
            this.selectedItem = this.getItem(name);
        }
        addItem(config) {
            let item = this.createItem(config);
            this.content.add(item);
            return item;
        }
        createItem(config) {
            let item = new NavBarItem(Object.assign({ template: this.prop("itemTemplate"), behavoirs: this.prop("itemBehavoirs") }, config));
            item.parentView = this;
            item.select = () => this.selectedItem = item;
            return item;
        }
        onSelectedItemChanged(newItem, oldItem) {
            if (oldItem)
                oldItem.status = "";
            if (newItem)
                newItem.status = "active";
        }
    }
    WebApp.NavBar = NavBar;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class PopUpContent extends WebApp.BasePopUpMessage {
        constructor(config) {
            super(Object.assign({ template: "PopUpContent", className: "pop-up-content" }, config));
            this.contentProvider = null;
            this.actions = observableListOf();
            this.contentView = new WebApp.Panel();
            this.title = null;
            this.contentStyle = ["vertical", "fill-h", "fit-items-h"];
            this.closeLabel = "Cancel";
            this.bindConfig("contentProvider", config);
            this.bindConfig("contentStyle", config);
            this.bindConfigString("title", config);
            this.bindConfigString("closeLabel", config);
        }
        createAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                const viewContent = yield this.contentProvider.getContentAsync(this);
                if (viewContent.actions) {
                    this.addAction({
                        name: "close",
                        icon: "fas fa-close",
                        displayName: this.closeLabel,
                        executeAsync: () => this.closeAsync()
                    });
                    viewContent.actions.forEach(a => this.addAction(a));
                }
                if (viewContent.title)
                    this.title = WebApp.DynamicString.getValue(viewContent.title);
                this.contentView.content.clear();
                if (viewContent.views)
                    viewContent.views.forEach(a => this.contentView.addView(a));
                if (viewContent.styles && viewContent.styles.length > 0)
                    this.contentView.styles = viewContent.styles;
                else
                    this.contentView.styles = this.contentStyle;
            });
        }
        get result() {
            return new Promise(res => this._resultResolve = res);
        }
        openAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.createAsync();
                this.showAsync();
                return this;
            });
        }
        notifyContentChanged(provider) {
            this.createAsync();
        }
        closeAsync(result) {
            if (this._resultResolve)
                this._resultResolve(result);
            this.hide("");
            return Promise.resolve(true);
        }
        addAction(action) {
            let actionView = WebApp.ActionView.fromAction(action);
            if (action.priority == WebApp.ActionPriority.Evidence) {
                actionView.styles.push("primary");
                actionView.buildStyles();
            }
            this.actions.add(actionView);
            return actionView;
        }
    }
    WebApp.PopUpContent = PopUpContent;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ProgressView extends WebApp.ViewComponent {
        constructor(config) {
            super(config);
        }
    }
    WebApp.ProgressView = ProgressView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class PropertyView extends WebApp.ViewComponent {
        constructor(config) {
            super(Object.assign({ template: "PropertyView" }, config));
            this._lastValidationValue = undefined;
            this.isDirty = null;
            this.isValid = true;
            this.value = null;
            this.editor = null;
            this.error = null;
            this.label = null;
            this.readonly = false;
            this.showLabel = true;
            this.validators = [];
            this.bindConfig("editor", config);
            this.bindConfig("readonly", config);
            this.bindConfig("showLabel", config);
            this.bindConfig("value", config);
            this.bindConfigString("label", config, WebApp.StringUsage.Label);
            this.prop("error");
            if (config) {
                if (config.onValueChanged)
                    this.prop("value").subscribe((o, n) => config.onValueChanged(o, n));
                if (config.validators)
                    this.validators = config.validators;
            }
            this.prop("editor").subscribe(() => this.bindEditor());
            this.bindEditor();
        }
        bindEditor() {
            if (this.editor) {
                this.editor.name = this.name;
                this.editor.value = this.value;
                this.bind("value", this.editor.prop("value"));
                this.bind("isDirty", this.editor.prop("isDirty"));
                if ("label" in this.editor) {
                    this.bind("label", this.editor.prop("label"));
                    this.showLabel = false;
                }
                this.editor.prop("isValid").subscribe(value => {
                    if (!value)
                        this.isValid = false;
                    this.error = this.editor.error;
                });
            }
        }
        clearError() {
            this.editor.error = null;
            this.error = null;
        }
        validateAsync(target, force) {
            return __awaiter(this, void 0, void 0, function* () {
                console.group("begin validation: " + this.label, " - needValidation: ", this.isDirty);
                try {
                    const curValue = this.editor instanceof WebApp.NumberEditor ? this.editor.value : this.editor.editValue;
                    if (!force && this._lastValidationValue !== undefined && WebApp.ObjectUtils.equals(this._lastValidationValue, curValue))
                        return this.isValid;
                    this.clearError();
                    this._lastValidationValue = curValue;
                    if (!(yield this.editor.validateAsync(force))) {
                        this.isValid = false;
                        this.error = this.editor.error;
                        return false;
                    }
                    const ctx = {
                        value: curValue,
                        fieldName: this.label,
                        target: target
                    };
                    for (let validator of this.validators) {
                        const result = yield validator.validateAsync(ctx);
                        if (!result.isValid) {
                            this.error = WebApp.DynamicString.getValue(result.error, WebApp.StringUsage.Message);
                            this.isValid = false;
                            return false;
                        }
                    }
                    this.isValid = true;
                    return true;
                }
                finally {
                    console.groupEnd();
                }
            });
        }
        loadAsync() {
            return this.editor.loadAsync();
        }
        clear() {
            this.editor.clear();
            this.clearError();
        }
    }
    WebApp.PropertyView = PropertyView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class RemovableItemView extends WebApp.ContentView {
        constructor(config) {
            super(config);
            this.item = null;
            this.bindConfig("item", config);
            if (config) {
                if (config.removeAsync)
                    this.removeWorkAsync = config.removeAsync;
            }
        }
        removeAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                this.status = "removed";
                yield WebApp.PromiseUtils.delay(150);
                yield this.removeWorkAsync();
            });
        }
        removeWorkAsync() {
            throw "Not supported";
        }
    }
    WebApp.RemovableItemView = RemovableItemView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class SearchView extends WebApp.ActionView {
        constructor(config) {
            super(Object.assign({ name: "search", template: "SearchView", content: "fas fa-search", tooltip: "Ricerca" }, config));
            this._lastSearchText = null;
            this.searchText = null;
            this.isExpanded = false;
            this.hasFocus = false;
            this.poolInterval = 200;
            this.bindConfig("isExpanded", config);
            this.bindConfig("searchText", config);
            this.prop("hasFocus").subscribe(value => this.onFocusChanged(value));
            if (config) {
                if (config.poolInterval)
                    this.poolInterval = config.poolInterval;
                if (config.searchAsync)
                    this.doSearchAsync = config.searchAsync;
            }
        }
        onFocusChanged(value) {
            if (value) {
                this._lastSearchText = this.searchText;
                this.poolSearchTextAsync();
            }
        }
        poolSearchTextAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                while (this.hasFocus) {
                    if (this.searchText != this._lastSearchText) {
                        this._lastSearchText = this.searchText;
                        yield this.searchAsync(this._lastSearchText);
                    }
                    yield WebApp.PromiseUtils.delay(this.poolInterval);
                }
            });
        }
        executeWorkAsync() {
            if (!this.isExpanded) {
                this.isExpanded = true;
                this.hasFocus = true;
            }
            return Promise.resolve();
        }
        searchAsync(text) {
            return __awaiter(this, void 0, void 0, function* () {
                this.status = "searching";
                yield WebApp.PromiseUtils.delay(0);
                try {
                    yield this.doSearchAsync(text);
                }
                finally {
                    this.status = "loaded";
                }
            });
        }
        doSearchAsync(text) {
            return Promise.resolve();
        }
        clear() {
            this.searchText = "";
        }
        close() {
            this.isExpanded = false;
        }
    }
    WebApp.SearchView = SearchView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class SectionView extends WebApp.ContentView {
        constructor(config) {
            super(config);
            if (typeof (config === null || config === void 0 ? void 0 : config.header) == "string")
                this.header = new WebApp.TextView({ content: config.header });
        }
    }
    WebApp.SectionView = SectionView;
    class SectionsView extends WebApp.ItemsView {
        constructor(config) {
            super(config);
            if (config === null || config === void 0 ? void 0 : config.sections)
                config.sections.forEach(a => this.content.add(new SectionView(a)));
        }
        section(name) {
            return WebApp.linq(this.content).first(a => a.name == name);
        }
    }
    WebApp.SectionsView = SectionsView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class SelectableItemView extends WebApp.ContentView {
        constructor(config) {
            super(config);
            this.isSelected = false;
            this.item = null;
            this.bindConfig("isSelected", config);
            this.bindConfig("item", config);
        }
        select() {
            this.isSelected = true;
        }
        toggle() {
            this.isSelected = !this.isSelected;
        }
    }
    WebApp.SelectableItemView = SelectableItemView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class SelfHostedPageHost extends WebApp.View {
        constructor(config) {
            super(Object.assign({ template: "SinglePageHost" }, config));
            this._parentHost = window.parent["WebApp"]["app"]["pageHost"];
            this._parentPage = this._parentHost.current;
        }
        get(index) {
            return this._parentHost.get(index);
        }
        clearAsync() {
            this.current = null;
            return Promise.resolve();
        }
        goBackAsync() {
            return this._parentHost.goBackAsync();
        }
        goForwardAsync() {
            return this._parentHost.goForwardAsync();
        }
        bringFrontAsync(page) {
            if (page == this.current)
                return Promise.resolve();
            return this._parentHost.bringFrontAsync(page);
        }
        loadAsync(page, options) {
            if (!this.current) {
                page.host = this;
                this.current = page;
                page.loadAsync();
                page.status = "active";
                return Promise.resolve(page);
            }
            return this._parentHost.loadAsync(page, options);
        }
        find(nameOrType) {
            if (this.current) {
                if (WebApp.TypeCheck.isString(nameOrType) && nameOrType == WebApp.ObjectUtils.getTypeName(this.current))
                    return this.current;
                if (WebApp.ObjectUtils.getType(this.current) == nameOrType)
                    return this.current;
            }
            return this._parentHost.find(nameOrType);
        }
        goToAsync(index) {
            return __awaiter(this, void 0, void 0, function* () {
                this._parentHost.currentIndex = index;
                return Promise.resolve();
            });
        }
        get canGoBack() {
            return this._parentHost.canGoBack;
        }
        get currentIndex() {
            return this._parentHost.currentIndex;
        }
        set currentIndex(value) {
            this._parentHost.currentIndex = value;
        }
        get pageCount() {
            return this._parentHost.pageCount;
        }
    }
    WebApp.SelfHostedPageHost = SelfHostedPageHost;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class SimpleItemView extends WebApp.IconTextView {
        constructor(config) {
            super(config);
            this.subText = null;
            this.status = null;
            this.item = null;
            this.bindConfigString("subText", config);
            this.bindConfig("status", config);
            this.bindConfig("item", config);
        }
    }
    WebApp.SimpleItemView = SimpleItemView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class SlidePageHost extends WebApp.View {
        constructor(config) {
            super(config);
            this._activeViewIndex = 0;
            this.defaultTransaction = "pop-up-down";
            this.activeTransaction = "none";
            this.pageViews = [{ content: null, className: null },
                { content: null, className: null }];
            this.clearAsync();
            if (config) {
                if (config.defaultTransaction)
                    this.defaultTransaction = config.defaultTransaction;
            }
        }
        clearAsync() {
            this._pageStack = [];
            this._currentIndex = -1;
            this._activeViewIndex = 0;
            this.pageViews[0].content = null;
            this.pageViews[0].className = "immediate next";
            this.pageViews[1].content = null;
            this.pageViews[1].className = "immediate prev";
        }
        goBackAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this._currentIndex > 0)
                    yield this.goToAsync(this._currentIndex - 1);
            });
        }
        goForwardAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this._currentIndex > 0)
                    yield this.goToAsync(this._currentIndex + 1);
            });
        }
        bringFrontAsync(page) {
            return __awaiter(this, void 0, void 0, function* () {
                let pageIndex = WebApp.linq(this._pageStack).indexOf(a => a.page == page);
                if (pageIndex != -1)
                    yield page.host.goToAsync(pageIndex);
            });
        }
        loadAsync(page, options) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.current == page) {
                    yield page.refreshAsync();
                    return page;
                }
                this.cancelHidePrev();
                let op = WebApp.Operation.begin("Hosting new page");
                try {
                    if (this.current && WebApp.Activity.isActivity(this.current))
                        yield this.current.deactivateAsync();
                    if ((options === null || options === void 0 ? void 0 : options.loadMode) == "clear")
                        this._currentIndex = -1;
                    if ((options === null || options === void 0 ? void 0 : options.loadMode) == "replace" && this.currentIndex >= 0)
                        this._currentIndex--;
                    while (this._pageStack.length > this._currentIndex + 1)
                        this._pageStack.splice(this._pageStack.length - 1, 1);
                    this._pageStack.push({ page: page, options: options });
                    if (options && options.transaction)
                        this.activeTransaction = options.transaction;
                    else
                        this.activeTransaction = this.defaultTransaction;
                    this._currentIndex++;
                    page.host = this;
                    page.view.parentView = this;
                    this.pageViews[this.backIndex].className = "immediate next";
                    yield WebApp.PromiseUtils.delay(0);
                    yield page.loadAsync();
                    if (this._currentIndex > 0) {
                        this.pageViews[this.backIndex].content = page.view;
                        yield WebApp.PromiseUtils.delay(0);
                        this.pageViews[this.frontIndex].className = "animate prev";
                        this.pageViews[this.backIndex].className = "animate active";
                        this._activeViewIndex = this.backIndex;
                        this.hidePrev();
                    }
                    else {
                        this.pageViews[this.frontIndex].content = page.view;
                        this.pageViews[this.frontIndex].className = "active";
                    }
                    page.status = "active";
                    if (WebApp.Activity.isActivity(this.current))
                        yield this.current.activateAsync();
                }
                catch (e) {
                    WebApp.app.handleError(this, e);
                }
                finally {
                    op.end();
                }
                return page;
            });
        }
        get(index) {
            return this._pageStack[index].page;
        }
        goToAsync(index) {
            return __awaiter(this, void 0, void 0, function* () {
                if (index < 0 || index >= this._pageStack.length || index == this._currentIndex)
                    return;
                this.cancelHidePrev();
                let op = WebApp.Operation.begin("Going to " + index);
                try {
                    if (WebApp.Activity.isActivity(this.current))
                        yield this.current.deactivateAsync();
                    this.current.status = "hidden";
                    let options = this._pageStack[this._currentIndex].options;
                    if (options && options.transaction)
                        this.activeTransaction = options.transaction;
                    else
                        this.activeTransaction = this.defaultTransaction;
                    this._currentIndex = index;
                    if (this.current.view.parentView == this)
                        this.current.view.parentView = null;
                    this.pageViews[this.backIndex].content = this._pageStack[this._currentIndex].page.view;
                    this.pageViews[this.backIndex].className = "immmediate prev";
                    yield WebApp.PromiseUtils.delay(0);
                    this.pageViews[this.frontIndex].className = "animate next";
                    this.pageViews[this.backIndex].className = "animate active";
                    this._activeViewIndex = this.backIndex;
                    this.current.status = "active";
                    if (WebApp.Activity.isActivity(this.current))
                        yield this.current.activateAsync();
                    this.hidePrev();
                }
                catch (e) {
                    WebApp.app.handleError(this, e);
                }
                finally {
                    op.end();
                }
            });
        }
        cancelHidePrev() {
            if (this._hideTimerId) {
                clearTimeout(this._hideTimerId);
                this._hideTimerId = null;
            }
        }
        hidePrev() {
            this._hideTimerId = window.setTimeout(() => {
                if (!this._hideTimerId)
                    return;
                this.pageViews[this.backIndex].className = "prev hide";
            }, 4000);
        }
        onActivePageChanged() {
        }
        onTransactionEnd() {
        }
        find(nameOrType) {
            let curPage;
            if (typeof nameOrType == "string")
                curPage = WebApp.linq(this._pageStack).first(a => a.page.name == nameOrType);
            else
                curPage = WebApp.linq(this._pageStack).first(a => Object.getPrototypeOf(a.page).constructor == nameOrType);
            if (curPage)
                return curPage.page;
        }
        get current() {
            return this._currentIndex == -1 ? undefined : this._pageStack[this._currentIndex].page;
        }
        get canGoBack() {
            return this._currentIndex > 0;
        }
        get frontIndex() {
            return this._activeViewIndex;
        }
        get backIndex() {
            return (this._activeViewIndex + 1) % 2;
        }
        get currentIndex() {
            return this._currentIndex;
        }
        set currentIndex(value) {
            if (this._currentIndex == value)
                return;
            this.goToAsync(value);
        }
        get pageCount() {
            return this._pageStack.length;
        }
    }
    WebApp.SlidePageHost = SlidePageHost;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class SnackBar extends WebApp.ViewComponent {
        constructor() {
            super({ template: "SnackBar" });
            this.action = null;
            this.content = null;
            this.showTime = WebApp.TimeSpan.fromSeconds(0);
            this.instanceId = null;
            this.status = "close";
            new WebApp.TemplateBuilder(this, document.body).content(this);
        }
        showAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.status == "open")
                    return;
                WebApp.app.unblock(true);
                yield WebApp.PromiseUtils.delay(0);
                this.status = "open";
                return new Promise(res => this._showResolve = res);
            });
        }
        hide(actionName) {
            if (this.status != "open")
                return;
            this.status = "close";
            WebApp.app.restoreBlock();
            if (this._showResolve) {
                this._showResolve(actionName);
                this._showResolve = null;
            }
        }
        static showAsync(options) {
            const instanceId = new Date().valueOf();
            if (!SnackBar.instance)
                SnackBar.instance = new SnackBar();
            SnackBar.instance.content = options.content;
            SnackBar.instance.instanceId = instanceId;
            if (options.action) {
                let action;
                if (typeof options.action == "string")
                    action = {
                        name: options.action,
                        executeAsync: () => Promise.resolve()
                    };
                else
                    action = options.action;
                SnackBar.instance.action = WebApp.ActionView.fromAction(action, {
                    executeAsync: () => __awaiter(this, void 0, void 0, function* () {
                        yield action.executeAsync();
                        SnackBar.instance.hide(action.name);
                    })
                });
            }
            else
                SnackBar.instance.action = null;
            if (options.showTime) {
                setTimeout(() => {
                    if (SnackBar.instance.instanceId == instanceId && SnackBar.instance._isVisible)
                        SnackBar.instance.hide(null);
                }, options.showTime.totalMilliseconds);
            }
            return SnackBar.instance.showAsync();
        }
    }
    SnackBar.instance = null;
    WebApp.SnackBar = SnackBar;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class StaticMapView extends WebApp.ViewComponent {
        constructor(config) {
            super(Object.assign({ template: "ImageView" }, config));
            this.bindConfig("options", config);
            this.update();
        }
        update() {
            this.content = WebApp.Services.mapManager().staticMap(this.options);
        }
    }
    WebApp.StaticMapView = StaticMapView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class TextView extends WebApp.ContentView {
        constructor(config) {
            super(Object.assign({ template: "TextContent" }, config));
        }
    }
    WebApp.TextView = TextView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class Toast extends WebApp.ViewComponent {
        constructor(config) {
            super(Object.assign({ template: "Toast", visible: false }, config));
            this.message = null;
            this.showTime = WebApp.TimeSpan.fromSeconds(0);
            if (Toast._container == null)
                Toast.init();
            this.bindConfigString("message", config, WebApp.StringUsage.Tooltip);
            this.bindConfig("showTime", config);
        }
        static init() {
            Toast._container = document.createElement("div");
            Toast._container.className = "toast-container";
            const builder = new WebApp.TemplateBuilder(Toast._items, Toast._container);
            builder.template("ToastContainer", a => a);
            document.body.appendChild(Toast._container);
        }
        showAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                Toast._items.add(this);
                yield WebApp.PromiseUtils.delay(10);
                this.visible = true;
                let showMs = this.showTime.totalMilliseconds;
                if (showMs == 0)
                    showMs = Math.min(Math.max(this.message.length * 70, 2000), 7000);
                setTimeout(() => this.hideAsync(), showMs);
                return new Promise(res => this._showResolve = res);
            });
        }
        hideAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                this.visible = false;
                yield WebApp.PromiseUtils.delay(600);
                Toast._items.remove(this);
                if (this._showResolve) {
                    this._showResolve();
                    this._showResolve = null;
                }
            });
        }
    }
    Toast._items = observableListOf();
    WebApp.Toast = Toast;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class VideoView extends WebApp.ContentView {
        constructor(config) {
            super(Object.assign({ template: "VideoView" }, config));
            this.isAutoPlay = true;
            this.isMuted = true;
            this.showControls = false;
            this.isLoop = true;
            this.bindConfig("isAutoPlay", config);
            this.bindConfig("isMuted", config);
            this.bindConfig("showControls", config);
            this.bindConfig("isLoop", config);
        }
        onContentChanged() {
            this.updateVideo();
        }
        attach(element) {
            this._video = element;
            this.updateVideo();
        }
        loadAsync() {
            if (this.content) {
                if (this._video)
                    return WebApp.VideoLoader.loadIntoAsync(this.content, this._video);
                else
                    return WebApp.VideoLoader.loadAsync(this.content);
            }
            return Promise.resolve();
        }
        updateVideo() {
            if (!this._video)
                return;
            this._video.muted = this.isMuted;
            this._video.autoplay = this.isAutoPlay;
            this._video.controls = this.showControls;
            this._video.loop = this.isLoop;
            if (this.content)
                this._video.load();
        }
        play() {
            if (this._video)
                this._video.play();
        }
        pause() {
            if (this._video)
                this._video.pause();
        }
    }
    WebApp.VideoView = VideoView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class WebPage extends WebApp.Page {
        constructor(config) {
            super(config);
            this.view = new WebApp.WebView();
            this.updateUrl();
            this.prop("url").subscribe(() => this.updateUrl());
        }
        updateUrl() {
            this.view.content = WebApp.Uri.absolute(WebApp.Format.replaceArgs(this.url, WebApp.app.startupArgs));
        }
        loadWorkAsync() {
            if (!this.view.window || this.view.window.document.readyState == "complete")
                return Promise.resolve();
            return new Promise((res, rej) => {
                function onLoad(ev) {
                    this.view.window.removeEventListener("load", onLoad);
                    res();
                }
                function onError(ev) {
                    this.view.window.removeEventListener("error", onError);
                    rej();
                }
                this.view.window.addEventListener("load", onLoad);
                this.view.window.addEventListener("error", onError);
            });
        }
        refreshAsync() {
            if (!this.view.window)
                return Promise.resolve();
            return new Promise((res, rej) => {
                function onLoad(ev) {
                    this.view.window.removeEventListener("load", onLoad);
                    res();
                }
                function onError(ev) {
                    this.view.window.removeEventListener("error", onError);
                    rej();
                }
                this.view.window.addEventListener("load", onLoad);
                this.view.window.addEventListener("error", onError);
                this.view.window.document.location.reload();
            });
        }
        closeAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                this.view.window.close();
                if ("goBackAsync" in this.host)
                    yield this.host.goBackAsync();
                return true;
            });
        }
    }
    WebApp.WebPage = WebPage;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class WebView extends WebApp.ContentView {
        constructor(config) {
            super(Object.assign({ template: "WebView" }, config));
        }
        attach(element) {
            this.window = element.contentWindow;
        }
    }
    WebApp.WebView = WebView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class WizardStepView extends WebApp.ContentView {
        constructor(config) {
            super(Object.assign({ template: "ContentView" }, config));
            this.error = null;
            this.isValid = true;
            this.index = 0;
            this.title = "";
            this.isActive = false;
            this.nextLabel = null;
            this.coverImage = null;
            this.actions = observableListOf();
            this.bindConfig("index", config);
            this.bindConfig("coverImage", config);
            this.bindConfigString("title", config, WebApp.StringUsage.Title);
            this.bindConfigString("nextLabel", config, WebApp.StringUsage.Action);
            if (config) {
                if (config.loadAsync)
                    this.loadAsync = () => config.loadAsync(this);
                if (config.validateAsync)
                    this.validateAsync = force => config.validateAsync(this);
                if (config.actions)
                    config.actions.forEach(a => this.addAction(a));
            }
        }
        addAction(action) {
            let view = WebApp.ActionView.fromAction(action, { template: "ActionButton", styles: ["primary"] });
            this.actions.add(view);
            return view;
        }
        loadAsync() {
            if (WebApp.TypeCheck.isAsyncLoad(this.content))
                return this.content.loadAsync();
            return Promise.resolve();
        }
        validateAsync(force) {
            return __awaiter(this, void 0, void 0, function* () {
                if (WebApp.TypeCheck.isValidable(this.content))
                    this.isValid = yield this.content.validateAsync(force);
                return this.isValid;
            });
        }
        select() {
            this.parentView.selectStepAsync(this.index);
        }
    }
    WebApp.WizardStepView = WizardStepView;
    class WizardView extends WebApp.ItemsView {
        constructor(config) {
            super(Object.assign({ template: "WizardView" }, config));
            this.currentStepIndex = -1;
            this.nextLabel = "Next";
            this.prevLabel = "Previous";
            this.finishLabel = "Finish";
            this.actions = {
                next: new WebApp.ActionView({
                    name: "next",
                    template: "ActionButton",
                    styles: ["secondary"],
                    content: new WebApp.IconTextView({
                        template: "IconTextViewInline",
                        text: this.prop("nextLabel")
                    }),
                    executeAsync: () => this.nextAsync()
                }),
                prev: new WebApp.ActionView({
                    name: "prev",
                    template: "ActionButton",
                    styles: ["secondary"],
                    content: new WebApp.IconTextView({
                        template: "IconTextViewInline",
                        text: this.prop("prevLabel")
                    }),
                    executeAsync: () => this.previousAsync()
                }),
                finish: new WebApp.ActionView({
                    name: "finish",
                    template: "ActionButton",
                    styles: ["secondary"],
                    content: new WebApp.IconTextView({
                        template: "IconTextViewInline",
                        text: this.prop("finishLabel")
                    }),
                    executeAsync: () => this.finishAsync()
                })
            };
            this.prop("currentStepIndex").subscribe((value, oldValue) => {
                var _a;
                if (oldValue != -1)
                    this.content.get(oldValue).isActive = false;
                this.content.get(value).isActive = true;
                this.currentView = this.content.get(value);
                this.actions.next.visible = this.hasNextStep();
                this.actions.prev.visible = this.hasPrevStep();
                this.actions.finish.visible = !this.hasNextStep();
                if (this.currentView.nextLabel)
                    this.nextLabel = this.currentView.nextLabel;
                else
                    this.nextLabel = WebApp.DynamicString.getValue((_a = config === null || config === void 0 ? void 0 : config.nextLabel) !== null && _a !== void 0 ? _a : WebApp.Strings["wizard-next"], WebApp.StringUsage.Action);
            });
            this.bindConfigString("nextLabel", config, WebApp.StringUsage.Action);
            this.bindConfigString("prevLabel", config, WebApp.StringUsage.Action);
            this.bindConfigString("finishLabel", config, WebApp.StringUsage.Action);
            if (config) {
                if (config.steps) {
                    config.steps.forEach((step, i) => this.content.add(new WizardStepView(Object.assign(Object.assign({}, step), { index: i }))));
                    this.currentStepIndex = 0;
                }
                if (config.finishAsync)
                    this.doFinishAsync = config.finishAsync;
            }
            if (!(config === null || config === void 0 ? void 0 : config.prevLabel))
                this.prevLabel = WebApp.DynamicString.getValue(WebApp.Strings["wizard-prev"], WebApp.StringUsage.Action);
            if (!(config === null || config === void 0 ? void 0 : config.finishLabel))
                this.prevLabel = WebApp.DynamicString.getValue(WebApp.Strings["wizard-finish"], WebApp.StringUsage.Action);
        }
        finishAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if ((yield this.validateUntilAsync(this.content.count - 1)) !== true)
                    return;
                yield this.doFinishAsync();
            });
        }
        doFinishAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                return Promise.resolve();
            });
        }
        clearErrors() {
        }
        validateUntilAsync(targetIndex) {
            return __awaiter(this, void 0, void 0, function* () {
                let curStep = this.currentStepIndex;
                while (curStep <= targetIndex) {
                    if (!(yield this.content.get(curStep).validateAsync()))
                        return curStep;
                    curStep++;
                }
                return true;
            });
        }
        selectStepAsync(index) {
            return __awaiter(this, void 0, void 0, function* () {
                if (index == this.currentStepIndex)
                    return;
                this.clearErrors();
                if (index > this.currentStepIndex) {
                    let result = yield this.validateUntilAsync(index - 1);
                    if (result === true) {
                        this.currentStepIndex = index;
                        yield this.content.get(index).loadAsync();
                    }
                    else {
                        this.currentStepIndex = result;
                        if (result != this.currentStepIndex)
                            yield this.content.get(result).loadAsync();
                    }
                }
                else
                    this.currentStepIndex = index;
            });
        }
        nextAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.currentStepIndex + 1 < this.content.count)
                    yield this.selectStepAsync(this.currentStepIndex + 1);
            });
        }
        previousAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.currentStepIndex > 0)
                    yield this.selectStepAsync(this.currentStepIndex - 1);
            });
        }
        endAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.selectStepAsync(this.content.count - 1);
            });
        }
        hasPrevStep() {
            let curIndex = this.currentStepIndex - 1;
            while (curIndex >= 0) {
                if (this.content.get(curIndex).visible)
                    return true;
                curIndex--;
            }
            return false;
        }
        hasNextStep() {
            let curIndex = this.currentStepIndex + 1;
            while (curIndex <= this.content.count - 1) {
                if (this.content.get(curIndex).visible)
                    return true;
                curIndex++;
            }
            return false;
        }
        isComplete() {
            return !this.hasNextStep();
        }
    }
    WebApp.WizardView = WizardView;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ItemEditContent extends WebApp.BindableObject {
        constructor(config) {
            super();
            this.editor = null;
            this.title = null;
            this.value = null;
            this.saveLabel = "Save";
            this.saveOnCommit = false;
            this.savePriority = null;
            this.styles = ["vertical", "scroll", "fill-h", "fit-items-h"];
            this.info = {
                name: "item-edit",
                icon: "fas fa-edit",
                displayName: "Edit"
            };
            this.bindConfig("editor", config);
            this.bindConfig("value", config);
            this.bindConfig("styles", config);
            this.bindConfig("savePriority", config);
            this.bindConfig("saveOnCommit", config);
            this.bindConfigString("title", config, WebApp.StringUsage.Title);
            this.bindConfigString("saveLabel", config, WebApp.StringUsage.Action);
            if (config) {
                if (config.saveItemAsync)
                    this.saveItemAsync = config.saveItemAsync;
            }
        }
        getContentAsync(host) {
            return __awaiter(this, void 0, void 0, function* () {
                this._host = host;
                yield this.editor.beginEditAsync(this.value);
                const container = new WebApp.Container({
                    name: "editor-container",
                    title: this.title,
                    content: this.editor.view
                });
                if (WebApp.TypeCheck.isActivable(this.editor))
                    setTimeout(() => this.editor.activateAsync(), 200);
                const actions = [];
                if (this.saveOnCommit) {
                    this.editor.prop("value").subscribe(value => this.saveAsync());
                }
                else {
                    actions.push({
                        name: "save",
                        icon: "fas fa-save",
                        displayName: this.saveLabel,
                        priority: this.savePriority,
                        executeAsync: () => this.saveAsync()
                    });
                }
                return Promise.resolve({
                    views: [container],
                    actions: actions,
                    styles: this.styles,
                    title: this.title
                });
            });
        }
        saveItemAsync(item) {
            return Promise.resolve(item);
        }
        saveAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.saveOnCommit) {
                    if (!this.editor.isValid)
                        return;
                }
                else {
                    if (!(yield this.editor.commitAsync(true)))
                        return;
                }
                const result = yield this.saveItemAsync(this.editor.value);
                if (result == null)
                    return;
                yield this._host.closeAsync(result);
            });
        }
    }
    WebApp.ItemEditContent = ItemEditContent;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ItemListContent extends WebApp.BindableObject {
        constructor() {
            super();
            this._isRefreshing = false;
        }
        refreshAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                this._isRefreshing = true;
                try {
                    yield this._listView.refreshAsync();
                }
                finally {
                    this._isRefreshing = false;
                }
            });
        }
        deactivateAsync() {
            var _a;
            (_a = this._listView) === null || _a === void 0 ? void 0 : _a.deactivateListener();
            return Promise.resolve();
        }
        activateAsync(reason) {
            var _a;
            (_a = this._listView) === null || _a === void 0 ? void 0 : _a.activateListener();
            return this.refreshAsync();
        }
        getContentAsync(host) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const views = [];
                const options = yield this.configureAsync(host);
                this._listView = new WebApp.ListView(Object.assign({ itemsSource: options.itemsSource, itemsLoader: options.pageSize ? new WebApp.PagedItemsLoader({
                        pageSize: options.pageSize
                    }) : undefined }, options.listView));
                if (options.filters) {
                    if (options.filters.length > 1) {
                        this._tabView = new WebApp.NavBar({
                            styles: ["tab-view"],
                            itemTemplate: "TextView",
                            itemBehavoirs: ["ripple"],
                            onItemSelected: item => {
                                this._listView.filter = item.content;
                                this.refreshAsync();
                            },
                            items: WebApp.linq(options.filters).select(a => ({
                                text: a.name,
                                content: a.content
                            })).toArray()
                        });
                        views.push(this._tabView);
                    }
                    else if (options.filters.length == 1)
                        this._listView.filter = options.filters[0].content;
                }
                views.push(this._listView);
                if (this._tabView)
                    this._tabView.selectedItem = this._tabView.content.get(0);
                if (options.footer)
                    options.footer.forEach(a => views.push(a));
                this._listView.activateListener();
                return Promise.resolve({
                    title: (_a = options.title) !== null && _a !== void 0 ? _a : this.info.displayName,
                    actions: options.actions,
                    styles: options.styles,
                    views: views
                });
            });
        }
    }
    WebApp.ItemListContent = ItemListContent;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class MapContent {
        constructor() {
        }
        refreshAsync() {
            return null;
        }
        getContentAsync(host) {
            return __awaiter(this, void 0, void 0, function* () {
                const views = [];
                this._mapView = new WebApp.MapView({
                    onMapLoaded: () => this.onMapLoaded(),
                    manager: WebApp.Services.mapManager()
                });
                this._progress = new WebApp.ProgressView();
                return {
                    views: [this._mapView, this._progress],
                    title: this.info.displayName
                };
            });
        }
        createMapAsync(manager) {
            return Promise.resolve();
        }
        onMapLoaded() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.createMapAsync(this._mapView.manager);
                this._progress.visible = false;
            });
        }
    }
    WebApp.MapContent = MapContent;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class MasterDetailsContent extends WebApp.BindableObject {
        constructor(config) {
            super();
            this.details = null;
            this.minWidth = 400;
            this.masterContent = null;
            this.styles = ["horizontal", "fill-v", "fill-h", "fill-items-v", "master-details"];
            this.mode = "auto";
            this.itemDisplayName = null;
            this.bindConfig("mode", config);
            this.bindConfig("masterContent", config);
            this.bindConfig("itemDisplayName", config);
            this.bindConfig("minWidth", config);
            if (config != null) {
                if (config.styles)
                    config.styles.forEach(a => this.styles.push(a));
            }
            if (this.masterContent)
                this.masterContent.masterHost = this;
        }
        activateAsync(reason) {
            if (this.masterContent.activateAsync)
                return this.masterContent.activateAsync(reason);
            return Promise.resolve();
        }
        deactivateAsync() {
            if (this.masterContent.deactivateAsync)
                return this.masterContent.deactivateAsync();
            return Promise.resolve();
        }
        getContentAsync(host) {
            return __awaiter(this, void 0, void 0, function* () {
                this._host = host;
                if (this.mode == "auto") {
                    let curWidth = document.body.clientWidth / window.devicePixelRatio;
                    if (curWidth > this.minWidth)
                        this.mode = "split-h";
                    else
                        this.mode = "separate";
                }
                if (this.mode != "separate") {
                    let views = [];
                    this._masterContainer = new WebApp.ContentHostView({
                        name: "master",
                        contentProvider: this.masterContent
                    });
                    this._detailsContainer = new WebApp.ContentHostView({
                        name: "details",
                        emptyView: new WebApp.IconTextView({
                            styles: ["empty-view"],
                            icon: this.info.icon,
                            text: WebApp.Format.message("msg-select-an-item", this.itemDisplayName)
                        })
                    });
                    views.push(this._masterContainer);
                    views.push(this._detailsContainer);
                    return Promise.resolve({
                        views: views,
                        styles: WebApp.ArrayUtils.merge(this.styles, [this.mode]),
                        title: this.info.displayName
                    });
                }
                else
                    return this.masterContent.getContentAsync(host);
            });
        }
        showDetailsAsync(item) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!item) {
                    if (this.mode != "separate")
                        yield this._detailsContainer.closeAsync();
                }
                else {
                    const details = yield this.masterContent.getDetailsAsync(item);
                    if (!details)
                        return;
                    if (this.mode != "separate") {
                        this._detailsContainer.contentProvider = details;
                        yield this._detailsContainer.loadAsync();
                    }
                    else {
                        yield WebApp.Actions.loadPageAsync(new WebApp.ContentActivity({
                            providers: [details],
                            name: details.info.name,
                        }));
                    }
                }
            });
        }
        get info() { return this.masterContent.info; }
    }
    WebApp.MasterDetailsContent = MasterDetailsContent;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class MessageContent {
        constructor(options) {
            this._options = options;
        }
        getContentAsync(host) {
            return __awaiter(this, void 0, void 0, function* () {
                const views = [];
                views.push(new WebApp.IconTextView({
                    icon: this._options.icon,
                    text: this._options.message,
                    styles: ["message-view"]
                }));
                if (this._options.customActions) {
                    this._options.customActions.forEach(action => views.push(new WebApp.ActionView({
                        name: action.name,
                        template: "ActionButton",
                        styles: ["primary"],
                        content: new WebApp.TextView({ content: WebApp.DynamicString.getValue(action.displayName, WebApp.StringUsage.Action) }),
                        executeAsync: () => __awaiter(this, void 0, void 0, function* () {
                            yield host.closeAsync();
                            yield action.executeAsync();
                        })
                    })));
                }
                return Promise.resolve({
                    views: views,
                    title: this._options.title,
                    styles: ["vertical", "margin-items-v", "scroll", "fit-items-h", "surface", "padding"],
                });
            });
        }
        get info() {
            return {
                name: "message",
                icon: null,
                displayName: this._options.title
            };
        }
    }
    WebApp.MessageContent = MessageContent;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ActivityEditor extends WebApp.BindableObject {
        constructor(config) {
            super();
            this.editor = null;
            this.title = "Edit";
            this.bindConfig("editor", config);
            this.bindConfigString("title", config);
            if (config) {
                if (config.editToItemAsync)
                    this.editToItemAsync = config.editToItemAsync;
            }
        }
        editAsync(value, validate) {
            return __awaiter(this, void 0, void 0, function* () {
                const activity = new WebApp.ContentActivity({
                    providers: [new WebApp.ItemEditContent({
                            editor: this.editor,
                            title: this.title,
                            value: value,
                            saveItemAsync: (edit) => __awaiter(this, void 0, void 0, function* () {
                                if (validate) {
                                    const valResult = yield validate(edit);
                                    if (valResult == null)
                                        return null;
                                }
                                return yield this.editToItemAsync(edit);
                            })
                        })]
                });
                const result = yield (yield WebApp.Actions.loadPageAsync(activity, { loadMode: "add" })).result;
                if (result == null)
                    return null;
                return this.editor.value;
            });
        }
        editToItemAsync(edit) {
            return Promise.resolve(edit);
        }
    }
    WebApp.ActivityEditor = ActivityEditor;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class BaseEditor extends WebApp.ViewComponent {
        constructor(config) {
            super(Object.assign({}, config));
            this._needValidation = false;
            this._isEditing = 0;
            this._editValue = null;
            this.isValid = true;
            this.status = "none";
            this.commitMode = "onchange";
            this.validationMode = "onchanged";
            this.allowNull = true;
            this.displayValue = null;
            this.value = null;
            this.hasFocus = false;
            this.isDirty = false;
            this.uid = null;
            this.error = null;
            WebApp.setEnumerable(this, "editValue", BaseEditor.prototype);
            this._onCommit = config === null || config === void 0 ? void 0 : config.onCommit;
            this.bindConfig("hasFocus", config);
            this.bindConfig("value", config);
            this.bindConfig("commitMode", config);
            this.bindConfig("validationMode", config);
            this.prop("displayValue");
            this.prop("value").subscribe((value, old) => this.onValueChanged(value, old));
            this.prop("name").subscribe(() => this.updateUid());
            this.updateUid();
        }
        updateUid() {
            var _a;
            this.uid = WebApp.Identifier.generate(WebApp.ViewUtils.formatForCss((_a = this.name) !== null && _a !== void 0 ? _a : WebApp.ObjectUtils.getTypeName(this)));
        }
        createEditValueProp() {
            this.prop("editValue").subscribe(() => this.notifyEditValueChangedAsync());
        }
        notifyEditValueChangedAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                console.debug("value changed: ", this.debugName);
                this._needValidation = true;
                this.isDirty = true;
                if (!this._isEditing) {
                    if (this.commitMode == "onchange")
                        yield this.commitAsync();
                    else
                        yield this.validateAsync();
                }
            });
        }
        onValueChanged(value, oldValue) {
            if (this.status == "commiting")
                return;
            this.beginEditAsync(value);
        }
        clear() {
            this.value = null;
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                console.group("begin load: ", this.debugName, " - status: ", this.status);
                try {
                    if (this.status != "none")
                        return;
                    this.status = "loading";
                    try {
                        yield this.loadAsyncWork();
                    }
                    finally {
                        this.status = "loaded";
                    }
                }
                finally {
                    console.groupEnd();
                }
            });
        }
        clearError() {
            this.error = null;
        }
        loadAsyncWork() {
            return Promise.resolve();
        }
        beginEditAsync(value) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this._isEditing)
                    return;
                console.group("begin edit: ", this.debugName);
                this._isEditing++;
                try {
                    if (this.status == "none")
                        yield this.loadAsync();
                    this.value = value;
                    this.editValue = this.valueToEdit(value);
                    yield this.beginEditWorkAsync(value);
                    this._needValidation = true;
                }
                finally {
                    this._isEditing--;
                    console.groupEnd();
                }
            });
        }
        valueToEdit(value) {
            return value;
        }
        editToValue(value) {
            return value;
        }
        beginEditWorkAsync(value) {
            return Promise.resolve();
        }
        validateAsync(force) {
            return __awaiter(this, void 0, void 0, function* () {
                console.group("begin validation: " + this.debugName, " - needValidation: ", this._needValidation);
                try {
                    if (this._isEditing)
                        return undefined;
                    if (!this._needValidation && this.validationMode == "onchanged" && !force)
                        return this.isValid;
                    this.clearError();
                    const validationResult = yield this.validateAsyncWork(force);
                    if (validationResult !== undefined) {
                        this.isValid = validationResult;
                        this._needValidation = false;
                    }
                    console.debug("validation: ", this.debugName, " = ", this.isValid);
                    return this.isValid;
                }
                finally {
                    console.groupEnd();
                }
            });
        }
        validateAsyncWork(force) {
            return Promise.resolve(true);
        }
        commitAsync(force) {
            return __awaiter(this, void 0, void 0, function* () {
                console.group("begin commit: ", this.debugName, " isDirty: ", this.isDirty, " - status: ", this.status);
                try {
                    if (this._isEditing)
                        return false;
                    if (!force && this.commitMode != "manual" && !this.isDirty)
                        return true;
                    if (this.status != "loaded")
                        return this.status == "commiting";
                    this.status = "commiting";
                    try {
                        if (!(yield this.validateAsync(force)))
                            return false;
                        if (!(yield this.commitAsyncWork(force)))
                            return false;
                        const newValue = this.editToValue(this.editValue);
                        if (newValue !== undefined)
                            this.value = newValue;
                        if (this._onCommit)
                            this._onCommit(this);
                        this.isDirty = false;
                        return true;
                    }
                    finally {
                        this.status = "loaded";
                    }
                }
                finally {
                    console.groupEnd();
                }
            });
        }
        activateAsync() {
            return Promise.resolve();
        }
        commitAsyncWork(force) {
            return Promise.resolve(true);
        }
        rollback() {
            this.editValue = this.valueToEdit(this.value);
        }
        get view() {
            return this;
        }
        get editValue() {
            return this._editValue;
        }
        set editValue(value) {
            this._editValue = value;
        }
    }
    WebApp.BaseEditor = BaseEditor;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class BaseItemEditor extends WebApp.BindableObject {
        constructor(config) {
            super();
            this.view = null;
            this.value = null;
            this.isValid = null;
        }
        beginEditAsync(item) {
            throw "Not implemented";
        }
        commitAsync(force) {
            throw "Not implemented";
        }
    }
    WebApp.BaseItemEditor = BaseItemEditor;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class BasePicker extends WebApp.BaseEditor {
        constructor(config) {
            super(config);
            this.canAdd = false;
            this.addLabel = "Add";
            this.pickLabel = "Select";
            this.selectAction = null;
            this.itemsSource = null;
            this.pageSize = 0;
            this.filters = observableListOf();
            this.bindConfig("canAdd", config);
            this.bindConfig("itemsSource", config);
            this.bindConfig("pageSize", config);
            this.bindConfigString("addLabel", config);
            this.bindConfigString("pickLabel", config);
            if (config) {
                if (config.filters)
                    this.filters.addRange(config.filters);
                if (config.createItemView)
                    this.createItemView = config.createItemView;
                if (config.createItemListView)
                    this.createItemListView = config.createItemListView;
                if (config.createItemEditor)
                    this.createItemEditor = config.createItemEditor;
            }
            if (!(config === null || config === void 0 ? void 0 : config.addLabel))
                this.addLabel = WebApp.Strings["new-item"]({ params: [this.itemsSource.displayName], usage: WebApp.StringUsage.Title });
            if (!(config === null || config === void 0 ? void 0 : config.pickLabel))
                this.pickLabel = WebApp.Strings["select-item"]({ params: [this.itemsSource.displayName], usage: WebApp.StringUsage.Title });
            this.createEditValueProp();
            this.selectAction = WebApp.ActionView.fromActionIcon({
                name: "select",
                icon: "fas fa-list",
                operation: WebApp.OperationType.Local,
                displayName: this.pickLabel,
                executeAsync: () => this.selectAsync()
            });
        }
        createItemEditor() {
            throw "Not Supported";
        }
        createItemView(item) {
            return new WebApp.TextView({ content: this.itemsSource.getItemText(item) });
        }
        createItemListView(item) {
            return this.createItemView(item);
        }
        notifyEditValueChangedAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                yield WebApp.BaseEditor.prototype["notifyEditValueChangedAsync"].call(this);
                yield this.updateViewAsync();
            });
        }
    }
    WebApp.BasePicker = BasePicker;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class BaseTextEditor extends WebApp.BaseEditor {
        constructor(config) {
            super(config);
            this.trackMode = "onlostfocus";
            this.bindConfig("trackMode", config);
            this.prop("hasFocus").subscribe(a => this.onFocusChanged(a));
        }
        attach(element) {
            this._element = element;
        }
        activateAsync() {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                if (this._element.nodeName == "INPUT" || this._element.nodeName == "TEXTAREA") {
                    while (true) {
                        const input = this._element;
                        input.selectionStart = 0;
                        input.selectionEnd = (_a = input.value) === null || _a === void 0 ? void 0 : _a.length;
                        this._element.focus();
                        if (this.hasFocus)
                            break;
                        yield WebApp.PromiseUtils.delay(100);
                    }
                }
            });
        }
        onFocusChanged(value) {
            if (!value && this.trackMode == "onlostfocus")
                this.notifyEditValueChangedAsync();
        }
        notifyEditValueChangedAsync() {
            if (this.hasFocus && this.trackMode == "onlostfocus") {
                this._needValidation = true;
                this.isDirty = true;
                return Promise.resolve();
            }
            return super.notifyEditValueChangedAsync();
        }
    }
    WebApp.BaseTextEditor = BaseTextEditor;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class BooleanEditor extends WebApp.BaseEditor {
        constructor(config) {
            super(Object.assign({ template: "CheckBox" }, config));
            this.trueLabel = null;
            this.falseLabel = null;
            this.label = null;
            this.bindConfigString("trueLabel", config);
            this.bindConfigString("falseLabel", config);
            this.bindConfigString("label", config, WebApp.StringUsage.Action);
            this.createEditValueProp();
        }
        toggle() {
            if (window.event)
                window.event.stopPropagation();
            this.editValue = !this.editValue;
        }
    }
    WebApp.BooleanEditor = BooleanEditor;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class DateEditor extends WebApp.BaseEditor {
        constructor(config) {
            super(Object.assign({ template: "DateEditor" }, config));
            this.placeholder = null;
            this.bindConfig("placeholder", config);
            this.createEditValueProp();
        }
        get textValue() {
            return "";
        }
        set textValue(value) {
        }
    }
    WebApp.DateEditor = DateEditor;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class DateEditorCombo extends WebApp.BaseEditor {
        constructor(config) {
            var _a, _b;
            super(config);
            this.selectedDay = null;
            this.selectedMonth = null;
            this.selectedYear = null;
            this.days = [];
            this.months = [];
            this.years = [];
            WebApp.setEnumerable(this, "editValue", DateEditorCombo.prototype);
            for (let i = 1; i <= 31; i++)
                this.days.push(i.toString());
            for (let i = 1; i <= 12; i++)
                this.months.push({ number: i.toString(), name: WebApp.DateUtils.MONTHS[i - 1] });
            const maxYear = (_a = config === null || config === void 0 ? void 0 : config.maxYear) !== null && _a !== void 0 ? _a : new Date().getFullYear();
            const minYear = (_b = config === null || config === void 0 ? void 0 : config.minYear) !== null && _b !== void 0 ? _b : new Date().getFullYear() - 100;
            for (let i = minYear; i <= maxYear; i++)
                this.years.push(i.toString());
            this.prop("selectedDay").subscribe(() => this.tryCommit());
            this.prop("selectedMonth").subscribe(() => this.tryCommit());
            this.prop("selectedYear").subscribe(() => this.tryCommit());
        }
        tryCommit() {
            this.commitAsync();
        }
        commitAsync(force) {
            var _a, _b;
            if (((_a = this.editValue) === null || _a === void 0 ? void 0 : _a.getTime()) != ((_b = this.value) === null || _b === void 0 ? void 0 : _b.getTime()))
                this.value = this.editValue;
            return Promise.resolve(true);
        }
        get editValue() {
            if (!this.selectedDay || !this.selectedMonth || !this.selectedYear)
                return null;
            return new Date(parseInt(this.selectedYear), parseInt(this.selectedMonth) - 1, parseInt(this.selectedDay));
        }
        set editValue(value) {
            var _a;
            if ((value === null || value === void 0 ? void 0 : value.getTime()) == ((_a = this.editValue) === null || _a === void 0 ? void 0 : _a.getTime()))
                return;
            if (!value) {
                this.selectedDay = null;
                this.selectedMonth = null;
                this.selectedYear = null;
            }
            else {
                this.selectedDay = (value.getDate()).toString();
                this.selectedMonth = (value.getMonth() + 1).toString();
                this.selectedYear = value.getFullYear().toString();
            }
        }
    }
    WebApp.DateEditorCombo = DateEditorCombo;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ItemEditorConverter extends WebApp.BindableObject {
        constructor(config) {
            super();
            this.editor = null;
            this.bindConfig("editor", config);
            if (config) {
                if (config.itemToEdit)
                    this.itemToEdit = config.itemToEdit;
                if (config.editToItem)
                    this.editToItem = config.editToItem;
            }
        }
        activateAsync() {
            if (WebApp.TypeCheck.isActivable(this.editor))
                return this.editor.activateAsync();
            return Promise.resolve();
        }
        beginEditAsync(item) {
            this._item = item;
            return this.editor.beginEditAsync(this.itemToEdit(item));
        }
        commitAsync(force) {
            return __awaiter(this, void 0, void 0, function* () {
                if (yield this.editor.commitAsync(force)) {
                    this.editToItem(this._item, this.editor.value);
                    return true;
                }
                return false;
            });
        }
        itemToEdit(item) {
            throw "Not supported";
        }
        editToItem(item, editValue) {
        }
        get value() {
            return this.editor.value;
        }
        get view() {
            return this.editor;
        }
        get isValid() {
            return this.editor.isValid;
        }
    }
    WebApp.ItemEditorConverter = ItemEditorConverter;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ItemsEditorItemView extends WebApp.ItemView {
        constructor(config) {
            super(Object.assign({}, config));
            this.error = null;
            this.addTitle = null;
            this.editTitle = null;
            this.editor = null;
            this.view = null;
            this.value = null;
            this.status = "unchanged";
            this.editMode = "external";
            this.isEdit = false;
            if (config.canEdit) {
                this.addAction({
                    name: "edit-item",
                    icon: "fas fa-edit",
                    operation: WebApp.OperationType.Local,
                    priority: WebApp.BindableObject.bindValue(config.editActionsPriority),
                    displayName: config.editActionLabel,
                    executeAsync: () => this.editAsync()
                });
            }
            if (config.canRemove) {
                this.addAction({
                    name: "remove-item",
                    icon: "fas fa-trash",
                    operation: WebApp.OperationType.Local,
                    priority: WebApp.BindableObject.bindValue(config.editActionsPriority),
                    displayName: config.removeActionLabel,
                    executeAsync: () => this.removeAsync()
                });
            }
            if (config.itemActions) {
                config.itemActions.forEach(action => this.addAction({
                    name: action.name,
                    icon: action.icon,
                    priority: action.priority,
                    operation: action.operation,
                    displayName: WebApp.Format.action(action.displayName, config.itemsSource.displayName),
                    canExecute: action.canExecute ? () => action.canExecute(this) : undefined,
                    executeAsync: () => action.executeAsync(this)
                }));
            }
            this.value = config.value;
        }
        updateView() {
            this.content.clear();
            if (this.isEdit && this.editMode == "inline" && !WebApp.TypeCheck.isAsyncEditor(this.editor))
                this.content.add(this.editor.view);
            else
                this.content.add(this.view);
        }
        updateValueAsync() {
            throw "Not implemented";
        }
        createUpdateEditor() {
            throw "Not implemented";
        }
        createAddEditor() {
            throw "Not implemented";
        }
        executeUpdateAsync(item) {
            throw "Not implemented";
        }
        executeAddAsync(item) {
            throw "Not implemented";
        }
        editAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.isEdit)
                    return false;
                if (!this.editor) {
                    if (this.status == "added")
                        this.editor = this.createAddEditor();
                    else
                        this.editor = this.createUpdateEditor();
                }
                this.isEdit = true;
                if (this.editMode == "external") {
                    let newItem = null;
                    if (WebApp.TypeCheck.isAsyncEditor(this.editor)) {
                        const editValue = yield this.editor.editAsync(this.item);
                        if (editValue) {
                            if (this.status == "added")
                                newItem = yield this.executeAddAsync(editValue);
                            else
                                newItem = yield this.executeUpdateAsync(editValue);
                        }
                    }
                    else {
                        const activity = new WebApp.ContentActivity({
                            providers: [new WebApp.ItemEditContent({
                                    editor: this.editor,
                                    title: item => this.status == "added" ? this.addTitle : this.editTitle,
                                    value: this.item,
                                    saveItemAsync: item => this.status == "added" ? this.executeAddAsync(item) : this.executeUpdateAsync(item)
                                })]
                        });
                        newItem = yield (yield WebApp.Actions.loadPageAsync(activity)).result;
                    }
                    if (newItem) {
                        this.item = newItem;
                        this.status = "unchanged";
                        this.isEdit = false;
                        yield this.updateValueAsync();
                    }
                    else
                        this.isEdit = false;
                    this.editor = null;
                    return newItem != null;
                }
                return false;
            });
        }
        cancelEdit() {
            this.isEdit = false;
        }
        removeAsync() {
            throw "Not implemented";
        }
        clearErrors() {
            this.error = null;
        }
        validateAsync(force) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.isEdit) {
                    if (WebApp.TypeCheck.isValidable(this.editor))
                        return yield this.editor.validateAsync();
                }
                else {
                    if (WebApp.TypeCheck.isValidable(this.view))
                        return yield this.view.validateAsync();
                }
                return true;
            });
        }
        loadAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                this.updateView();
            });
        }
        get itemsEditor() {
            return this.parentView;
        }
        ;
    }
    WebApp.ItemsEditorItemView = ItemsEditorItemView;
    class ItemsEditor extends WebApp.BaseEditor {
        constructor(config) {
            var _a;
            super(Object.assign({ template: "ItemsEditor" }, config));
            this._changesCount = 0;
            this._isUpdating = 0;
            this.content = observableListOf();
            this.editActionsPriority = WebApp.ActionPriority.Secondary;
            this.editActionLabel = "Edit";
            this.removeActionLabel = "Remove";
            this.canAdd = true;
            this.canRemove = true;
            this.canEdit = false;
            this.canOpen = false;
            this.editMode = "inline";
            this.itemActions = [];
            this.itemsSource = null;
            this.isConfirmRemove = true;
            WebApp.setEnumerable(this, "editValue", ItemsEditor.prototype);
            this.bindConfig("editMode", config);
            this.bindConfig("canAdd", config);
            this.bindConfig("canOpen", config);
            this.bindConfig("canRemove", config);
            this.bindConfig("isConfirmRemove", config);
            this.bindConfig("canEdit", config);
            this.bindConfig("itemsSource", config);
            this.bindConfig("itemActions", config);
            this.bindConfig("editActionsPriority", config);
            this.bindConfig("removeActionLabel", config);
            this.bindConfig("editActionLabel", config);
            if (config) {
                if (!config.editActionLabel)
                    this.editActionLabel = WebApp.Format.action("edit-item", this.itemsSource.displayName);
                if (!config.removeActionLabel)
                    this.removeActionLabel = WebApp.Format.action("remove-item", this.itemsSource.displayName);
                if (config.createItemAddEditor)
                    this.createItemAddEditor = config.createItemAddEditor;
                if (config.createItemUpdateEditor)
                    this.createItemUpdateEditor = config.createItemUpdateEditor;
                if (config.createItemView)
                    this.createItemView = config.createItemView;
                if (config.attachItem)
                    this.attachItem = config.attachItem;
                if (config.newItem)
                    this.newItem = config.newItem;
                if (config.openItem) {
                    this.openItem = config.openItem;
                    if (config.canOpen == undefined)
                        this.canOpen = true;
                }
            }
            if (!this.itemsSource)
                this.itemsSource = new WebApp.EditableItemsSource();
            this.addAction = WebApp.ActionView.fromAction({
                name: "add-item",
                icon: "fas fa-plus",
                operation: WebApp.OperationType.Local,
                displayName: (_a = config === null || config === void 0 ? void 0 : config.addActionLabel) !== null && _a !== void 0 ? _a : WebApp.Format.action("add-item", this.itemsSource.displayName),
                executeAsync: () => __awaiter(this, void 0, void 0, function* () { return yield this.addAsync(); })
            });
            if (this.value)
                this.beginEditAsync(this.value);
        }
        loadAsyncWork() {
            return __awaiter(this, void 0, void 0, function* () {
                const awaiters = [];
                for (let item of this.content)
                    awaiters.push(item.loadAsync());
                yield Promise.all(awaiters);
            });
        }
        clear() {
            this.content.clear();
        }
        clearErrors() {
            for (let item of this.content)
                item.clearErrors();
        }
        insert() {
        }
        addAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                const item = this.newItem();
                this.attachItem(item, true);
                const itemView = this.createItem(this.itemToValue(item), item);
                itemView.item = item;
                itemView.status = "added";
                if (yield itemView.editAsync()) {
                    if (WebApp.linq(this.content).any(a => this.itemsSource.itemComparer(a.item, itemView.item)))
                        return;
                    this.content.add(itemView);
                    yield this.notifyEditValueChangedAsync();
                }
            });
        }
        openItem(item) {
        }
        attachItem(item, isNew) {
        }
        isCapable(selector, item) {
            if (typeof selector == "boolean")
                return selector;
            return selector(item);
        }
        createItem(value, item) {
            const result = new ItemsEditorItemView({
                value: value,
                item: item,
                addTitle: WebApp.Format.title("add-item", this.itemsSource.displayName),
                editTitle: "",
                itemsSource: this.itemsSource,
                editActionsPriority: this.editActionsPriority,
                editActionLabel: this.editActionLabel,
                removeActionLabel: this.removeActionLabel,
                itemActions: this.itemActions,
                canRemove: this.isCapable(this.canRemove, item),
                canEdit: this.isCapable(this.canEdit, item),
                canOpen: this.isCapable(this.canOpen, item),
                open: () => this.openItem(result.item)
            });
            result.parentView = this;
            result.isConfirmRemove = this.isConfirmRemove;
            result.createAddEditor = () => this.createItemAddEditor(result.item);
            result.createUpdateEditor = () => this.createItemUpdateEditor(result.item);
            result.executeAddAsync = item => this.itemsSource.addItemAsync(item);
            result.executeUpdateAsync = editItem => this.itemsSource.updateItemAsync(editItem, result.item);
            result.loadAsync = () => __awaiter(this, void 0, void 0, function* () {
                if (!result.item) {
                    result.item = yield this.valueToItemAsync(result.value);
                    result.canOpen = this.isCapable(this.canOpen, result.item);
                    result.editTitle = WebApp.Format.title("edit-item", this.itemsSource.getItemText(result.item));
                    this.attachItem(result.item, result.status != "added");
                }
                result.view = this.createItemView(result.item);
                result.updateView();
            });
            result.updateValueAsync = () => __awaiter(this, void 0, void 0, function* () {
                result.canOpen = this.isCapable(this.canOpen, result.item);
                result.value = this.itemToValue(result.item);
                result.view = this.createItemView(result.item);
                result.editTitle = WebApp.Format.title("edit-item", this.itemsSource.getItemText(result.item));
                result.updateView();
                yield this.notifyEditValueChangedAsync();
            });
            result.removeAsync = () => __awaiter(this, void 0, void 0, function* () {
                if (result.status == "added")
                    this.content.remove(result);
                else {
                    if (this.isConfirmRemove) {
                        if (!(yield WebApp.Interaction.confirmAsync(WebApp.Format.message("msg-remove-confirm", this.itemsSource.displayName))))
                            return;
                    }
                    if (this.status == "none")
                        this.status = "loaded";
                    result.status = "removed";
                    yield this.notifyEditValueChangedAsync();
                }
            });
            result.value = value;
            if (this.status != "none")
                result.loadAsync();
            return result;
        }
        itemToValue(item) {
            return item;
        }
        valueToItemAsync(value) {
            return Promise.resolve(value);
        }
        onItemChanged(oldValue, newValue) {
            this._needValidation = true;
            if (this._isUpdating) {
                this._changesCount++;
                return;
            }
            this.notifyEditValueChangedAsync();
        }
        set editValue(value) {
            if (!this.content || this._isUpdating)
                return;
            this._isUpdating++;
            this._changesCount = 0;
            this.content.clear();
            try {
                if (value) {
                    for (let itemValue of value)
                        this.content.add(this.createItem(itemValue));
                }
            }
            finally {
                this._isUpdating--;
            }
            if (this._changesCount > 0)
                this.notifyEditValueChangedAsync();
        }
        get editValue() {
            const result = [];
            for (let item of this.content) {
                if (item.status == "removed")
                    continue;
                result.push(item.value);
            }
            return result;
        }
        validateAsyncWork(force) {
            return __awaiter(this, void 0, void 0, function* () {
                let isValid = true;
                for (let item of this.content) {
                    if (!(yield item.validateAsync(force)))
                        isValid = false;
                }
                return isValid;
            });
        }
        commitAsyncWork(force) {
            return __awaiter(this, void 0, void 0, function* () {
                let isValid = true;
                let isChanged = false;
                if (!isValid)
                    return false;
                for (let i = this.content.count - 1; i >= 0; i--) {
                    const item = this.content.get(i);
                    item.clearErrors();
                    if (item.status == "removed") {
                        if (yield this.itemsSource.removeItemAsync(item.item))
                            this.content.removeAt(i);
                        else {
                            this.error = "";
                            isValid = false;
                        }
                        isChanged = true;
                    }
                    else if (item.status == "modified" && !WebApp.TypeCheck.isAsyncEditor(item.editor)) {
                        const updateItem = yield this.itemsSource.updateItemAsync(item.editor.value, item.item);
                        if (updateItem) {
                            item.item = updateItem;
                            item.status = "unchanged";
                            item.updateView();
                        }
                        else {
                            this.error = "";
                            isValid = false;
                        }
                        isChanged = true;
                    }
                    else if (item.status == "added" && !WebApp.TypeCheck.isAsyncEditor(item.editor)) {
                        const addItem = yield this.itemsSource.addItemAsync(item.editor.value);
                        if (addItem) {
                            item.item = addItem;
                            item.status = "unchanged";
                            item.updateView();
                        }
                        else {
                            this.error = "";
                            isValid = false;
                        }
                        isChanged = true;
                    }
                }
                if (isValid) {
                    if (isChanged)
                        this.onValueChanged(this.editValue);
                }
                return isValid;
            });
        }
        newItem() {
            return this.itemsSource.newItem();
        }
        getItemViewContent(item) {
            return this.itemsSource ? this.itemsSource.getItemText(item) : item.toString();
        }
        createItemView(item) {
            return new WebApp.TextView({ content: this.getItemViewContent(item) });
        }
        createItemUpdateEditor(item) {
            throw "Not Supported";
        }
        createItemAddEditor(item) {
            throw "Not Supported";
        }
    }
    WebApp.ItemsEditor = ItemsEditor;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class MediaEditor extends WebApp.BaseEditor {
        constructor(config) {
            super(Object.assign({ template: "MediaEditor" }, config));
            this.fileUpload = null;
            this.mediaView = null;
            this.noMediaUrl = null;
            this.maxFileSize = null;
            this.validMedias = ["video", "image"];
            this.bindConfig("noMediaUrl", config);
            this.bindConfig("maxFileSize", config);
            this.bindConfig("validMedias", config);
            if (config) {
                if (config.getUploadUrl)
                    this.getUploadUrl = config.getUploadUrl;
                if (config.getMediaUrl)
                    this.getMediaUrl = () => config.getMediaUrl(this.editValue);
            }
            this.mediaView = new WebApp.MediaView(Object.assign({ image: { template: "ImageInline" }, video: { template: "VideoViewInline" } }, config === null || config === void 0 ? void 0 : config.mediaView));
            this.fileUpload = new WebApp.FileUploadView({
                onChanged: () => this.notifyEditValueChangedAsync()
            });
            this.fileUpload.visible = false;
            this.mediaView.content = {
                type: "empty"
            };
        }
        getUploadUrl(fileName) {
            throw "Not implemented";
        }
        validateAsyncWork(force) {
            if (this.fileUpload.status == "selected") {
                if (this.validMedias.indexOf("image") != -1 && this.fileUpload.file.type.startsWith("image/"))
                    this.mediaView.content.type = "image";
                else if (this.validMedias.indexOf("video") != -1 && this.fileUpload.file.type.startsWith("video/"))
                    this.mediaView.content.type = "video";
                else
                    this.error = WebApp.Strings["msg-invalid-media"]({ usage: WebApp.StringUsage.Message });
                if (this.maxFileSize && this.fileUpload.file.size > this.maxFileSize)
                    this.error = WebApp.Strings["msg-max-size"]({ usage: WebApp.StringUsage.Message, params: [(this.maxFileSize / 1024 / 1024).toString()] });
            }
            return Promise.resolve(!this.error);
        }
        commitAsyncWork(force) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.fileUpload.status == "selected") {
                    const result = yield this.fileUpload.uploadAsync(this.getUploadUrl(this.fileUpload.file.name));
                    this.editValue.id = result;
                    this.editValue.status = "new";
                    this.editValue.type = this.mediaView.content.type;
                    this.mediaView.content = {
                        src: this.getMediaUrl(),
                        type: this.mediaView.content.type
                    };
                    this.notifyEditValueChangedAsync();
                }
                return true;
            });
        }
        getMediaUrl() {
            throw "Not Implemented";
        }
        beginEditAsync(value) {
            return __awaiter(this, void 0, void 0, function* () {
                yield WebApp.BaseEditor.prototype.beginEditAsync.call(this, value);
                if (!this.editValue)
                    this.editValue = {
                        id: null,
                        type: "empty",
                        status: "empty"
                    };
                if (this.editValue.status == "empty")
                    this.mediaView.content = {
                        type: "image",
                        src: this.noMediaUrl
                    };
                else {
                    this.mediaView.content = {
                        type: this.editValue.type,
                        src: this.getMediaUrl()
                    };
                }
            });
        }
        change() {
            this.fileUpload.visible = true;
            this.fileUpload.select();
        }
        remove() {
            this.editValue.status = "deleted";
            this.mediaView.content = {
                type: "image",
                src: this.noMediaUrl
            };
            this.notifyEditValueChangedAsync();
        }
        showMenu() {
            const menu = new WebApp.ContextMenu();
            if (this.editValue.status == "new" || this.editValue.id) {
                menu.addAction({
                    name: "remove-item",
                    icon: "fas fa-trash",
                    displayName: "delete",
                    executeAsync: () => __awaiter(this, void 0, void 0, function* () { return this.remove(); })
                });
            }
            menu.addAction({
                name: "edit-item",
                icon: "fas fa-edit",
                displayName: "change",
                executeAsync: () => __awaiter(this, void 0, void 0, function* () { return this.change(); })
            });
            menu.showAsync(undefined, window.event);
        }
    }
    WebApp.MediaEditor = MediaEditor;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class MultiItemPicker extends WebApp.BasePicker {
        constructor(config) {
            super(config);
            this.selector = null;
            this.items = observableListOf();
        }
        selectAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                let mustRefresh = false;
                if (this.selector == null) {
                    this.selector = new WebApp.SelectMultipleItemsActivity({
                        createItemEditor: () => this.createItemEditor(),
                        createItemContentView: item => this.createItemView(item),
                        createItemListView: item => this.createItemListView(item),
                        itemsSource: this.itemsSource,
                        addLabel: this.addLabel,
                        tooltip: this.pickLabel,
                        canAdd: this.canAdd
                    });
                    this.selector.filters = this.filters;
                }
                else
                    mustRefresh = true;
                this.selector.setSelectedItems(WebApp.linq(this.items).select(a => a.item).toArray());
                if (mustRefresh)
                    yield this.selector.refreshAsync();
                const result = yield (yield WebApp.Actions.loadPageAsync(this.selector)).result;
                if (result != null) {
                    const newValue = WebApp.linq(result).select(a => this.itemsSource.getItemValue(a)).toArray();
                    if (!WebApp.ArrayUtils.equals(newValue, this.editValue))
                        this.editValue = newValue;
                }
            });
        }
        valueToEdit(value) {
            return value ? value.slice() : [];
        }
        editToValue(value) {
            return value ? value.slice() : [];
        }
        updateViewAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.status == "loading")
                    return;
                this.items.clear();
                if (this.editValue) {
                    this.status = "loading";
                    try {
                        for (let value of this.editValue) {
                            const item = yield this.itemsSource.getItemByValueAsync(value);
                            if (!item)
                                continue;
                            const itemView = new WebApp.RemovableItemView({
                                item: item,
                                content: this.createItemView(item),
                                removeAsync: () => __awaiter(this, void 0, void 0, function* () {
                                    this.items.remove(itemView);
                                    this.editValue.splice(this.editValue.indexOf(this.itemsSource.getItemValue(itemView.item)), 1);
                                    yield this.notifyEditValueChangedAsync();
                                })
                            });
                            this.items.add(itemView);
                        }
                    }
                    finally {
                        this.status = "loaded";
                    }
                }
            });
        }
    }
    WebApp.MultiItemPicker = MultiItemPicker;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class NumberEditor extends WebApp.BaseTextEditor {
        constructor(config) {
            super(Object.assign({ template: "NumberEditor" }, config));
            this.placeholder = null;
            this.min = null;
            this.max = null;
            this.precision = null;
            this.bindConfig("placeholder", config);
            this.bindConfig("precision", config);
            this.createEditValueProp();
        }
        valueToEdit(value) {
            return value == null || value == undefined ? "" : (this.precision != null ? value.toFixed(this.precision) : value.toString()).replace(".", ",");
        }
        editToValue(value) {
            return !value ? null : parseFloat(value.replace(",", "."));
        }
    }
    WebApp.NumberEditor = NumberEditor;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ObjectEditor extends WebApp.BaseEditor {
        constructor(config) {
            super(Object.assign({ template: "ItemsViewForm", validationMode: "always", commitMode: "manual" }, config));
            this._changesCount = 0;
            this._isUpdating = 0;
            this.properties = {};
            this.defaultProperty = null;
            this.propertyTemplateName = "PropertyView";
            this.emptyView = null;
            this.content = observableListOf();
            WebApp.setEnumerable(this, "editValue", ObjectEditor.prototype);
            this.bindConfig("propertyTemplateName", config);
            this.bindConfig("defaultProperty", config);
            this.bindConfig("emptyView", config);
            this.prop("content");
            if (config) {
                this._onPropertyChanged = config.onPropertyChanged;
                if (config.properties) {
                    for (let propName in config.properties) {
                        config.properties[propName].name = propName;
                        this.addProperty(config.properties[propName]);
                    }
                }
            }
            this.createProxy();
            if (!WebApp.ObjectUtils.isEmpty(this.value))
                this.beginEditAsync(this.value);
        }
        addProperty(config) {
            const item = new WebApp.PropertyView(Object.assign({ name: config.name, template: this.prop("propertyTemplateName") }, config));
            this.properties[config.name] = item;
            return item;
        }
        beginEditWorkAsync(value) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.value)
                    this.value = {};
                this.isDirty = true;
                for (let propName in this.properties) {
                    const prop = this.properties[propName];
                    if (prop.value != undefined)
                        yield prop.editor.beginEditAsync(prop.value);
                }
            });
        }
        clearErrors() {
            for (let propName in this.properties)
                this.properties[propName].error = null;
        }
        validateAsyncWork(force) {
            return __awaiter(this, void 0, void 0, function* () {
                let isValid = true;
                const curValue = this.editValue;
                for (let propName in this.properties) {
                    const prop = this.properties[propName];
                    if (!(yield prop.validateAsync(curValue, force))) {
                        this.isValid = false;
                        isValid = false;
                    }
                }
                return isValid;
            });
        }
        createProxy() {
            this._proxy = {};
            this.content.clear();
            for (let propName in this.properties) {
                const curProp = this.properties[propName];
                curProp.prop("value").subscribe((value, oldValue) => this.onPropertyValueChanged(propName, value, oldValue));
                curProp.prop("isValid").subscribe(value => {
                    if (!value)
                        this.isValid = false;
                });
                curProp.prop("isDirty").subscribe(value => {
                    if (value)
                        this.isDirty = true;
                });
                this.content.add(curProp);
                Object.defineProperty(this._proxy, propName, {
                    enumerable: true,
                    get: () => curProp.value,
                    set: value => curProp.value = value
                });
            }
        }
        activateAsync() {
            if (this.defaultProperty)
                return this.editor(this.defaultProperty).activateAsync();
            return Promise.resolve();
        }
        loadAsyncWork() {
            return __awaiter(this, void 0, void 0, function* () {
                const awaiters = [];
                for (let propName in this.properties)
                    awaiters.push(this.properties[propName].loadAsync());
                yield Promise.all(awaiters);
            });
        }
        clear() {
            this._isUpdating++;
            try {
                for (let propName in this.properties)
                    this.property(propName).clear();
            }
            finally {
                this._isUpdating--;
            }
        }
        editToValue(value) {
            return undefined;
        }
        commitAsyncWork(force) {
            return __awaiter(this, void 0, void 0, function* () {
                let isChanged = false;
                let isValid = true;
                for (let propName in this.properties) {
                    const commitResult = yield this.commitPropertyAsync(propName, false);
                    if (!commitResult.isValid)
                        isValid = false;
                    if (!commitResult.isChanged)
                        isChanged = true;
                }
                if (isValid) {
                    if (isChanged)
                        this.onValueChanged(this.value);
                }
                return isValid;
            });
        }
        commitPropertyAsync(propName, validate) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = {
                    isValid: true,
                    isChanged: false
                };
                const prop = this.property(propName);
                if (validate && !(yield prop.validateAsync(this.editValue, false)))
                    result.isValid = false;
                else if (!(yield prop.editor.commitAsync()))
                    result.isValid = false;
                else {
                    if (!WebApp.ObjectUtils.equals(prop.value, this.value[propName])) {
                        this.value[propName] = prop.value;
                        result.isChanged = true;
                    }
                }
                return result;
            });
        }
        editor(propName) {
            return this.properties[propName].editor;
        }
        property(propName) {
            return this.properties[propName];
        }
        onPropertyValueChanged(propName, value, oldValue) {
            return __awaiter(this, void 0, void 0, function* () {
                this._needValidation = true;
                if (this._isUpdating || this._isEditing) {
                    this._changesCount++;
                    return;
                }
                if (this.commitMode == "onchange") {
                    const commitResult = yield this.commitPropertyAsync(propName, true);
                    if (commitResult.isChanged) {
                        this._needValidation = true;
                        this.isDirty = true;
                    }
                }
                else
                    yield this.notifyEditValueChangedAsync();
                if (this._onPropertyChanged)
                    this._onPropertyChanged(propName, value, oldValue);
            });
        }
        set editValue(value) {
            if (this._isUpdating)
                return;
            this._isUpdating++;
            this._changesCount = 0;
            try {
                if (WebApp.ObjectUtils.isEmpty(value))
                    this.clear();
                else {
                    for (let propName in this.properties)
                        this._proxy[propName] = value[propName];
                }
            }
            finally {
                this._isUpdating--;
            }
            if (this._changesCount > 0)
                this.notifyEditValueChangedAsync();
        }
        get editValue() {
            return this._proxy;
        }
    }
    WebApp.ObjectEditor = ObjectEditor;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class PopUpEditor extends WebApp.BindableObject {
        constructor(config) {
            super();
            this.editor = null;
            this.title = "Edit";
            this.saveLabel = null;
            this.savePriority = null;
            this.closeLabel = null;
            this.saveOnCommit = false;
            this.styles = [];
            this.name = null;
            this.bindConfig("name", config);
            this.bindConfig("editor", config);
            this.bindConfig("styles", config);
            this.bindConfig("saveOnCommit", config);
            this.bindConfig("savePriority", config);
            this.bindConfigString("title", config, WebApp.StringUsage.Title);
            this.bindConfigString("closeLabel", config, WebApp.StringUsage.Action);
            this.bindConfigString("saveLabel", config, WebApp.StringUsage.Action);
            if (config) {
                if (config.editToItemAsync)
                    this.editToItemAsync = config.editToItemAsync;
            }
            if (!this.closeLabel)
                this.closeLabel = WebApp.Format.action("cancel");
            if (!this.saveLabel)
                this.saveLabel = WebApp.Format.action("ok");
        }
        editAsync(value, validate) {
            return __awaiter(this, void 0, void 0, function* () {
                const popUp = new WebApp.PopUpContent({
                    title: this.title,
                    contentProvider: new WebApp.ItemEditContent({
                        editor: this.editor,
                        value: value,
                        styles: this.styles,
                        savePriority: this.savePriority,
                        saveOnCommit: this.saveOnCommit,
                        saveLabel: this.saveLabel,
                        saveItemAsync: (edit) => __awaiter(this, void 0, void 0, function* () {
                            if (validate) {
                                const valResult = yield validate(edit);
                                if (valResult == null)
                                    return null;
                            }
                            return yield this.editToItemAsync(edit);
                        })
                    }),
                    closeLabel: this.closeLabel
                });
                const result = yield (yield popUp.openAsync()).result;
                if (!result)
                    return null;
                return this.editor.value;
            });
        }
        editToItemAsync(edit) {
            return Promise.resolve(edit);
        }
    }
    WebApp.PopUpEditor = PopUpEditor;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class RichTextEditor extends WebApp.BaseTextEditor {
        constructor(config) {
            super(Object.assign({ template: "Attach" }, config));
            WebApp.setEnumerable(this, "editValue", RichTextEditor.prototype);
        }
        attach(element) {
            this.editor = new Quill(element, {
                theme: "snow",
            });
            this.editor.root.innerHTML = this.value;
            this.editor.on("text-change", () => this.notifyEditValueChangedAsync());
        }
        set editValue(value) {
            if (this.editor)
                this.editor.root.innerHTML = value;
        }
        get editValue() {
            if (this.editor)
                return this.editor.root.innerHTML;
            return this.value;
        }
    }
    WebApp.RichTextEditor = RichTextEditor;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class SectionView extends WebApp.ViewComponent {
        constructor(config) {
            super(config);
            this.title = null;
            this.bindConfig("editor", config);
            this.bindConfigString("title", config);
        }
    }
    class SectionEditor extends WebApp.BaseEditor {
        constructor(config) {
            super(Object.assign({ template: "SectionEditor" }, config));
            this.sections = observableListOf();
            this.activeSectionName = null;
            this.navBar = new WebApp.NavBar({
                styles: ["tab-view", "surface"],
                itemTemplate: "TextView",
                itemBehavoirs: ["ripple"],
                selectedItem: this.prop("activeSectionName")
            });
            if (config) {
                if (config.sections)
                    config.sections.forEach(a => this.addSection(a));
            }
            if (this.sections.count > 0)
                this.activeSectionName = this.sections.get(0).name;
            this.createEditValueProp();
        }
        loadAsyncWork() {
            return __awaiter(this, void 0, void 0, function* () {
                for (let section of this.sections) {
                    if (section.editor)
                        yield section.editor.loadAsync();
                }
            });
        }
        beginEditWorkAsync(value) {
            return __awaiter(this, void 0, void 0, function* () {
                for (let section of this.sections) {
                    if (section.editor)
                        yield section.editor.beginEditAsync(value);
                }
            });
        }
        validateAsyncWork(force) {
            return __awaiter(this, void 0, void 0, function* () {
                let isValid = true;
                for (let section of this.sections) {
                    if (section.editor)
                        if (!(yield section.editor.validateAsync(force))) {
                            isValid = false;
                            this.activeSectionName = section.name;
                        }
                }
                return isValid;
            });
        }
        commitAsyncWork(force) {
            return __awaiter(this, void 0, void 0, function* () {
                let isValid = true;
                for (let section of this.sections) {
                    if (section.editor)
                        if (!(yield section.editor.commitAsync(force)))
                            isValid = false;
                }
                return isValid;
            });
        }
        getSection(name) {
            return WebApp.linq(this.sections).first(a => a.name == name);
        }
        addSection(config) {
            const item = new SectionView(config);
            this.sections.add(item);
            this.navBar.addItem({
                text: item.prop("title"),
                name: item.name,
                content: item
            });
            return item;
        }
    }
    WebApp.SectionEditor = SectionEditor;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class SingleItemPicker extends WebApp.BasePicker {
        constructor(config) {
            super(config);
            this.selector = null;
            this.contentView = null;
            this.clearAction = null;
            this.clearAction = WebApp.ActionView.fromActionIcon({
                name: "clear",
                icon: "fas fa-times",
                displayName: WebApp.Strings["clear"],
                executeAsync: () => Promise.resolve(this.clear())
            });
        }
        selectAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                let mustRefresh = false;
                if (this.selector == null) {
                    this.selector = new WebApp.SelectSingleItemActivity({
                        itemsSource: this.itemsSource,
                        createItemEditor: () => this.createItemEditor(),
                        createItemContentView: item => this.createItemListView(item),
                        pageSize: this.pageSize,
                        addLabel: this.addLabel,
                        tooltip: this.pickLabel,
                        canAdd: this.canAdd
                    });
                    this.selector.filters = this.filters;
                }
                else
                    mustRefresh = true;
                this.selector.selectedValue = this.editValue;
                if (mustRefresh)
                    yield this.selector.refreshAsync();
                const result = yield (yield WebApp.Actions.loadPageAsync(this.selector)).result;
                if (result != null)
                    this.editValue = this.itemsSource.getItemValue(result);
            });
        }
        createItemEditor() {
            throw "Not Supported";
        }
        updateViewAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.status == "loading")
                    return;
                if (this.editValue) {
                    this.status = "loading";
                    try {
                        const item = yield this.itemsSource.getItemByValueAsync(this.editValue);
                        this.contentView = this.createItemView(item);
                    }
                    finally {
                        this.status = "loaded";
                    }
                }
                else
                    this.contentView = null;
            });
        }
    }
    WebApp.SingleItemPicker = SingleItemPicker;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class SelectorItemView extends WebApp.ContentView {
        constructor(config) {
            super(Object.assign({ template: "SelectorItemView" }, config));
            this.isSelected = false;
            this.value = null;
            this.bindConfig("value", config);
            this.bindConfig("isSelected", config);
        }
        select() {
            this.isSelected = true;
        }
    }
    WebApp.SelectorItemView = SelectorItemView;
    class SingleItemSelector extends WebApp.BaseEditor {
        constructor(config) {
            super(Object.assign({ template: "SelectEditor" }, config));
            this.itemTemplate = "SelectorItemCheckBox";
            this.placeholder = null;
            this.emptyText = null;
            this.selectedItem = null;
            this.selectedIndex = -1;
            this.itemsSource = null;
            this.items = observableListOf();
            WebApp.setEnumerable(this, "editValue", SingleItemSelector.prototype);
            this.bindConfig("itemsSource", config);
            this.bindConfig("itemTemplate", config);
            this.bindConfigString("placeholder", config);
            this.bindConfigString("emptyText", config, WebApp.StringUsage.Title);
            if (config === null || config === void 0 ? void 0 : config.createItemView)
                this.createItemViewWork = config === null || config === void 0 ? void 0 : config.createItemView;
            if (config === null || config === void 0 ? void 0 : config.items) {
                if (this.emptyText)
                    this.items.add(this.createEmptyItem());
                config.items.forEach(a => this.items.add(this.createItemView(a)));
                this.status = "loaded";
            }
            this.prop("selectedItem").subscribe((value, oldValue) => __awaiter(this, void 0, void 0, function* () {
                if (this._isSelecting)
                    return;
                if (!value && this.emptyText) {
                    this.selectedItem = this.items.get(0);
                    return;
                }
                this._isSelecting = true;
                try {
                    if (oldValue)
                        oldValue.isSelected = false;
                    if (value)
                        value.isSelected = true;
                    this.selectedIndex = this.items.indexOf(value);
                    if (this.status != "loading")
                        yield this.notifyEditValueChangedAsync();
                }
                finally {
                    this._isSelecting = false;
                }
            }));
            this.prop("selectedIndex").subscribe(value => {
                var _a;
                if (value == -1 && this.emptyText) {
                    this.selectedIndex = 0;
                    return;
                }
                this.selectedItem = value == -1 ? null : this.items.get(value);
                if (((_a = this._element) === null || _a === void 0 ? void 0 : _a.tagName) == "SELECT")
                    this._element.selectedIndex = value;
            });
        }
        attach(element) {
            this._element = element;
            if (element.tagName == "SELECT") {
                this._element.selectedIndex = this.selectedIndex;
                this._element.addEventListener("change", () => this.selectedIndex = element.selectedIndex);
            }
        }
        findItemByValue(value) {
            if (this.itemsSource)
                return WebApp.linq(this.items).first(a => this.itemsSource.equals(a.value, value));
            return WebApp.linq(this.items).first(a => a.value == value);
        }
        set editValue(value) {
            if (this.editValue == value)
                return;
            if (value == null && this.emptyText)
                this.selectedItem = this.items[0];
            else
                this.selectedItem = this.findItemByValue(value);
        }
        get editValue() {
            var _a;
            return (_a = this.selectedItem) === null || _a === void 0 ? void 0 : _a.value;
        }
        loadAsyncWork() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.itemsSource) {
                    this.items.clear();
                    if (this.emptyText)
                        this.items.add(this.createEmptyItem());
                    const items = yield this.itemsSource.getItemsAsync(this.itemsSource.getFilter());
                    if (items)
                        items.forEach(a => this.items.add(this.createItemView(a)));
                }
                this.selectedIndex = 0;
                this.isDirty = true;
            });
        }
        createEmptyItem() {
            const result = new SelectorItemView({
                value: null,
                content: this.emptyText,
                template: this.itemTemplate
            });
            result.prop("isSelected").subscribe(value => {
                if (value)
                    this.selectedItem = null;
            });
            return result;
        }
        createItemViewWork(item) {
            if (this.itemsSource)
                return new SelectorItemView({
                    value: this.itemsSource.getItemValue(item),
                    content: this.itemsSource.getItemText(item),
                    template: this.itemTemplate
                });
        }
        createItemView(item) {
            const itemView = this.createItemViewWork(item);
            itemView.prop("isSelected").subscribe(value => {
                if (value)
                    this.selectedItem = itemView;
            });
            return itemView;
        }
    }
    WebApp.SingleItemSelector = SingleItemSelector;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class TextEditor extends WebApp.BaseTextEditor {
        constructor(config) {
            super(Object.assign({ template: "TextEditor" }, config));
            this.placeholder = null;
            this.lineCount = 1;
            this.maxLength = null;
            this.bindConfigString("placeholder", config, WebApp.StringUsage.Tooltip);
            this.bindConfig("lineCount", config);
            this.bindConfig("maxLength", config);
            this.bindConfig("trackMode", config);
            this.createEditValueProp();
        }
    }
    WebApp.TextEditor = TextEditor;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let Actions;
    (function (Actions) {
        function loadPageAsync(page, options) {
            return WebApp.app.pageHost.loadAsync(page, options);
        }
        Actions.loadPageAsync = loadPageAsync;
        function call(phoneNumber) {
            window.location.href = "tel:" + phoneNumber;
            return Promise.resolve();
        }
        Actions.call = call;
        function email(email) {
            window.location.href = "mailto:" + email;
            return Promise.resolve();
        }
        Actions.email = email;
        function webPage(url) {
            return loadPageAsync(new WebApp.WebPage({ url: url }));
        }
        Actions.webPage = webPage;
        function navigate(uri) {
            return new Promise((res, rej) => {
                const newWindows = window.open(uri, "_blank");
                newWindows.addEventListener("load", ev => {
                    res();
                });
                newWindows.addEventListener("error", ev => {
                    rej();
                });
            });
        }
        Actions.navigate = navigate;
        function facebookPage(pageId) {
            window.location.href = "fb://page/" + pageId;
            return Promise.resolve();
        }
        Actions.facebookPage = facebookPage;
        function maps(location, zoomLevel = 17) {
            if (location.position)
                window.location.href = "https://www.google.com/maps/search/?api=1&query=" + location.position.latitude + "," + location.position.longitude;
            else
                window.location.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(location.address);
            return Promise.resolve();
        }
        Actions.maps = maps;
    })(Actions = WebApp.Actions || (WebApp.Actions = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let Animation;
    (function (Animation) {
        function cubic(p0, p1, p2, p3) {
            return t => Math.pow(1 - t, 3) * p0 +
                3 * Math.pow(1 - t, 2) * t * p1 +
                3 * (1 - t) * Math.pow(t, 2) * p2 +
                Math.pow(t, 3) * p3;
        }
        Animation.cubic = cubic;
        function linear() {
            return t => t;
        }
        Animation.linear = linear;
        function animate(options) {
            let curTime = 0;
            const handler = setInterval(() => {
                if (curTime > options.duration)
                    curTime = options.duration;
                options.step(options.timeFunction(curTime / options.duration));
                if (curTime == options.duration)
                    clearInterval(handler);
                curTime += options.stepTime;
            }, options.stepTime);
        }
        Animation.animate = animate;
    })(Animation = WebApp.Animation || (WebApp.Animation = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let Components;
    (function (Components) {
        function sections(config) {
            return new WebApp.SectionsView(config);
        }
        Components.sections = sections;
    })(Components = WebApp.Components || (WebApp.Components = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    function observable() {
        return function (target, propertyKey) {
        };
    }
    WebApp.observable = observable;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let Editors;
    (function (Editors) {
        function richText() {
            return new WebApp.RichTextEditor();
        }
        Editors.richText = richText;
        function currency() {
            return new WebApp.NumberEditor({
                allowNull: false,
                min: 0.01,
            });
        }
        Editors.currency = currency;
        function converter(editor, itemToEdit, editToItem) {
            return new WebApp.ItemEditorConverter({
                editor: editor,
                editToItem: editToItem,
                itemToEdit: itemToEdit
            });
        }
        Editors.converter = converter;
        function items(config) {
            return new WebApp.ItemsEditor(Object.assign({}, config));
        }
        Editors.items = items;
        function text(config) {
            return new WebApp.TextEditor(Object.assign({}, config));
        }
        Editors.text = text;
        function textMultiLine(config) {
            return new WebApp.TextEditor(Object.assign({ template: "TextEditorMultiLine" }, config));
        }
        Editors.textMultiLine = textMultiLine;
        function number(config) {
            return new WebApp.NumberEditor(Object.assign({}, config));
        }
        Editors.number = number;
        function boolean(config) {
            return new WebApp.BooleanEditor(Object.assign({}, config));
        }
        Editors.boolean = boolean;
        function password(config) {
            return new WebApp.TextEditor(Object.assign({ template: "PasswordEditor" }, config));
        }
        Editors.password = password;
        function object(config) {
            return new WebApp.ObjectEditor(config);
        }
        Editors.object = object;
        function address(config) {
            return new WebApp.TextEditor(Object.assign({ template: "TextEditorMultiLine" }, config));
        }
        Editors.address = address;
        function birthDate(minAge, config) {
            return new WebApp.DateEditorCombo({ maxYear: new Date().getFullYear() - (minAge !== null && minAge !== void 0 ? minAge : 0), minYear: new Date().getFullYear() - 100 });
        }
        Editors.birthDate = birthDate;
        function singleItemSelector(config) {
            return new WebApp.SingleItemSelector(config);
        }
        Editors.singleItemSelector = singleItemSelector;
    })(Editors = WebApp.Editors || (WebApp.Editors = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ImageLoader {
        static loadAsync(src) {
            const op = WebApp.Operation.begin({ message: "Loading image: " + src, type: WebApp.OperationType.Local });
            return new Promise((res, rej) => {
                const img = document.createElement("img");
                img.addEventListener("load", () => {
                    res(img);
                    op.end();
                });
                img.addEventListener("error", ev => {
                    rej(ev.error);
                    op.end();
                });
                img.src = src;
            });
        }
    }
    WebApp.ImageLoader = ImageLoader;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let Interaction;
    (function (Interaction) {
        function showMessageAsync(options) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const msgActions = (_a = options.actions) !== null && _a !== void 0 ? _a : ["ok"];
                const msgBox = new WebApp.MessageBox({ message: options.message, icon: options.icon, title: options.title });
                msgActions.forEach(a => {
                    msgBox.addAction({
                        name: a,
                        displayName: WebApp.Format.action(a),
                        executeAsync: () => Promise.resolve()
                    });
                });
                if (options.customActions)
                    options.customActions.forEach(a => msgBox.addAction(a));
                const result = yield msgBox.showAsync();
                return result;
            });
        }
        Interaction.showMessageAsync = showMessageAsync;
        function confirmAsync(message) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield showMessageAsync({
                    message: message,
                    title: WebApp.Strings["confirm"],
                    actions: ["yes", "no"]
                });
                return result == "yes";
            });
        }
        Interaction.confirmAsync = confirmAsync;
        function info(message) {
            const toast = new WebApp.Toast({ message: message });
            toast.showAsync();
        }
        Interaction.info = info;
        function warning(message) {
            const toast = new WebApp.Toast({ message: message, styles: ["warning"] });
            toast.showAsync();
        }
        Interaction.warning = warning;
        function succeed(message) {
            return WebApp.Actions.loadPageAsync(new WebApp.ContentActivity({
                providers: [new WebApp.MessageContent(Object.assign({ icon: "far fa-smile", customActions: [{
                                name: "close",
                                displayName: "close",
                                executeAsync: () => Promise.resolve(),
                            }] }, message))],
                name: "message"
            }));
        }
        Interaction.succeed = succeed;
        function fail(message) {
            return WebApp.Actions.loadPageAsync(new WebApp.ContentActivity({
                providers: [new WebApp.MessageContent(Object.assign({ icon: "far fa-sad-tear", customActions: [{
                                name: "close",
                                displayName: "close",
                                executeAsync: () => Promise.resolve(),
                            }] }, message))],
                name: "message"
            }));
        }
        Interaction.fail = fail;
    })(Interaction = WebApp.Interaction || (WebApp.Interaction = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let ItemsSources;
    (function (ItemsSources) {
        function static(items, allowZero = false) {
            return new WebApp.ItemsSource({
                typeName: "WebApp.ISimpleItem",
                getItemValue: a => a.value,
                getItemText: a => WebApp.Format.title(a.text),
                getItemsAsync: () => Promise.resolve(items),
                getItemByValueAsync: value => Promise.resolve(WebApp.linq(items).first(a => a.value == value)),
                allowZero: allowZero
            });
        }
        ItemsSources.static = static;
        function array(items) {
            return new WebApp.ItemsSource({
                getItemsAsync: () => Promise.resolve(items)
            });
        }
        ItemsSources.array = array;
        function actions(items) {
            return new WebApp.ItemsSource({
                typeName: "WebApp.IAction",
                getItemText: a => WebApp.DynamicString.getValue(a.displayName),
                getItemsAsync: () => Promise.resolve(items),
                allowZero: false
            });
        }
        ItemsSources.actions = actions;
    })(ItemsSources = WebApp.ItemsSources || (WebApp.ItemsSources = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ScriptLoader {
        constructor(src) {
            this.src = WebApp.Uri.absolute(src.replace("~/", "./"));
        }
        isLoaded() {
            if (this.src.substr(this.src.length - 3) == ".ts")
                return true;
            return WebApp.linq(document.scripts).any(a => a.src.toLowerCase().startsWith(this.src.toLowerCase()));
        }
        loadAsync(operation) {
            if (this.isLoaded())
                return Promise.resolve(true);
            return new Promise((resolve, reject) => {
                const curOperation = WebApp.Operation.begin({ parentOperation: operation, message: "Loading script " + this.src });
                const scriptNode = document.createElement("script");
                scriptNode.onload = () => {
                    curOperation.end();
                    resolve(true);
                };
                scriptNode.onerror = () => {
                    curOperation.end();
                    resolve(false);
                };
                scriptNode.type = "text/javascript";
                scriptNode.src = this.src;
                document.body.appendChild(scriptNode);
            });
        }
    }
    WebApp.ScriptLoader = ScriptLoader;
    class StyleLoader {
        constructor(src) {
            this.src = WebApp.Uri.absolute(src.replace("~/", "./"));
        }
        isLoaded() {
            return WebApp.linq(document.styleSheets).any(a => a.href && a.href.toLowerCase().startsWith(this.src.toLowerCase()));
        }
        loadAsync(operation) {
            if (this.isLoaded())
                return Promise.resolve(true);
            return new Promise((resolve, reject) => {
                const curOperation = WebApp.Operation.begin({ parentOperation: operation, message: "Loading style " + this.src });
                const linkNode = document.createElement("link");
                linkNode.onload = () => {
                    curOperation.end();
                    resolve(true);
                };
                linkNode.onerror = () => {
                    curOperation.end();
                    resolve(false);
                };
                linkNode.rel = "stylesheet";
                linkNode.href = this.src;
                document.body.appendChild(linkNode);
            });
        }
    }
    WebApp.StyleLoader = StyleLoader;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    ;
    let Services;
    (function (Services) {
        Services.views = {};
        Services.permissionManager = null;
        Services.itemsObserver = null;
    })(Services = WebApp.Services || (WebApp.Services = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let TypeCheck;
    (function (TypeCheck) {
        function isAsyncEditor(value) {
            return value && typeof value == "object" && "editAsync" in value && typeof value["editAsync"] == "function";
        }
        TypeCheck.isAsyncEditor = isAsyncEditor;
        function isView(value) {
            return value && typeof value == "object" && "parentView" in value && "template" in value;
        }
        TypeCheck.isView = isView;
        function isActivable(value) {
            return value && typeof value == "object" && typeof value["activateAsync"] == "function" && value["activateAsync"].length == 0;
        }
        TypeCheck.isActivable = isActivable;
        function isSelectable(value) {
            return value && typeof value == "object" && "isSelected" in value && "select" in value && typeof value["select"] == "function";
        }
        TypeCheck.isSelectable = isSelectable;
        function isSingleItemSelector(value) {
            return value && typeof value == "object" && "selectedItem" in value;
        }
        TypeCheck.isSingleItemSelector = isSingleItemSelector;
        function isAsyncLoad(value) {
            return value && typeof value == "object" && typeof value["loadAsync"] == "function" && value["loadAsync"].length == 0;
        }
        TypeCheck.isAsyncLoad = isAsyncLoad;
        function isValidable(value) {
            return value && typeof value == "object" && typeof value["validateAsync"] == "function" && value["validateAsync"].length < 2;
        }
        TypeCheck.isValidable = isValidable;
        function isHTMLContainer(value) {
            return value && typeof value == "object" && "nodes" in value;
        }
        TypeCheck.isHTMLContainer = isHTMLContainer;
        function isEditable(value) {
            return value && typeof value == "object" && "createEditor" in value && typeof value.createEditor == "function";
        }
        TypeCheck.isEditable = isEditable;
    })(TypeCheck = WebApp.TypeCheck || (WebApp.TypeCheck = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let Validators;
    (function (Validators) {
        var EMAIL_REGEXP = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        Validators.required = {
            validateAsync: ctx => Promise.resolve({
                isValid: ctx.value != null && ctx.value != "" && (!Array.isArray(ctx.value) || ctx.value.length > 0),
                error: WebApp.Strings["msg-specify-value"]({ params: [ctx.fieldName] })
            })
        };
        function minValue(value) {
            return {
                validateAsync: ctx => Promise.resolve(({
                    isValid: ctx.value >= value,
                    error: WebApp.Strings["msg-insert-greater-than"]({ params: [value.toString()] })
                }))
            };
        }
        Validators.minValue = minValue;
        ;
        function maxValue(value) {
            return {
                validateAsync: ctx => Promise.resolve(({
                    isValid: ctx.value <= value,
                    error: WebApp.Strings["msg-insert-less-than"]({ params: [value.toString()] }),
                }))
            };
        }
        Validators.maxValue = maxValue;
        ;
        Validators.email = {
            validateAsync: ctx => Promise.resolve(({
                isValid: ctx.value && EMAIL_REGEXP.test(ctx.value.toLowerCase()),
                error: WebApp.Strings["msg-invalid-email"]({ params: [ctx.value] })
            }))
        };
        function custom(validator) {
            return {
                validateAsync: (ctx) => __awaiter(this, void 0, void 0, function* () { return yield validator(ctx); })
            };
        }
        Validators.custom = custom;
        ;
    })(Validators = WebApp.Validators || (WebApp.Validators = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class VideoLoader {
        static loadAsync(src) {
            const op = WebApp.Operation.begin({ message: "Loading image: " + src, type: WebApp.OperationType.Local });
            return new Promise((res, rej) => {
                const video = document.createElement("video");
                video.addEventListener("playing", () => {
                    video.pause();
                    op.end();
                    res(video);
                });
                video.addEventListener("error", ev => {
                    op.end();
                    rej(ev.error);
                });
                video.src = src;
                video.play();
                if (video.readyState >= 2)
                    res(video);
            });
        }
        static loadIntoAsync(src, video) {
            if (!video.paused || video.played)
                return Promise.resolve();
            const op = WebApp.Operation.begin({ message: "Loading image: " + src, type: WebApp.OperationType.Local });
            return new Promise((res, rej) => {
                function removeListeners() {
                    video.removeEventListener("playing", loadListener);
                    video.removeEventListener("error", errorListener);
                }
                const loadListener = () => {
                    op.end();
                    removeListeners();
                    res(undefined);
                };
                const errorListener = ev => {
                    op.end();
                    removeListeners();
                    rej(ev.error);
                };
                video.addEventListener("playing", loadListener);
                video.addEventListener("error", errorListener);
                video.src = src;
                video.play();
            });
        }
    }
    WebApp.VideoLoader = VideoLoader;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    let ViewUtils;
    (function (ViewUtils) {
        function loadAllAsync(items) {
            return __awaiter(this, void 0, void 0, function* () {
                const loaders = WebApp.linq(items).ofType(a => WebApp.TypeCheck.isAsyncLoad(a)).select(a => a.loadAsync()).toArray();
                return yield Promise.all(loaders);
            });
        }
        ViewUtils.loadAllAsync = loadAllAsync;
        function formatForCss(name) {
            let s = 0;
            let result = "";
            for (let i = 0; i < name.length; i++) {
                const c = name.charAt(i);
                switch (s) {
                    case 0:
                        result += c.toLowerCase();
                        if (!WebApp.StringUtils.isUpperCase(c) || c == "-")
                            s = 1;
                        break;
                    case 1:
                        if (WebApp.StringUtils.isUpperCase(c) && c != "-") {
                            result += "-";
                            s = 0;
                        }
                        result += c.toLowerCase();
                        break;
                }
            }
            return result;
        }
        ViewUtils.formatForCss = formatForCss;
    })(ViewUtils = WebApp.ViewUtils || (WebApp.ViewUtils = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ItemsSource {
        constructor(config) {
            if (config) {
                if (config.getItemsAsync)
                    this.getItemsAsync = config.getItemsAsync;
                if (config.allowZero !== undefined)
                    this._allowZero = config.allowZero;
                if (config.getItemValue)
                    this.getItemValue = (a, bindItem) => {
                        if (bindItem === false)
                            return config.getItemValue(a);
                        if (!a && (a !== 0 || !config.allowZero))
                            return undefined;
                        return WebApp.Item.create({ type: this.typeName, value: config.getItemValue(a), text: this.getItemText(a), item: a });
                    };
                if (config.getItemText)
                    this.getItemText = config.getItemText;
                if (config.getFilter)
                    this.getFilter = config.getFilter;
                if (config.getItemByValueAsync) {
                    this.getItemByValueAsync = value => {
                        const item = WebApp.Item.getItem(value);
                        if (item)
                            return Promise.resolve(item);
                        return config.getItemByValueAsync(value);
                    };
                }
                if (config.equals)
                    this.equals = config.equals;
                this._typeName = config.typeName;
                this.displayName = config.displayName;
            }
        }
        getItemsAsync(filter) {
            return Promise.resolve([]);
        }
        getItemText(item) {
            if (item)
                return item.toString();
        }
        getItemValue(item, bindItem) {
            return item;
        }
        getFilter(text, offset, pageSize) {
            return {};
        }
        countAsync(filter) {
            return __awaiter(this, void 0, void 0, function* () {
                return (yield this.getItemsAsync(filter)).length;
            });
        }
        getItemByValueAsync(value) {
            const item = WebApp.Item.getItem(value);
            if (item)
                return Promise.resolve(item);
            return Promise.resolve(value);
        }
        equals(a, b) {
            if (a == b)
                return true;
            if (a != undefined && a.valueOf && b != undefined && b.valueOf)
                return a.valueOf() == b.valueOf();
            return false;
        }
        get itemComparer() {
            return (a, b) => this.equals(this.getItemValue(a), this.getItemValue(b));
        }
        get typeName() {
            return this._typeName;
        }
        get allowZero() {
            return this._allowZero;
        }
    }
    WebApp.ItemsSource = ItemsSource;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class EditableItemsSource extends WebApp.ItemsSource {
        constructor(config) {
            super(config);
            if (config) {
                if (config.addItemAsync)
                    this.addItemAsync = config.addItemAsync;
                if (config.updateItemAsync)
                    this.updateItemAsync = config.updateItemAsync;
                if (config.removeItemAsync)
                    this.removeItemAsync = config.removeItemAsync;
                if (config.newItem)
                    this.newItem = config.newItem;
            }
        }
        newItem() {
            return {};
        }
        addItemAsync(item) {
            return Promise.resolve(item);
        }
        updateItemAsync(editItem, item) {
            return Promise.resolve(item);
        }
        removeItemAsync(item) {
            return Promise.resolve(true);
        }
    }
    WebApp.EditableItemsSource = EditableItemsSource;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class CachedEditableItemsSource extends WebApp.EditableItemsSource {
        constructor(config) {
            super();
            this.source = null;
            this.cache = null;
            this.filter = null;
            if (config) {
                this.source = config.source;
                this.cache = config.cache;
                if (config.filterItem)
                    this.filterItem = (filter, item) => config.filterItem(filter, item, this.items);
                if (config.finalize)
                    this.finalize = config.finalize;
            }
            if (!this.cache)
                this.cache = {
                    key: new Date().getTime().toString(),
                    lastUpdateTime: null,
                    value: null
                };
            if (!this.cache.updateComplete)
                this.cache.updateComplete = new WebApp.Signal(true);
            if (!this.cache.value)
                this.cache.value = new Map();
            else if (this.cache.value.size > 0)
                this.cache.lastUpdateTime = new Date();
        }
        getItemText(item) {
            return this.source.getItemText(item);
        }
        getItemValue(item, bindItem) {
            return this.source.getItemValue(item, bindItem);
        }
        getFilter(text, offset, pageSize) {
            return this.source.getFilter(text, offset, pageSize);
        }
        equals(a, b) {
            return this.source.equals(a, b);
        }
        newItem() {
            return this.source.newItem();
        }
        finalize(filter, items) {
        }
        countAsync(filter) {
            return __awaiter(this, void 0, void 0, function* () {
                return WebApp.linq(this.items.entries()).select(a => a[1]).where(a => this.filterItem(filter, a)).count();
            });
        }
        getItemsAsync(filter) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.updateCacheAsync(false);
                const items = yield WebApp.linq(this.items.entries()).select(a => a[1]).where(a => this.filterItem(filter, a)).toArrayAsync(10);
                this.finalize(filter, items);
                return items;
            });
        }
        getItemByValueAsync(value) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.updateCacheAsync(false);
                if (value == null)
                    return null;
                if (typeof value == "object" && typeof value["valueOf"] == "function")
                    value = value["valueOf"]();
                return Promise.resolve(this.items.get(value));
            });
        }
        addItemAsync(item) {
            return __awaiter(this, void 0, void 0, function* () {
                const newItem = yield this.source.addItemAsync(item);
                if (newItem != null)
                    this.items.set(this.getItemValue(newItem, false), newItem);
                return newItem;
            });
        }
        updateItemAsync(item) {
            return __awaiter(this, void 0, void 0, function* () {
                const newItem = yield this.source.updateItemAsync(item);
                if (newItem != null)
                    this.items.set(this.getItemValue(newItem, false), newItem);
                return newItem;
            });
        }
        removeItemAsync(item) {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield this.source.removeItemAsync(item);
                if (result)
                    this.items.delete(this.getItemValue(item, false));
                return result;
            });
        }
        filterItem(filter, item) {
            return true;
        }
        readCacheAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.cache.key)
                    return yield WebApp.Services.dbStorage.getItem(this.cache.key);
            });
        }
        writeCacheAsync(items) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.cache.key)
                    yield WebApp.Services.dbStorage.setItem(this.cache.key, items);
            });
        }
        updateCacheAsync(force) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.cache.lastUpdateTime && !force)
                    return;
                if (!this.cache.updateComplete.isSet) {
                    yield this.cache.updateComplete.waitFor();
                    return;
                }
                this.cache.updateComplete.reset();
                try {
                    let newItems;
                    try {
                        newItems = yield this.source.getItemsAsync(this.filter);
                    }
                    catch (ex) {
                        console.error(ex);
                    }
                    let mustUpdate = true;
                    if (newItems == null) {
                        newItems = yield this.readCacheAsync();
                        mustUpdate = false;
                    }
                    if (newItems != null) {
                        this.items.clear();
                        for (let item of newItems)
                            this.items.set(this.getItemValue(item, false), item);
                        this.cache.lastUpdateTime = new Date();
                        if (mustUpdate)
                            yield this.writeCacheAsync(newItems);
                    }
                }
                finally {
                    this.cache.updateComplete.set();
                }
            });
        }
        get typeName() {
            return this.source.typeName;
        }
        get allowZero() {
            return this.source.allowZero;
        }
        get itemComparer() {
            return this.source.itemComparer;
        }
        get items() {
            return this.cache.value;
        }
    }
    WebApp.CachedEditableItemsSource = CachedEditableItemsSource;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class FullItemsLoader {
        loadItemsAsync(container, chunkSize) {
            return __awaiter(this, void 0, void 0, function* () {
                container.status = "loading";
                const operation = WebApp.Operation.begin({ message: "Loading items", type: WebApp.OperationType.Local });
                try {
                    const items = yield container.itemsSource.getItemsAsync(container.filter);
                    container.clear();
                    if (items)
                        yield WebApp.ArrayUtils.forEachAsync(items, chunkSize, a => container.addItem(a));
                }
                finally {
                    operation.end();
                    container.status = "loaded";
                }
            });
        }
    }
    FullItemsLoader.instance = new FullItemsLoader();
    WebApp.FullItemsLoader = FullItemsLoader;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class Item {
        static create(options) {
            let newValue = options.value;
            if (typeof newValue == "string")
                newValue = new String(newValue);
            else if (typeof newValue == "number")
                newValue = new Number(newValue);
            else if (typeof newValue == "boolean")
                newValue = new Boolean(newValue);
            if (options.item) {
                options.item.valueOf = () => options.value;
                if (options.value)
                    options.item["toJSON"] = () => options.value;
                if (options.text)
                    options.item.toString = () => options.text;
                if (options.type)
                    options.item["$type"] = () => options.type;
            }
            if (newValue) {
                if (options.text)
                    newValue.toString = () => options.text;
                if (options.type)
                    WebApp.ObjectUtils.setTypeName(newValue, options.type);
                if (options.item !== undefined)
                    WebApp.ObjectUtils.set(newValue, "@item", options.item);
                newValue["toJSON"] = () => options.value;
            }
            if (newValue)
                return newValue;
            return options.item;
        }
        static getText(value) {
            if (value == null || value == undefined)
                return "";
            const item = this.getItem(value);
            if (item !== value)
                return item.toString();
            return value.toString();
        }
        static getType(value) {
            return WebApp.ObjectUtils.getTypeName(value);
        }
        static getValue(value) {
            if (!value)
                return;
            if (value.valueOf)
                return value.valueOf();
            return value;
        }
        static getItem(value) {
            if (!value)
                return;
            const item = WebApp.ObjectUtils.get(value, "@item");
            if (item)
                return item;
            return undefined;
        }
    }
    WebApp.Item = Item;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class ItemsObserver {
        constructor() {
            this._listener = {};
        }
        unregister(itemType, listener) {
            if (itemType in this._listener) {
                const listeners = this._listener[itemType];
                const index = listeners.indexOf(listener);
                if (index - 1)
                    listeners.splice(index, 1);
            }
        }
        register(itemType, listener) {
            if (!(itemType in this._listener))
                this._listener[itemType] = [listener];
            else {
                if (this._listener[itemType].indexOf(listener) == -1)
                    this._listener[itemType].push(listener);
            }
        }
        clear() {
            this._listener = {};
        }
        notifyAdded(args) {
            if (args.itemType in this._listener)
                this._listener[args.itemType].forEach(a => a.onItemAdded ? a.onItemAdded(args) : undefined);
        }
        notifyRemoved(args) {
            if (args.itemType in this._listener)
                this._listener[args.itemType].forEach(a => a.onItemRemoved ? a.onItemRemoved(args) : undefined);
        }
        notifyChanged(args) {
            if (args.itemType in this._listener)
                this._listener[args.itemType].forEach(a => a.onItemChanged ? a.onItemChanged(args) : undefined);
        }
    }
    WebApp.ItemsObserver = ItemsObserver;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class PagedItemsLoader extends WebApp.BindableObject {
        constructor(config) {
            super();
            this._hasMoreItems = true;
            this.pageSize = 20;
            this.isScrollCheckActive = true;
            this.bindConfig("pageSize", config);
            if (config) {
                if (config.getFilter)
                    this.getFilter = config.getFilter;
            }
        }
        loadItemsAsync(container, chunkSize) {
            this._container = container;
            this._hasMoreItems = true;
            this._container.clear();
            return this.loadNextPageAsync();
        }
        loadNextPageAsync() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.canLoadNextPage)
                    return;
                if (this._container.itemsSource) {
                    const filter = this.getFilter(this._container.itemsCount, this.pageSize);
                    const operation = WebApp.Operation.begin({ message: "Laoding items from " + this._container.itemsCount, type: WebApp.OperationType.Local });
                    try {
                        this._container.status = "loading";
                        const newItems = yield this._container.itemsSource.getItemsAsync(Object.assign(Object.assign({}, filter), this._container.filter));
                        if (!newItems || newItems.length == 0)
                            this._hasMoreItems = false;
                        else {
                            newItems.forEach(item => this._container.addItem(item));
                            this._hasMoreItems = newItems.length == this.pageSize;
                        }
                    }
                    finally {
                        operation.end();
                        this._container.status = "loaded";
                    }
                }
            });
        }
        onScroll(data) {
            if (data.pageBottom < 1 && this.canLoadNextPage)
                this.loadNextPageAsync();
        }
        getFilter(offset, pageSize) {
            return this._container.itemsSource.getFilter(null, offset, pageSize);
        }
        get canLoadNextPage() {
            return this._hasMoreItems && this._container.status != "loading";
        }
    }
    WebApp.PagedItemsLoader = PagedItemsLoader;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class AppContentManager {
        constructor(contents) {
            this.contents = contents;
        }
        get(name) {
            return WebApp.linq(this.contents).first(a => a.name == name);
        }
        actionFor(name) {
            const content = this.get(name);
            return {
                executeAsync: content.openAsync,
                name: content.name,
                displayName: content.displayName,
                icon: content.icon
            };
        }
    }
    WebApp.AppContentManager = AppContentManager;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class DynamicPageManager {
        createPageAsync(pageInfo) {
            return __awaiter(this, void 0, void 0, function* () {
                const curOperation = WebApp.Operation.begin({ message: "Loading page '" + pageInfo.name + "'..." });
                const clientPage = yield this.getClientPageAsync(pageInfo.name, curOperation);
                if (!clientPage.isLoded)
                    yield this.loadClientPageAsync(clientPage, curOperation);
                const result = eval(clientPage.action);
                let page;
                if (result instanceof Promise)
                    yield result;
                if (page != null)
                    page.url = WebApp.Format.replaceArgs(WebApp.app.baseUrl + clientPage.url, pageInfo.args);
                page.args = pageInfo.args;
                curOperation.end();
                return page;
            });
        }
        loadComponentsAsync(pageName) {
            return __awaiter(this, void 0, void 0, function* () {
                const curOperation = WebApp.Operation.begin({ message: "Loading page '" + pageName + "'..." });
                const clientPage = yield this.getClientPageAsync(pageName, curOperation);
                if (clientPage && !clientPage.isLoded)
                    yield this.loadClientPageAsync(clientPage, curOperation);
                curOperation.end();
            });
        }
        loadAppStructureAsync(operation) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this._struture == null)
                    this._struture = yield WebApp.Http.getJsonAsync("~/app.json");
            });
        }
        loadClientPageAsync(clientPage, operation) {
            return __awaiter(this, void 0, void 0, function* () {
                const loaders = [];
                clientPage.isLoded = true;
                if (clientPage.scripts)
                    clientPage.scripts.forEach(a => loaders.push(new WebApp.ScriptLoader(a)));
                if (clientPage.styles)
                    clientPage.styles.forEach(a => loaders.push(new WebApp.StyleLoader(a)));
                yield Promise.all(WebApp.linq(loaders).select(a => a.loadAsync(operation)).toArray());
            });
        }
        getClientPageAsync(name, operation) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.loadAppStructureAsync(operation);
                const result = {};
                const pageInfo = this._struture.pages[name];
                result.styles = [];
                result.scripts = [];
                result.action = pageInfo.action;
                result.url = pageInfo.url;
                this.includeClientPage(result, pageInfo.include);
                return result;
            });
        }
        includeClientPage(clientPage, include) {
            if (!include)
                return;
            if (include.components)
                include.components.forEach(a => this.includeClientPage(clientPage, this._struture.components[a].include));
            if (include.styles)
                include.styles.forEach(a => {
                    if (clientPage.styles.indexOf(a) == -1)
                        clientPage.styles.push(a);
                });
            if (include.scripts)
                include.scripts.forEach(a => {
                    if (clientPage.scripts.indexOf(a) == -1)
                        clientPage.scripts.push(a);
                });
        }
    }
    WebApp.DynamicPageManager = DynamicPageManager;
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    class PermissionRequestItemView extends WebApp.ViewComponent {
        constructor(value) {
            super();
            this.value = null;
            this.switchView = null;
            this.isShowInfo = false;
            this.value = value;
            this.switchView = new WebApp.BooleanEditor({
                label: this.value.permission.name,
                template: "Switch",
                styles: ["primary"]
            });
        }
    }
    WebApp.PermissionRequestItemView = PermissionRequestItemView;
    class PermissionEditor extends WebApp.BindableObject {
        constructor() {
            super(...arguments);
            this._listView = null;
            this.view = null;
            this.value = null;
            this.isValid = true;
        }
        beginEditAsync(item) {
            const panel = new WebApp.Panel({
                styles: ["vertical"]
            });
            this._listView = panel.addView(new WebApp.ListView({
                styles: ["surface"],
                items: observableListOf(item),
                isAutoLoad: true,
                createItemView: item => new PermissionRequestItemView(item)
            }));
            panel.addView(new WebApp.IconTextView({ text: "msg-permission-request", styles: ["message warning"] }));
            this.view = panel;
            this.value = item;
            return Promise.resolve();
        }
        commitAsync(force) {
            for (let item of this._listView.content)
                item.value.granted = item.switchView.editValue;
            return Promise.resolve(true);
        }
    }
    class PermissionManager {
        constructor() {
            this.geolocation = {
                name: "geolocation",
                ask: () => new Promise(res => {
                    function setResult(result) {
                        localStorage.setItem("geolocation", result ? "granted" : "denied");
                        res(result);
                    }
                    navigator.geolocation.getCurrentPosition(() => setResult(true), error => setResult(error.code != error.PERMISSION_DENIED), { maximumAge: Infinity, timeout: 2000 });
                }),
                isGranted: () => __awaiter(this, void 0, void 0, function* () {
                    if ("permissions" in navigator)
                        return (yield navigator.permissions.query({ name: "geolocation" })).state == "granted";
                    return localStorage.getItem("geolocation") == "granted";
                })
            };
            this.notification = {
                name: "notification",
                ask: () => new Promise(res => {
                    if (!("Notification" in window)) {
                        console.warn("Notification not supported");
                        res(false);
                    }
                    Notification.requestPermission(p => {
                        res(p == "granted");
                    });
                }),
                isGranted: () => Promise.resolve(!("Notification" in window) ? true : Notification.permission == "granted")
            };
        }
        requireAsync(...permissions) {
            return __awaiter(this, void 0, void 0, function* () {
                let toAsk = [];
                let result = {};
                for (let perm of permissions) {
                    if (!(yield perm.permission.isGranted()))
                        toAsk.push(perm);
                    else
                        result[perm.permission.name] = true;
                }
                if (toAsk.length > 0) {
                    const editor = new WebApp.PopUpEditor({
                        editor: new PermissionEditor(),
                        saveLabel: "accept",
                        savePriority: WebApp.ActionPriority.Evidence,
                        title: "permission-request",
                    });
                    const editResult = yield editor.editAsync(toAsk);
                    if (editResult) {
                        for (let item of editResult) {
                            if (item.granted)
                                item.granted = yield item.permission.ask();
                            result[item.permission.name] = item.granted;
                        }
                    }
                }
                return result;
            });
        }
    }
    WebApp.PermissionManager = PermissionManager;
})(WebApp || (WebApp = {}));
WebApp.templateCatalog["ActionBar"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).class("context-mode", m => { var _a; return (_a = m.selectionManager) === null || _a === void 0 ? void 0 : _a.isActive; })
        .beginChild("ul").set("class", "nav main")
        .if(m => m.icon != null, t3 => t3
        .beginChild("li").set("class", "icon").template("Icon", m => m.icon).endChild())
        .if(m => m.mainAction == 'menu', t3 => t3
        .beginChild("li").set("class", "main-action menu").on("click", m => m.showNavigationMenu()).behavoir("ripple")
        .beginChild("i").set("class", "icon fas fa-bars").endChild()
        .endChild())
        .if(m => m.mainAction == 'back', t3 => t3
        .beginChild("li").set("class", "main-action back").on("click", m => m.back()).behavoir("ripple")
        .beginChild("i").set("class", "icon fas fa-chevron-left").endChild()
        .endChild())
        .if(m => m.title != null, t3 => t3
        .beginChild("li").set("class", "title").text(m => m.title).endChild())
        .foreach(m => m.actions, t3 => t3
        .beginChild("li").set("class", "action-item").class(m => m.name).content(m => m).endChild())
        .endChild()
        .beginChild("ul").set("class", "nav context")
        .beginChild("li").set("class", "main-action close").on("click", m => { var _a; return (_a = m.selectionManager) === null || _a === void 0 ? void 0 : _a.close(); }).behavoir("ripple")
        .beginChild("i").set("class", "icon fas fa-times").endChild()
        .endChild()
        .if(m => m.selectionManager != null, t3 => t3
        .beginChild("li").set("class", "title").text(m => m.selectionManager.selectionText).endChild()
        .foreach(m => m.selectionManager.actions, t4 => t4
        .beginChild("li").set("class", "action-item").class(m => m.name).content(m => m).endChild()))
        .endChild()
        .endChild()
        .content(m => m.navigationMenu);
};
WebApp.templateCatalog["ActionIcon"] = (t) => {
    t
        .beginChild("button").set("type", "button").set("class", "action button-text").set("tooltip", m => m.tooltip).on("click", m => m.executeAsync()).class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).behavoir("ripple").template("Icon", m => m.content).endChild();
};
WebApp.templateCatalog["ActionLink"] = (t) => {
    t
        .beginChild("button").set("type", "button").set("class", "action button-text").on("click", m => m.executeAsync()).class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).behavoir("ripple").content(m => m.content).endChild();
};
WebApp.templateCatalog["ActionButton"] = (t) => {
    t
        .beginChild("button").set("type", "button").set("class", "action button").on("click", m => m.executeAsync()).class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).behavoir("ripple").content(m => m.content).endChild();
};
WebApp.templateCatalog["Attach"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).behavoir("attach").endChild();
};
WebApp.templateCatalog["Blocker"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).class(m => m.status).behavoir("attach")
        .beginChild("div").set("class", "spinner-container")
        .beginChild("i").set("class", "spinner fas fa-circle-notch fa-spin fa-3x fa-fw").endChild()
        .endChild()
        .endChild();
};
WebApp.templateCatalog["DefaultCheckBox"] = (t) => {
    t
        .beginChild("label")
        .beginChild("input").set("type", "checkbox").value(m => m.editValue).focus(m => m.hasFocus).class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).set("id", m => m.uid).endChild()
        .beginChild("span").text(m => m.label).endChild()
        .endChild();
};
WebApp.templateCatalog["Switch"] = (t) => {
    t
        .beginChild("div").set("class", "switch").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).set("id", m => m.uid).class("selected", m => m.editValue)
        .beginChild("div").set("class", "checkbox-container")
        .beginChild("div").set("class", "unselected-half").on("click", m => m.editValue = false).endChild()
        .beginChild("div").set("class", "selected-half").on("click", m => m.editValue = true).endChild()
        .beginChild("div").set("class", "switch-button").endChild()
        .endChild()
        .if(m => m.label != null, t2 => t2
        .beginChild("label").text(m => m.label).endChild())
        .endChild();
};
WebApp.templateCatalog["CheckBox"] = (t) => {
    t
        .beginChild("div").set("class", "checkbox").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).set("id", m => m.uid).on("click", m => m.toggle()).class("selected", m => m.editValue)
        .beginChild("div").set("class", "checkbox-container")
        .beginChild("i").set("class", "fas fa-check").endChild()
        .endChild()
        .if(m => m.label != null, t2 => t2
        .beginChild("label").text(m => m.label).endChild())
        .endChild();
};
WebApp.templateCatalog["BottomSheet"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).class(m => m.status).behavoir("attach")
        .if(m => m.isShowOpener, t2 => t2
        .beginChild("button").set("type", "button").set("class", "opener button-text").on("click", m => m.toggle())
        .beginChild("i").set("class", "fas fa-caret-up").endChild()
        .endChild())
        .content(m => m.content).endChild();
};
WebApp.templateCatalog["ConsoleView"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible)
        .beginChild("div").set("class", "toolbar")
        .beginChild("button").set("type", "button").on("click", m => m.hide()).text("Hide").endChild()
        .beginChild("button").set("type", "button").on("click", m => m.clear()).text("Clear").endChild()
        .endChild()
        .beginChild("div").set("class", "body")
        .foreach(m => m.root.items, t3 => t3
        .content(m => m))
        .endChild()
        .endChild();
};
WebApp.templateCatalog["ConsoleMessageView"] = (t) => {
    t
        .beginChild("div").set("class", "console-item console-message").class(m => m.type)
        .if(m => m.content != null, t2 => t2
        .foreach(m => m.content, t3 => t3
        .beginChild("span").text(m => m).endChild()))
        .endChild();
};
WebApp.templateCatalog["ConsoleGroupView"] = (t) => {
    t
        .beginChild("div").set("class", "console-item console-group")
        .beginChild("header").template("ConsoleMessageView", m => m).endChild()
        .beginChild("section")
        .foreach(m => m.items, t3 => t3
        .content(m => m))
        .endChild()
        .endChild();
};
WebApp.templateCatalog["Container"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).behavoir("attach")
        .if(m => m.title != null, t2 => t2
        .beginChild("header")
        .beginChild("label").text(m => m.title).endChild()
        .endChild())
        .beginChild("div").set("class", "content").class("expanded", m => m.isExpanded).class("expandible", m => m.canExpand)
        .if(m => m.canExpand, t3 => t3
        .beginChild("div").set("class", "content-wrapper").content(m => m.content, true).endChild()
        .if(m => m.isOverflow, t4 => t4
        .beginChild("a").set("class", "base-button expand-collapse").on("click", m => m.toggleExpand()).visible(m => m.canExpand).behavoir("ripple")
        .beginChild("i").set("class", "fas fa-angle-down").endChild()
        .endChild()), t3 => t3
        .content(m => m.content, true))
        .endChild()
        .endChild();
};
WebApp.templateCatalog["ContentView"] = (t) => {
    t
        .content(m => m.content);
};
WebApp.templateCatalog["ContentViewNested"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).class(m => m.status).behavoir("attach").content(m => m.content).endChild();
};
WebApp.templateCatalog["ContextMenu"] = (t) => {
    t
        .beginChild("ul").class(m => m.className)
        .foreach(m => m.actions, t2 => t2
        .beginChild("li").content(m => m).endChild())
        .endChild();
};
WebApp.templateCatalog["CounterView"] = (t) => {
    t
        .beginChild("div").set("class", "action").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled)
        .beginChild("label").set("class", "title").text(m => m.title).endChild()
        .beginChild("span").set("class", "value").text(m => m.content).endChild()
        .endChild();
};
WebApp.templateCatalog["DateEditor"] = (t) => {
    t
        .beginChild("input").set("type", "date").value(m => m.textValue).focus(m => m.hasFocus).class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).set("id", m => m.uid).set("placeholder", m => m.placeholder).endChild();
};
WebApp.templateCatalog["DateEditorCombo"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled)
        .beginChild("select").set("class", "input-element day").value(m => m.selectedDay)
        .beginChild("option").set("value", "").text("[Giorno]").endChild()
        .foreach(m => m.days, t3 => t3
        .beginChild("option").set("value", m => m).text(m => m).endChild())
        .endChild()
        .beginChild("select").set("class", "input-element month").value(m => m.selectedMonth)
        .beginChild("option").set("value", "").text("[Mese]").endChild()
        .foreach(m => m.months, t3 => t3
        .beginChild("option").set("value", m => m.number).text(m => m.name).endChild())
        .endChild()
        .beginChild("select").set("class", "input-element year").value(m => m.selectedYear)
        .beginChild("option").set("value", "").text("[Anno]").endChild()
        .foreach(m => m.years, t3 => t3
        .beginChild("option").set("value", m => m).text(m => m).endChild())
        .endChild()
        .endChild();
};
WebApp.templateCatalog["Drawer"] = (t) => {
    t
        .beginChild("div").set("class", "drawer-container").class(m => m.status)
        .beginChild("div").set("class", "drawer")
        .if(m => m.header != null, t3 => t3
        .beginChild("header").content(m => m.header).endChild())
        .foreach(m => m.groups, t3 => t3
        .beginChild("section")
        .if(m => m.label != null, t5 => t5
        .beginChild("label").text(m => m.label).endChild())
        .beginChild("ul").set("class", "menu")
        .foreach(m => m.actions, t6 => t6
        .beginChild("li").set("class", "base-button").on("click", m => m.executeAsync()).behavoir("ripple")
        .beginChild("div").set("class", "action")
        .beginChild("i").set("class", "icon").class(m => m.content.icon).visible(m => m.content.icon != null).endChild()
        .beginChild("span").set("class", "text").text(m => m.content.text).endChild()
        .endChild()
        .endChild())
        .endChild()
        .endChild())
        .endChild()
        .behavoir("attach").endChild();
};
WebApp.templateCatalog["FileUploadView"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).class(m => m.status)
        .beginChild("div").set("class", "content")
        .beginChild("div").set("class", "header")
        .beginChild("button").set("type", "button").set("class", "select button-text").on("click", m => m.select()).text(m => m.text).set("enabled", m => m.status == 'selected' || m.status == 'empty').endChild()
        .endChild()
        .beginChild("div").set("class", "progress")
        .beginChild("div").set("class", "bar").style("width", m => (m.progress * 100) + '%').endChild()
        .beginChild("div").set("class", "text").text(m => m.progressText).endChild()
        .endChild()
        .endChild()
        .endChild();
};
WebApp.templateCatalog["Html"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).html(m => m.content).endChild();
};
WebApp.templateCatalog["HtmlNode"] = (t) => {
    t
        .appendChild(t.model.content);
};
WebApp.templateCatalog["Icon"] = (t) => {
    t
        .if(m => m != null, t1 => t1
        .if(m => m.substr(0, 4) == 'fas ' || m.substr(0, 4) == 'fab ' || m.substr(0, 4) == 'far ' || m.substr(0, 4) == 'fal ' || m.substr(0, 4) == 'fad ', t2 => t2
        .beginChild("i").set("class", "icon").class(m => m).endChild(), t2 => t2
        .beginChild("img").set("class", "icon").set("src", m => m).endChild()));
};
WebApp.templateCatalog["IconTextView"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).class(m => m.status)
        .if(m => m.icon != null, t2 => t2
        .template("Icon", m => m.icon))
        .if(m => m.text != null, t2 => t2
        .beginChild("span").set("class", "text").text(m => m.text).endChild())
        .endChild();
};
WebApp.templateCatalog["IconTextViewInline"] = (t) => {
    t
        .class(m => m.status)
        .if(m => m.icon != null, t1 => t1
        .template("Icon", m => m.icon))
        .if(m => m.text != null, t1 => t1
        .beginChild("span").set("class", "text").text(m => m.text).endChild());
};
WebApp.templateCatalog["ImageInline"] = (t) => {
    t
        .beginChild("img").class(m => m.className).set("src", m => m.content).visible(m => m.visible).set("enabled", m => m.enabled).endChild();
};
WebApp.templateCatalog["Image"] = (t) => {
    t
        .beginChild("div").set("class", "image-container").visible(m => m.visible).set("enabled", m => m.enabled)
        .beginChild("img").class(m => m.className).set("src", m => m.content).endChild()
        .endChild();
};
WebApp.templateCatalog["ItemView"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).class(m => m.status).class("activable", m => m.canOpen).class("compact", m => !(m.mainActions && m.mainActions.length > 0))
        .if(m => m.mainActions && m.mainActions.length > 0, t2 => t2
        .beginChild("div").set("class", "body-container").template("ItemViewBody", m => m).endChild()
        .beginChild("div").set("class", "main-actions")
        .foreach(m => m.mainActions, t4 => t4
        .content(m => m))
        .endChild(), t2 => t2
        .template("ItemViewBody", m => m))
        .endChild();
};
WebApp.templateCatalog["ItemViewBody"] = (t) => {
    t
        .class("with-menu", m => m.hasActions)
        .beginChild("div").on("click", m => m.open()).class("body", m => true)
        .if(m => m.content.count <= 1, t2 => t2
        .content(m => m.content.get(0), true), t2 => t2
        .foreach(m => m.content, t3 => t3
        .content(m => m)))
        .endChild()
        .if(m => m.canOpen, t1 => t1
        .beginChild("i").set("class", "open-icon fas fa-angle-right").endChild())
        .if(m => m.hasActions, t1 => t1
        .beginChild("a").set("class", "menu").on("click", m => m.showMenu())
        .beginChild("i").set("class", "fas fa-ellipsis-v").endChild()
        .endChild());
};
WebApp.templateCatalog["ItemsEditor"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled)
        .foreach(m => m.content, t2 => t2
        .beginChild("div").set("class", "list-item").content(m => m, true).endChild())
        .if(m => m.canAdd, t2 => t2
        .beginChild("div").set("class", "add-item").content(m => m.addAction).endChild())
        .endChild();
};
WebApp.templateCatalog["ItemsView"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled)
        .foreach(m => m.content, t2 => t2
        .content(m => m))
        .if(m => m.content.count == 0 && m.emptyView != null, t2 => t2
        .content(m => m.emptyView))
        .endChild();
};
WebApp.templateCatalog["ItemsViewWrapped"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled)
        .beginChild("div").set("class", "wrapper")
        .foreach(m => m.content, t3 => t3
        .content(m => m))
        .if(m => m.content.count == 0 && m.emptyView != null, t3 => t3
        .content(m => m.emptyView))
        .endChild()
        .endChild();
};
WebApp.templateCatalog["ItemsViewForm"] = (t) => {
    t
        .beginChild("form").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled)
        .foreach(m => m.content, t2 => t2
        .content(m => m))
        .if(m => m.content.count == 0 && m.emptyView != null, t2 => t2
        .content(m => m.emptyView))
        .endChild();
};
WebApp.templateCatalog["ListView"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).behavoir("scroll-check").class(m => m.status)
        .foreach(m => m.header, t2 => t2
        .beginChild("header").set("class", "header-item").content(m => m).endChild()
        .if(m => WebApp.injectProxy(m, "$parent", t.model).showSeparator, t3 => t3
        .beginChild("div").set("class", "separator").endChild()))
        .if(m => m.content.count == 0 && m.emptyView != null && m.status == 'loaded', t2 => t2
        .content(m => m.emptyView))
        .foreach(m => m.content, t2 => t2
        .beginChild("div").set("class", "list-item").content(m => m, true).endChild()
        .if(m => WebApp.injectProxy(m, "$parent", t.model).showSeparator, t3 => t3
        .beginChild("div").set("class", "separator").endChild()))
        .foreach(m => m.footer, t2 => t2
        .beginChild("footer").set("class", "footer-item").content(m => m).endChild()
        .if(m => WebApp.injectProxy(m, "$parent", t.model).showSeparator, t3 => t3
        .beginChild("div").set("class", "separator").endChild()))
        .beginChild("div").set("class", "loading-item")
        .beginChild("i").set("class", "fas fa-circle-notch fa-spin fa-3x fa-fw").endChild()
        .endChild()
        .endChild();
};
WebApp.templateCatalog["ListViewInline"] = (t) => {
    t
        .beginChild("div").set("class", "list-view-inline").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).behavoir("scroll-check").class(m => m.status)
        .if(m => m.header.count > 0, t2 => t2
        .foreach(m => m.header, t3 => t3
        .content(m => m))
        .if(m => m.showSeparator, t3 => t3
        .beginChild("div").set("class", "separator").endChild()))
        .if(m => m.content.count == 0 && m.emptyView != null && m.status == 'loaded', t2 => t2
        .content(m => m.emptyView))
        .foreach(m => m.content, t2 => t2
        .content(m => m)
        .if(m => WebApp.injectProxy(m, "$parent", t.model).showSeparator, t3 => t3
        .beginChild("div").set("class", "separator").endChild()))
        .if(m => m.footer.count > 0, t2 => t2
        .foreach(m => m.footer, t3 => t3
        .content(m => m))
        .if(m => m.showSeparator, t3 => t3
        .beginChild("div").set("class", "separator").endChild()))
        .beginChild("div").set("class", "loading-item")
        .beginChild("i").set("class", "fas fa-circle-notch fa-spin fa-3x fa-fw").endChild()
        .endChild()
        .endChild();
};
WebApp.templateCatalog["LocationView"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled)
        .beginChild("address")
        .if(m => m.content.name != null, t3 => t3
        .beginChild("label").text(m => m.content.name).endChild())
        .beginChild("span").text(m => m.content.address).endChild()
        .endChild()
        .beginChild("img").set("src", m => m.map).on("click", m => m.showMap()).endChild()
        .endChild();
};
WebApp.templateCatalog["MediaEditor"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible)
        .beginChild("div").set("class", "media-container").on("click", m => m.showMenu()).content(m => m.mediaView).endChild()
        .content(m => m.fileUpload).endChild();
};
WebApp.templateCatalog["MediaView"] = (t) => {
    t
        .content(m => m.activeView);
};
WebApp.templateCatalog["MessageBox"] = (t) => {
    t
        .beginChild("div").class(m => m.className)
        .beginChild("h5").set("class", "title").text(m => m.title).endChild()
        .beginChild("div").set("class", "body")
        .if(m => m.icon != null, t3 => t3
        .template("Icon", m => m.icon))
        .beginChild("div").set("class", "text").text(m => m.message).endChild()
        .endChild()
        .beginChild("div").set("class", "actions")
        .foreach(m => m.actions, t3 => t3
        .content(m => m))
        .endChild()
        .endChild();
};
WebApp.templateCatalog["MultiItemPicker"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).class(m => m.status)
        .beginChild("div").set("class", "items-container")
        .beginChild("i").set("class", "loading-item fas fa-circle-notch fa-spin fa-fw").endChild()
        .foreach(m => m.items, t3 => t3
        .content(m => m))
        .endChild()
        .content(m => m.selectAction).endChild();
};
WebApp.templateCatalog["NavBar"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled)
        .beginChild("nav").set("class", "nav")
        .foreach(m => m.content, t3 => t3
        .beginChild("button").set("class", "button-text").class(m => m.status).on("click", m => m.select()).visible(m => m.visible).behavoir("ripple").content(m => m).endChild())
        .endChild()
        .endChild();
};
WebApp.templateCatalog["SlidePageHost"] = (t) => {
    t
        .beginChild("div").set("class", "slide-page-host").class(m => m.activeTransaction)
        .beginChild("div").set("class", "page-container").class(m => m.pageViews[0].className).content(m => m.pageViews[0].content).endChild()
        .beginChild("div").set("class", "page-container").class(m => m.pageViews[1].className).content(m => m.pageViews[1].content).endChild()
        .endChild();
};
WebApp.templateCatalog["SinglePageHost"] = (t) => {
    t
        .beginChild("div").set("class", "single-page-host").content(m => m.current.view).endChild();
};
WebApp.templateCatalog["PermissionRequestItemView"] = (t) => {
    t
        .beginChild("div").class(m => m.className)
        .beginChild("div").set("class", "item-content")
        .beginChild("div").set("class", "main").content(m => m.switchView).endChild()
        .beginChild("span").set("class", "right bold uppercase").text(m => WebApp.Format.action('permission-why')).on("click", m => m.isShowInfo = true).class("hidden", m => m.isShowInfo).endChild()
        .endChild()
        .beginChild("div").set("class", "info-message on-surface-smaller").text(m => WebApp.Format.message(m.value.description)).class("hidden", m => !m.isShowInfo).endChild()
        .endChild();
};
WebApp.templateCatalog["PopUpContent"] = (t) => {
    t
        .beginChild("div").class(m => m.className)
        .beginChild("h5").set("class", "title").text(m => m.title).endChild()
        .beginChild("div").set("class", "body").content(m => m.contentView).endChild()
        .beginChild("div").set("class", "actions")
        .foreach(m => m.actions, t3 => t3
        .content(m => m))
        .endChild()
        .endChild();
};
WebApp.templateCatalog["ProgressView"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).class("visible", m => m.visible)
        .beginChild("i").set("class", "spinner fas fa-circle-notch fa-spin fa-3x fa-fw").endChild()
        .endChild();
};
WebApp.templateCatalog["PropertyView"] = (t) => {
    t
        .beginChild("div").set("class", "action").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled)
        .if(m => m.showLabel && m.label != null, t2 => t2
        .beginChild("label").set("for", m => m.editor.uid).text(m => m.label).endChild())
        .if(m => m.readonly, t2 => t2
        .beginChild("div").set("class", "display-value").text(m => m.editor.displayValue).endChild(), t2 => t2
        .content(m => m.editor)
        .if(m => m.error != null, t3 => t3
        .beginChild("span").set("class", "error").text(m => m.error).endChild()))
        .endChild();
};
WebApp.templateCatalog["RemovableItemView"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).class(m => m.status)
        .beginChild("div").set("class", "content").content(m => m.content).endChild()
        .beginChild("button").set("type", "button").set("class", "remove button-text").set("href", "#!").on("click", m => m.removeAsync())
        .beginChild("i").set("class", "fas fa-times").endChild()
        .endChild()
        .endChild();
};
WebApp.templateCatalog["SearchView"] = (t) => {
    t
        .if(m => m.isExpanded, t1 => t1
        .beginChild("div").set("class", "search-container").class(m => m.className).visible(m => m.visible).class(m => m.status)
        .beginChild("input").set("type", "text").focus(m => m.hasFocus).set("enabled", m => m.enabled).value(m => m.searchText).set("placeholder", m => m.tooltip).endChild()
        .beginChild("i").set("class", "loading-item fas fa-circle-notch fa-spin fa-fw").endChild()
        .endChild(), t1 => t1
        .template("ActionIcon", m => m));
};
WebApp.templateCatalog["SectionEditor"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).content(m => m.navBar)
        .if(m => { var _a, _b; return ((_b = (_a = m.navBar.selectedItem) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.editor) != null; }, t2 => t2
        .content(m => m.navBar.selectedItem.content.editor))
        .endChild();
};
WebApp.templateCatalog["SectionsView"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled)
        .foreach(m => m.content, t2 => t2
        .beginChild("section")
        .beginChild("h5").set("class", "header").content(m => m.header).endChild()
        .beginChild("div").set("class", "content").content(m => m.content).endChild()
        .endChild())
        .endChild();
};
WebApp.templateCatalog["SelectableItemView"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).on("click", m => m.toggle()).class("selected", m => m.isSelected).class("checkbox", m => true)
        .beginChild("div").set("class", "checkbox-container").value(m => m.isSelected)
        .beginChild("i").set("class", "fas fa-check").endChild()
        .endChild()
        .content(m => m.content).endChild();
};
WebApp.templateCatalog["SimpleItemView"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).class(m => m.status).template("Icon", m => m.icon)
        .beginChild("div").set("class", "details")
        .beginChild("h6").text(m => m.text).endChild()
        .if(m => m.subText != null, t3 => t3
        .beginChild("div").set("class", "sub-text").text(m => m.subText).endChild())
        .endChild()
        .endChild();
};
WebApp.templateCatalog["SingleItemPicker"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).class(m => m.status)
        .beginChild("div").set("class", "items-container")
        .beginChild("i").set("class", "loading-item fas fa-circle-notch fa-spin fa-fw").endChild()
        .content(m => m.contentView).endChild()
        .if(m => m.editValue != null, t2 => t2
        .content(m => m.clearAction))
        .content(m => m.selectAction).endChild();
};
WebApp.templateCatalog["SelectEditor"] = (t) => {
    t
        .beginChild("select").set("class", "input-element").focus(m => m.hasFocus).class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).set("id", m => m.uid).behavoir("attach")
        .if(m => m.placeholder != null, t2 => t2
        .beginChild("option").set("value", "").text(m => m.placeholder).endChild())
        .foreach(m => m.items, t2 => t2
        .beginChild("option").text(m => m.content).endChild())
        .endChild();
};
WebApp.templateCatalog["SingleItemSelectorList"] = (t) => {
    t
        .beginChild("div").set("class", "list-view compact").class(m => m.className)
        .foreach(m => m.items, t2 => t2
        .content(m => m))
        .endChild();
};
WebApp.templateCatalog["SelectorItemView"] = (t) => {
    t
        .beginChild("div").set("class", "list-item selectable-item-view").on("click", m => m.select()).class("selected", m => m.isSelected).content(m => m.content, true).endChild();
};
WebApp.templateCatalog["SelectorItemCheckBox"] = (t) => {
    t
        .beginChild("div").set("class", "list-item selectable-item-view single checkbox").on("click", m => m.select()).class("selected", m => m.isSelected)
        .beginChild("div").set("class", "checkbox-container").value(m => m.isSelected)
        .beginChild("i").set("class", "fas fa-check").endChild()
        .endChild()
        .content(m => m.content).endChild();
};
WebApp.templateCatalog["SnackBar"] = (t) => {
    t
        .beginChild("div").set("class", "snack-bar-container").class(m => m.status)
        .beginChild("div").class(m => m.className)
        .beginChild("div").set("class", "content").on("click", m => m.hide(null)).content(m => m.content).endChild()
        .if(m => m.action != null, t3 => t3
        .content(m => m.action))
        .endChild()
        .endChild();
};
WebApp.templateCatalog["TextEditor"] = (t) => {
    t
        .beginChild("input").behavoir("attach").set("class", "input-element").set("type", "text")
        .value(m => m.editValue)
        .focus(m => m.hasFocus).class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).set("id", m => m.uid).set("placeholder", m => m.placeholder).set("maxlength", m => m.maxLength).endChild();
};
WebApp.templateCatalog["NumberEditor"] = (t) => {
    t
        .beginChild("input").behavoir("attach").set("class", "input-element").set("inputmode", "decimal").set("type", "text").set("pattern", m => WebApp.Strings['decimal-input']()).set("lang", m => WebApp.app.language).value(m => m.editValue).focus(m => m.hasFocus).class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).set("id", m => m.uid).set("placeholder", m => m.placeholder).endChild();
};
WebApp.templateCatalog["PasswordEditor"] = (t) => {
    t
        .beginChild("input").behavoir("attach").set("class", "input-element").set("type", "password").value(m => m.editValue).focus(m => m.hasFocus).class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).set("id", m => m.uid).set("placeholder", m => m.placeholder).set("maxlength", m => m.maxLength).endChild();
};
WebApp.templateCatalog["TextEditorMultiLine"] = (t) => {
    t
        .beginChild("textarea").set("class", "input-element").behavoir("attach").value(m => m.editValue).focus(m => m.hasFocus).class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).set("id", m => m.uid).set("cols", m => m.lineCount).set("placeholder", m => m.placeholder).set("maxlength", m => m.maxLength).endChild();
};
WebApp.templateCatalog["TextContent"] = (t) => {
    t
        .beginChild("span").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).text(m => m.content).endChild();
};
WebApp.templateCatalog["TextView"] = (t) => {
    t
        .beginChild("span").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).text(m => m.text).endChild();
};
WebApp.templateCatalog["Text"] = (t) => {
    t
        .beginChild("span").text(m => m).endChild();
};
WebApp.templateCatalog["ToastContainer"] = (t) => {
    t
        .foreach(m => m, t1 => t1
        .content(m => m));
};
WebApp.templateCatalog["Toast"] = (t) => {
    t
        .beginChild("div").class(m => m.className).text(m => m.message).class("visible", m => m.visible).endChild();
};
WebApp.templateCatalog["VideoView"] = (t) => {
    t
        .beginChild("div").set("class", "video-container").visible(m => m.visible).set("enabled", m => m.enabled).class(m => m.className)
        .beginChild("video").set("src", m => m.content).behavoir("attach").endChild()
        .endChild();
};
WebApp.templateCatalog["VideoViewInline"] = (t) => {
    t
        .beginChild("video").visible(m => m.visible).set("enabled", m => m.enabled).class(m => m.className).set("src", m => m.content).behavoir("attach").endChild();
};
WebApp.templateCatalog["WebView"] = (t) => {
    t
        .beginChild("iframe").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled).set("src", m => m.content).behavoir("attach").endChild();
};
WebApp.templateCatalog["WizardView"] = (t) => {
    t
        .beginChild("div").class(m => m.className).visible(m => m.visible).set("enabled", m => m.enabled)
        .beginChild("div").set("class", "wizard-steps")
        .beginChild("ul")
        .foreach(m => m.content, t4 => t4
        .beginChild("li").text(m => m.index + 1).class("active", m => m.isActive).class("done", m => m.index < WebApp.injectProxy(m, "$parent", t.model).currentStepIndex).endChild())
        .endChild()
        .endChild()
        .if(m => m.currentView != null, t2 => t2
        .beginChild("h5").set("class", "title").text(m => m.currentView.title).endChild()
        .if(m => m.currentView.coverImage != null, t3 => t3
        .beginChild("div").set("class", "cover-image").template("Icon", m => m.currentView.coverImage).endChild())
        .content(m => m.currentView))
        .beginChild("div").set("class", "actions").content(m => m.actions.next).content(m => m.actions.finish)
        .foreach(m => m.currentView.actions, t3 => t3
        .content(m => m))
        .endChild()
        .endChild();
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
        /****************************************/
        class ConstIndicatorFunction {
            constructor(value) {
                this._value = value;
            }
            /****************************************/
            value(main, delta, exMain, exDelta, area) {
                let result = this._value(main, area);
                if (exMain) {
                    for (var i in exMain)
                        result = WebApp.MathUtils.sumNull(result, -this.value(exMain[i], exDelta[i], null, null, area));
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
                let curValue;
                for (var i in main)
                    curValue = WebApp.MathUtils.sumNull(curValue, indicator.value(main[i], delta[i], exMain[i], exDelta[i], area));
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
                let curValue;
                let curFactor;
                for (var i in main) {
                    curValue = WebApp.MathUtils.sumNull(curValue, indicator.value(main[i], delta[i], exMain[i], exDelta[i], area));
                    curFactor = WebApp.MathUtils.sumNull(curFactor, this._factor.value(main[i], delta[i], exMain[i], exDelta[i], area));
                }
                return this._value(curValue, curFactor);
            }
        }
        GeoPlot.DoubleFactorFunction = DoubleFactorFunction;
        class IndicatorCalculator {
            constructor(data, dataSet, geo) {
                this.data = data;
                this.dataSet = dataSet;
                this.geo = geo;
            }
            /****************************************/
            getDataAtDay(number, curAreaId) {
                if (number < 0)
                    return undefined;
                const day = this.data.days[number];
                if (day) {
                    const data = day.values[curAreaId];
                    if (data)
                        return data;
                }
                return this.dataSet.empty;
            }
            /****************************************/
            getFactorValue(options) {
                const areaId = (typeof options.areaOrId == "string" ? options.areaOrId : options.areaOrId.id).toLowerCase();
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
                    main.push(this.getDataAtDay(dayNumber, areaId));
                    if (options.isDayDelta)
                        delta.push(this.getDataAtDay(dayNumber - 1, areaId));
                    if (options.execludedAreas) {
                        var curExMain = [];
                        var curExDelta = [];
                        for (var exAreaId of options.execludedAreas) {
                            curExMain.push(this.getDataAtDay(dayNumber, exAreaId.toLowerCase()));
                            if (options.isDayDelta)
                                curExDelta.push(this.getDataAtDay(dayNumber - 1, exAreaId.toLowerCase()));
                        }
                        exMain.push(curExMain);
                        exDelta.push(curExDelta);
                    }
                }
                const factor = WebApp.linq(this.dataSet.factors).first(a => a.id == options.factorId);
                const indicator = WebApp.linq(this.dataSet.indicators).first(a => a.id == options.indicatorId);
                return factor.compute.value(main, delta, exMain, exDelta, this.geo.areas[areaId], indicator.compute);
            }
            /****************************************/
            getIndicatorValue(options) {
                const areaId = (typeof options.areaOrId == "string" ? options.areaOrId : options.areaOrId.id).toLowerCase();
                const indicator = WebApp.linq(this.dataSet.indicators).first(a => a.id == options.indicatorId);
                let main = this.getDataAtDay(options.dayNumber, areaId);
                let delta;
                let exMain;
                let exDelta;
                if (options.isDayDelta)
                    delta = this.getDataAtDay(options.dayNumber - 1, areaId);
                if (options.execludedAreas) {
                    exMain = [];
                    exDelta = [];
                    for (var exAreaId of options.execludedAreas) {
                        exMain.push(this.getDataAtDay(options.dayNumber, exAreaId.toLowerCase()));
                        if (options.isDayDelta)
                            exDelta.push(this.getDataAtDay(options.dayNumber - 1, exAreaId.toLowerCase()));
                    }
                    ;
                }
                return indicator.compute.value(main, delta, exMain, exDelta, this.geo.areas[areaId]);
            }
            /****************************************/
            getSerie(source) {
                const result = [];
                if (source.groupSize > 1) {
                    let count = source.groupSize;
                    let group = [];
                    for (let i = 0 + source.startDay; i < this.data.days.length; i++) {
                        group.push(i);
                        count--;
                        if (count == 0) {
                            const item = {
                                x: (source.xAxis == "date" ? new Date(this.data.days[i].date) : i),
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
                    for (let i = 0 + source.startDay; i < this.data.days.length; i++) {
                        const item = {
                            x: source.xAxis == "date" ? new Date(this.data.days[i].date) : i,
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
            GeoAreaType[GeoAreaType["Continent"] = 0] = "Continent";
            GeoAreaType[GeoAreaType["CountryGroup"] = 1] = "CountryGroup";
            GeoAreaType[GeoAreaType["Country"] = 2] = "Country";
            GeoAreaType[GeoAreaType["State"] = 3] = "State";
            GeoAreaType[GeoAreaType["Region"] = 4] = "Region";
            GeoAreaType[GeoAreaType["District"] = 5] = "District";
            GeoAreaType[GeoAreaType["Municipality"] = 6] = "Municipality";
        })(GeoAreaType = GeoPlot.GeoAreaType || (GeoPlot.GeoAreaType = {}));
        let Gender;
        (function (Gender) {
            Gender[Gender["All"] = 0] = "All";
            Gender[Gender["Male"] = 1] = "Male";
            Gender[Gender["Female"] = 2] = "Female";
        })(Gender = GeoPlot.Gender || (GeoPlot.Gender = {}));
        /****************************************/
        GeoPlot.MATERIAL_COLORS = {
            "red": { "600": "#f44336" },
            "pink": { "600": "#e91e63" },
            "purple": { "600": "#9c27b0" },
            "deep_purple": { "600": "#673ab7" },
            "indigo": { "600": "#3f51b5" },
            "blue": { "600": "#2196f3" },
            "light_blue": { "600": "#03a9f4" },
            "cyan": { "600": "#00bcd4" },
            "teal": { "600": "#009688" },
            "green": { "600": "#4caf50" },
            "light_green": { "600": "#8bc34a" },
            "lime": { "600": "#cddc39" },
            "yellow": { "600": "#ffeb3b" },
            "amber": { "600": "#ffc107" },
            "orange": { "600": "#ff9800" },
            "depp_orange": { "600": "#ff5722" },
            "brown": { "600": "#795548" },
            "grey": { "600": "#9e9e9e" },
            "blue_gray": { "600": "#607d8b" },
        };
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
        class ActionView {
            execute() {
            }
        }
        GeoPlot.ActionView = ActionView;
        /****************************************/
        /* TreeNode
        /****************************************/
        class TreeNode {
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
            select(expand = false) {
                this.isSelected(true);
                if (this._element)
                    this._element.focus();
                if (expand) {
                    let curNode = this;
                    while (curNode) {
                        curNode.isExpanded(true);
                        curNode = curNode.parentNode;
                    }
                }
            }
            /****************************************/
            expandCollapse() {
                this.isExpanded(!this.isExpanded());
            }
        }
        GeoPlot.TreeNode = TreeNode;
        /****************************************/
        /* TreeView
        /****************************************/
        class TreeView {
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
        GeoPlot.TreeView = TreeView;
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
})(WebApp || (WebApp = {}));
/// <reference path="treeview.ts" />
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        /****************************************/
        class BaseStudioItem extends GeoPlot.BaseTreeItem {
            constructor() {
                super();
                this._isUpdating = 0;
                this.time = ko.observable(0);
                this.parameters = ko.observableArray();
            }
            /****************************************/
            createActions(result) {
                result.push(WebApp.apply(new GeoPlot.ActionView(), action => {
                    action.text = $string("$(delete)");
                    action.icon = "delete";
                    action.execute = () => this.remove();
                }));
            }
            /****************************************/
            setState(state) {
                this._isUpdating++;
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
                this._isUpdating--;
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
                this._graphCtx.treeItems[this.folderId] = this;
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
                const node = new GeoPlot.TreeNode(value);
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
                if (this.mainExpression && this._graphCtx)
                    this._graphCtx.setSelectedId(this.mainExpression);
            }
            /****************************************/
            onGraphChanged() {
            }
            /****************************************/
            updateColor() {
            }
        }
        GeoPlot.BaseStudioItem = BaseStudioItem;
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        /****************************************/
        class ColorPicker {
            /****************************************/
            constructor() {
                /****************************************/
                this.isOpened = ko.observable(false);
                this.colors = [];
                for (var color in GeoPlot.MATERIAL_COLORS)
                    this.addColor(GeoPlot.MATERIAL_COLORS[color][600]);
                this._mouseDown = ev => this.onMouseDown(ev);
            }
            /****************************************/
            attachNode(element) {
                this._element = element;
                document.body.appendChild(this._element);
            }
            /****************************************/
            pick() {
                return __awaiter(this, void 0, void 0, function* () {
                    yield this.open();
                    return new Promise(res => this._onSelected = res);
                });
            }
            /****************************************/
            addColor(color) {
                this.colors.push({
                    value: color,
                    select: () => {
                        if (this._onSelected)
                            this._onSelected(color);
                        this._onSelected = null;
                        this.close();
                    }
                });
            }
            /****************************************/
            open() {
                return __awaiter(this, void 0, void 0, function* () {
                    if (this.isOpened())
                        return;
                    this.isOpened(true);
                    if (window.event) {
                        const mouseEvent = window.event;
                        const coords = { x: mouseEvent.pageX, y: mouseEvent.pageY };
                        //await PromiseUtils.delay(0);
                        this._element.style.left = coords.x + "px";
                        this._element.style.top = (coords.y - this._element.clientHeight) + "px";
                    }
                    document.body.addEventListener("mousedown", this._mouseDown);
                });
            }
            /****************************************/
            close() {
                if (!this.isOpened())
                    return;
                this.isOpened(false);
                document.body.removeEventListener("mousedown", this._mouseDown);
            }
            /****************************************/
            onMouseDown(ev) {
                if (ev.target.parentElement != this._element) {
                    if (this._onSelected)
                        this._onSelected(undefined);
                    this._onSelected = null;
                    this.close();
                }
            }
        }
        ColorPicker.instance = new ColorPicker();
        GeoPlot.ColorPicker = ColorPicker;
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
                this.treeView = new GeoPlot.TreeView();
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
                this.treeView.setRoot(new GeoPlot.TreeNode());
                this.treeView.selectedNode.subscribe(a => this.onNodeSelected(a));
                this.fileDrop.onFileDropped = text => this.importText(text);
            }
            /****************************************/
            importText(text, options) {
                return __awaiter(this, void 0, void 0, function* () {
                    M.toast({ html: $string("$(msg-start-analysis)") });
                    this.hasData(true);
                    yield WebApp.PromiseUtils.delay(0);
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
                    let childNode = new GeoPlot.TreeNode(new GroupItem(group));
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
                        let childNode = new GeoPlot.TreeNode(new GroupItem(item.value));
                        childNode.loadChildNodes = () => __awaiter(this, void 0, void 0, function* () { return this.updateNode(childNode, item.value); });
                        node.addNode(childNode);
                        childNode.value().attachNode(childNode);
                    }
                }
                if (group.series) {
                    for (let item of WebApp.linq(group.series)) {
                        let childNode = new GeoPlot.TreeNode(new SerieItem(item.value));
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
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        /****************************************/
        class GraphContext {
            constructor() {
                this.vars = {};
                this.treeItems = {};
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
            setSelectedId(id) {
                if (this.calculator.controller.listModel.selectedItem && this.calculator.controller.listModel.selectedItem.id == id)
                    return;
                this.calculator.controller.dispatch({ type: "set-selected-id", id: id });
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
                /*
    
                this.calculator.setExpression({
                    id: id,
                    type: "table",
                    columns: [
                        {
                            values: linq(values).select(a => a.x.toString()).toArray()
                        },
                        {
                            values: linq(values).select(a => a.y.toString()).toArray(),
                            hidden: false
                        },
                    ]
                });*/
            }
            /****************************************/
            updateExpression(value) {
                //const exp = <Desmos.IMathExpression>linq(this.calculator.getExpressions()).where(a => a.id == value.id).first();
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
        GeoPlot.GraphContext = GraphContext;
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        /****************************************/
        class StudioProject extends GeoPlot.BaseStudioItem {
            constructor(config) {
                super();
                /****************************************/
                this.time = ko.observable(0);
                this.aggregationMode = ko.observable("none");
                this.itemType = "project";
                this.icon = "folder";
                this.optionsTemplateName = "ProjectOptionsTemplate";
                this.aggregationModes = [
                    {
                        text: $string("$(none)"),
                        value: "none"
                    },
                    {
                        text: $string("$(sum)"),
                        value: "sum"
                    },
                    {
                        text: $string("$(average)"),
                        value: "avg",
                    }
                ];
                this._varsMap = {
                    "time": null,
                    "xagg": null,
                    "yagg": null
                };
                if (config)
                    this.setState(config);
            }
            /****************************************/
            createActions(result) {
                super.createActions(result);
                result.push(WebApp.apply(new GeoPlot.ActionView(), action => {
                    action.text = $string("$(update-all-proj)");
                    action.icon = "autorenew";
                    action.execute = () => this.updateAllSerie();
                }));
            }
            /****************************************/
            updateAllSerie() {
                return __awaiter(this, void 0, void 0, function* () {
                    for (let item of this.children)
                        yield item.updateSerie();
                });
            }
            /****************************************/
            canAccept(value) {
                return (value instanceof GeoPlot.StudioSerie);
            }
            /****************************************/
            canReadData(transfer) {
                return transfer.types.indexOf("application/json+studio") != -1;
            }
            /****************************************/
            readData(transfer) {
                const textData = transfer.getData("application/json+studio");
                let serie = GeoPlot.StudioSerie.fromText(textData);
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
                    },
                    {
                        type: "folder",
                        id: this.getGraphId("private"),
                        title: this.name(),
                        secret: true,
                        collapsed: true
                    },
                    {
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
                    },
                    {
                        type: "table",
                        id: this.getGraphId("aggregate"),
                        folderId: this.getGraphId("private"),
                        columns: [
                            {
                                id: this.getGraphId("table/xagg"),
                                latex: this._varsMap["xagg"],
                            },
                            {
                                id: this.getGraphId("table/yagg"),
                                latex: this._varsMap["yagg"],
                                lines: true,
                                points: true
                                //hidden: this.aggregationMode() == "none"
                            }
                        ]
                    }
                ];
                return values;
            }
            /****************************************/
            updateAggregate() {
                const values = {};
                const children = this.children.toArray();
                for (var child of children) {
                    const ofs = parseInt(child.offsetX());
                    for (var item of child.values) {
                        const xReal = item.x + ofs;
                        if (!(xReal in values))
                            values[xReal] = item.y;
                        else
                            values[xReal] += item.y;
                    }
                }
                const funValues = WebApp.linq(values).orderBy(a => a.key).select(a => ({ x: a.key, y: a.value })).toArray();
                this._graphCtx.updateTable(this.getGraphId("aggregate"), funValues);
            }
            /****************************************/
            updateColor() {
                this._graphCtx.setColor(this.getGraphId("aggregate"), this.color());
            }
            /****************************************/
            get mainExpression() {
                return this.getGraphId("aggregate");
            }
            /****************************************/
            createParameters(result) {
                result.push(WebApp.apply(new GeoPlot.ParameterViewModel({ value: this.time, name: $string("$(day)") }), p => {
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
                if (state.aggregationMode)
                    this.aggregationMode(state.aggregationMode);
                else
                    this.aggregationMode("none");
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
                if (this.aggregationMode() != "none")
                    this.updateAggregate();
            }
            /****************************************/
            getState() {
                const state = super.getState();
                state.time = this.time();
                state.children = this.children.select(a => a.getState()).toArray();
                state.aggregationMode = this.aggregationMode();
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
                this.aggregationMode.subscribe(a => this.updateAggregate());
            }
            /****************************************/
            addSerie(configOrSerie, updateGraph = true) {
                return this.addChildrenWork(configOrSerie instanceof GeoPlot.StudioSerie ? configOrSerie : new GeoPlot.StudioSerie(configOrSerie), updateGraph);
            }
        }
        GeoPlot.StudioProject = StudioProject;
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
        class StudioSerieRegression extends GeoPlot.BaseStudioItem {
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
            get mainExpression() {
                return this.getGraphId("main-func");
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
                result.push(WebApp.apply(new GeoPlot.ParameterViewModel({ value: this.endDay, name: $string("$(reg-days)") }), p => {
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
        GeoPlot.StudioSerieRegression = StudioSerieRegression;
    })(GeoPlot = WebApp.GeoPlot || (WebApp.GeoPlot = {}));
})(WebApp || (WebApp = {}));
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        /****************************************/
        class StudioSerie extends GeoPlot.BaseStudioItem {
            constructor(config) {
                super();
                /****************************************/
                this.color = ko.observable();
                this.offsetX = ko.observable(0);
                this.values = [];
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
                        this.values = WebApp.linq(points).select(a => ({
                            x: Math.round(WebApp.DateUtils.diff(a.x, startDate).totalDays),
                            xLabel: a.x,
                            y: a.y
                        })).toArray();
                    }
                    else if (isNaN(points[0].x)) {
                        this.values = WebApp.linq(points).select((a, i) => ({
                            x: i,
                            xLabel: a.x,
                            y: a.y
                        })).toArray();
                        return;
                    }
                    else
                        this.values = points;
                }
                else
                    this.values = [];
                this.onSerieChanged();
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
                result.push(WebApp.apply(new GeoPlot.ActionView(), action => {
                    action.text = $string("$(update)");
                    action.icon = "autorenew";
                    action.execute = () => this.updateSerie();
                }));
                result.push(WebApp.apply(new GeoPlot.ActionView(), action => {
                    action.text = $string("$(new-regression)");
                    action.icon = "add_box";
                    action.execute = () => {
                        const reg = this.addRegression(null, false);
                        reg.updateGraph();
                        this.node.isExpanded(true);
                        reg.node.isSelected(true);
                    };
                }));
                result.push(WebApp.apply(new GeoPlot.ActionView(), action => {
                    action.text = $string("$(zoom)");
                    action.icon = "zoom_in";
                    action.execute = () => this.zoom();
                }));
                result.push(WebApp.apply(new GeoPlot.ActionView(), action => {
                    action.text = $string("$(align-with-this)");
                    action.icon = "compare_arrows";
                    action.execute = () => {
                        let answer = prompt($string("$(tollerance)"), "10");
                        this.alignOthers(isNaN(answer) ? 10 : parseInt(answer));
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
            alignOthers(tollerance, ...series) {
                if (!series || series.length == 0)
                    series = this.parent.children.where(a => a != this).toArray();
                for (let serie of series)
                    serie.alignWith(this, tollerance);
            }
            /****************************************/
            alignWith(other, tollerance) {
                let minOfs = 0;
                let minValue = Number.NEGATIVE_INFINITY;
                for (let ofs = -this.values.length; ofs < this.values.length; ofs++) {
                    let value = 0;
                    for (let i = 0; i < this.values.length; i++) {
                        const ofsX = i - ofs;
                        if (ofsX < 0 || ofsX >= this.values.length)
                            continue;
                        if (i >= other.values.length)
                            continue;
                        if (Math.abs(this.values[ofsX].y - other.values[i].y) < tollerance)
                            value++;
                    }
                    if (value > minValue) {
                        minValue = value;
                        minOfs = ofs;
                    }
                }
                other.offsetX(0);
                this.offsetX(minOfs);
            }
            /****************************************/
            get mainExpression() {
                return this.getGraphId("offset-x-serie");
            }
            /****************************************/
            createParameters(result) {
                result.push(WebApp.apply(new GeoPlot.ParameterViewModel({ value: this.offsetX, name: $string("$(shift)") }), p => {
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
                super.onSelected();
                //this._graphCtx.expressionZoomFit(this.getGraphId("table"));
            }
            /****************************************/
            updateColor() {
                this._graphCtx.setColor(this.getGraphId("offset-x-serie"), this.color());
                this.children.foreach(a => a.onParentChanged());
            }
            /****************************************/
            attachGraph(ctx) {
                super.attachGraph(ctx);
                this.offsetX.subscribe(value => {
                    this._graphCtx.updateVariable(this.getGraphId("offset"), this._varsMap["ofs"], value);
                    this.onSerieChanged();
                });
            }
            /****************************************/
            onSerieChanged() {
                if (this._isUpdating == 0)
                    this.parent.updateAggregate();
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
                    this.source = this.upgradeSource(state.source);
                if (state.values != undefined)
                    this.importValues(state.values);
            }
            /****************************************/
            upgradeSource(source) {
                if (!source.type)
                    source.type = "geoplot";
                if (source.type == "geoplot") {
                    source.areaId = this.upgradeAreaId(source.areaId);
                    if (source.exeludedAreaIds)
                        for (let i = 0; i < source.exeludedAreaIds.length; i++)
                            source.exeludedAreaIds[i] = this.upgradeAreaId(source.exeludedAreaIds[i]);
                }
                return source;
            }
            /****************************************/
            upgradeAreaId(id) {
                if (id) {
                    if (id.startsWith("R") && id.length == 2)
                        return "R0" + id.substring(1);
                    if (id.startsWith("D") && id.length == 2)
                        return "D00" + id.substring(1);
                    if (id.startsWith("D") && id.length == 3)
                        return "D0" + id.substring(1);
                }
                return id;
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
                return this.addChildrenWork(configOrState instanceof GeoPlot.StudioSerieRegression ? configOrState : new GeoPlot.StudioSerieRegression(configOrState), updateGraph);
            }
            /****************************************/
            changeColor() {
                return __awaiter(this, void 0, void 0, function* () {
                    const color = yield GeoPlot.ColorPicker.instance.pick();
                    if (color)
                        this.color(color);
                });
            }
            /****************************************/
            updateSerie() {
                return __awaiter(this, void 0, void 0, function* () {
                    if (this.source.type == "geoplot" || !this.source.type) {
                        if (!this._graphCtx.serieCalculator) {
                            M.toast({ html: $string("$(msg-downloading-data)") });
                            const model = yield GeoPlot.Api.loadStudioData();
                            this._graphCtx.serieCalculator = new GeoPlot.IndicatorCalculator(model.data, GeoPlot.InfectionDataSet, model.geo);
                        }
                        this.importValues(this._graphCtx.serieCalculator.getSerie(this.source));
                        this._graphCtx.updateTable(this.getGraphId("table"), this.values);
                        this.children.foreach(a => a.onParentChanged());
                        this.onSerieChanged();
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
        GeoPlot.StudioSerie = StudioSerie;
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
/// <reference path="../indicators.ts" />
/// <reference path="../Framework/Graphics.ts" />
var WebApp;
(function (WebApp) {
    var GeoPlot;
    (function (GeoPlot) {
        /****************************************/
        GeoPlot.InfectionDataSet = {
            name: "COVID-19",
            empty: {
                currentPositive: undefined,
                historicDeaths: { "2015": undefined, "2016": undefined, "2017": undefined, "2018": undefined, "2019": undefined, "2020": undefined },
                toatlTests: undefined,
                totalDeath: undefined,
                totalHealed: undefined,
                totalHospedalized: undefined,
                totalPositive: undefined,
                totalSevere: undefined,
                totalCaseTested: undefined,
            },
            indicators: [
                {
                    id: "totalPositive",
                    name: $string("$(total-positive)"),
                    colorLight: "#f44336",
                    colorDark: "#b71c1c",
                    validFor: ["region", "country", "district"],
                    showInFavorites: true,
                    compute: new GeoPlot.SimpleIndicatorFunction(a => a.totalPositive)
                },
                {
                    id: "currentPositive",
                    name: $string("$(current-positive)"),
                    validFor: ["region", "country"],
                    colorLight: "#e91e63",
                    colorDark: "#880e4f",
                    showInFavorites: true,
                    compute: new GeoPlot.SimpleIndicatorFunction(a => a.currentPositive)
                },
                {
                    id: "totalDeath",
                    name: $string("$(death)"),
                    validFor: ["region", "country"],
                    colorLight: "#9c27b0",
                    colorDark: "#4a148c",
                    showInFavorites: true,
                    compute: new GeoPlot.SimpleIndicatorFunction(a => a.totalDeath)
                },
                {
                    id: "totalSevere",
                    name: $string("$(severe)"),
                    validFor: ["region", "country"],
                    colorLight: "#ff9800",
                    colorDark: "#e65100",
                    showInFavorites: true,
                    compute: new GeoPlot.SimpleIndicatorFunction(a => a.totalSevere)
                },
                {
                    id: "totalHospedalized",
                    name: $string("$(hospedalized)"),
                    validFor: ["region", "country"],
                    colorLight: "#fdd835",
                    colorDark: "#fbc02d",
                    showInFavorites: true,
                    compute: new GeoPlot.SimpleIndicatorFunction(a => a.totalHospedalized)
                },
                {
                    id: "totalHealed",
                    name: $string("$(healed)"),
                    validFor: ["region", "country"],
                    colorLight: "#4caf50",
                    colorDark: "#1b5e20",
                    showInFavorites: true,
                    compute: new GeoPlot.SimpleIndicatorFunction(a => a.totalHealed)
                },
                {
                    id: "toatlTests",
                    name: $string("$(tested)"),
                    validFor: ["region", "country"],
                    colorLight: "#03a9f4",
                    colorDark: "#01579b",
                    showInFavorites: true,
                    compute: new GeoPlot.SimpleIndicatorFunction(a => a.toatlTests)
                },
                {
                    id: "totalCaseTested",
                    name: $string("$(caseTested)"),
                    validFor: ["region", "country"],
                    colorLight: "#03a9f4",
                    colorDark: "#01579b",
                    showInFavorites: true,
                    compute: new GeoPlot.SimpleIndicatorFunction(a => a.totalCaseTested)
                },
                {
                    id: "surface",
                    name: $string("$(surface) ($(geo))"),
                    validFor: ["region", "district"],
                    colorLight: "#777",
                    colorDark: "#222",
                    showInFavorites: false,
                    compute: new GeoPlot.ConstIndicatorFunction((v, a) => WebApp.MathUtils.round(a.surface, 0))
                },
                {
                    id: "density",
                    name: $string("$(density) ($(geo))"),
                    validFor: ["region", "district"],
                    colorLight: "#777",
                    colorDark: "#222",
                    showInFavorites: false,
                    compute: new GeoPlot.ConstIndicatorFunction((v, a) => WebApp.MathUtils.round(a.demography.total / a.surface, 0))
                },
                {
                    id: "death2020",
                    name: $string("$(total-death) +60 (2020)*"),
                    validFor: ["details"],
                    colorLight: "#9c27b0",
                    colorDark: "#4a148c",
                    showInFavorites: true,
                    compute: new GeoPlot.SimpleIndicatorFunction(a => a.historicDeaths ? a.historicDeaths["2020"] : undefined)
                },
                {
                    id: "death2019",
                    name: $string("$(total-death) +60 (2019)"),
                    validFor: ["region", "district", "details"],
                    colorLight: "#9c27b0",
                    colorDark: "#4a148c",
                    showInFavorites: true,
                    compute: new GeoPlot.SimpleIndicatorFunction(a => a.historicDeaths ? a.historicDeaths["2019"] : undefined)
                },
                {
                    id: "death2018",
                    name: $string("$(total-death) +60 (2018)"),
                    validFor: ["region", "district", "details"],
                    colorLight: "#9c27b0",
                    colorDark: "#4a148c",
                    showInFavorites: false,
                    compute: new GeoPlot.SimpleIndicatorFunction(a => a.historicDeaths ? a.historicDeaths["2018"] : undefined)
                },
                {
                    id: "death2017",
                    name: $string("$(total-death) +60 (2017)"),
                    validFor: ["region", "district", "details"],
                    colorLight: "#9c27b0",
                    colorDark: "#4a148c",
                    showInFavorites: false,
                    compute: new GeoPlot.SimpleIndicatorFunction(a => a.historicDeaths ? a.historicDeaths["2017"] : undefined)
                },
                {
                    id: "death-diff-2020-2019",
                    name: $string("DIff. decessi 2020-19"),
                    validFor: ["details"],
                    colorLight: "#f44336",
                    colorDark: "#b71c1c",
                    gradient: new WebApp.LinearGradient("#00c853", "#bdbdbd", "#ff1744"),
                    canBeNegative: true,
                    compute: new GeoPlot.CombineIndicatorFunction({
                        death2019: new GeoPlot.SimpleIndicatorFunction(a => a.historicDeaths[2019]),
                        death2020: new GeoPlot.SimpleIndicatorFunction(a => a.historicDeaths[2020]),
                    }, values => WebApp.MathUtils.isNaNOrNull(values.death2020) || WebApp.MathUtils.isNaNOrNull(values.death2019) ? undefined : (values.death2020 - values.death2019))
                },
                {
                    id: "population",
                    name: $string("$(population) ($(geo))"),
                    validFor: ["region", "district", "details", "country"],
                    colorLight: "#777",
                    colorDark: "#222",
                    showInFavorites: false,
                    compute: new GeoPlot.ConstIndicatorFunction((v, a) => a.demography.total)
                },
                {
                    id: "populationOld",
                    name: $string("$(population) +65 ($(geo))"),
                    validFor: ["region", "district", "country"],
                    colorLight: "#777",
                    colorDark: "#222",
                    showInFavorites: false,
                    compute: new GeoPlot.ConstIndicatorFunction((v, a) => a.demography.over65)
                },
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
                    validFor: ["region", "country", "details", "district"],
                    name: $string("$(population)"),
                    compute: new GeoPlot.SimpleFactorFunction((i, v, a) => WebApp.MathUtils.divideNull(i, a.demography.total) * 100000),
                    format: a => formatNumber(a),
                    reference: (v, a) => formatNumber(a.demography.total),
                    description: $string("[indicator] $(every-100k)")
                },
                {
                    id: "populationOld",
                    validFor: ["region", "country", "district"],
                    name: $string("$(population) +65"),
                    compute: new GeoPlot.SimpleFactorFunction((i, v, a) => WebApp.MathUtils.divideNull(i, a.demography.over65) * 100000),
                    format: a => formatNumber(WebApp.MathUtils.round(a, 1)),
                    reference: (v, a) => formatNumber(a.demography.over65),
                    description: $string("[indicator] $(every-100k) +65")
                },
                {
                    id: "density",
                    name: $string("$(density)"),
                    validFor: ["region", "country", "district"],
                    compute: new GeoPlot.SimpleFactorFunction((i, v, a) => WebApp.MathUtils.divideNull(i, WebApp.MathUtils.divideNull(a.demography.total, a.surface)) * 100000),
                    format: a => formatNumber(WebApp.MathUtils.round(a, 1)),
                    reference: (v, a) => formatNumber(WebApp.MathUtils.round(a.demography.total / a.surface, 1)),
                    description: $string("[indicator] $(over-density)")
                },
                {
                    id: "totalPositive",
                    name: $string("$(total-positive)"),
                    validFor: ["region", "country"],
                    compute: new GeoPlot.DoubleFactorFunction((i, f) => WebApp.MathUtils.isNaNOrNull(i) ? undefined : (i / f) * 100, new GeoPlot.SimpleIndicatorFunction(v => v.totalPositive)),
                    format: a => WebApp.MathUtils.round(a, 1) + "%",
                    reference: (v, a) => formatNumber(v.totalPositive),
                    description: $string("% [indicator] $(over-total-positive)")
                },
                {
                    id: "severe",
                    name: $string("$(severe)"),
                    validFor: ["region", "country"],
                    compute: new GeoPlot.DoubleFactorFunction((i, f) => WebApp.MathUtils.isNaNOrNull(i) ? undefined : (i / f) * 100, new GeoPlot.SimpleIndicatorFunction(v => v.totalSevere)),
                    format: a => WebApp.MathUtils.round(a, 1) + "%",
                    reference: (v, a) => formatNumber(v.totalSevere),
                    description: $string("% [indicator] $(over-severe)")
                },
                {
                    id: "test",
                    name: $string("$(tested)"),
                    validFor: ["region", "country"],
                    compute: new GeoPlot.DoubleFactorFunction((i, f) => WebApp.MathUtils.isNaNOrNull(i) ? undefined : (i / f) * 100, new GeoPlot.SimpleIndicatorFunction(v => v.toatlTests)),
                    format: a => WebApp.MathUtils.round(a, 1) + "%",
                    reference: (v, a) => formatNumber(v.toatlTests),
                    description: $string("% [indicator] $(over-tested)")
                },
                {
                    id: "caseTested",
                    name: $string("$(caseTested)"),
                    validFor: ["region", "country"],
                    compute: new GeoPlot.DoubleFactorFunction((i, f) => WebApp.MathUtils.isNaNOrNull(i) ? undefined : (i / f) * 100, new GeoPlot.SimpleIndicatorFunction(v => v.totalCaseTested)),
                    format: a => WebApp.MathUtils.round(a, 1) + "%",
                    reference: (v, a) => formatNumber(v.totalCaseTested),
                    description: $string("% [indicator] $(over-case-tested)")
                },
                {
                    id: "death2019Perc",
                    name: $string("$(total-death) +60 (2019)"),
                    validFor: ["details"],
                    compute: new GeoPlot.DoubleFactorFunction((i, f) => WebApp.MathUtils.isNaNOrNull(i) ? undefined : (i / f) * 100, new GeoPlot.SimpleIndicatorFunction(v => v.historicDeaths[2019])),
                    format: a => WebApp.MathUtils.isNaNOrNull(a) ? "N/A" : (a > 0 ? "+" : "") + WebApp.MathUtils.round(a, 1) + "%",
                    reference: (v, a) => formatNumber(v.historicDeaths[2019]),
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
            },
            'details': {
                label: {
                    singular: $string("$(area-details)"),
                    plural: $string("$(area-details)")
                },
                mapGroup: "group_municipality",
                tab: "detailsTab",
                areaType: GeoPlot.GeoAreaType.Municipality,
                validateId: (id) => id[0].toLowerCase() == 'm'
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
                if (row.trim().length == 0)
                    continue;
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
                if (WebApp.TypeCheck.isString(progress))
                    progress = { message: progress };
                if (this.current)
                    this.current.progress = progress;
            }
            /****************************************/
            begin(configOrMessge) {
                var _a;
                if (WebApp.TypeCheck.isString(configOrMessge))
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
                            this.selectedArea = this._calculator.geo.areas["r10"];
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
                            this._execludedArea.set("R8", this._calculator.geo.areas["r8"]);
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
                this.detailsLoading = new WebApp.Signal(true);
                this.detailsArea = ko.observable();
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
                this._mainData = model.data;
                this._mainGeo = model.geo;
                this._debugMode = model.debugMode;
                this._calculator = new GeoPlot.IndicatorCalculator(this._mainData, this._dataSet, this._mainGeo);
                this.totalDays(this._calculator.data.days.length - 1);
                this.dayNumber.subscribe(value => {
                    if (value != this._calculator.data.days.length - 1)
                        this.tipManager.markAction("dayChanged");
                    this.updateDayData();
                    this._specialDates.current.date = new Date(this._calculator.data.days[value].date);
                    this.updateChart();
                });
                this._mapSvg = document.getElementsByTagName("svg").item(0);
                this._mapSvg.addEventListener("click", e => this.onMapClick(e, false));
                this._mapSvg.addEventListener("dblclick", e => this.onMapClick(e, true));
                this.days = [];
                for (var i = 0; i < this._calculator.data.days.length; i++)
                    this.days.push({ number: i, value: new Date(this._calculator.data.days[i].date), text: WebApp.DateUtils.format(this._calculator.data.days[i].date, $string("$(date-format-short)")) });
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
                this.detailsArea.subscribe(value => {
                    this.updateDetailsArea();
                });
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
                return (!state.day || state.day == this._calculator.data.days.length - 1) &&
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
                    (!state.excludedArea) &&
                    (!state.detailsArea);
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
                this.dayNumber(state.day != undefined ? state.day : this._calculator.data.days.length - 1);
                if (state.excludedArea) {
                    this._execludedArea.clear();
                    for (let areaId of state.excludedArea)
                        this._execludedArea.set(areaId, this._calculator.geo.areas[areaId.toLowerCase()]);
                }
                if (state.indicator)
                    this.selectedIndicator(WebApp.linq(this._dataSet.indicators).first(a => a.id == state.indicator));
                if (state.factor)
                    this.selectedFactor(WebApp.linq(this._dataSet.factors).first(a => a.id == state.factor));
                if (state.area)
                    this.selectedArea = this._calculator.geo.areas[state.area.toLowerCase()];
                if (state.detailsArea)
                    this.detailsArea(this._calculator.geo.areas[state.detailsArea]);
            }
            /****************************************/
            saveStata() {
                return {
                    view: this.viewMode() == "region" ? undefined : this.viewMode(),
                    indicator: this.selectedIndicator() ? this.selectedIndicator().id : undefined,
                    factor: this.selectedFactor() ? this.selectedFactor().id : undefined,
                    dayDelta: this.isDayDelta() ? true : undefined,
                    maxFactor: this.autoMaxFactor() ? undefined : this.maxFactor(),
                    day: this.dayNumber() == this._calculator.data.days.length - 1 ? undefined : this.dayNumber(),
                    area: this.selectedArea ? this.selectedArea.id : undefined,
                    groupSize: this.groupSize() == 1 ? undefined : this.groupSize(),
                    startDay: this.startDay() == 0 ? undefined : this.startDay(),
                    logScale: this.isLogScale() ? true : undefined,
                    excludedArea: this._execludedArea.size > 0 ? WebApp.linq(this._execludedArea.keys()).toArray() : undefined,
                    showEnvData: this.isShowEnvData() ? true : undefined,
                    detailsArea: this.detailsArea() ? this.detailsArea().id : undefined,
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
                    for (let i = 0; i < data.length; i++) {
                        if (i > 0)
                            text += "\n";
                        text += WebApp.DateUtils.format(data[i].x, $string("$(date-format)")) + "\t" + i + "\t" + WebApp.MathUtils.round(data[i].y, 1);
                    }
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
                if (this.dayNumber() == this._calculator.data.days.length - 1)
                    this.dayNumber(0);
                this.isPlaying(true);
                this.nextFrame();
            }
            /****************************************/
            pause() {
                this.isPlaying(false);
            }
            /****************************************/
            setViewMode(mode, fromModel = false) {
                if (fromModel) {
                    const areaTabs = M.Tabs.getInstance(document.getElementById("areaTabs"));
                    areaTabs.select(GeoPlot.ViewModes[mode].tab);
                }
                if (mode == "details") {
                    if (this._detailsGeo && this._detailsData) {
                        this._calculator.geo = this._detailsGeo;
                        this._calculator.data = this._detailsData;
                        this.totalDays(this._calculator.data.days.length - 1);
                    }
                }
                else {
                    this._calculator.geo = this._mainGeo;
                    this._calculator.data = this._mainData;
                }
                this.totalDays(this._calculator.data.days.length - 1);
                if (mode != "region")
                    this.tipManager.markAction("viewChanged", mode);
                this.viewMode(mode);
                const districtGroup = document.getElementById("group_district");
                if (mode == "district" || mode == "details")
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
                    this.selectedArea = this._calculator.geo.areas["it"];
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
            onMapClick(e, isDouble) {
                const item = e.target;
                const areaId = item.parentElement.id;
                const area = this._calculator.geo.areas[areaId.toLowerCase()];
                if (!area)
                    return;
                if (!isDouble) {
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
                        //if (item.parentElement.classList.contains(this.viewMode()))
                        this.selectedArea = area;
                    }
                    this.tipManager.markAction("areaSelected", area.name);
                }
                else {
                    if (this.viewMode() == "region" || this.viewMode() == "district")
                        this.detailsArea(area);
                }
            }
            nextFrame() {
                if (!this.isPlaying())
                    return;
                if (this.dayNumber() >= this._calculator.data.days.length - 1)
                    this.pause();
                else
                    this.dayNumber(parseInt(this.dayNumber().toString()) + 1);
                setTimeout(() => this.nextFrame(), 200);
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
                        if (indicator.showInFavorites === false)
                            continue;
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
                let count = 0;
                let list = [];
                for (let i = 0; i < this._calculator.data.days.length; i++) {
                    const day = this._calculator.data.days[i];
                    for (let areaId in day.values) {
                        if (!curView.validateId(areaId))
                            continue;
                        const factor = Math.abs(this.getFactorValue(i, areaId));
                        if (!WebApp.MathUtils.isNaNOrNull(factor) && factor != Number.POSITIVE_INFINITY && factor > result)
                            result = factor;
                        if (factor != 0)
                            list.push(factor);
                    }
                }
                /*
                list = linq(list).orderBy(a => a).toArray();
                var index = Math.floor(list.length / 2);
                result = list[index];*/
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
                /*
                if (!day || !day.values[id]) {
                    M.toast({
                        html: $string("$(msg-no-data)")});
                    return;
                }*/
                value.data(this._calculator.getDataAtDay(dayNumber, id));
                value.indicator(this.getIndicatorValue(dayNumber, id, this.selectedIndicator().id));
                value.factor(this.getFactorValue(dayNumber, area));
                value.reference(this.selectedFactor().reference(value.data(), area));
            }
            /****************************************/
            updateDetailsArea() {
                return __awaiter(this, void 0, void 0, function* () {
                    const detailsEl = document.querySelector(".details-map");
                    if (!this.detailsArea()) {
                        this.setViewMode("region");
                        detailsEl.innerHTML = "";
                    }
                    else {
                        yield this.detailsLoading.waitFor();
                        this.detailsLoading.reset();
                        try {
                            this.setViewMode("details", true);
                            yield WebApp.PromiseUtils.delay(0);
                            detailsEl.innerHTML = "<span class = 'loading'><i class ='material-icons'>loop</i></span>";
                            document.getSelection().empty();
                            const mainData = JSON.parse(yield (yield fetch(WebApp.app.baseUrl + "AreaData/" + this.detailsArea().id)).text());
                            const mapData = yield (yield fetch(WebApp.app.baseUrl + "AreaMap/" + this.detailsArea().id)).text();
                            detailsEl.innerHTML = mapData;
                            var svgMap = document.querySelector(".details-map svg");
                            svgMap.addEventListener("click", e => this.onMapClick(e, false));
                            svgMap.querySelector("#group_municipality").classList.add("active");
                            this._detailsData = mainData.data;
                            this._detailsGeo = mainData.geo;
                            this.setViewMode("details", true);
                        }
                        finally {
                            this.detailsLoading.set();
                        }
                    }
                });
            }
            /****************************************/
            updateTopAreas() {
                this._daysData = [];
                for (let i = 0; i < this._calculator.data.days.length; i++) {
                    const day = this._calculator.data.days[i];
                    const item = {};
                    const isInArea = GeoPlot.ViewModes[this.viewMode()].validateId;
                    item.topAreas = WebApp.linq(day.values).select(a => ({
                        factor: this.getFactorValue(i, a.key),
                        value: a
                    })).where(a => !WebApp.MathUtils.isNaNOrNull(a.factor))
                        .orderByDesc(a => a.factor).where(a => isInArea(a.value.key)).select(a => {
                        const area = new AreaViewModel();
                        area.value = this._calculator.geo.areas[a.value.key.toLowerCase()];
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
                const day = this._calculator.data.days[this.dayNumber()];
                if (!day) {
                    console.warn("No day data: " + this.dayNumber());
                    return;
                }
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
                const day = this._calculator.data.days[this.dayNumber()];
                if (!day || !day.values) {
                    console.warn("No day data: " + this.dayNumber());
                    return;
                }
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
                    const day = this._calculator.data.days[this.dayNumber()];
                    var indicator = this.selectedIndicator();
                    const gradient = indicator.gradient ? indicator.gradient : new WebApp.LinearGradient("#fff", indicator.colorDark);
                    for (const key in day.values) {
                        const element = document.getElementById(key.toUpperCase());
                        if (element) {
                            const area = this._calculator.geo.areas[key];
                            if (area.type != GeoPlot.ViewModes[this.viewMode()].areaType)
                                continue;
                            let factor = this.getFactorValue(this.dayNumber(), area);
                            if (factor == Number.POSITIVE_INFINITY)
                                factor = NaN;
                            if (indicator.canBeNegative)
                                factor = 0.5 + (factor / (this.maxFactor() * 2));
                            else
                                factor = factor / this.maxFactor();
                            factor = Math.min(1, Math.max(0, factor));
                            if (WebApp.MathUtils.isNaNOrNull(factor)) {
                                if (element.classList.contains("valid"))
                                    element.classList.remove("valid");
                                element.style.removeProperty("fill");
                            }
                            else {
                                if (!element.classList.contains("valid"))
                                    element.classList.add("valid");
                                let value;
                                if (!indicator.canBeNegative)
                                    value = WebApp.MathUtils.discretize(WebApp.MathUtils.exponential(factor), 20);
                                else
                                    value = WebApp.MathUtils.discretize(factor, 20);
                                element.style.fill = gradient.valueAt(value).toString();
                            }
                        }
                    }
                }
                else if (this.viewMode() != "details") {
                    WebApp.linq(document.querySelectorAll(".main-map g.region")).foreach((element) => {
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
        GeoPlot.ParameterViewModel = ParameterViewModel;
        /****************************************/
        class StudioPage {
            constructor(projectId) {
                /****************************************/
                this.items = new GeoPlot.TreeView();
                this.maxX = ko.observable();
                this.maxY = ko.observable();
                this.dataImport = new GeoPlot.DataImportControl();
                this._projectId = projectId;
                this._graphCtx = new GeoPlot.GraphContext();
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
                this._graphCtx.calculator.controller.listModel.onSelectionChanged = item => this.onGraphSelectionChanged(item);
                const actions = [];
                actions.push(WebApp.apply(new GeoPlot.ActionView(), action => {
                    action.text = $string("$(new-project)"),
                        action.icon = "create_new_folder";
                    action.execute = () => this.newProject();
                }));
                actions.push(WebApp.apply(new GeoPlot.ActionView(), action => {
                    action.text = $string("$(save)"),
                        action.icon = "save";
                    action.execute = () => this.saveState();
                }));
                actions.push(WebApp.apply(new GeoPlot.ActionView(), action => {
                    action.text = $string("$(import)"),
                        action.icon = "import_export";
                    action.execute = () => this.import();
                }));
                actions.push(WebApp.apply(new GeoPlot.ActionView(), action => {
                    action.text = $string("$(share) Studio"),
                        action.icon = "share";
                    action.execute = () => this.share();
                }));
                actions.push(WebApp.apply(new GeoPlot.ActionView(), action => {
                    action.text = $string("$(options)"),
                        action.icon = "settings";
                    action.execute = () => this.showOptions();
                }));
                const root = new GeoPlot.TreeNode();
                root.actions(actions);
                this.items.setRoot(root);
                document.body.addEventListener("paste", (ev) => __awaiter(this, void 0, void 0, function* () {
                    if (ev.target.tagName == "INPUT")
                        return;
                    if (yield this.onPaste(ev.clipboardData))
                        ev.preventDefault();
                }));
                M.Modal.init(document.getElementById("options"), {
                    onCloseEnd: () => this.updateOptions()
                });
                setTimeout(() => this.init());
            }
            /****************************************/
            onGraphSelectionChanged(item) {
                if (!item || !item.folderId)
                    return;
                const folderGuid = item.folderId.split("/")[0];
                const treeItem = this._graphCtx.treeItems[folderGuid];
                if (!treeItem)
                    return;
                treeItem.node.select(true);
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
                const project = new GeoPlot.StudioProject(config);
                const node = new GeoPlot.TreeNode(project);
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
                    //var text = await (await fetch("https://raw.githubusercontent.com/datasets/covid-19/master/data/countries-aggregated.csv")).text();
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
                    const serie = GeoPlot.StudioSerie.fromText(text);
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
                    if (this.items.selectedNode() && this.items.selectedNode().value() instanceof GeoPlot.StudioSerie) {
                        if (confirm($string("$(msg-replace-serie)"))) {
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
                    const serie = new GeoPlot.StudioSerie({
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