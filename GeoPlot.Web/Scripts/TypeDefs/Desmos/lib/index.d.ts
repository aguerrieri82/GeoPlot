
declare namespace Desmos {

    /****************************************/
    /* TYPES
    /****************************************/

    type Expression = IMathExpression | IFolderExpression | ITableExpression;

    type LatexString = string | number;

    type HexColor = string;

    type EnumValue = string;

    type AxisArrowMode = EnumValue;

    type Style = EnumValue;

    type DragMode = EnumValue;

    type LabelSize = EnumValue;

    type LabelOrientation = EnumValue;

    type MathBounds = "top" | "bottom" | "left" | "right";

    /****************************************/
    /* FUNCTIONS
    /****************************************/

    function GraphingCalculator(element: HTMLElement, options?: IGraphingCalculatorOptions): IGraphingCalculator;

    /****************************************/
    /* CLASSES
    /****************************************/

    interface IGraphingCalculator extends IObservable<IGraphingCalculatorObservableMap> {
        getState(): IGraphState;
        setState(value: IGraphState, options?: ISetStateOptions): void;
        setDefaultState(value: IGraphState): void;
        setBlank(): void;
        undo(): void;
        redo(): void;
        clearHistory(): void;
        resize(): void;
        setMathBounds(bounds: MathBounds): void;
        screenshot(options?: IScreenshotOptions): void;
        asyncScreenshot(options?: IAsyncScreenshotOptions, callback?: (data: string) => void): void;
        observeEvent<K extends keyof IEventHandlerMap>(type: K, handler?: IEventHandlerMap[K]): void;
        unobserveEvent(type: keyof IEventHandlerMap): void;
        setExpression(state: Expression): void;
        HelperExpression(state: Expression): IHelperExpression;
        removeExpression(state: IExpressionReference): void;
        expressionAnalysis(): { [id: string]: IExpressionAnalysis };
        getExpressions(): Expression[];
        updateSettings(settings: IGraphingCalculatorOptions): void;
        graphpaperBounds(): IGraphBounds;
        mathToPixels(point: IPoint): IPoint;
        pixelsToMath(point: IPoint): IPoint;
        readonly settings: IObservable<IGraphingCalculatorOptions>;
    }

    interface IObservable<T> {
        observe(property: keyof T, handler: () => void): void;
        unobserve(property: keyof T): void;
    }

    /****************************************/
    /* EXPRESSIONS
    /****************************************/

    interface IExpressionReference {
        id: string;
    }

    interface IBaseExpression {
        type: string;
        id?: string;
        folderId?: string;
    }

    interface ITextExpression extends IBaseExpression {
        type: "text";
        text?: string;
    }

    interface ITableExpression extends IBaseExpression {
        type: "table";
        columns: ITableColumn[];
    }

    interface IFolderExpression extends IBaseExpression {
        type: "folder";
        title?: string;
        collapsed?: boolean;
        hidden?: boolean;
        secret?: boolean;
    }

    interface ITableColumn extends IBaseExpressionProperties {
        values?: LatexString[];
    }

    interface IBaseExpressionProperties {

        latex?: string;
        color?: HexColor;
        hidden?: boolean;
        pointStyle?: Style;
        lineStyle?: Style;
        points?: boolean;
        lines?: boolean;
        dragMode?: DragMode;
    }

    interface IMathExpression extends IBaseExpression, IBaseExpressionProperties {
        type: "expression";
        fillOpacity?: number;
        fill?: boolean;
        secret?: boolean;
        sliderBounds?: ISliderBounds;
        parametricDomain?: IDomain;
        polarDomain?: IDomain;
        label?: string;
        showLabel?: boolean;
        labelSize?: LabelSize;
        labelOrientation?: LabelOrientation;
    }

    /****************************************/
    /* MAPS
    /****************************************/

    interface IGraphingCalculatorObservableMap {
        expressionAnalysis: any;
        graphpaperBounds: any;
    }

    interface IEventHandlerMap {
        "change": () => void;
        "graphReset": () => void;
    }

    /****************************************/
    /* ENTITIES
    /****************************************/

