namespace WebApp.GeoPlot {

    type TData = IInfectionData;

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
        indicator?: keyof TData | string;
        factor?: string;
        dayDelta?: boolean;
        groupSize?: number;
        startDay?: number;
        logScale?: boolean;
        showEnvData?: boolean;
        excludedArea?: string[];
        detailsArea?: string;
    }

    /****************************************/

    interface IOverviewViewActions extends Dictionary<number>  {

        areaSelected: number;
        indicatorChanged: number;
        indicatorSelected: number;
        dayChanged: number;
        viewChanged: number;
        groupChanged: number;
        scaleChanged: number;
        topAreasOpened: number;
        chartActionExecuted: number;
        factorChanged: number;
        maxFactorChanged: number;
        deltaSelected: number;
        regionExcluded: number;
    }

    /****************************************/

    interface IViewPreferences extends ITipPreferences<IOverviewViewActions> {
        isFirstView: boolean;
        version: number;
    }

    /****************************************/

    interface IGeoPlotViewModel {
        geo: IGeoAreaSet;
        data: IDayAreaDataSet<TData>;
        debugMode: boolean;
    }

    /****************************************/

    interface IGroupDay {
        number: number;
        value: Date;
        text: string;
    }

    /****************************************/

    class IndicatorViewModel {

        select() {

        }

        indicator: IIndicator<TData>;
        value = ko.observable<number>();
    }

    /****************************************/

    class AreaViewModel {

        select() {

        }

        /****************************************/

        value: IGeoArea;

        data = ko.observable<TData>();
        factor = ko.observable<number>();
        indicator = ko.observable<number>();
        reference = ko.observable<any>();
        indicators = ko.observable<IndicatorViewModel[]>();
    }

    /****************************************/

    export class GeoPlotPage {

        private readonly _mainData: IDayAreaDataSet<TData>;
        private readonly _mainGeo: IGeoAreaSet;
        private _detailsData: IDayAreaDataSet<TData>;
        private _detailsGeo: IGeoAreaSet;

        private _selectedArea: IGeoArea; ù
        private _chart: Chart;
        private _daysData: IDayData[];
        private _topAreasVisible: boolean = false;
        private _mapSvg: SVGSVGElement;
        private _execludedArea = new Map<string, IGeoArea>();
        private _dataSet = InfectionDataSet;
        private _keepState = false;
        private _debugMode = false;
        private _preferences: IViewPreferences;
        private _calculator: IndicatorCalculator<TData>;

        private _tips: DictionaryOf<IOverviewViewActions, IViewActionTip> = {
            areaSelected: {
                order: 0,
                featureName: "Zone",
                html: "Puoi vedere i dati relativi ad una particolare area selezionadoli sulla mappa.",
                elementSelector: ".card-map .center-align",
                showAfter: 3,
                showAction: () => {
                    this.viewMode("region");
                    this.selectedArea = this._calculator.geo.areas["r10"];
                }
            },
            indicatorSelected: {
                order: 1,
                featureName: "Indicatori",
                html: "Puoi vedere il grafico associato all'indicatore, facendo click sull'indicatore.",
                elementSelector: ".indicators .summary-field",
                showAfter: 15,
                showAction: () => {
                    if (!this.currentArea())
                        this._tips.areaSelected.showAction();
                    this.selectedIndicator(linq(this._dataSet.indicators).first(a => a.id == "totalDeath"));
                }
            },
            dayChanged: {
                order: 2,
                featureName: "Cronologia",
                html: "Puoi vedere gli indicatori dei giorni precedenti muovendo la slide.",
                elementSelector: ".day input[type=range]",
                showAfter: 20,
                showAction: () => {
                    this.dayNumber(5);
                }
            },
            indicatorChanged: {
                order: 3,
                featureName: "Indicatori",
                html: "Puoi cambiare l'indicatore scegliendolo dal filtro nell'elenco.",
                elementSelector: ".filter-indicator",
                showAfter: 0
            },
            viewChanged: {
                order: 4,
                featureName: "Zone",
                html: "Puoi vedere gli indicatori a livello regionale, nazionale o provinciale.",
                elementSelector: "#areaTabs",
                showAfter: 0,
                showAction: () => {
                    this.viewMode("district");
                }
            },
            topAreasOpened: {
                order: 5,
                featureName: "Zone",
                html: "Puo vedere le zone più colpite di un qualsiasi indicatore scelto.",
                elementSelector: "#topCases .card-title",
                showAfter: 20,
                showAction: () => {
                    if (this.viewMode() == "country")
                        this.viewMode("region");
                    M.Collapsible.getInstance(document.getElementById("topCases")).open(0);
                }
            },
            deltaSelected: {
                order: 5.5,
                featureName: "Indicatori",
                html: "Puoi vedere l'incremento giornaliero dell'indicatore anzichè il valore totale.",
                elementSelector: ".day-delta",
                showAfter: 20,
                showAction: () => {
                    if (!this.currentArea())
                        this._tips.areaSelected.showAction();
                    this.isDayDelta(true);
                }
            },
            factorChanged: {
                order: 6,
                featureName: "Indicatori",
                html: "Puoi mettere in relazione qualsiasi indicatore a numerosi parametri (es. % Positivi su Tamponi).",
                elementSelector: ".filter-factor",
                showAfter: 30,
                showAction: () => {
                    if (!this.currentArea())
                        this._tips.areaSelected.showAction();
                    this.selectedIndicator(linq(this._dataSet.indicators).first(a => a.id == "totalPositive"));
                    this.selectedFactor(linq(this._dataSet.factors).first(a => a.id == "population"));
                }
            },
            groupChanged: {
                order: 7,
                featureName: "Grafico",
                html: "Puo raggruppare i dati del grafico in gruppi da 1 a 7 giorni. Puoi anche scegliere la data d'inizio.",
                elementSelector: ".row-chart-group .select-wrapper",
                showAfter: 30,
                showAction: () => {
                    if (!this.currentArea())
                        this._tips.areaSelected.showAction();
                    var element = document.querySelector(".chart-options");
                    if (element.classList.contains("closed"))
                        element.classList.remove("closed");
                    this.groupSize(2);
                    M.FormSelect.init(document.querySelectorAll(".row-chart-group select"));
                }
            },
            chartActionExecuted: {
                order: 8,
                featureName: "Grafico",
                html: "Puoi portare il grafico a schermo interno, copiarlo, o copiare la serie numerico e incollarla in excel.",
                elementSelector: ".chart .actions",
                showAfter: 30
            },
            scaleChanged: {
                order: 9,
                featureName: "Grafico",
                html: "Puoi cambiare da scala logaritmica a scala lineare.",
                elementSelector: ".log-scale",
                showAfter: 210,
                showAction: () => {
                    this.isLogScale(true);
                }
            },
            maxFactorChanged: {
                order: 10,
                featureName: "Mappa",
                html: "Puoi cambiare il riferimento rispetto al quale la mappa viene colorata. Normalmente è in base al valore massimo che si ha avuto globalmente.",
                elementSelector: ".max-factor",
                showAfter: 60,
                showAction: () => {
                    if (!this.currentArea())
                        this._tips.areaSelected.showAction();
                    this.selectedIndicator(linq(this._dataSet.indicators).first(a => a.id == "totalPositive"));
                    this.autoMaxFactor(false);
                    this.maxFactor(1000);
                }
            },
            regionExcluded: {
                order: 11,
                featureName: "Mappa",
                html: "Nella vista nazionale puoi escludere dagli indicatori il valore di una o più regioni cliccando sulla mappa.",
                elementSelector: ".card-map .center-align",
                showAfter: 0,
                showAction: () => {
                    if (this.viewMode() != "country")
                        this.viewMode("country");
                    this._execludedArea.set("R8", this._calculator.geo.areas["r8"]);
                    this.updateIndicator();
                }
            }
        }

        private _specialDates: IDictionary<ISpecialDate> = {
            current: {
                date: undefined,
                color: "#000",
                width: 0.5,
                label: "Giorno corrente"
            },
            "dpcm8": {
                date: new Date(2020, 2, 7),
                color: "#000",
                dash: [5, 5],
                width: 1,
                visible: true,
                label: "DPCM 8 Marzo (italia zona rossa)"
            },
            "dpcm9": {
                date: new Date(2020, 2, 9),
                color: "#000",
                dash: [5, 5],
                width: 1,
                visible: true,
                label: "DPCM 9 Marzo (italia zona rossa)"
            },
            "dpcm11": {
                date: new Date(2020, 2, 11),
                color: "#000",
                dash: [5, 5],
                width: 1,
                visible: true,
                label: "DPCM 11 Marzo (chiusura attività)"
            },
            "mds20": {
                date: new Date(2020, 2, 20),
                color: "#070",
                dash: [5, 5],
                width: 1,
                visible: false,
                label: "MDS 20 Marzo (chiura parchi, motoria nelle vicinane)"
            },
            "dpcm22": {
                date: new Date(2020, 2, 21),
                color: "#000",
                dash: [5, 5],
                width: 1,
                visible: true,
                label: "DPCM 22 Marzo (chiusura ulteriore attività)"
            },
            "dpcm25": {
                date: new Date(2020, 2, 24),
                color: "#000",
                dash: [5, 5],
                width: 1,
                visible: true,
                label: "DPCM 25 Marzo (maggiori sanzioni)"
            }
        };

        constructor(model: IGeoPlotViewModel) {

            this._mainData = model.data;
            this._mainGeo = model.geo;
            this._debugMode = model.debugMode;
            this._calculator = new IndicatorCalculator(this._mainData, this._dataSet, this._mainGeo);

            this.totalDays(this._calculator.data.days.length - 1);

            this.dayNumber.subscribe(value => {
                if (value != this._calculator.data.days.length - 1)
                    this.tipManager.markAction("dayChanged");
                this.updateDayData();
                this._specialDates.current.date = new Date(this._calculator.data.days[value].date);
                this.updateChart();
            });

            this._mapSvg = document.getElementsByTagName("svg").item(0);
            this._mapSvg.addEventListener("click", e => this.onMapClick(e, false))
            this._mapSvg.addEventListener("dblclick", e => this.onMapClick(e, true))

            this.days = [];
            for (var i = 0; i < this._calculator.data.days.length; i++)
                this.days.push({ number: i, value: new Date(this._calculator.data.days[i].date), text: DateUtils.format(this._calculator.data.days[i].date, $string("$(date-format-short)")) });


            const areaTabs = M.Tabs.init(document.getElementById("areaTabs"));

            areaTabs.options.onShow = (el: HTMLDivElement) => {

                this.setViewMode(<ViewMode>el.dataset["viewMode"]);
            };

            const topCasesView = M.Collapsible.init(document.getElementById("topCases"));

            topCasesView.options.onOpenStart = () => {
                if (!this._daysData)
                    this.updateTopAreas();
                this._topAreasVisible = true;
                this.tipManager.markAction("topAreasOpened");
            }

            topCasesView.options.onCloseEnd = () => {
                this._topAreasVisible = false;
            }

            this.indicators = ko.computed(() => linq(this._dataSet.indicators)
                .where(a => !a.validFor || a.validFor.indexOf(this.viewMode()) != -1)
                .toArray());

            this.factors = ko.computed(() => linq(this._dataSet.factors)
                .where(a => !a.validFor || a.validFor.indexOf(this.viewMode()) != -1)
                .toArray());

            this.detailsArea.subscribe(value => {
                this.updateDetailsArea();
            });

            this.selectedIndicator.subscribe(value => {
                if (!value)
                    return;
                this.updateIndicator();
                if (value.id != "totalPositive")
                    this.tipManager.markAction("indicatorChanged", value.id);
            });

            this.selectedFactor.subscribe(value => {
                if (!value)
                    return;
                this.updateIndicator();
                if (value.id != "none")
                    this.tipManager.markAction("factorChanged", value.id);
                setTimeout(() => M.FormSelect.init(document.querySelectorAll(".row-chart-group select")));
            });

            this.autoMaxFactor.subscribe(value => {
                if (value) {
                    this.updateMaxFactor();
                    this.updateMap();
                }
                this.updateUrl();
            });

            this.maxFactor.subscribe(value => {
                if (!this.autoMaxFactor()) {
                    this.updateMap();
                    this.tipManager.markAction("maxFactorChanged", value.toString());
                }
                this.updateUrl();
            });

            this.isDayDelta.subscribe(value => {
                this.computeStartDayForGroup();
                this.updateIndicator();
                if (value)
                    this.tipManager.markAction("deltaSelected");

            });

            this.isLogScale.subscribe(value => {
                this.updateChart();
                this.updateUrl();
                if (value)
                    this.tipManager.markAction("scaleChanged");
            });

            this.isZoomChart.subscribe(value => {
                this.updateChart();
            });

            this.groupSize.subscribe(value => {
                this.computeStartDayForGroup();
                this.updateChart();
                this.updateUrl();
                if (value > 1)
                    this.tipManager.markAction("groupChanged", value.toString());
            });

            this.startDay.subscribe(value => {
                this.updateChart();
                this.updateUrl();
            });

            const urlParams = new URLSearchParams(window.location.search);
            const stateRaw = urlParams.get("state");
            this._keepState = urlParams.get("keepState") == "true";

            this.loadPreferences();

            this.tipManager = new TipManager<IOverviewViewActions>(this._tips, () => this._preferences, () => this.savePreferences());

            this.tipManager.engageUser();

            let state: IPageState;

            if (stateRaw && this._keepState)
                state = <IPageState>JSON.parse(atob(stateRaw));
            else
                state = {};

            setTimeout(() => this.loadState(state), 0);

            if (!this._debugMode)
                window.addEventListener("beforeunload", () => this.savePreferences());

            //Templating.template(document.querySelector("#template"), "TestComponent", Templating.model({ isChecked: false }));
        }

        /****************************************/

        protected isDefaultState(state: IPageState) {
            return (!state.day || state.day == this._calculator.data.days.length - 1) &&
                (!state.view || state.view == "region") &&
                !state.area &&
                (!state.indicator || state.indicator == "totalPositive") &&
                (!state.factor || state.factor == "none") &&
                !state.maxFactor &&
                !state.dayDelta &&
                !state.logScale &&
                !state.showEnvData &&
                (!state.groupSize || state.groupSize == 1) &&
                (state.startDay == undefined || state.startDay == 0) &&
                (!state.excludedArea) &&
                (!state.detailsArea);
        }

        /****************************************/

        loadState(state: IPageState) {

            if (!state.view)
                state.view = "region";

            const viewTabs = M.Tabs.getInstance(document.getElementById("areaTabs"));
            viewTabs.select(ViewModes[state.view].tab);

            document.body.scrollTop = 0;

            if (state.logScale != undefined)
                this.isLogScale(state.logScale);

            if (state.groupSize)
                this.groupSize(state.groupSize);

            if (state.startDay != undefined)
                this.startDay(state.startDay);

            if (state.dayDelta != undefined)
                this.isDayDelta(state.dayDelta);

            if (state.showEnvData != undefined)
                this.isShowEnvData(state.showEnvData);

            if (state.maxFactor) {
                this.autoMaxFactor(false);
                this.maxFactor(state.maxFactor);
            }

            this.dayNumber(state.day != undefined ? state.day : this._calculator.data.days.length - 1);

            if (state.excludedArea) {
                this._execludedArea.clear();
                for (let areaId of state.excludedArea)
                    this._execludedArea.set(areaId, this._calculator.geo.areas[areaId.toLowerCase()]);
            }

            if (state.indicator)
                this.selectedIndicator(linq(this._dataSet.indicators).first(a => a.id == state.indicator));

            if (state.factor)
                this.selectedFactor(linq(this._dataSet.factors).first(a => a.id == state.factor));

            if (state.area)
                this.selectedArea = this._calculator.geo.areas[state.area.toLowerCase()];

            if (state.detailsArea) 
                this.detailsArea(this._calculator.geo.areas[state.detailsArea]);
        }

        /****************************************/

        saveStata(): IPageState {

            return {
                view: this.viewMode() == "region" ? undefined : this.viewMode(),
                indicator: this.selectedIndicator() ? this.selectedIndicator().id : undefined,
                factor: this.selectedFactor() ? this.selectedFactor().id : undefined,
                dayDelta: this.isDayDelta() ? true : undefined,
                maxFactor: this.autoMaxFactor() ? undefined : this.maxFactor(),
                day: this.dayNumber() == this._calculator.data.days.length - 1 ? undefined : this.dayNumber(),
                area: this.selectedArea ? this.selectedArea.id : undefined,
                groupSize: this.groupSize() == 1 ? undefined : this.groupSize(),
                startDay: this.startDay() == 0 ? undefined : this.startDay(),
                logScale: this.isLogScale() ? true : undefined,
                excludedArea: this._execludedArea.size > 0 ? linq(this._execludedArea.keys()).toArray() : undefined,
                showEnvData: this.isShowEnvData() ? true : undefined,
                detailsArea: this.detailsArea() ? this.detailsArea().id : undefined,
            };
        }

        /****************************************/

        loadPreferences() {
            let json = localStorage.getItem("preferences");

            if (json) {

                try {
                    this._preferences = JSON.parse(json);
                }
                catch{
                }

                if (!this._preferences || this._preferences.version != 1) {
                    this._preferences = this.getDefaultPreferences();
                    this._preferences.isFirstView = false;
                    this._preferences.showTips = false;
                    this.savePreferences();
                }
            }
            else
                this._preferences = this.getDefaultPreferences();
        }

        /****************************************/

        protected getDefaultPreferences(): IViewPreferences {
            return ({
                isFirstView: true,
                showTips: true,
                version: 1,
                actions: {
                    areaSelected: 0,
                    indicatorSelected: 0,
                    indicatorChanged: 0,
                    dayChanged: 0,
                    viewChanged: 0,
                    chartActionExecuted: 0,
                    factorChanged: 0,
                    groupChanged: 0,
                    maxFactorChanged: 0,
                    scaleChanged: 0,
                    topAreasOpened: 0,
                    deltaSelected: 0,
                    regionExcluded: 0
                }
            });
        }

        /****************************************/

        savePreferences() {
            this._preferences.isFirstView = false;
            localStorage.setItem("preferences", JSON.stringify(this._preferences));
        }


        /****************************************/

        toggleChartZoom() {

            this._preferences.actions.chartActionExecuted++;
            this.isZoomChart(!this.isZoomChart());
        }

        /****************************************/

        async copyMap() {
            const element = document.querySelector("svg.map");
            const svgText = element.outerHTML;
            const blob = new Blob([svgText], { type: "image/svg+xml" });

            if (navigator["clipboard"] && navigator["clipboard"]["write"]) {
                const svgImage = document.createElement('img');
                svgImage.style.width = element.clientWidth + "px";
                svgImage.style.height = element.clientHeight + "px";
                svgImage.onload = function () {

                    const canvas = document.createElement("canvas");
                    canvas.width = element.clientWidth;
                    canvas.height = element.clientHeight;

                    const ctx = canvas.getContext("2d");
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(svgImage, 0, 0);

                    canvas.toBlob(async pngBlob => {
                        let item = new ClipboardItem({ [pngBlob.type]: pngBlob });
                        await navigator.clipboard.write([item]);
                        M.toast({ html: $string("$(msg-map-copied)")})
                    })
                }
                svgImage.src = window.URL.createObjectURL(blob);
            }
            else {
                const element = document.createElement("a");
                element.href = window.URL.createObjectURL(blob);
                element.target = "_blan";
                element.download = "map.svg";
                element.click();
                M.toast({ html: $string("$(msg-no-copy)") })
            }
        }

        /****************************************/

        copyChart() {
            this._chart.canvas.toBlob(async blob => {
                if (navigator["clipboard"] && navigator["clipboard"]["write"]) {
                    let item = new ClipboardItem({ [blob.type]: blob });
                    await navigator.clipboard.write([item]);
                    M.toast({ html: $string("$(msg-chart-copied)") })
                }
                else {
                    const url = window.URL.createObjectURL(blob);
                    const element = document.createElement("a");
                    element.href = url;
                    element.target = "_blan";
                    element.download = this._chart.options.title.text + ".png";
                    element.click();
                    M.toast({ html: $string("$(msg-no-copy)") })
                }
            });
            this.tipManager.markAction("chartActionExecuted", "copy");
        }

        /****************************************/

        async copySerie() {

            const data = <{ x: Date, y: number }[]>this._chart.data.datasets[0].data;
            let text = "";
            for (let i = 0; i < data.length; i++)
                text += DateUtils.format(data[i].x, $string("$(date-format)")) + "\t" + i + "\t" + MathUtils.round(data[i].y, 1) + "\n";

            DomUtils.copyText(text);

            M.toast({ html: $string("$(msg-serie-copied)")})
            this.tipManager.markAction("chartActionExecuted", "copySerie");
        }

        /****************************************/

        async copySerieForStudio() {

            let obj: StudioData = {
                type: "serie",
                version: 1,
                color: this.selectedIndicator().colorLight,
                serie: {
                    type: "geoplot",
                    areaId: this.selectedArea.id,
                    indicatorId: this.selectedIndicator().id,
                    xAxis: "dayNumber",
                    startDay: this.startDay(),
                    exeludedAreaIds: linq(this._execludedArea.keys()).toArray(),
                    factorId: this.selectedFactor().id,
                    groupSize: this.groupSize(),
                    isDelta: this.isDayDelta(),
                },
                title: this.factorDescription()
            };

            obj.values = this._calculator.getSerie(obj.serie);

            DomUtils.copyText(JSON.stringify(obj));

            M.toast({ html: $string("$(msg-serie-copied-studio)") })

            this.tipManager.markAction("chartActionExecuted", "copySerieForStudio");
        }

        /****************************************/

        play() {
            if (this.dayNumber() == this._calculator.data.days.length - 1)
                this.dayNumber(0);
            this.isPlaying(true);
            this.nextFrame();
        }

        /****************************************/

        pause() {
            this.isPlaying(false);
        }

        /****************************************/

        setViewMode(mode: ViewMode, fromModel = false) {

            if (fromModel) {
                const areaTabs = M.Tabs.getInstance(document.getElementById("areaTabs"));
                areaTabs.select(ViewModes[mode].tab);
            }

            if (mode == "details") {

                if (this._detailsGeo && this._detailsData) {
                    this._calculator.geo = this._detailsGeo;
                    this._calculator.data = this._detailsData;
                    this.totalDays(this._calculator.data.days.length - 1);
                }
            }
            else
            {
                this._calculator.geo = this._mainGeo;
                this._calculator.data = this._mainData;
            }

            this.totalDays(this._calculator.data.days.length - 1);

            if (mode != "region")
                this.tipManager.markAction("viewChanged", mode);

            this.viewMode(mode);

            const districtGroup = document.getElementById("group_district");

            if (mode == "district" || mode == "details")
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
                this.selectedArea = this._calculator.geo.areas["it"];
                this.tipManager.showTip("regionExcluded", { timeout: 5 });
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

        protected getFactorValue(dayNumberOrGroup: number | number[], areaOrId: string | IGeoArea): number {

            return this._calculator.getFactorValue({
                dayNumberOrGroup: dayNumberOrGroup,
                areaOrId: areaOrId,
                factorId: this.selectedFactor().id,
                indicatorId: this.selectedIndicator().id,
                isDayDelta: this.isDayDelta(),
                execludedAreas: linq(this._execludedArea.keys()).toArray()
            });
        }

        /****************************************/

        protected getIndicatorValue(dayNumber: number, areaOrId: string | IGeoArea, indicatorId: keyof TData | string): number {

            return this._calculator.getIndicatorValue({
                dayNumber: dayNumber,
                areaOrId: areaOrId,
                indicatorId: indicatorId,
                isDayDelta: this.isDayDelta(),
                execludedAreas: linq(this._execludedArea.keys()).toArray()
            });
        }

        /****************************************/

        protected computeStartDayForGroup() {

            let totDays = this.days.length - this.startDay();
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

        private onMapClick(e: MouseEvent, isDouble: boolean) {

            const item = <SVGPolygonElement>e.target;
            const areaId = item.parentElement.id;
            const area = this._calculator.geo.areas[areaId.toLowerCase()];

            if (!area)
                return;

            if (!isDouble) {
                if (this.viewMode() == "country") {
                    if (this._execludedArea.has(areaId))
                        this._execludedArea.delete(areaId);
                    else {
                        this._execludedArea.set(areaId, area);
                        M.toast({ html: $string("$(msg-region-ex)").replace("[region]", area.name) });
                    }
                    this.updateIndicator();
                }
                else {
                    //if (item.parentElement.classList.contains(this.viewMode()))
                    this.selectedArea = area;
                }

                this.tipManager.markAction("areaSelected", area.name);
            }
            else {
                if (this.viewMode() == "region" || this.viewMode() == "district")
                    this.detailsArea(area);
            }
        }


        /****************************************/

        protected nextFrame() {

            if (!this.isPlaying())
                return;

            if (this.dayNumber() >= this._calculator.data.days.length - 1)
                this.pause();
            else
                this.dayNumber(parseInt(this.dayNumber().toString()) + 1);

            setTimeout(() => this.nextFrame(), 1000);
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

                this.updateFactorDescription();

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

                    if (indicator.showInFavorites === false)
                        continue;

                    let item = new IndicatorViewModel();
                    item.indicator = indicator;
                    item.select = () => {
                        this.tipManager.markAction("indicatorSelected", item.indicator.id);
                        this.selectedIndicator(indicator);
                        setTimeout(() =>
                            M.FormSelect.init(document.querySelectorAll(".row-indicator select")));
                    }
                    items.push(item);
                }
                this.currentArea().indicators(items);
            }

            const areaId = this.currentArea().value.id.toLowerCase();

            for (let item of this.currentArea().indicators())
                item.value(this.getIndicatorValue(this.dayNumber(), areaId, item.indicator.id))
        }

        /****************************************/

        protected updateFactorDescription() {

            let desc = "";

            if (this.isDayDelta())
                desc = "$(new) ";

            desc += this.selectedFactor().description.replace("[indicator]", this.selectedIndicator().name);
            if (this.currentArea())
                desc += " - " + this.currentArea().value.name;

            if (this._execludedArea.size > 0) {
                desc += " - $(except) (";
                let i = 0;
                for (let key of this._execludedArea.keys()) {
                    if (i > 0)
                        desc += ", ";
                    desc += this._execludedArea.get(key).name;
                    i++;
                }
                desc += ")";
            }

            this.factorDescription($string(desc));
        }

        /****************************************/

        protected updateIndicator() {

            if (!this.selectedIndicator() || !this.selectedFactor())
                return;

            this.updateFactorDescription();

            /*
            if (this.selectedFactor().id != "none") {
 
                if (this.groupSize() != 1)
                    this.groupSize(1);
            }*/

            this.updateMaxFactor();
            this.updateDayData();
            this.updateChart();
            this.updateUrl();

            if (this._topAreasVisible)
                this.updateTopAreas();
        }

        /****************************************/

        protected updateMaxFactor() {

            if (!this.selectedFactor() || !this.selectedIndicator() || !this.autoMaxFactor())
                return;

            let result = Number.NEGATIVE_INFINITY;
            let curView = ViewModes[this.viewMode()];


            let count = 0;
            let list = [];
            for (let i = 0; i < this._calculator.data.days.length; i++) {
                const day = this._calculator.data.days[i];
                for (let areaId in day.values) {
                    if (!curView.validateId(areaId))
                        continue;
                    const factor = Math.abs(this.getFactorValue(i, areaId));
                    if (!MathUtils.isNaNOrNull(factor) && factor != Number.POSITIVE_INFINITY && factor > result)
                        result = factor;

                    if (factor != 0)
                        list.push(factor);
                }
            }
            /*
            list = linq(list).orderBy(a => a).toArray();
            var index = Math.floor(list.length / 2);
            result = list[index];*/

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
                        else
                            ctx.setLineDash([]);
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

            this._chart.data.datasets[0].label = this.factorDescription();
            this._chart.options.title.text = this._chart.data.datasets[0].label;

            if (this.isLogScale())
                this._chart.options.scales.yAxes[0].type = "logarithmic";
            else
                this._chart.options.scales.yAxes[0].type = "linear";

            this._chart.data.datasets[0].borderColor = this.selectedIndicator().colorDark;
            this._chart.data.datasets[0].backgroundColor = this.selectedIndicator().colorLight;

            this._chart.data.datasets[0].data = this._calculator.getSerie({
                type: "geoplot",
                areaId: area.id,
                indicatorId: this.selectedIndicator().id,
                xAxis: "date",
                startDay: this.startDay(),
                exeludedAreaIds: linq(this._execludedArea.keys()).toArray(),
                factorId: this.selectedFactor().id,
                groupSize: this.groupSize(),
                isDelta: this.isDayDelta()
            });

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

            /*
            if (!day || !day.values[id]) {
                M.toast({
                    html: $string("$(msg-no-data)")});
                return;
            }*/

            value.data(this._calculator.getDataAtDay(dayNumber, id));

            value.indicator(this.getIndicatorValue(dayNumber, id, this.selectedIndicator().id));

            value.factor(MathUtils.round(this.getFactorValue(dayNumber, area), 1));

            value.reference(this.selectedFactor().reference(value.data(), area));

        }

        /****************************************/

        protected async updateDetailsArea() {

            const detailsEl = <HTMLElement>document.querySelector(".details-map");

            if (!this.detailsArea()) {
                this.setViewMode("region");
                detailsEl.innerHTML = "";
            }
            else {

                await this.detailsLoading.waitFor();

                this.detailsLoading.reset();

                try {

                    this.setViewMode("details", true);

                    await PromiseUtils.delay(0);

                    detailsEl.innerHTML = "<span class = 'loading'><i class ='material-icons'>loop</i></span>";

                    document.getSelection().empty();

                    const mainData = <IGeoPlotViewModel>JSON.parse(await (await fetch(app.baseUrl + "AreaData/" + this.detailsArea().id)).text());
                    const mapData = await (await fetch(app.baseUrl + "AreaMap/" + this.detailsArea().id)).text();

                    detailsEl.innerHTML = mapData;

                    var svgMap = <HTMLElement>document.querySelector(".details-map svg");
                    svgMap.addEventListener("click", e => this.onMapClick(e, false));

                    svgMap.querySelector("#group_municipality").classList.add("active");

                    this._detailsData = mainData.data;
                    this._detailsGeo = mainData.geo;

                    this.setViewMode("details", true);
                }
                finally {

                    this.detailsLoading.set();
                }
            }
        }

        /****************************************/

        protected updateTopAreas() {

            this._daysData = [];

            for (let i = 0; i < this._calculator.data.days.length; i++) {

                const day = this._calculator.data.days[i];

                const item: IDayData = {};

                const isInArea = ViewModes[this.viewMode()].validateId;

                item.topAreas = linq(day.values).select(a => ({
                    factor: this.getFactorValue(i, a.key),
                    value: a
                }))
                    .orderByDesc(a => a.factor).where(a => isInArea(a.value.key)).select(a => {

                        const area = new AreaViewModel();

                        area.value = this._calculator.geo.areas[a.value.key.toLowerCase()];

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

            const day = this._calculator.data.days[this.dayNumber()];

            if (!day) {
                console.warn("No day data: " + this.dayNumber());
                return;
            }

            this.currentData(DateUtils.format(day.date, $string("$(date-format)")));

            this.updateMap();

            this.updateArea(this.currentArea());

            this.updateAreaIndicators();

            if (this._daysData && this._topAreasVisible)
                this.topAreas(this._daysData[this.dayNumber()].topAreas);

            this.updateUrl();
        }

        /****************************************/

        protected updateUrl() {
            if (!this._keepState)
                return;
            const state = this.saveStata();
            let url = app.baseUrl + "Overview";
            if (!this.isDefaultState(state))
                url += "?state=" + encodeURIComponent(btoa(JSON.stringify(state))) + "&keepState=true";
            history.replaceState(null, null, url);
        }

        /****************************************/

        protected clearMap() {

            const day = this._calculator.data.days[this.dayNumber()];

            if (!day || !day.values) {
                console.warn("No day data: " + this.dayNumber());
                return;
            }

            for (const key in day.values) {
                const element = document.getElementById(key.toUpperCase());
                if (element) {
                    //element.style.fillOpacity = "1";
                    element.style.removeProperty("fill");
                }
            }
        }

        /****************************************/

        protected updateMap() {

            if (!this.selectedIndicator() || !this.selectedFactor())
                return;


            if (this.viewMode() != "country") {

                const day = this._calculator.data.days[this.dayNumber()];

                var indicator = this.selectedIndicator();

                const gradient = indicator.gradient ? indicator.gradient : new LinearGradient("#fff", indicator.colorDark);

                for (const key in day.values) {
                    const element = document.getElementById(key.toUpperCase());
                    if (element) {

                        const area = this._calculator.geo.areas[key];

                        if (area.type != ViewModes[this.viewMode()].areaType)
                            continue;


                        let factor = this.getFactorValue(this.dayNumber(), area);
                        if (factor == Number.POSITIVE_INFINITY)
                            factor = NaN;

                        if (indicator.canBeNegative)
                            factor = 0.5 + (factor / (this.maxFactor() * 2));
                        else 
                            factor = factor / this.maxFactor();


                        factor = Math.min(1, Math.max(0, factor));

                        if (MathUtils.isNaNOrNull(factor)) {
                            if (element.classList.contains("valid"))
                                element.classList.remove("valid");
                            element.style.removeProperty("fill");
                        }
                        else {
                            if (!element.classList.contains("valid"))
                                element.classList.add("valid");
                             
                            let value: number;
                            if (!indicator.canBeNegative) 
                                value = MathUtils.discretize(MathUtils.exponential(factor), 20);
                            else
                                value = MathUtils.discretize(factor, 20);
                            element.style.fill = gradient.valueAt(value).toString();

                        }
                    }
                }
            }
            else if (this.viewMode() != "details") {
                linq(document.querySelectorAll(".main-map g.region")).foreach((element: HTMLElement) => {
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
        detailsLoading = new Signal(true);
        detailsArea = ko.observable<IGeoArea>();
        currentData = ko.observable<string>();
        currentArea = ko.observable<AreaViewModel>();
        topAreas = ko.observable<AreaViewModel[]>();
        viewMode = ko.observable<ViewMode>("district");
        selectedIndicator = ko.observable<IIndicator<TData>>();
        selectedFactor = ko.observable<IFactor<TData>>();
        autoMaxFactor = ko.observable<boolean>(true);
        maxFactor = ko.observable<number>();
        isPlaying = ko.observable(false);
        isLogScale = ko.observable<boolean>(false);
        isDayDelta = ko.observable<boolean>(false);
        isZoomChart = ko.observable<boolean>(false);
        isShowEnvData = ko.observable<boolean>(false);
        groupSize = ko.observable<number>(1);
        startDay = ko.observable<number>(0);
        tipManager: TipManager<IOverviewViewActions>; 
        isNoFactorSelected = ko.computed(() => this.selectedFactor() && this.selectedFactor().id == 'none');
        groupDays = [1, 2, 3, 4, 5, 6, 7];
        factorDescription = ko.observable<string>();
        indicators: KnockoutObservable<IIndicator<TData>[]>;
        factors: KnockoutObservable<IFactor<TData>[]>;        
        days: IGroupDay[];
    }
}
