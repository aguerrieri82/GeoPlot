namespace GeoPlot {

    type ViewMode = "district" | "region";

    interface IDayData {
        topAreas?: AreaViewModel[];
    }

    interface IGeoPlotViewModel {
        geo: IGeoAreaSet;
        data: IDayAreaDataSet<IInfectionData>;
        day?: number;
        district?: string;
    }

    interface IViewModeData {
        label: { singular: string, plural: string },
        mapGroup: string,
        areaType: GeoAreaType
        validateId: (id: string) => boolean;
    }

    interface IIndicator {
        id: keyof IInfectionData;
        name: string;
        validFor?: ViewMode[];
    }

    interface IFactor {
        name: string;
        validFor?: ViewMode[];
        compute: (value: IInfectionData, area: IGeoArea, indicator: number) => number
        reference: (value: IInfectionData, area: IGeoArea) => any;
    }

    /****************************************/

    class AreaViewModel {

        select() {

        }

        /****************************************/

        value: IGeoArea;

        data = ko.observable<IInfectionData>();
        factor = ko.observable<number>();
        indicator = ko.observable<number>();
        reference = ko.observable<any>();
    }


    /****************************************/

    export class GeoPlotPage {

        private readonly _data: IDayAreaDataSet<IInfectionData>;
        private readonly _geo: IGeoAreaSet;
        private _selectedArea: IGeoArea; ù
        private _chart: Chart;
        private _daysData: IDayData[];
        private _topAreasVisible: boolean = false;
        private _gradient = new LinearGradient("#18ffff", "#ffff00", "#ff3d00");
        private _mapSvg: SVGSVGElement;

        readonly VIEW_MODES: { [K in ViewMode]: IViewModeData } = {
            "district": {
                label: {
                    singular: "provincia",
                    plural: "province"
                },
                mapGroup: "group_district",
                areaType: GeoAreaType.District,
                validateId: (id: string) => id[0].toLowerCase() == 'd'
            },
            "region": {
                label: {
                    singular: "regione",
                    plural: "regioni"
                },
                mapGroup: "group_dregion",
                areaType: GeoAreaType.Region,
                validateId: (id: string) => id[0].toLowerCase() == 'r'
            },
        }

        readonly INDICATORS: IIndicator[] = [
            {
                id: "totalPositive",
                name: "Positivi Totali"
            },
            {
                id: "currentPositive",
                name: "Attuali Positivi",
                validFor: ["region"]
            },
            {
                id: "totalDeath",
                name: "Deceduti",
                validFor: ["region"]
            },
            {
                id: "totalSevere",
                name: "Gravi",
                validFor: ["region"]
            },
            {
                id: "totalHospedalized",
                name: "Ricoverati",
                validFor: ["region"]
            },
            {
                id: "totalHealed",
                name: "Guariti",
                validFor: ["region"]
            },
            {
                id: "toatlTests",
                name: "Tamponi",
                validFor: ["region"]
            },
        ];

        readonly FACTORS: IFactor[] = [
            {
                name: "Nessuno",
                compute: (v, a, i) => i,
                reference: (v, a) => "N/A"
            },
            {
                name: "Popolazione",
                compute: (v, a, i) => (i / a.demography.total) * 100000,
                reference: (v, a) => formatNumber(a.demography.total)
            },
            {
                name: "Positivi Totali",
                validFor: ["region"],
                compute: (v, a, i) => !v.totalPositive ? 0 : (i / v.totalPositive) * 100,
                reference: (v, a) => !v.totalPositive ? "N/A" : formatNumber(v.totalPositive)
            },
            {
                name: "Gravi",
                validFor: ["region"],
                compute: (v, a, i) => !v.totalSevere ? 0 : (i / v.totalSevere) * 100,
                reference: (v, a) => !v.totalSevere ? "N/A" : formatNumber(v.totalSevere)
            },
            {
                name: "Tamponi",
                validFor: ["region"],
                compute: (v, a, i) => !v.toatlTests ? 0 : (i / v.toatlTests) * 100,
                reference: (v, a) => !v.toatlTests ? "N/A" : formatNumber(v.toatlTests)
            }
        ];

        constructor(model: IGeoPlotViewModel) {

            this._data = model.data;
            this._geo = model.geo;

            this.totalDays(this._data.days.length - 1);
            this.dayNumber.subscribe(a => this.updateDayData());

            this._mapSvg = document.getElementsByTagName("svg").item(0);
            this._mapSvg.addEventListener("click", e => this.onMapClick(e))

            let instance1 = M.Tabs.init(document.getElementById("areaTabs"));
            
            instance1.options.onShow = (el: HTMLDivElement) => {

                this.setViewMode(<ViewMode>el.dataset["viewMode"]);
            };

            instance1.select("districtTab");

            let instance2 = M.Collapsible.init(document.getElementById("topCases"));

            instance2.options.onOpenStart = () => {
                if (!this._daysData)
                    this.updateTopAreas();
                this._topAreasVisible = true;
            }
            instance2.options.onCloseEnd = () => {
                this._topAreasVisible = false;
            }

            this.dayNumber(model.day != undefined ? model.day : this._data.days.length - 1);

            if (model.district)
                this.selectedArea = this._geo.areas[model.district.toLowerCase()];

            this.indicators = ko.computed(() => linq(this.INDICATORS)
                .where(a => !a.validFor || a.validFor.indexOf(this.viewMode()) != -1)
                .toArray());

            this.factors = ko.computed(() => linq(this.FACTORS)
                .where(a => !a.validFor || a.validFor.indexOf(this.viewMode()) != -1)
                .toArray());


            this.selectedIndicator.subscribe(value => {
                if (!value)
                    return;
                this.updateIndicator();
            });

            this.selectedFactor.subscribe(value => {
                if (!value)
                    return;
                this.updateIndicator();
            });

            this.autoMaxFactor.subscribe(value => {
                if (value) {
                    this.updateMaxFactor();
                    this.updateMap();
                }
                
            });

            this.maxFactor.subscribe(() => {
                if (!this.autoMaxFactor())
                    this.updateMap();
            });
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

        setViewMode(mode: ViewMode) {

            this.viewMode(mode);

            let districtGroup = document.getElementById("group_district");

            if (mode == "district")
                districtGroup.style.removeProperty("display");
            else
                districtGroup.style.display = "none";

            this.selectedArea = null;

            this._chart = null;

            this.updateMaxFactor();

            this.updateDayData();

            if (this._topAreasVisible)
                this.updateTopAreas();
            else
                this._daysData = undefined;

            setTimeout(() =>
                M.FormSelect.init(document.querySelectorAll("select")));
        }


        /****************************************/

        get selectedArea() {
            return this._selectedArea;
        }

        set selectedArea(value: IGeoArea) {
            if (value == this._selectedArea)
                return;

            if (this._selectedArea) {
                let element = document.getElementById(this._selectedArea.id.toUpperCase());
                element.classList.remove("selected");
            }

            this._selectedArea = value;

            if (this._selectedArea) {
                let element = document.getElementById(this._selectedArea.id.toUpperCase());
                element.classList.add("selected");
                let parent = element.parentElement;
                element.remove();
                parent.appendChild(element);
            }
            this.changeArea();
        }

        /****************************************/

        private onMapClick(e: MouseEvent) {
            let item = <SVGPolygonElement>e.target;
            if (item.parentElement.classList.contains(this.viewMode())) {
                let area = this._geo.areas[item.parentElement.id.toLowerCase()];
                this.selectedArea = area;
            }
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

        protected changeArea() {
            if (this._selectedArea == null)
                this.currentArea(null);
            else {

                let area = new AreaViewModel();

                let day = this._data.days[this.dayNumber()];

                area.value = this._selectedArea;

                this.updateArea(area);

                this.currentArea(area)

                this.updateChart();
            }

            this.updateUrl();
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
                                tooltipFormat: "DD/MMM"
                            }

                        }],

                    }
                }
            });
        }

        /****************************************/

        protected updateIndicator() {
            this.updateMaxFactor();
            this.updateDayData();
            this.updateChart();
            if (this._topAreasVisible)
                this.updateTopAreas();

        }

        /****************************************/

        protected updateMaxFactor() {

            if (!this.selectedFactor() || !this.selectedIndicator() || !this.autoMaxFactor())
                return;

            this.maxFactor(linq(this._data.days)
                .select(a => linq(a.values).where(a => this.VIEW_MODES[this.viewMode()].validateId(a.key))
                    .select(b => this.selectedFactor().compute(b.value, this._geo.areas[b.key], b.value[this.selectedIndicator().id])).max()).max());
        }

        /****************************************/

        protected updateChart() {

            if (!this.selectedIndicator() || !this.currentArea() || !this.selectedFactor())
                return;

            if (this._chart == null)
                this.initChart();

            let area = this.currentArea().value;
            let areaId = area.id.toLowerCase();
            let field = this.selectedIndicator().id;

            this._chart.data.datasets[0].data = linq(this._data.days).select(a => ({
                x: new Date(a.date),
                y: this.selectedFactor().compute(a.values[areaId], area, a.values[areaId][field])
            })).toArray();

            this._chart.update();
        }

        /****************************************/

        protected updateArea(viewModel: AreaViewModel) {

            if (!viewModel || !this.selectedIndicator() || !this.selectedFactor())
                return;

            let id = viewModel.value.id.toLowerCase();
            let area = viewModel.value;

            let day = this._data.days[this.dayNumber()];

            viewModel.data(day.values[id]);

            viewModel.indicator(day.values[id][this.selectedIndicator().id]);

            viewModel.factor(MathUtils.discretize(this.selectedFactor().compute(day.values[id], area, viewModel.indicator()), 10));

            viewModel.reference(this.selectedFactor().reference(day.values[id], area));
        }

        /****************************************/

        protected updateTopAreas() {

            this._daysData = [];

            for (var i = 0; i < this._data.days.length; i++) {

                let day = this._data.days[i];

                let item: IDayData = {};

                let isInArea = this.VIEW_MODES[this.viewMode()].validateId;

                item.topAreas = linq(day.values).orderByDesc(a => a.value[this.selectedIndicator().id]).where(a => isInArea(a.key)).select(a => {

                    let area = new AreaViewModel();

                    area.value = this._geo.areas[a.key.toLowerCase()];

                    area.select = () => this.selectedArea = area.value;

                    this.updateArea(area);

                    return area;

                }).take(25).toArray();

                this._daysData.push(item);
            }

            this.topAreas(this._daysData[this.dayNumber()].topAreas);
        }

        /****************************************/

        protected updateDayData() {

            let day = this._data.days[this.dayNumber()];

            this.currentData(DateUtils.format(day.date, "{DD}/{MM}/{YYYY}"));

            this.updateMap();

            this.updateArea(this.currentArea());

            if (this._daysData && this._topAreasVisible)
                this.topAreas(this._daysData[this.dayNumber()].topAreas);

            this.updateUrl();
        }

        /****************************************/

        protected updateUrl() {
            let url = Uri.appRoot + "?day=" + this.dayNumber();
            if (this.selectedArea)
                url += "&district=" + this.selectedArea.id;
            history.replaceState(null, null, url);
        }

        /****************************************/

        protected updateMap() {

            if (!this.selectedIndicator() || !this.selectedFactor())
                return;

            let day = this._data.days[this.dayNumber()];

            for (let key in day.values) {
                let element = document.getElementById(key.toUpperCase());
                if (element) {

                    let area = this._geo.areas[key];

                    if (area.type != this.VIEW_MODES[this.viewMode()].areaType)
                        continue;

                    let field = this.selectedIndicator().id;

                    let factor = this.selectedFactor().compute(day.values[key], area, day.values[key][field]);

                    factor = Math.min(1, factor / this.maxFactor());

                    if (day.values[key][field] == 0 || isNaN(factor)) {
                        if (element.classList.contains("valid"))
                            element.classList.remove("valid");
                        element.style.fillOpacity = "1";
                        element.style.removeProperty("fill");
                    }
                    else {
                        if (!element.classList.contains("valid"))
                            element.classList.add("valid");
                        let value = MathUtils.discretize(MathUtils.exponential(factor), 20);
                        element.style.fillOpacity = value.toString();
                        //element.style.fill = this._gradient.valueAt(value).toString();
                    }
                }
            }
        }

        /****************************************/

        dayNumber = ko.observable(0);
        totalDays = ko.observable(0);
        currentData = ko.observable<string>();
        isPlaying = ko.observable(false);
        currentArea = ko.observable<AreaViewModel>();
        topAreas = ko.observable<AreaViewModel[]>();
        viewMode = ko.observable<ViewMode>();
        selectedIndicator = ko.observable<IIndicator>();
        selectedFactor = ko.observable<IFactor>();
        autoMaxFactor = ko.observable<boolean>(true);
        maxFactor = ko.observable<number>();
        indicators: KnockoutObservable<IIndicator[]>;
        factors: KnockoutObservable<IFactor[]>;
    }
}