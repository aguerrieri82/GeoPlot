namespace WebApp {

    interface IShowTipOptions {
        onClose?: () => void;
        timeout?: number;
        override?: boolean;
        force?: boolean;
    }

    /****************************************/

    export interface IViewActionTip {
        html: string;
        featureName: string;
        elementSelector?: string;
        showAfter: number;
        showAction?: () => void;
        order: number;
    }

    /****************************************/

    export class TipViewModel {

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

        onActionExecuted() {

        }

        /****************************************/

        executeAction() {
            if (this.value.showAction)
                this.value.showAction();
            setTimeout(() => this.startPulse());
            this.onActionExecuted();
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

    export interface ITipPreferences<TActions extends Dictionary<number>> {
        showTips: boolean
        actions: TActions;
    }

    /****************************************/

    export class TipManager<TActions extends Dictionary<number>> {

        private _getPreferences: () => ITipPreferences<TActions>;

        private _tips: DictionaryOf<TActions, IViewActionTip>;

        constructor(tips: DictionaryOf<TActions, IViewActionTip>, getPreferences: () => ITipPreferences<TActions>, savePreferences: () => void) {

            this._getPreferences = getPreferences;
            this._tips = tips;            
            this.savePreferences = savePreferences;
        }

        /****************************************/

        get preferences(): ITipPreferences<TActions> {
            return this._getPreferences();
        }

        /****************************************/

        savePreferences() {

        }

        /****************************************/

        markAction(actionId: keyof TActions, label?: string) {

            this.preferences.actions[actionId]++;
            this.savePreferences();

            if (!window["gtag"])
                return;

            safeCall(() => gtag("event", actionId, {
                event_category: "GeoPlot",
                event_label: label,
                value: this.preferences.actions[actionId]
            }));
        }

        /****************************************/

        protected markTip(tipId: keyof TActions, action: string) {
            if (!window["gtag"])
                return;

            safeCall(() => gtag("event", action, {
                event_category: "GeoPlot/Tip",
                event_label: tipId
            }));
        }

        /****************************************/

        engageUser() {

            if (this.preferences.showTips != undefined && !this.preferences.showTips)
                return;

            const nextTip = linq(this._tips).where(a => a.value.showAfter > 0 && this.preferences.actions[a.key] == 0).first();

            if (!this.showTip(nextTip.key, {
                onClose: () => this.engageUser(),
                timeout: nextTip.value.showAfter,
            })) {
                this.engageUser();
            }

        }

        /****************************************/

        showTip(tipId: keyof TActions, options?: IShowTipOptions) {

            if (this.preferences.showTips != undefined && !this.preferences.showTips)
                return false;

            if ((!options || !options.override) && this.tip() && this.tip().isVisible())
                return false;

            if ((!options || !options.force) && this.preferences.actions[tipId])
                return false;

            const tip = this._tips[tipId];

            const model = new TipViewModel(tip);

            model.onActionExecuted = () => {
                this.markTip(tipId, "how");
            }

            model.dontShowAgain = () => {
                this.preferences.showTips = false;
                this.savePreferences();
                model.close();
                this.markTip(tipId, "dontShowAgain");
            }

            model.understood = () => {
                this.preferences.actions[tipId]++;
                this.savePreferences();
                model.close();
                this.markTip(tipId, "understood");
            };

            model.onClose = () => {
                //this.tip(null);
                if (options && options.onClose)
                    options.onClose();
            }

            let nextTip = linq(this._tips).where(a => a.value.order > tip.order && this.preferences.actions[a.key] == 0).first();

            if (nextTip) {
                model.next = () => {
                    model.close();
                    this.preferences.actions[tipId]++;
                    this.showTip(nextTip.key);
                    this.markTip(tipId, "next");
                }
            }
            else
                model.next = null;

            this.tip(model);

            setTimeout(() => model.show(), options && options.timeout ? options.timeout * 1000 : 0);

            return true;
        }

        tip = ko.observable<TipViewModel>();
    }  
}


