namespace GeoPlot {

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