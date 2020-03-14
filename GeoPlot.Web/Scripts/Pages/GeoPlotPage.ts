namespace GeoPlot {


    class AreaViewModel {

        value: IGeoArea;   
        
        dayData = ko.observable<IInfectionData>();
        dayFactor = ko.observable<number>();
    }

    /****************************************/

    export class GeoPlotPage {

        private readonly _data: IDayAreaDataSet<IInfectionData>;
        private readonly _geo: IGeoAreaSet;
        private _selectedArea: IGeoArea;

        constructor(data: IDayAreaDataSet<IInfectionData>, geo: IGeoAreaSet) {
            let svg = document.getElementsByTagName("svg").item(0);
            svg.addEventListener("click", e => this.onMapClick(e))
            this._data = data;
            this._geo = geo;

            this.totalDays(this._data.days.length - 1);
            this.dayNumber.subscribe(a => this.updateData());
            this.updateData();
        }

        /****************************************/

        private onMapClick(e: MouseEvent) {
            let item = <SVGPolygonElement>e.target;
            if (item.parentElement.classList.contains("district")) {
                let area = this._geo.areas[item.parentElement.id.toLowerCase()];
                this.selectedArea = area;
            }
        }

        /****************************************/

        play() {
            this.isPlaying(true);
            this.nextFrame();
        }

        /****************************************/

        pause() {
            this.isPlaying(false);
        }

        /****************************************/

        protected nextFrame() {

            if (!this.isPlaying())
                return;

            if (this.dayNumber() >= this._data.days.length - 1)
                this.dayNumber(0);
            else
                this.dayNumber(parseInt(this.dayNumber().toString()) + 1);
            
            setTimeout(() => this.nextFrame(), 300);
        }

        /****************************************/

        get selectedArea() {
            return this._selectedArea;
        }

        set selectedArea(value: IGeoArea) {
            if (value == this._selectedArea)
                return;

            if (this._selectedArea) {
                let element = document.getElementById(value.id.toUpperCase());
                element.classList.remove("selected");
            }

            this._selectedArea = value;

            if (this._selectedArea) {
                let element = document.getElementById(value.id.toUpperCase());
                element.classList.add("selected");
            }    
            this.changeArea();
        }

        /****************************************/

        protected changeArea() {
            if (this._selectedArea == null)
                this.currentArea(null);
            else {

                let area = new AreaViewModel();

                let day = this._data.days[this.dayNumber()];

                area.value = this._selectedArea;                
             
                this.updateArea(area);

                this.currentArea(area)
            }
        }

        /****************************************/

        protected updateArea(viewModel: AreaViewModel) {

            if (!viewModel)
                return;

            let id = viewModel.value.id.toLowerCase();
            let area = viewModel.value;

            let day = this._data.days[this.dayNumber()];

            viewModel.dayData(day.values[id]);

            viewModel.dayFactor(Math.round((day.values[id].totalPositive / area.demography.total) * 100000 * 10) / 10);
        }

        /****************************************/

        protected updateData() {
            
            let day = this._data.days[this.dayNumber()];

            this.currentData(DateUtils.format(day.data, "{DD}/{MM}/{YYYY}"));

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
                        element.style.fill = "#b71c1c";
                        element.style.fillOpacity = (value).toString();
                    }
                }
            }

            this.updateArea(this.currentArea());       
        }

        /****************************************/

        dayNumber = ko.observable(0);
        totalDays = ko.observable(0);
        currentData = ko.observable<string>();
        isPlaying = ko.observable(false);
        currentArea = ko.observable<AreaViewModel>();
    }
}