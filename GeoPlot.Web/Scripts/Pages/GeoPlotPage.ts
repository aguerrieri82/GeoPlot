namespace GeoPlot {

    type ViewMode = "district" | "region" | "country";

    type FactorType = "none" | "population" | "totalPositive" | "severe" | "test";

    interface IDayData {
        topAreas?: AreaViewModel[];
    }

    interface ISpecialDate {
        date: Date;
        visible?: boolean;
        label?: string;
        color?: string;
        width?: number;
        dash?: number[];
        dashOffset?: number;
    }

    interface IPageState {
        day?: number;
        area?: string;
        view?: ViewMode;
        maxFactor?: number;
        indicator?: keyof IInfectionData;
        factor?: FactorType;
        graphDelta?: boolean;
        groupSize?: number;
        startDay?: number;
        logScale?: boolean;
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
        colorLight?: string;
        colorDark?: string;
    }

    interface IGroupDay {
        number: number;
        value: Date;
        text: string;
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

    class IndicatorViewModel {

        select() {

        }

        indicator: IIndicator;
        value = ko.observable<number>();
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
        indicators = ko.observable<IndicatorViewModel[]>();
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
        private _execludedArea = new Map<string, IGeoArea>();

        private _specialDates: IDictionary<ISpecialDate> = {
            current: {
                date: undefined,
                color: "#000",
                width: 0.5,
                label: "Giorno corrente"
            }
        };


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
                mapGroup: "group_region",
                tab: "regionTab",
                areaType: GeoAreaType.Region,
                validateId: (id: string) => id[0].toLowerCase() == 'r'
            },
            "country": {
                label: {
                    singular: "italiana",
                    plural: "italiane"
                },
                mapGroup: "group_country",
                tab: "italyTab",
                areaType: GeoAreaType.Country,
                validateId: (id: string) => id.toLowerCase() == 'it'
            }
        }

        readonly INDICATORS: IIndicator[] = [
            {
                id: "totalPositive",
                name: "Positivi Totali",
                colorLight: "#f44336",
                colorDark: "#b71c1c"
            },
            {
                id: "currentPositive",
                name: "Attuali Positivi",
                validFor: ["region", "country"],
                colorLight: "#e91e63",
                colorDark: "#880e4f"
            },
            {
                id: "totalDeath",
                name: "Deceduti",
                validFor: ["region", "country"],
                colorLight: "#9c27b0",
                colorDark: "#4a148c"
            },
            {
                id: "totalSevere",
                name: "Gravi",
                validFor: ["region", "country"],
                colorLight: "#ff9800",
                colorDark: "#e65100"
            },
            {
                id: "totalHospedalized",
                name: "Ricoverati",
                validFor: ["region", "country"],
                colorLight: "#fdd835",
                colorDark: "#fbc02d"
            },
            {
                id: "totalHealed",
                name: "Guariti",
                validFor: ["region", "country"],
                colorLight: "#4caf50",
                colorDark: "#1b5e20"
            },
            {
                id: "toatlTests",
                name: "Tamponi",
                validFor: ["region", "country"],
                colorLight: "#03a9f4",
                colorDark: "#01579b"

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
                validFor: ["region", "country"],
                compute: (v, a, i) => !v.totalPositive ? 0 : (i / v.totalPositive) * 100,
                reference: (v, a) => !v.totalPositive ? "N/A" : formatNumber(v.totalPositive),
                description: "% [indicator] su positivi totali"
            },
            {
                id: "severe",
                name: "Gravi",
                validFor: ["region", "country"],
                compute: (v, a, i) => !v.totalSevere ? 0 : (i / v.totalSevere) * 100,
                reference: (v, a) => !v.totalSevere ? "N/A" : formatNumber(v.totalSevere),
                description: "% [indicator] sui gravi totali"
            },
            {
                id: "test",
                name: "Tamponi",
                validFor: ["region", "country"],
                compute: (v, a, i) => !v.toatlTests ? 0 : (i / v.toatlTests) * 100,
                reference: (v, a) => !v.toatlTests ? "N/A" : formatNumber(v.toatlTests),
                description: "% [indicator] sui tamponi eseguiti"
            }
        ];

        constructor(model: IGeoPlotViewModel) {

            this._data = model.data;
            this._geo = model.geo;

            this.totalDays(this._data.days.length - 1);

            this.dayNumber.subscribe(a => {
                this.updateDayData();
                this._specialDates.current.date = new Date(this._data.days[a].date);
                this.updateChart();
            });

            this._mapSvg = document.getElementsByTagName("svg").item(0);
            this._mapSvg.addEventListener("click", e => this.onMapClick(e))

            this.days = [];
            for (var i = 0; i < this._data.days.length; i++)
                this.days.push({ number: i, value: new Date(this._data.days[i].date), text: DateUtils.format(this._data.days[i].date, "{DD}/{MM}") });

            M.Tooltip.init(document.querySelectorAll(".tooltipped"));

            M.Sidenav.init(document.getElementById("mobile-menu"));

            const areaTabs = M.Tabs.init(document.getElementById("areaTabs"));
            
            areaTabs.options.onShow = (el: HTMLDivElement) => {

                this.setViewMode(<ViewMode>el.dataset["viewMode"]);
            };          

            const topCasesView = M.Collapsible.init(document.getElementById("topCases"));

            topCasesView.options.onOpenStart = () => {
                if (!this._daysData)
                    this.updateTopAreas();
                this._topAreasVisible = true;
            }

            topCasesView.options.onCloseEnd = () => {
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
                setTimeout(() => M.FormSelect.init(document.querySelectorAll(".row-chart-group select")));
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
                this.computeStartDayForGroup();
                this.updateChart();
                this.updateUrl();
            });

            this.isLogScale.subscribe(() => {
                this.updateChart();
                this.updateUrl();
            });

            this.isZoomChart.subscribe(() => {
                this.updateChart();
                this.updateUrl();
            });

            this.groupSize.subscribe(value => {
                this.computeStartDayForGroup();
                this.updateChart();
                this.updateUrl(); 
            });

            this.startDay.subscribe(() => {
                this.updateChart();
                this.updateUrl();
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
                !state.graphDelta &&
                !state.logScale &&
                (!state.groupSize || state.groupSize == 1) &&
                (state.startDay == undefined || state.startDay == 0);
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

            document.body.scrollTop = 0;

            if (state.logScale != undefined)
                this.isLogScale(state.logScale);

            if (state.groupSize)
                this.groupSize(state.groupSize);

            if (state.startDay != undefined)
                this.startDay(state.startDay);

            if (state.graphDelta != undefined)
                this.isGraphDelta(state.graphDelta);

            if (state.maxFactor) {
                this.autoMaxFactor(false);
                this.maxFactor(state.maxFactor);
            }

            this.dayNumber(state.day != undefined ? state.day : this._data.days.length - 1);

            if (state.indicator)
                this.selectedIndicator(linq(this.INDICATORS).first(a => a.id == state.indicator));

            if (state.factor)
                this.selectedFactor(linq(this.FACTORS).first(a => a.id == state.factor));

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
                area: this.selectedArea ? this.selectedArea.id : undefined,
                groupSize: this.groupSize(),
                startDay: this.startDay(), 
                logScale: this.isLogScale()
            }; 
        }

        /****************************************/

        copyChart() {
            this._chart.canvas.toBlob(async blob => {
                if (navigator["clipboard"] && navigator["clipboard"]["write"]) {
                    let item = new ClipboardItem({ [blob.type]: blob });
                    await navigator.clipboard.write([item]);
                    M.toast({ html: "Grafico copiato negli appunti." })
                }
                else {
                    const url = window.URL.createObjectURL(blob);
                    const element = document.createElement("a");
                    element.href = url;
                    element.target = "_blan";
                    element.download = this._chart.options.title.text + ".png";
                    element.click();
                    M.toast({ html: "Funzionalità non supportata, download in corso." })
                }
            });

        }

        /****************************************/

        async copySerie() {

            const data = <{ x: Date, y: number }[]>this._chart.data.datasets[0].data;
            let text = "";
            for (let i = 0; i < data.length; i++) 
                text += DateUtils.format(data[i].x, "{YYYY}-{MM}-{DD}") + "\t" + i + "\t" + MathUtils.round(data[i].y, 1) + "\n";

            DomUtils.copyText(text);

            M.toast({ html: "Serie copiata sugli appunti." })
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

            this._execludedArea.clear();

            this.clearMap();

            this.updateMaxFactor();

            this.updateDayData();

            if (this.viewMode() == "country") {
                this.selectedArea = this._geo.areas["it"];
            }
            else {
                if (this._topAreasVisible)
                    this.updateTopAreas();
                else
                    this._daysData = undefined;
            }

            setTimeout(() =>
                M.FormSelect.init(document.querySelectorAll(".row-indicator select")));
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
                if (element)
                    element.classList.remove("selected");
            }

            this._selectedArea = value;

            if (this._selectedArea) {
                const element = document.getElementById(this._selectedArea.id.toUpperCase());
                if (element) {
                    element.classList.add("selected");
                    const parent = element.parentElement;
                    element.remove();
                    parent.appendChild(element);
                }
            }
            this.changeArea();
        }

        /****************************************/

        protected getFactorValue(dayOrNumber: number | IDayAreaGroupItem<IInfectionData>, areaOrId: string|IGeoArea, indicator: keyof IInfectionData): number {

            const day = typeof dayOrNumber == "number" ? this._data.days[dayOrNumber] : dayOrNumber;

            const area = typeof areaOrId == "string" ? this._geo.areas[areaOrId.toLowerCase()] : areaOrId;

            return this.selectedFactor().compute(day[area.id.toLowerCase()], area, this.getIndicatorValue(day, area, indicator));
        }

        /****************************************/

        protected getIndicatorValue(dayOrNumber: number | IDayAreaGroupItem<IInfectionData>, areaOrId: string | IGeoArea, indicator: keyof IInfectionData): number {

            const day = typeof dayOrNumber == "number" ? this._data.days[<number>dayOrNumber] : dayOrNumber;

            const areaId = typeof areaOrId == "string" ? areaOrId : areaOrId.id;

            let curValue = day.values[areaId.toLowerCase()][indicator];
            if (this._execludedArea.size > 0) {
                this._execludedArea.forEach(a => {
                    curValue -= day.values[a.id.toLowerCase()][indicator];
                });
            }

            return curValue;
        }

        /****************************************/

        protected computeStartDayForGroup() {

            let totDays = this.days.length - this.startDay();
            if (this.isGraphDelta())
                totDays--;
            const module = (totDays % this.groupSize());
            if (module != 0) {
                const invModule = this.groupSize() - module;
                if (this.startDay() - invModule >= 0)
                    this.startDay(this.startDay() - invModule);
                else if (this.startDay() + module < this.days.length - 1)
                    this.startDay(this.startDay() + module);

                M.FormSelect.init(document.querySelectorAll(".row-chart-group select"));
            }
        }

        /****************************************/

        private onMapClick(e: MouseEvent) {
            const item = <SVGPolygonElement>e.target;
            if (this.viewMode() == "country") {
                const areaId = item.parentElement.id;
                if (this._execludedArea.has(areaId))
                    this._execludedArea.delete(areaId);
                else {
                    const area = this._geo.areas[areaId.toLowerCase()];
                    this._execludedArea.set(areaId, area);
                    M.toast({ html: "Regione " + area.name + " esclusa dai conteggi." });
                }
                this.updateIndicator();
            }
            else {
                if (item.parentElement.classList.contains(this.viewMode())) {
                    const area = this._geo.areas[item.parentElement.id.toLowerCase()];
                    this.selectedArea = area;
                }
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

            setTimeout(() => this.nextFrame(), 100);
        }

        /****************************************/

        protected changeArea() {
            if (this._selectedArea == null)
                this.currentArea(null);
            else {
                var isEmptyArea = !this.currentArea();

                const area = new AreaViewModel();

                area.value = this._selectedArea;

                this.updateArea(area);

                this.currentArea(area)

                this.updateAreaIndicators();

                this.updateChart();

                if (isEmptyArea) {
                    M.FormSelect.init(document.querySelectorAll(".row-chart-group select"));
                    M.Tooltip.init(document.querySelectorAll(".row-chart-group .tooltipped"));
                }
            }

            this.updateUrl();
        }

        /****************************************/

        protected updateAreaIndicators() {
            if (!this.currentArea())
                return;
            if (!this.currentArea().indicators()) {
                const items: IndicatorViewModel[] = [];
                for (let indicator of this.indicators()) {
                    let item = new IndicatorViewModel();
                    item.indicator = indicator;
                    item.select = () => {
                        this.selectedIndicator(indicator);
                        setTimeout(() =>
                            M.FormSelect.init(document.querySelectorAll(".row-indicator select")));
                    }
                    items.push(item);
                }
                this.currentArea().indicators(items);
            }

            const day = this._data.days[this.dayNumber()];
            const areaId = this.currentArea().value.id.toLowerCase();

            for (let item of this.currentArea().indicators())
                item.value(this.getIndicatorValue(day, areaId, item.indicator.id))
        }

        /****************************************/

        protected updateIndicator() {

            if (!this.selectedIndicator() || !this.selectedFactor())
                return;

            this.factorDescription(this.selectedFactor().description.replace("[indicator]", this.selectedIndicator().name));

            if (this.selectedFactor().id != "none") {

                if (this.groupSize() != 1) 
                    this.groupSize(1);
            }

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

            let result = Number.NEGATIVE_INFINITY;
            let curView = this.VIEW_MODES[this.viewMode()];

            for (let i = 0; i < this._data.days.length; i++) {
                const day = this._data.days[i];
                for (let areaId in day.values) {
                    if (!curView.validateId(areaId))
                        continue;
                    const factor = this.getFactorValue(day, areaId, this.selectedIndicator().id);
                    if (factor > result)
                        result = factor;
                }
            }

            this.maxFactor(parseFloat(result.toFixed(1)));
        }


        /****************************************/

        protected initChart() {
            const canvas = <HTMLCanvasElement>document.querySelector("#areaGraph");

            const referencesPlugIn: Chart.PluginServiceRegistrationOptions = {
                afterDraw: chart => {

                    const data = chart.data.datasets[0].data;

                    if (!data || data.length == 0)
                        return;

                    const xScale = chart["scales"]["x-axis-0"];
                    const ctx = chart.ctx;

                    for (let key in this._specialDates) {

                        let item = this._specialDates[key];
                        if (!item.date || item.visible === false)
                            continue;

                        let offset = <number>xScale["getPixelForValue"]({ x: item.date });

                        ctx.lineWidth = item.width || 1;

                        ctx.beginPath();
                        ctx.moveTo(offset, chart.chartArea.top);
                        ctx.lineTo(offset, chart.chartArea.bottom);
                        ctx.strokeStyle = item.color || "#000";
                        if (item.dash)
                            ctx.setLineDash(item.dash);
                        if (item.dashOffset)
                            ctx.lineDashOffset = item.dashOffset;
                        ctx.stroke();
                    }
                }
            };

            this._chart = new Chart(canvas, {
                plugins: [referencesPlugIn],
                type: "line",
                data: {
                    datasets: [
                        {
                            lineTension: 0,
                            data: [],
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    maintainAspectRatio: false,
                    legend: {
                        display: true,
                        position: "bottom"
                    },
                    title: {
                        display: false,
                    },
                    tooltips: {
                        callbacks: {
                            label: (t, d) => {
                                return t.xLabel + ": " + MathUtils.round(parseFloat(t.value), 1);
                            }
                        }
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

        protected updateChart() {

            if (!this.selectedIndicator() || !this.currentArea() || !this.selectedFactor())
                return;

            if (this._chart == null)
                this.initChart();

            const area = this.currentArea().value;
            const areaId = area.id.toLowerCase();
            const field = this.selectedIndicator().id;

            this._chart.data.datasets[0].label = this.factorDescription() + " - " + area.name;;
            this._chart.options.title.text = this._chart.data.datasets[0].label;

            if (this.isLogScale())
                this._chart.options.scales.yAxes[0].type = "logarithmic";
            else
                this._chart.options.scales.yAxes[0].type = "linear";

            this._chart.data.datasets[0].borderColor = this.selectedIndicator().colorDark;
            this._chart.data.datasets[0].backgroundColor = this.selectedIndicator().colorLight;

            if (this.isGraphDelta()) {
                this._chart.data.datasets[0].data = [];

                for (let i = 1 + this.startDay(); i < this._data.days.length; i++) {
                    const day = this._data.days[i];
                    const prevDay = this._data.days[i - 1];
                    const item : Chart.ChartPoint = {
                        x: new Date(day.date),
                        y: this.getFactorValue(day, area, field) - this.getFactorValue(prevDay, area, field)
                    };
                    this._chart.data.datasets[0].data.push(<any>item);
                }
            }
            else {
                this._chart.data.datasets[0].data = linq(this._data.days).skip(this.startDay()).select(a => ({
                    x: new Date(a.date),
                    y: this.getFactorValue(a, area, field)
                })).toArray();
            }

            if (this.groupSize() > 1) {
                const newData = [];
                const data = <{ x: Date, y: number }[]>this._chart.data.datasets[0].data;
                let count = this.groupSize();
                let curPoint: { x?: Date, y: number } = {y: 0};
                for (let i = 0; i < data.length; i++) {
                    curPoint.y += data[i].y;
                    count--;
                    if (count == 0) {
                        curPoint.x = data[i].x;
                        newData.unshift(curPoint);
                        curPoint = { y: 0 };
                        count = this.groupSize();
                    }
                }
                this._chart.data.datasets[0].data = newData;
            }

            this._chart.update();
        }

        /****************************************/

        protected updateArea(value: AreaViewModel, dayNumber?: number) {

            if (!value || !this.selectedIndicator() || !this.selectedFactor())
                return;

            if (dayNumber == undefined)
                dayNumber = this.dayNumber();

            const id = value.value.id.toLowerCase();
            const area = value.value;
            const day = this._data.days[dayNumber];

            if (!day || !day.values[id]) {
                M.toast({ html: "Dati non disponibili" });
                return;
            }

            value.data(day.values[id]);

            value.indicator(this.getIndicatorValue(day, id, this.selectedIndicator().id));

            value.factor(MathUtils.round(this.getFactorValue(day, area, this.selectedIndicator().id), 1));

            value.reference(this.selectedFactor().reference(day.values[id], area));

        }

        /****************************************/

        protected updateTopAreas() {

            this._daysData = [];

            for (let i = 0; i < this._data.days.length; i++) {

                const day = this._data.days[i];

                const item: IDayData = {};

                const isInArea = this.VIEW_MODES[this.viewMode()].validateId;

                item.topAreas = linq(day.values).select(a => ({
                    factor: this.getFactorValue(day, a.key, this.selectedIndicator().id),
                        value: a
                    }))
                    .orderByDesc(a => a.factor).where(a => isInArea(a.value.key)).select(a => {

                    const area = new AreaViewModel();

                    area.value = this._geo.areas[a.value.key.toLowerCase()];

                    area.select = () => this.selectedArea = area.value;

                    this.updateArea(area, i);

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

            this.updateAreaIndicators();

            if (this._daysData && this._topAreasVisible)
                this.topAreas(this._daysData[this.dayNumber()].topAreas);

            this.updateUrl();
        }

        /****************************************/

        protected updateUrl() {
            const state = this.saveStata();
            let url = Uri.appRoot + "Overview";
            if (!this.isDefaultState(state))
                url += "?state=" + encodeURIComponent(btoa(JSON.stringify(state)));
            history.replaceState(null, null, url);
        }

        /****************************************/

        protected clearMap() {
            const day = this._data.days[this.dayNumber()];

            for (const key in day.values) {
                const element = document.getElementById(key.toUpperCase());
                if (element) {
                    element.style.fillOpacity = "1";
                    element.style.removeProperty("fill");
                }
            }
        }

        /****************************************/

        protected updateMap() {

            if (!this.selectedIndicator() || !this.selectedFactor())
                return;


            if (this.viewMode() != "country") {

                const day = this._data.days[this.dayNumber()];

                for (const key in day.values) {
                    const element = document.getElementById(key.toUpperCase());
                    if (element) {

                        const area = this._geo.areas[key];

                        if (area.type != this.VIEW_MODES[this.viewMode()].areaType)
                            continue;

                        const field = this.selectedIndicator().id;

                        let factor = this.getFactorValue(day, area, field);
                        let indicator = this.getIndicatorValue(day, area, field);

                        factor = Math.min(1, factor / this.maxFactor());

                        if (indicator == 0 || isNaN(factor)) {
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
                            element.style.fill = this.selectedIndicator().colorDark;
                            //element.style.fill = this._gradient.valueAt(value).toString();
                        }
                    }
                }
            }
            else {
                linq(document.querySelectorAll("g.region")).foreach((element: HTMLElement) => {
                    if (this._execludedArea.has(element.id))
                        element.style.fill = "#444";
                    else
                        element.style.fill = "#FFF";
                });
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
        isLogScale = ko.observable<boolean>(false);
        isGraphDelta = ko.observable<boolean>(false);
        isZoomChart = ko.observable<boolean>(false);
        groupSize = ko.observable<number>(1);
        startDay = ko.observable<number>(0);
        isNoFactorSelected = ko.computed(() => this.selectedFactor() && this.selectedFactor().id == 'none');
        groupDays = [1, 2, 3, 4, 5, 6, 7];
        factorDescription = ko.observable<string>();
        indicators: KnockoutObservable<IIndicator[]>;
        factors: KnockoutObservable<IFactor[]>;
        days: IGroupDay[];
    }
}