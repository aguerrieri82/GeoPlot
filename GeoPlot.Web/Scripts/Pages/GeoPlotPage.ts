namespace GeoPlot {

    /****************************************/

    export class GeoPlotPage {

        private readonly _data: IDayAreaDataSet<IInfectionData>;
        private readonly _geo: IGeoAreaSet;

        constructor(data: IDayAreaDataSet<IInfectionData>, geo: IGeoAreaSet) {
            let svg = document.getElementsByTagName("svg").item(0);
            svg.addEventListener("click", e => this.onMapClick(e))
            this._data = data;
            this._geo = geo;
            this.dayNumber.subscribe(a => this.updateData());
            this.updateData();
        }

        /****************************************/

        private onMapClick(e: MouseEvent) {
            let item = <SVGPolygonElement>e.target;
            if (item.parentElement.classList.contains("district")) {
                let area = this._geo.areas[item.parentElement.id.toLowerCase()];
                alert(area.name);
            }
        }

        /****************************************/

        updateData() {
            let day = this._data.days[this.dayNumber()];

            for (let key in day.values) {
                let element = document.getElementById(key.toUpperCase());
                if (element) {

                    let area = this._geo.areas[key];

                    let factor1 = (day.values[key].totalPositive / area.demography.total) / this._data.maxFactor;

                    if (day.values[key].totalPositive == 0) {
                        element.style.fill = "#fff";
                        element.style.fillOpacity = "1";
                    }
                    else {
                        factor1 = 1 - Math.pow(1 - factor1, 3);
                        let value = Math.ceil(factor1 * 20) / 20;
                        element.style.fill = "#f00";
                        element.style.fillOpacity = (value).toString();
                    }
                }
            }
        }

        dayNumber = ko.observable(0);
    }
}