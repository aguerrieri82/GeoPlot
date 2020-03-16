namespace GeoPlot {

    interface IEnumerator<T> {

        current: T;

        moveNext(): boolean;

        reset(): void;

        toArray?(): T[];

        count?(): number;

        first?(): T;

        last?(): T;
    }

    /****************************************/

    interface IGroupItem<TKey, TValue> {
        key: TKey;
        values: Linq<TValue>;
    }

    /****************************************/

    interface ICollection<T> {

        length: number;

        item(index: number): T;
    }

    /****************************************/

    interface IEnumerable<T> {

        getEnumerator(): IEnumerator<T>;
    }


    /****************************************/

    class EmptyEnumerator<T> implements IEnumerator<T> {

        get current(): T {
            return undefined;
        }

        /****************************************/

        moveNext(): boolean {
            return false;
        }

        /****************************************/

        reset(): void {
        }

        /****************************************/

        count(): number {
            return 0;
        }
    } 

    /****************************************/

    class DistinctEnumerator<TSrc, TDest> implements IEnumerator<TDest>{ 

        private _selector: (item: TSrc) => TDest;
        private _source: IEnumerator<TSrc>;
        private _foundItems: TDest[];
        private _current: TDest;

        /****************************************/

        constructor(source: IEnumerator<TSrc>, selector?: (item: TSrc) => TDest) {

            this._selector = selector;
            this._source = source;

            if (!this._selector)
                this._selector = a => <any>a;

            this.reset();
        }

        /****************************************/

        get current(): TDest {
            return this._current;
        }

        /****************************************/

        moveNext(): boolean {
            while (this._source.moveNext()) {
                var item = this._selector(this._source.current);
                if (this._foundItems.indexOf(item) == -1) {
                    this._foundItems.push(item);
                    this._current = item;
                    return true;
                }
            }
            return false;
        }

        /****************************************/

        reset(): void {
            this._source.reset();
            this._foundItems = [];
            this._current = undefined;
        }
    }

    /****************************************/

    class DictionaryEnumerator<T> implements IEnumerator<IKeyValue<T>> {

        private _curIndex: number;
        private _keyList: string[];
        private _value: IDictionary<T>;

        /****************************************/

        constructor(value: IDictionary<T>) {
            this._keyList = Object.getOwnPropertyNames(value);
            this._value = value;
            this.reset();
        }

        /****************************************/

        get current(): IKeyValue<T> {
            return {
                key: this._keyList[this._curIndex],
                value: this._value[this._keyList[this._curIndex]]
            };
        }

        /****************************************/

        moveNext(): boolean {
            this._curIndex++;
            return this._curIndex < this._keyList.length;
        }

        /****************************************/

        reset(): void {
            this._curIndex = -1;
        }

        /****************************************/

        first(): IKeyValue<T> {
            return {
                key: this._keyList[0],
                value: this._value[this._keyList[0]]
            };
        }

        /****************************************/

        last(): IKeyValue<T> {
            return {
                key: this._keyList[this._keyList.length - 1],
                value: this._value[this._keyList[this._keyList.length - 1]]
            };
        }

        /****************************************/

        count(): number {
            return this._keyList.length;
        }

    }

    /****************************************/

    class ArrayEnumerator<T> implements IEnumerator<T> {

        private _curIndex: number;
        private _value: T[];

        /****************************************/

        constructor(value: T[]) {
            this._value = value;
            this.reset();
        }

        /****************************************/

        get current(): T {
            return this._value[this._curIndex];
        }

        /****************************************/

        toArray() {
            return this._value;
        }

        /****************************************/

        moveNext(): boolean {
            this._curIndex++;
            return this._curIndex < this._value.length;
        }

        /****************************************/

        reset(): void {
            this._curIndex = -1;
        }

        /****************************************/

        first(): T {
            return this._value[0];
        }

        /****************************************/

        last(): T {
            return this._value[this._value.length - 1];
        }

        /****************************************/

        count(): number {
            return this._value.length;
        }

    }

    /****************************************/

    class CollectionEnumerator<T> implements IEnumerator<T> {

        private _curIndex: number;
        private _value: ICollection<T>;

        /****************************************/

        constructor(value: ICollection<T>) {
            this._value = value;
            this.reset();
        }

        /****************************************/

        get current(): T {
            return this._value.item(this._curIndex);
        }

        /****************************************/

        moveNext(): boolean {
            this._curIndex++;
            return this._curIndex < this._value.length;
        }

        /****************************************/

        reset(): void {
            this._curIndex = -1;
        }

        /****************************************/

        first(): T {
            return this._value.item(0);
        }

        /****************************************/

        last(): T {
            return this._value.item(this._value.length - 1);
        }

        /****************************************/

        count(): number {
            return this._value.length;
        }
    }

    /****************************************/

    class SelectEnumerator<TSrc, TDest> implements IEnumerator<TDest> {

        private _selector: (item: TSrc) => TDest;
        private _source: IEnumerator<TSrc>;

        /****************************************/

        constructor(source: IEnumerator<TSrc>, selector: (item: TSrc) => TDest) {

            this._selector = selector;
            this._source = source;

            this.reset();
        }

        /****************************************/

        get current(): TDest {
            return this._selector(this._source.current);
        }

        /****************************************/

        moveNext(): boolean {
            return this._source.moveNext();
        }

        /****************************************/

        reset(): void {
            this._source.reset();
        }
    }

    /****************************************/

    class WhereEnumerator<T> implements IEnumerator<T> {

        private _condition: (item: T) => boolean;
        private _source: IEnumerator<T>;

        /****************************************/

        constructor(source: IEnumerator<T>, condition: (item: T) => boolean) {

            this._condition = condition;
            this._source = source;

            this.reset();
        }

        /****************************************/

        get current(): T {
            return this._source.current;
        }

        /****************************************/

        moveNext(): boolean {

            while (this._source.moveNext()) {
                if (this._condition(this._source.current))
                    return true;
            }
            return false;
        }

        /****************************************/

        reset(): void {
            this._source.reset();
        }
    }
    
    /****************************************/

    class SkipEnumerator<T> implements IEnumerator<T> {

        private _source: IEnumerator<T>;
        private _count: number;
        private _skipped: boolean;

        /****************************************/

        constructor(source: IEnumerator<T>, count: number) {

            this._count = count;
            this._source = source;

            this.reset();
        }

        /****************************************/

        get current(): T {
            return this._source.current;
        }

        /****************************************/

        moveNext(): boolean {

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

        /****************************************/

        reset(): void {
            this._source.reset();
            this._skipped = false;
        }
    }


    /****************************************/

    class TakeEnumerator<T> implements IEnumerator<T> {

        private _source: IEnumerator<T>;
        private _count: number;
        private _taken: number;

        /****************************************/

        constructor(source: IEnumerator<T>, count: number) {
            
            this._count = count;
            this._source = source;

            this.reset();
        }

        /****************************************/

        get current(): T {
            return this._source.current;
        }

        /****************************************/

        moveNext(): boolean {

            if (this._taken >= this._count)
                return false;

            if (!this._source.moveNext())
                return false;

            this._taken++;

            return true;
        }

        /****************************************/

        reset(): void {
            this._source.reset();
            this._taken = 0;
        }
    }


    /****************************************/

    class IteratorEnumerator<T> implements IEnumerator<T> {

        private _source: Iterator<T>;
        private _current: T;

        /****************************************/

        constructor(source: Iterator<T>) {
            this._source = source;
        }

        /****************************************/

        get current(): T {
            return this._current;
        }

        /****************************************/

        moveNext(): boolean {

            let result = this._source.next();
            if (result.done)
                return false;
            this._current = result.value;

            return true;
        }

        /****************************************/

        reset(): void {
        }
    }

    /****************************************/

    export class Linq<T> implements IEnumerable<T> {

        private _enumerator: IEnumerator<T>;

        /****************************************/

        constructor(value: IEnumerator<T>) {

            this._enumerator = value;
        }

        /****************************************/

        select<TResult>(selector: (item: T) => TResult): Linq<TResult> {

            return linq(new SelectEnumerator(this._enumerator, selector));
        }

        /****************************************/

        where(condition: (item: T) => boolean): Linq<T> {

            return linq(new WhereEnumerator(this._enumerator, condition));
        }

        /****************************************/

        first(condition?: (item: T) => boolean): T {

            if (condition)
                return this.where(condition).first();

            if (this._enumerator.first)
                return this._enumerator.first();

            this._enumerator.reset();
            if (this._enumerator.moveNext())
                return this._enumerator.current;
        }

        /****************************************/

        last(): T {

            if (this._enumerator.last)
                return this._enumerator.last();

            this._enumerator.reset();

            let lastItem: T;

            while (this._enumerator.moveNext())
                lastItem = this._enumerator.current;

            return lastItem;
        }

        /****************************************/

        sum(selector?: (item: T) => number): number {

            if (selector)
                return this.select(selector).sum();

            let result = 0;

            this.foreach(a => {
                result += parseFloat(<any>a);
            });

            return result;
        }

        /****************************************/

        max(selector?: (item: T) => number): number {

            if (selector)
                return this.select(selector).max();
            let result = Number.NEGATIVE_INFINITY;
            this.foreach(a => {
                let number = parseFloat(<any>a);
                if (number > result)
                    result = number; 
            });
            return result;
        }

        /****************************************/

        avg(selector?: (item: T) => number): number {

            if (selector)
                return this.select(selector).avg();

            let result = 0;
            let count = 0;

            this.foreach(a => {
                result += parseFloat(<any>a);
                count++;
            });

            if (count)
                return result / count;
            return NaN;
        }

        /****************************************/

        count(condition?: (item: T) => boolean): number {

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

        /****************************************/

        concat(separator: string, selector?: (item: T) => any): string {

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

        /****************************************/

        orderBy(selector: (item: T) => any): Linq<T> {

            var result = this.toArray();
            result.sort((a, b) => {
                var itemA = selector(a);
                var itemB = selector(b);
                return itemA - itemB;
            });
            return linq(result);
        }

        /****************************************/

        orderByDesc(selector: (item: T) => any): Linq<T> {

            var result = this.toArray();
            result.sort((a, b) => {
                var itemA = selector(a);
                var itemB = selector(b);
                return itemB - itemA;
            });
            return linq(result);
        }

        /****************************************/

        distinct<TDest>(selector?: (item: T) => TDest): Linq<TDest> {

            return linq(new DistinctEnumerator<T, TDest>(this._enumerator, selector));
        }

        /****************************************/

        groupBy<TKey>(key: (item: T) => TKey): Linq<IGroupItem<TKey, T>>;

        groupBy<TKey extends IDictionary<(item: T) => any>>(key: (item: T) => TKey): Linq<IGroupItem<TKey, T>>;

        groupBy<TKey>(key: any): Linq<IGroupItem<TKey, T>> {

            let keys = {};
            let result: Array<IGroupItem<TKey, T>> = [];

            if (typeof key == "function") {

                var keySelector = <(item: T) => TKey>key;

                this.foreach(item => {
                    var itemKey = keySelector(item);
                    var groupItem = linq(result).first(a => a.key == itemKey);
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

        /****************************************/

        indexOf(condition: (item: T) => boolean): number {

            let index = 0;

            this._enumerator.reset();
            while (this._enumerator.moveNext())
            {
                if (condition(this._enumerator.current))
                    return index;
                index++;
            }
        }

        /****************************************/

        foreach(action: (item: T) => void): void {

            this._enumerator.reset();

            while (this._enumerator.moveNext())
                action(this._enumerator.current);
        }

        /****************************************/

        any(condition?: (item: T) => boolean): boolean {

            if (!condition)
                return this._enumerator.moveNext();

            return this.where(condition).any();
        }

        /****************************************/

        contains(item: T, comparer?: (a: T, b: T) => boolean) {

            if (!comparer)
                comparer = (a, b) => a == b;

            this._enumerator.reset();

            while (this._enumerator.moveNext())
                if (comparer(this._enumerator.current, item))
                    return true;

            return false;
        }

        /****************************************/

        all(condition: (item: T) => boolean): boolean {

            return !this.where(a => !condition(a)).any();
        }

        /****************************************/

        take(count: number): Linq<T> {
            return linq(new TakeEnumerator(this._enumerator, count));
        }

        /****************************************/

        skip(count: number): Linq<T> {
            return linq(new SkipEnumerator(this._enumerator, count));
        }

        /****************************************/

        replace(condition: (item: T) => boolean, newItem: T) {
            if (!(this._enumerator instanceof ArrayEnumerator))
                throw "Invalid enumerator, expected array";
            let items = this._enumerator.toArray();
            for (let i = 0; i < items.length; i++) {
                if (condition[items[i]])
                    items[i] == newItem;
            }
        }

        /****************************************/

        toArray(): T[] {

            if (this._enumerator.toArray)
                return this._enumerator.toArray();

            let result: T[] = [];
            this.foreach(a => result.push(a));
            return result;
        }

        /****************************************/

        getEnumerator(): IEnumerator<T> {

            return this._enumerator;
        }
    }

    /****************************************/

    export function linq<T>(enumerator: IEnumerator<T>): Linq<T>;
    export function linq<T>(enumerable: IEnumerable<T>): Linq<T>;
    export function linq<T>(array: T[]): Linq<T>;
    export function linq<T>(list: ICollection<T>): Linq<T>;
    export function linq<T>(iterator: Iterator<T>): Linq<T>;
    export function linq<T>(dictionary: IDictionary<T>): Linq<IKeyValue<T>>;

    export function linq<T>(value: any): Linq<any> {

        let enumerator: IEnumerator<any>;

        if (!value)
            enumerator = new EmptyEnumerator<T>();
        else if (Array.isArray(value))
            enumerator = new ArrayEnumerator<T>(value);
        else if ("getEnumerator" in value)
            enumerator = (<IEnumerable<T>>value).getEnumerator();
        else if ("item" in value)
            enumerator = new CollectionEnumerator<T>(value);
        else if ("next" in value && typeof (value["next"]) == "function")
            enumerator = new IteratorEnumerator(value);
        else if ("current" in value && "reset" in value && "moveNext" in value )
            enumerator = value;
        else
            return new Linq(new DictionaryEnumerator<T>(value));

        return new Linq(enumerator);
    }
}