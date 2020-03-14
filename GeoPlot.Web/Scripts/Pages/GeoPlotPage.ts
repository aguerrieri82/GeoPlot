namespace GeoPlot {

    type AgeGroup = keyof IDemography;

    class AreaViewModel {

        select() {

        }

        /****************************************/

        value: IGeoArea;           
        dayData = ko.observable<IInfectionData>();
        dayFactor = ko.observable<IDemography>();
    }


    /****************************************/

    interface IDayData {
        topAreas?: AreaViewModel[];
    }

    /****************************************/

    export class GeoPlotPage {

        private readonly _data: IDayAreaDataSet<IInfectionData>;
        private readonly _geo: IGeoAreaSet;
        private _selectedArea: IGeoArea; ù
        private _chart: Chart;
        private _daysData: IDayData[];
        private _updateDayData: boolean = false;

        constructor(data: IDayAreaDataSet<IInfectionData>, geo: IGeoAreaSet) {
            let svg = document.getElementsByTagName("svg").item(0);
            svg.addEventListener("click", e => this.onMapClick(e))
            this._data = data;
            this._geo = geo;

            this.totalDays(this._data.days.length - 1);
            this.dayNumber.subscribe(a => this.updateDayData());
            this.ageGroup.subscribe(a => this.updateMap());
            this.updateDayData();

            var instance = M.Collapsible.getInstance(document.getElementById("topCases"));

            instance.options.onOpenStart = () => {
                if (!this._daysData)
                    this.computeDayData();
                this._updateDayData = true;
            }
            instance.options.onCloseEnd = () => {
                this._updateDayData = false;
            }

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

                if (this._chart == null)
                    this.initChart();

                this.updateChart();
            }
        }

        /****************************************/

        protected updateChart() {
            let day = [this.dayNumber()];

            this._chart.data.datasets[0].data = linq(this._data.days).select(a => ({
                x: new Date(a.data),
                y: a.values[this.currentArea().value.id.toLowerCase()].totalPositive
            })).toArray();

            this._chart.update();
        }

        /****************************************/

        protected initChart() {
            let canvas = <HTMLCanvasElement>document.querySelector("#areaGraph");

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
        }

        /****************************************/

        protected updateArea(viewModel: AreaViewModel) {

            if (!viewModel)
                return;

            let id = viewModel.value.id.toLowerCase();
            let area = viewModel.value;

            let day = this._data.days[this.dayNumber()];

            viewModel.dayData(day.values[id]);

            viewModel.dayFactor({
                total: Math.round((day.values[id].totalPositive / area.demography.total) * 100000 * 10) / 10,
                old: Math.round((day.values[id].totalPositive / area.demography.old) * 100000 * 10) / 10,
            });
        }

        /****************************************/

        protected computeDayData() {

            this._daysData = [];

            for (var i = 0; i < this._data.days.length; i++) {

                let day = this._data.days[i];

                let item: IDayData = {};

                item.topAreas = linq(day.values).orderByDesc(a => a.value.totalPositive).select(a => {

                    let area = new AreaViewModel();

                    area.value = this._geo.areas[a.key.toLowerCase()];

                    area.select = () => this.selectedArea = area.value;

                    this.updateArea(area);

                    return area;

                }).take(10).toArray();

                this._daysData.push(item);
            }
        }

        /****************************************/

        protected updateDayData() {
            
            let day = this._data.days[this.dayNumber()];

            this.currentData(DateUtils.format(day.data, "{DD}/{MM}/{YYYY}"));

            this.updateMap();

            this.updateArea(this.currentArea());   

            if (this._daysData && this._updateDayData)
                this.topAreas(this._daysData[this.dayNumber()].topAreas);
        }

        /****************************************/

        protected updateMap() {

            let day = this._data.days[this.dayNumber()];

            for (let key in day.values) {
                let element = document.getElementById(key.toUpperCase());
                if (element) {

                    let area = this._geo.areas[key];

                    let factor1 = (day.values[key].totalPositive / area.demography[this.ageGroup()]) / this._data.maxFactor.total;

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
        }

        /****************************************/

        dayNumber = ko.observable(0);
        totalDays = ko.observable(0);
        currentData = ko.observable<string>();
        isPlaying = ko.observable(false);
        ageGroup = ko.observable<AgeGroup>("total");
        currentArea = ko.observable<AreaViewModel>();
        topAreas = ko.observable<AreaViewModel[]>();
    }
}