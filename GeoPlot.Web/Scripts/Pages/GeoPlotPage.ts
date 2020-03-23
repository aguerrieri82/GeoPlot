namespace WebApp {

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
    }

    /****************************************/

    interface IViewActionTip {
        html: string;
        featureName: string;
        elementSelector?: string;
        showAfter: number;
        showAction?: () => void;
        order: number;
    }

    /****************************************/

    interface IViewActions<T> extends IDictionary<T> {
        areaSelected: T;
        indicatorChanged: T;
        indicatorSelected: T;
        dayChanged: T;
        viewChanged: T;
        groupChanged: T;
        scaleChanged: T;
        topAreasOpened: T;
        chartActionExecuted: T;
        factorChanged: T;
        maxFactorChanged: T;
        deltaSelected: T;
        regionExcluded: T;
    }

    /****************************************/

    interface IViewPreferences {
        isFirstView: boolean;
        showTips: boolean;
        actions: IViewActions<number>;
        version: number;
    }

    /****************************************/

    interface IShowTipOptions {
        onClose?: () => void;
        timeout?: number;
        override?: boolean;
        force?: boolean;
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

    class TipViewModel {

        private _closeTimeoutId: number;
        private _element: HTMLElement;
        private _closeAfter: number;

        constructor(value: IViewActionTip, closeAfter?: number) {
            this.value = value;
            this._closeAfter = closeAfter;
        }

        /****************************************/

        dontShowAgain() {

        }

        /****************************************/

        executeAction() {
            if (this.value.showAction)
                this.value.showAction();
            setTimeout(() => this.startPulse());
        }

        /****************************************/

        startPulse() {
            this._element = document.querySelector(this.value.elementSelector);
            if (!this._element)
                return;
            let relY = DomUtils.centerElement(this._element);

            DomUtils.addClass(this._element, "pulse")

            let tipElement = document.querySelector(".tip-container");
            if (relY < (tipElement.clientTop + tipElement.clientHeight))
                this.isTransparent(true);
        }

        /****************************************/

        stopPulse() {

            if (!this._element)
                return;
            DomUtils.removeClass(this._element, "pulse");
            this.isTransparent(false);
        }

        /****************************************/

        next() {

        }

        /****************************************/

        understood() {
        }

        /****************************************/

        onClose() {

        }

        /****************************************/

        close() {
            clearTimeout(this._closeTimeoutId);
            this.stopPulse();
            this.isVisible(false);
            this.onClose();
        }

        /****************************************/

        show() {
            if (this._closeTimeoutId)
                clearTimeout(this._closeTimeoutId);
            this.isVisible(true);
            if (this._closeAfter)
                this._closeTimeoutId = setTimeout(() => this.close(), this._closeAfter);
        }

        /****************************************/

        value: IViewActionTip;
        isVisible = ko.observable(false);
        isTransparent = ko.observable(false);
    }



    /****************************************/

    export class GeoPlotPage {

        private readonly _data: IDayAreaDataSet<TData>;
        private readonly _geo: IGeoAreaSet;
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
        
        private _tips: IViewActions<IViewActionTip> = {
            areaSelected: {
                order: 0,
                featureName: "Zone",
                html: "Puoi vedere i dati relativi ad una particolare area selezionadoli sulla mappa.",
                elementSelector: ".card-map .center-align",
                showAfter: 3,
                showAction: () => {
                    this.viewMode("region");
                    this.selectedArea = this._geo.areas["r10"];
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
                html: "Puo cambiare da scala logaritmica a scala lineare.",
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
                    this._execludedArea.set("R8", this._geo.areas["r8"]);
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
            }
        };

        constructor(model: IGeoPlotViewModel) {

            this._data = model.data;
            this._geo = model.geo;
            this._debugMode = model.debugMode;

            this.totalDays(this._data.days.length - 1);

            this.dayNumber.subscribe(value => {
                if (value != this._data.days.length - 1)
                    this._preferences.actions.dayChanged++;
                this.updateDayData();
                this._specialDates.current.date = new Date(this._data.days[value].date);
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
                this._preferences.actions.topAreasOpened++;
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


            this.selectedIndicator.subscribe(value => {
                if (!value)
                    return;
                this.updateIndicator();
                if (value.id != "totalPositive")
                    this._preferences.actions.indicatorChanged++;
            });

            this.selectedFactor.subscribe(value => {
                if (!value)
                    return;
                this.updateIndicator();
                if (value.id != "none")
                    this._preferences.actions.factorChanged++;
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
                if (!this.autoMaxFactor()) {
                    this.updateMap();
                    this._preferences.actions.maxFactorChanged++;
                }
                this.updateUrl();
            });

            this.isDayDelta.subscribe(value => {
                this.computeStartDayForGroup();
                this.updateIndicator();
                if (value)
                    this._preferences.actions.deltaSelected++;

            });

            this.isLogScale.subscribe(value => {
                this.updateChart();
                this.updateUrl();
                if (value)
                    this._preferences.actions.scaleChanged++;
            });

            this.isZoomChart.subscribe(value => {
                this.updateChart();
            });

            this.groupSize.subscribe(value => {
                this.computeStartDayForGroup();
                this.updateChart();
                this.updateUrl();
                if (value > 1)
                    this._preferences.actions.groupChanged++;
            });

            this.startDay.subscribe(value=> {
                this.updateChart();
                this.updateUrl();
            });

            const urlParams = new URLSearchParams(window.location.search);
            const stateRaw = urlParams.get("state");
            this._keepState = urlParams.get("keepState") == "true";

            this.loadPreferences();

            this.engageUser();

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

        protected engageUser() {

            if (this._preferences.showTips != undefined && !this._preferences.showTips)
                return;

            const nextTip = linq(this._tips).where(a => a.value.showAfter > 0 && this._preferences.actions[a.key] == 0).first();

            if (!this.showTip(nextTip.key, {
                onClose: () => this.engageUser(),
                timeout: nextTip.value.showAfter,
            })) {
                this.engageUser();
            }

        }

        /****************************************/

        protected showTip(tipId: keyof IViewActions<IViewActionTip>, options?: IShowTipOptions) {

            if (this._preferences.showTips != undefined && !this._preferences.showTips)
                return false;

            if (options && !options.override && this.tip() && this.tip().isVisible())
                return false;

            if (options && !options.force && this._preferences.actions[tipId])
                return false;

            const tip = this._tips[tipId];

            const model = new TipViewModel(tip);

            model.dontShowAgain = () => {
                this._preferences.showTips = false;
                this.savePreferences();
                model.close();
            }

            model.understood = () => {
                this._preferences.actions[tipId]++;
                this.savePreferences();
                model.close();
            };

            model.onClose = () => {
                //this.tip(null);
                if (options && options.onClose)
                    options.onClose();
            }

            let nextTip = linq(this._tips).where(a => a.value.order > tip.order && this._preferences.actions[a.key] == 0).first();

            if (nextTip) {
                model.next = () => {
                    model.close();
                    this._preferences.actions[tipId]++;
                    this.showTip(nextTip.key);
                }
            }
            else 
                model.next = null;

            this.tip(model);

            setTimeout(() => model.show(), options && options.timeout ? options.timeout * 1000 : 0);

            return true;
        }

        /****************************************/

        protected isDefaultState(state: IPageState) {
            return (!state.day || state.day == this._data.days.length - 1) &&
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
                (!state.excludedArea);
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

            this.dayNumber(state.day != undefined ? state.day : this._data.days.length - 1);

            if (state.excludedArea) {
                this._execludedArea.clear();
                for (let areaId of state.excludedArea)
                    this._execludedArea.set(areaId, this._geo.areas[areaId.toLowerCase()]);
            }

            if (state.indicator)
                this.selectedIndicator(linq(this._dataSet.indicators).first(a => a.id == state.indicator));

            if (state.factor)
                this.selectedFactor(linq(this._dataSet.factors).first(a => a.id == state.factor));

            if (state.area)
                this.selectedArea = this._geo.areas[state.area.toLowerCase()];
        }

        /****************************************/

        saveStata(): IPageState {

            return {
                view: this.viewMode() == "region" ? undefined : this.viewMode(),
                indicator: this.selectedIndicator() ? this.selectedIndicator().id : undefined,
                factor: this.selectedFactor() ? this.selectedFactor().id : undefined,
                dayDelta: this.isDayDelta() ? true : undefined,
                maxFactor: this.autoMaxFactor() ? undefined : this.maxFactor(),
                day: this.dayNumber() == this._data.days.length - 1 ? undefined : this.dayNumber(),
                area: this.selectedArea ? this.selectedArea.id : undefined,
                groupSize: this.groupSize() == 1 ? undefined : this.groupSize(),
                startDay: this.startDay() == 0 ? undefined : this.startDay(),
                logScale: this.isLogScale() ? true : undefined,
                excludedArea: this._execludedArea.size > 0 ? linq(this._execludedArea.keys()).toArray() : undefined,
                showEnvData: this.isShowEnvData() ? true : undefined
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
                        M.toast({ html: "Mappa copiata negli appunti." })
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
                M.toast({ html: "Funzionalità non supportata, download in corso." })
            }
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
            this._preferences.actions.chartActionExecuted++;
        }

        /****************************************/

        async copySerie() {

            const data = <{ x: Date, y: number }[]>this._chart.data.datasets[0].data;
            let text = "";
            for (let i = 0; i < data.length; i++)
                text += DateUtils.format(data[i].x, "{YYYY}-{MM}-{DD}") + "\t" + i + "\t" + MathUtils.round(data[i].y, 1) + "\n";

            DomUtils.copyText(text);

            M.toast({ html: "Serie copiata sugli appunti." })
            this._preferences.actions.chartActionExecuted++;
        }

        /****************************************/

        play() {
            if (this.dayNumber() == this._data.days.length - 1)
                this.dayNumber(0);
            this.isPlaying(true);
            this.nextFrame();
        }

        /****************************************/

        pause() {
            this.isPlaying(false);
        }

        /****************************************/

        setViewMode(mode: ViewMode) {

            if (mode != "region")
                this._preferences.actions.viewChanged++;
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
                this.showTip("regionExcluded", { timeout: 5 });
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

            const areaId = (typeof areaOrId == "string" ? areaOrId : areaOrId.id).toLowerCase();

            const dataAtDay = (number: number, curAreaId: string) =>
                number < 0 ? undefined : this._data.days[number].values[curAreaId];

            if (!Array.isArray(dayNumberOrGroup))
                dayNumberOrGroup = [dayNumberOrGroup];

            let main: TData[] = [];
            let delta: TData[] = [];
            let exMain: TData[][] = [];
            let exDelta: TData[][] = [];

            for (var dayNumber of dayNumberOrGroup) {

                main.push(dataAtDay(dayNumber, areaId));

                if (this.isDayDelta())
                    delta.push(dataAtDay(dayNumber - 1, areaId));

                if (this._execludedArea.size > 0) {
                    var curExMain = [];
                    var curExDelta = [];
                    this._execludedArea.forEach(a => {
                        curExMain.push(dataAtDay(dayNumber, a.id.toLowerCase()));
                        if (this.isDayDelta())
                            curExDelta.push(dataAtDay(dayNumber - 1, a.id.toLowerCase()));
                    });
                    exMain.push(curExMain)
                    exDelta.push(curExDelta)
                }
            }

            return this.selectedFactor().compute.value(main, delta, exMain, exDelta, this._geo.areas[areaId], this.selectedIndicator().compute);
        }

        /****************************************/

        protected getIndicatorValue(dayNumber: number, areaOrId: string | IGeoArea, indicatorId: keyof TData | string): number {

            const areaId = (typeof areaOrId == "string" ? areaOrId : areaOrId.id).toLowerCase();

            const indicator = linq(this._dataSet.indicators).first(a => a.id == indicatorId);

            const dataAtDay = (number: number, curAreaId: string) =>
                number < 0 ? undefined : this._data.days[number].values[curAreaId];


            let main = dataAtDay(dayNumber, areaId);
            let delta: TData;
            let exMain: TData[];
            let exDelta: TData[];

            if (this.isDayDelta())
                delta = dataAtDay(dayNumber - 1, areaId);

            if (this._execludedArea.size > 0) {
                exMain = [];
                exDelta = [];
                this._execludedArea.forEach(a => {
                    exMain.push(dataAtDay(dayNumber, a.id.toLowerCase()));
                    if (this.isDayDelta())
                        exDelta.push(dataAtDay(dayNumber - 1, a.id.toLowerCase()));
                });
            }

            return indicator.compute.value(main, delta, exMain, exDelta, this._geo.areas[areaId]);
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

        private onMapClick(e: MouseEvent) {
            const item = <SVGPolygonElement>e.target;
            const areaId = item.parentElement.id;
            const area = this._geo.areas[areaId.toLowerCase()];
            if (!area)
                return;

            if (this.viewMode() == "country") {
                if (this._execludedArea.has(areaId))
                    this._execludedArea.delete(areaId);
                else {
                    this._execludedArea.set(areaId, area);
                    M.toast({ html: "Regione " + area.name + " esclusa dai conteggi." });
                }
                this.updateIndicator();
            }
            else {
                if (item.parentElement.classList.contains(this.viewMode()))
                    this.selectedArea = area;
            }

            this._preferences.actions.areaSelected++;
        }

        /****************************************/

        protected nextFrame() {

            if (!this.isPlaying())
                return;

            if (this.dayNumber() >= this._data.days.length - 1)
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
                    let item = new IndicatorViewModel();
                    item.indicator = indicator;
                    item.select = () => {
                        this._preferences.actions.indicatorSelected++;
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
                desc = "Nuovi ";

            desc += this.selectedFactor().description.replace("[indicator]", this.selectedIndicator().name);
            if (this.currentArea())
                desc += " - " + this.currentArea().value.name;

            if (this._execludedArea.size > 0) {
                desc += " - Escluso (";
                let i = 0;
                for (let key of this._execludedArea.keys()) {
                    if (i > 0)
                        desc += ", ";
                    desc += this._execludedArea.get(key).name;
                    i++;
                }
                desc += ")";
            }

            this.factorDescription(desc);
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

            for (let i = 0; i < this._data.days.length; i++) {
                const day = this._data.days[i];
                for (let areaId in day.values) {
                    if (!curView.validateId(areaId))
                        continue;
                    const factor = this.getFactorValue(i, areaId);
                    if (factor > result && factor != Number.POSITIVE_INFINITY)
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

            this._chart.data.datasets[0].label = this.factorDescription();
            this._chart.options.title.text = this._chart.data.datasets[0].label;

            if (this.isLogScale())
                this._chart.options.scales.yAxes[0].type = "logarithmic";
            else
                this._chart.options.scales.yAxes[0].type = "linear";

            this._chart.data.datasets[0].borderColor = this.selectedIndicator().colorDark;
            this._chart.data.datasets[0].backgroundColor = this.selectedIndicator().colorLight;

            this._chart.data.datasets[0].data = [];

            if (this.groupSize() > 1) {

                let count = this.groupSize();
                let group: number[] = [];
                for (let i = 0 + this.startDay(); i < this._data.days.length; i++) {
                    group.push(i);
                    count--;
                    if (count == 0) {
                        const item: Chart.ChartPoint = {
                            x: new Date(this._data.days[i].date),
                            y: this.getFactorValue(group, area)
                        };
                        this._chart.data.datasets[0].data.push(<any>item);
                        count = this.groupSize();
                        group = [];
                    }
                }
            }
            else {
                for (let i = 0 + this.startDay(); i < this._data.days.length; i++) {

                    const item: Chart.ChartPoint = {
                        x: new Date(this._data.days[i].date),
                        y: this.getFactorValue(i, area)
                    };
                    this._chart.data.datasets[0].data.push(<any>item);
                }
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

            value.indicator(this.getIndicatorValue(dayNumber, id, this.selectedIndicator().id));

            value.factor(MathUtils.round(this.getFactorValue(dayNumber, area), 1));

            value.reference(this.selectedFactor().reference(day.values[id], area));

        }

        /****************************************/

        protected updateTopAreas() {

            this._daysData = [];

            for (let i = 0; i < this._data.days.length; i++) {

                const day = this._data.days[i];

                const item: IDayData = {};

                const isInArea = ViewModes[this.viewMode()].validateId;

                item.topAreas = linq(day.values).select(a => ({
                    factor: this.getFactorValue(i, a.key),
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

                const gradient = new LinearGradient("#fff", this.selectedIndicator().colorDark);

                for (const key in day.values) {
                    const element = document.getElementById(key.toUpperCase());
                    if (element) {

                        const area = this._geo.areas[key];

                        if (area.type != ViewModes[this.viewMode()].areaType)
                            continue;

                        let factor = this.getFactorValue(this.dayNumber(), area);
                        if (factor == Number.POSITIVE_INFINITY)
                            factor = NaN;

                        factor = Math.min(1, factor / this.maxFactor());

                        if (isNaN(factor)) {
                            if (element.classList.contains("valid"))
                                element.classList.remove("valid");
                            element.style.fillOpacity = "1";
                            element.style.removeProperty("fill");
                        }
                        else {
                            if (!element.classList.contains("valid"))
                                element.classList.add("valid");
                            const value = MathUtils.discretize(MathUtils.exponential(factor), 20);
                            //element.style.fillOpacity = value.toString();
                            element.style.fill = gradient.valueAt(factor).toString();

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
        isNoFactorSelected = ko.computed(() => this.selectedFactor() && this.selectedFactor().id == 'none');
        groupDays = [1, 2, 3, 4, 5, 6, 7];
        tip = ko.observable<TipViewModel>();
        factorDescription = ko.observable<string>();
        indicators: KnockoutObservable<IIndicator<TData>[]>;
        factors: KnockoutObservable<IFactor<TData>[]>;
        days: IGroupDay[];
    }
}