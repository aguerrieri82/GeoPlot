import { MATERIAL_COLORS } from "../Types";

interface IColorViewModel {
    select(): void;
    value: string;
}

/****************************************/

export class ColorPicker {

    private _onSelected: (color: string) => void;
    private _element: HTMLElement;
    private _mouseDown: (ev: MouseEvent) => void;

    /****************************************/

    constructor() {
        for (var color in MATERIAL_COLORS)
            this.addColor(MATERIAL_COLORS[color][600]);
        this._mouseDown = ev => this.onMouseDown(ev);
    }

    /****************************************/

    attachNode(element: HTMLElement) {
        this._element = element;
        document.body.appendChild(this._element);
    }

    /****************************************/

    async pick(): Promise<string> {
        await this.open();
        return new Promise(res => this._onSelected = res);
    }

    /****************************************/

    addColor(color: string) {
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

    async open() {

        if (this.isOpened())
            return;

        this.isOpened(true);

        if (window.event) {
            const mouseEvent = <MouseEvent>window.event;
            const coords = { x: mouseEvent.pageX, y: mouseEvent.pageY };
            //await PromiseUtils.delay(0);
            this._element.style.left = coords.x + "px";
            this._element.style.top = (coords.y - this._element.clientHeight) + "px";
        }
        document.body.addEventListener("mousedown", this._mouseDown);
    }

    /****************************************/

    close() {
        if (!this.isOpened())
            return;

        this.isOpened(false);

        document.body.removeEventListener("mousedown", this._mouseDown);
    }

    /****************************************/

    protected onMouseDown(ev: MouseEvent) {

        if ((<HTMLElement>ev.target).parentElement != this._element) {
            if (this._onSelected)
                this._onSelected(undefined);
            this._onSelected = null;
            this.close();
        }
    }

    /****************************************/

    isOpened = ko.observable(false);
    colors: IColorViewModel[] = [];

    static readonly instance = new ColorPicker();
}