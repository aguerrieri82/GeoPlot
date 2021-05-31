namespace WebApp {

    type Color = string;

    export interface IGeometry {

    }

    export interface IRect2D extends IGeometry {
        x: number;
        y: number
        width: number;
        height: number;
    }

    /****************************************/

    export interface IPoint2D extends IGeometry {
        x: number;
        y: number
    }

    /****************************************/

    export interface IPoly2D extends IGeometry {
        points: IPoint2D[];
    }

    /****************************************/

    export interface IDrawGeometry<T extends IGeometry> {
        id: string;
        geometry: T;
        fillColor?: Color;
        strokeColor?: Color;
        strokeSize?: number;
    }

    /****************************************/

    interface IGradientColor {
        value: string | RgbColor;
        position?: number;
    }

    /****************************************/

    export class LinearGradient {

        constructor(...values: (string | RgbColor)[]) {
            if (values.length > 0) {
                 
                if (typeof values[0] == "string")
                    this.colors = linq(values).select(a => new RgbColor(<string>a)).toArray();
                else
                    this.colors = <RgbColor[]>values;
            }
            else
                this.colors = [];
        }

        /****************************************/

        valueAt(pos: number) : RgbColor {

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

        /****************************************/

        colors: RgbColor[];
    }

    /****************************************/

    export class RgbColor {

        constructor(value?: string) {
            if (value)
                this.fromHex(value);
        }

        /****************************************/

        fromHex(value: string) {
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
            function toHex(value: number) {
                let res = Math.round(value * 255).toString(16);
                if (res.length == 1)
                    return "0" + res;
                return res;
            }
            return "#" + toHex(this.r) + toHex(this.g) + toHex(this.b);
        }

        /****************************************/

        r: number = 0;
        g: number = 0;
        b: number = 0;
    }

    /****************************************/

    export class Graphics {

        _svg: SVGSVGElement;

        constructor(svg: SVGSVGElement) {

            this._svg = svg;

        }

        /****************************************/

        setViewPort(minX: number, minY: number, maxX: number, maxY: number) {
            this._svg.viewBox.baseVal.x = minX;
            this._svg.viewBox.baseVal.y = minY;
            this._svg.viewBox.baseVal.width = maxX - minX;
            this._svg.viewBox.baseVal.height = maxY - minY;
        }


        /****************************************/

        drawPoly(poly: IDrawGeometry<IPoly2D>) {
            
            var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            polygon.style.fill = poly.fillColor;
            polygon.style.stroke = poly.strokeColor;
            polygon.style.strokeWidth = poly.strokeSize + "%";
            polygon.id = poly.id;

            for (let i = 0; i < poly.geometry.points.length; i++) {
                let point = this._svg.createSVGPoint();
                point.x = poly.geometry.points[i].x;
                point.y = poly.geometry.points[i].y
                polygon.points.appendItem(point);
            }

            this._svg.appendChild(polygon);
        }
    }
}