    interface IGraphState {
        degreeMode?: boolean;
        showGrid?: boolean;
        polarMode?: boolean;
        showXAxis?: boolean;
        showYAxis?: boolean;
        xAxisNumbers?: boolean;
        yAxisNumbers?: boolean;
        polarNumbers?: boolean;
        xAxisStep?: number;
        yAxisStep?: number;
        xAxisMinorSubdivisions?: number;
        yAxisMinorSubdivisions?: number;
        xAxisArrowMode?: AxisArrowMode;
        yAxisArrowMode?: AxisArrowMode;
        xAxisLabel?: string;
        yAxisLabel?: string;
        randomSeed?: string;
        expressions?: { list: Expression[] };
    }

    interface IGraphBounds {
        mathCoordinates: IRect;
        pixelCoordinates: IRect;
    }

    interface IPoint {
        x: number;
        y: number;
    }

    interface IRect {
        top: number;
        bottom: number;
        left: number;
        right: number;
        width: number;
        height: number;
    }

    interface IExpressionAnalysis {
        isGraphable: boolean;
        isError: boolean;
        errorMessage?: string;
        evaluationDisplayed?: boolean;
        evaluation?: { type: 'Number', value: Number } | { type: 'ListOfNumber', value: Number[] };
    }

    interface IHelperExpression extends IObservable<IHelperExpression> {
        numeriValue?: number;
        numericValue?: number[];
    }


    interface IDomain {
        min?: number;
        max?: number;
    }

    interface ISliderBounds extends IDomain {
        step?: number;
    }

    /****************************************/
    /* ENUMS
    /****************************************/

    var LabelSizes: {
        SMALL: LabelSize,
        MEDIUM: LabelSize,
        LARGE: LabelSize,
    }

    var LabelOrientations : {
        ABOVE: LabelOrientation,
        BELOW: LabelOrientation,
        LEFT: LabelOrientation,
        RIGHT: LabelOrientation,
        DEFAULT: LabelOrientation,
    }

    var DragModes: {
        X: DragMode,
        Y: DragMode,
        XY: DragMode,
        NONE: DragMode,
    }

    var AxisArrowModes: {
        NONE: AxisArrowMode,
        POSITIVE: AxisArrowMode,
        BOTH: AxisArrowMode
    }

    var Styles: {
        POINT: Style,
        OPEN: Style,
        CROSS: Style,
        SOLID: Style,
        DASHED: Style,
        DOTTED: Style
    }

    /****************************************/
    /* OPTIONS
    /****************************************/

    interface IScreenshotOptions {
        width?: number;
        height?: number;
        targetPixelRatio?: number;
        preserveAxisNumbers?: boolean;
    }

    interface IAsyncScreenshotOptions extends IScreenshotOptions {
        mode?: "contain" | "stretch" | "preserveX" | "preserveY";
        mathBounds?: MathBounds;
        showLabels?: boolean;
    }

    interface ISetStateOptions {
        allowUndo?: boolean;
        remapColors?: boolean;
    }  

    interface IGraphingCalculatorOptions extends IGraphState {
        keypad?: boolean;
        graphpaper?: boolean;
        expressions?: boolean;
        settingsMenu?: boolean;
        zoomButtons?: boolean;
        showResetButtonOnGraphpaper?: boolean;
        expressionsTopbar?: boolean;
        pointsOfInterest?: boolean;
        trace?: boolean;
        border?: boolean;
        lockViewport?: boolean;
        expressionsCollapsed?: boolean;
        capExpressionSize?: boolean;
        administerSecretFolders?: boolean;
        images?: boolean;
        imageUploadCallback?: (file: File, onError?: (error: string, url: string) => void) => void;
        folders?: boolean;
        notes?: boolean;
        sliders?: boolean;
        links?: boolean;
        qwertyKeyboard?: boolean;
        distributions?: boolean;
        restrictedFunctions?: boolean;
        restrictGridToFirstQuadrant?: boolean;
        pasteGraphLink?: boolean;
        pasteTableData?: boolean;
        clearIntoDegreeMode?: boolean;
        colors?: HexColor[];
        autosize?: boolean;
        plotInequalities?: boolean;
        plotImplicits?: boolean;
        plotSingleVariableImplicitEquations?: boolean;
        projectorMode?: boolean;
        decimalToFraction?: boolean;
        fontSize?: number;
        invertedColors?: boolean;
        language?: boolean;
        authorIDE?: boolean;
        advancedStyling?: boolean;


    }

}

export = Desmos;
export as namespace Desmos;