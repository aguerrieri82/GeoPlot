namespace GeoPlot {

    type ViewMode = "district" | "region";

    type FactorType = "none" | "population" | "totalPositive" | "severe" | "test";

    interface IDayData {
        topAreas?: AreaViewModel[];
    }

    interface IPageState {
        day?: number;
        area?: string;
        view?: ViewMode;
        maxFactor?: number;
        indicator?: keyof IInfectionData;
        factor?: FactorType;
        graphDelta?: boolean;
    }

    interface IGeoPlotViewModel  {
        geo: IGeoAreaSet;
        data: IDayAreaDataSet<IInfectionData>; 
    }

    interface IViewModeData {
        label: { singular: string, plural: string },
        mapGroup: string,
        areaType: GeoAreaType
        validateId: (id: string) => boolean;
        tab: string;
    }

    interface IIndicator {
        id: keyof IInfectionData;
        name: string;
        validFor?: ViewMode[];
    }

    interface IFactor {
        id: FactorType;
        name: string;
        validFor?: ViewMode[];
        compute: (value: IInfectionData, area: IGeoArea, indicator: number) => number
        reference: (value: IInfectionData, area: IGeoArea) => any;
        description: string;
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

    export class GeoPlotPage<TData> {

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
                tab: "districtTab",
                areaType: GeoAreaType.District,
                validateId: (id: string) => id[0].toLowerCase() == 'd'
            },
            "region": {
                label: {
                    singular: "regione",
                    plural: "regioni"
                },
                mapGroup: "group_dregion",
                tab: "regionTab",
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
                id: "none",
                name: "Nessuno",
                compute: (v, a, i) => i,
                reference: (v, a) => "N/A",
                description: "[indicator]"
            },
            {
                id: "population",
                name: "Popolazione",
                compute: (v, a, i) => (i / a.demography.total) * 100000,
                reference: (v, a) => formatNumber(a.demography.total),
                description: "[indicator] ogni 100.000 abitanti"
            },
            {
                id: "totalPositive",
                name: "Positivi Totali",
                validFor: ["region"],
                compute: (v, a, i) => !v.totalPositive ? 0 : (i / v.totalPositive) * 100,
                reference: (v, a) => !v.totalPositive ? "N/A" : formatNumber(v.totalPositive),
                description: "% [indicator] su positivi totali"
            },
            {
                id: "severe",
                name: "Gravi",
                validFor: ["region"],
                compute: (v, a, i) => !v.totalSevere ? 0 : (i / v.totalSevere) * 100,
                reference: (v, a) => !v.totalSevere ? "N/A" : formatNumber(v.totalSevere),
                description: "% [indicator] sui gravi totali"
            },
            {
                id: "test",
                name: "Tamponi",
                validFor: ["region"],
                compute: (v, a, i) => !v.toatlTests ? 0 : (i / v.toatlTests) * 100,
                reference: (v, a) => !v.toatlTests ? "N/A" : formatNumber(v.toatlTests),
                description: "% [indicator] sui tamponi eseguiti"
            }
        ];

        constructor(model: IGeoPlotViewModel) {

            this._data = model.data;
            this._geo = model.geo;

            this.totalDays(this._data.days.length - 1);
            this.dayNumber.subscribe(a => this.updateDayData());

            this._mapSvg = document.getElementsByTagName("svg").item(0);
            this._mapSvg.addEventListener("click", e => this.onMapClick(e))

            M.AutoInit();

            const areaTabs = M.Tabs.getInstance(document.getElementById("areaTabs"));
            
            areaTabs.options.onShow = (el: HTMLDivElement) => {

                this.setViewMode(<ViewMode>el.dataset["viewMode"]);
            };          

            const topCases = M.Collapsible.getInstance(document.getElementById("topCases"));

            topCases.options.onOpenStart = () => {
                if (!this._daysData)
                    this.updateTopAreas();
                this._topAreasVisible = true;
            }
            
            topCases.options.onCloseEnd = () => {
                this._topAreasVisible = false;
            }

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
                this.updateUrl();
            });

            this.maxFactor.subscribe(() => {
                if (!this.autoMaxFactor())
                    this.updateMap();
                this.updateUrl();
            });

            this.isGraphDelta.subscribe(() => {
                this.updateChart();
                this.updateUrl();
            });

            this.isZoomChart.subscribe(() => {
                setTimeout(() =>
                    this.updateChart(), 500);
            });

            const urlParams = new URLSearchParams(window.location.search);
            const stateRaw = urlParams.get("state");
            let state: IPageState;

            if (stateRaw)
                state = <IPageState>JSON.parse(atob(stateRaw));
            else
                state = {};

            setTimeout(() => this.loadState(state), 0);
        }

        /****************************************/

        protected isDefaultState(state: IPageState) {
            return (!state.day || state.day == this._data.days.length - 1) &&
                (!state.view || state.view == "district") &&
                !state.area &&
                (!state.indicator || state.indicator == "totalPositive") &&
                (!state.factor || state.factor == "none") &&
                !state.maxFactor &&
                !state.graphDelta;
        }

        /****************************************/

        toggleChartZoom() {

            this.isZoomChart(!this.isZoomChart());
        }

        /****************************************/

        loadState(state: IPageState) {

            if (!state.view)
                state.view = "district";

            const viewTabs = M.Tabs.getInstance(document.getElementById("areaTabs"));
            viewTabs.select(this.VIEW_MODES[state.view].tab);

            if (state.indicator)
                this.selectedIndicator(linq(this.INDICATORS).first(a => a.id == state.indicator));

            if (state.factor)
                this.selectedFactor(linq(this.FACTORS).first(a => a.id == state.factor));

            if (state.graphDelta)
                this.isGraphDelta(state.graphDelta);

            if (state.maxFactor) {
                this.autoMaxFactor(false);
                this.maxFactor(state.maxFactor);
            }

            this.dayNumber(state.day != undefined ? state.day : this._data.days.length - 1);

            if (state.area)
                this.selectedArea = this._geo.areas[state.area.toLowerCase()];
        }

        /****************************************/

        saveStata(): IPageState {

            return {
                view: this.viewMode(),
                indicator: this.selectedIndicator() ? this.selectedIndicator().id : undefined,
                factor: this.selectedFactor() ? this.selectedFactor().id : undefined,
                graphDelta: this.isGraphDelta(),
                maxFactor: this.autoMaxFactor() ? undefined : this.maxFactor(),
                day: this.dayNumber(),
                area: this.selectedArea ? this.selectedArea.id : undefined
            };
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

            const districtGroup = document.getElementById("group_district");

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
                const element = document.getElementById(this._selectedArea.id.toUpperCase());
                element.classList.remove("selected");
            }

            this._selectedArea = value;

            if (this._selectedArea) {
                const element = document.getElementById(this._selectedArea.id.toUpperCase());
                element.classList.add("selected");
                const parent = element.parentElement;
                element.remove();
                parent.appendChild(element);
            }
            this.changeArea();
        }

        /****************************************/

        private onMapClick(e: MouseEvent) {
            const item = <SVGPolygonElement>e.target;
            if (item.parentElement.classList.contains(this.viewMode())) {
                const area = this._geo.areas[item.parentElement.id.toLowerCase()];
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

                const area = new AreaViewModel();

                area.value = this._selectedArea;

                this.updateArea(area);

                this.currentArea(area)

                this.updateChart();
            }

            this.updateUrl();
        }

        /****************************************/

        protected initChart() {
            const canvas = <HTMLCanvasElement>document.querySelector("#areaGraph");

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
                    maintainAspectRatio: false,
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

            if (this.selectedIndicator() && this.selectedFactor())
                this.factorDescription(this.selectedFactor().description.replace("[indicator]", this.selectedIndicator().name));
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
            const max = linq(this._data.days)
                .select(a => linq(a.values).where(a => this.VIEW_MODES[this.viewMode()].validateId(a.key))
                    .select(b => this.selectedFactor().compute(b.value, this._geo.areas[b.key], b.value[this.selectedIndicator().id])).max()).max();

            this.maxFactor(parseFloat(max.toFixed(1)));
        }

        /****************************************/

        protected updateChart() {

            if (!this.selectedIndicator() || !this.currentArea() || !this.selectedFactor())
                return;

            if (this._chart == null)
                this.initChart();

            const area = this.currentArea().value;
            const areaId = area.id.toLowerCase();
            const field = this.selectedIndicator().id;

            if (this.isGraphDelta()) {
                this._chart.data.datasets[0].data = [];

                for (let i = 1; i < this._data.days.length - 1; i++) {
                    const day = this._data.days[i];
                    const prevDay = this._data.days[i - 1];
                    const item : Chart.ChartPoint = {
                        x: new Date(day.date),
                        y: this.selectedFactor().compute(day.values[areaId], area, day.values[areaId][field]) -
                            this.selectedFactor().compute(prevDay.values[areaId], area, prevDay.values[areaId][field])
                    };
                    this._chart.data.datasets[0].data.push(<any>item);
                }
            }
            else {
                this._chart.data.datasets[0].data = linq(this._data.days).select(a => ({
                    x: new Date(a.date),
                    y: this.selectedFactor().compute(a.values[areaId], area, a.values[areaId][field])
                })).toArray();
            }

            this._chart.update();
        }

        /****************************************/

        protected updateArea(viewModel: AreaViewModel) {

            if (!viewModel || !this.selectedIndicator() || !this.selectedFactor())
                return;

            const id = viewModel.value.id.toLowerCase();
            const area = viewModel.value;
            const day = this._data.days[this.dayNumber()];

            viewModel.data(day.values[id]);

            viewModel.indicator(day.values[id][this.selectedIndicator().id]);

            viewModel.factor(MathUtils.discretize(this.selectedFactor().compute(day.values[id], area, viewModel.indicator()), 10));

            viewModel.reference(this.selectedFactor().reference(day.values[id], area));
        }

        /****************************************/

        protected updateTopAreas() {

            this._daysData = [];

            for (let i = 0; i < this._data.days.length; i++) {

                const day = this._data.days[i];

                const item: IDayData = {};

                const isInArea = this.VIEW_MODES[this.viewMode()].validateId;

                item.topAreas = linq(day.values).orderByDesc(a => a.value[this.selectedIndicator().id]).where(a => isInArea(a.key)).select(a => {

                    const area = new AreaViewModel();

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

            const day = this._data.days[this.dayNumber()];

            this.currentData(DateUtils.format(day.date, "{DD}/{MM}/{YYYY}"));

            this.updateMap();

            this.updateArea(this.currentArea());

            if (this._daysData && this._topAreasVisible)
                this.topAreas(this._daysData[this.dayNumber()].topAreas);

            this.updateUrl();
        }

        /****************************************/

        protected updateUrl() {
            const state = this.saveStata();
            let url = Uri.appRoot + "Home/Overview";
            if (!this.isDefaultState(state))
                url += "?state=" + encodeURIComponent(btoa(JSON.stringify(state)));
            history.replaceState(null, null, url);
        }

        /****************************************/

        protected updateMap() {

            if (!this.selectedIndicator() || !this.selectedFactor())
                return;

            const day = this._data.days[this.dayNumber()];

            for (const key in day.values) {
                const element = document.getElementById(key.toUpperCase());
                if (element) {

                    const area = this._geo.areas[key];

                    if (area.type != this.VIEW_MODES[this.viewMode()].areaType)
                        continue;

                    const field = this.selectedIndicator().id;

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
                        const value = MathUtils.discretize(MathUtils.exponential(factor), 20);
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
        viewMode = ko.observable<ViewMode>("district");
        selectedIndicator = ko.observable<IIndicator>();
        selectedFactor = ko.observable<IFactor>();
        autoMaxFactor = ko.observable<boolean>(true);
        maxFactor = ko.observable<number>();
        isGraphDelta = ko.observable<boolean>(false);
        isZoomChart = ko.observable<boolean>(false);
        indicators: KnockoutObservable<IIndicator[]>;
        factorDescription = ko.observable<string>();
        factors: KnockoutObservable<IFactor[]>;
    }
}