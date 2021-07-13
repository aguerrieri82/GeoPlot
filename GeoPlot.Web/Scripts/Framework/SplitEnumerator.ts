import { IEnumerator } from "../WebApp";

export class SplitEnumerator implements IEnumerator<string> {
    protected _separator: string;
    protected _value: string;
    protected _startIndex: number;
    protected _curIndex: number;
    protected _currentStartIndex: number;
    protected _current: string;

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

export class CsvSplitEnumerator implements IEnumerator<string> {
    protected _state = 0;
    protected _wordLength = 0;
    protected _wordStartIndex: number;
    protected _separator: string;
    protected _value: string;
    protected _startIndex: number;
    protected _curIndex: number;
    protected _current: string;
    protected _hasEscape: boolean;

    /****************************************/

    constructor(value: string, separator: string, startIndex = 0) {
        this._value = value;
        this._separator = separator;
        this._startIndex = startIndex;
    }

    /****************************************/

    get current(): string {
        if (!this._current) {
            this._current = this._value.substr(this._wordStartIndex, this._wordLength);
            if (this._hasEscape)
                this._current = this._current.replace("\"\"", "\"");
        }
        return this._current;
    }

    /****************************************/

    moveNext(): boolean {

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
                        this._state = 1
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

    reset(): void {
        this._hasEscape = false;
        this._curIndex = this._startIndex;
        this._wordStartIndex = this._curIndex;
        this._wordLength = 0;
        this._current = null;
        this._state = 0;
    }
}