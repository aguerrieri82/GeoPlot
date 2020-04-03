/// <reference path="treeview.ts" />

namespace WebApp.GeoPlot {

    export interface IStudioItemConfig {
        name?: string;
        color?: string;
    }

    /****************************************/

    export interface IStudioItemState extends IStudioItemConfig {
        folderId?: string;
        visible?: boolean;
        opened?: boolean;
    }

    /****************************************/

    export abstract class BaseStudioItem<TState extends IStudioItemState, TParent extends ITreeItem & IGraphItem, TChild extends ITreeItem & IGraphItem> extends BaseTreeItem implements  IGraphItem {

        protected _graphCtx: GraphContext;
        protected _varsMap: IDictionary<string>;
        protected _isUpdating = 0;

        constructor() {
            super();
        }

        /****************************************/

        protected createActions(result: ActionView[]) {
            result.push(apply(new ActionView(), action => {
                action.text = $string("$(delete)");
                action.icon = "delete";
                action.execute = () => this.remove();
            }))

        }

        /****************************************/

        setState(state: TState) {

            this._isUpdating++;

            if (state.name)
                this.name(state.name);

            if (state.visible != undefined)
                this.node.isVisible(state.visible);

            if (state.color)
                this.color(state.color);

            if (state.opened != undefined)
                this.node.isExpanded(state.opened);

            if (state.folderId)
                this.folderId = state.folderId;

            this.setStateWork(state);

            this.updateGraph();

            this.setChildrenStateWork(state);

            this._isUpdating--;
        }

        /****************************************/

        getState(): TState {

            return <TState>{
                name: this.name(),
                visible: this.node.isVisible(),
                folderId: this.folderId,
                color: this.color(),
                opened: this.node.isExpanded()
            };
        }

        /****************************************/

        getVar(name: string): string {

            return this._varsMap[name];
        }

        /****************************************/

        remove(recursive = true) {

            if (this._graphCtx) {
                this._graphCtx.calculator.removeExpression({ id: this.getGraphId("private") });
                this._graphCtx.calculator.removeExpression({ id: this.getGraphId("public") });
            }
            this.node.remove();

            if (recursive)
                this.children.foreach(a => a.remove());
        }

        /****************************************/

        attachNode(node: TreeNode<ITreeItem>) {
            this.node = node;
            this.node.isVisible.subscribe(value => this.updateGraphVisibility());
            this.node.isSelected.subscribe(value => {
                if (value)
                    this.onSelected();
            })
            const actions: ActionView[] = [];
            this.createActions(actions);
            this.node.actions(actions);
        }

        /****************************************/

        attachGraph(ctx: GraphContext) {
            this._graphCtx = ctx;

            this._graphCtx.calculator.observe("expressionAnalysis", () => this.onGraphChanged());
            this.color.subscribe(value => this.updateColor());
        }

        /****************************************/

        isFullVisible(): boolean {
            let curNode = this.node;

            while (curNode) {
                if (!curNode.isVisible())
                    return false;
                curNode = curNode.parentNode;
            }
            return true;
        }

        /****************************************/

        updateGraphVisibility(recorsive = true): boolean {

            const visible = this.isFullVisible();

            this._graphCtx.setItemVisibile(this.getGraphId("public"), visible);
            this._graphCtx.setItemVisibile(this.getGraphId("private"), visible);

            if (recorsive)
                this.children.foreach(a => a.updateGraphVisibility());

            return visible;
        }

        /****************************************/

        updateGraph(recursive = true) {

            if (!this._graphCtx)
                return;

            if (!this.folderId)
                this.folderId = StringUtils.uuidv4();

            this._graphCtx.treeItems[this.folderId] = this;

            const values = this.getExpressions();

            this._graphCtx.setExpressions(values);

            this.updateGraphWork();

            this.updateGraphVisibility();

            this.updateParameters();

            if (recursive)
                this.children.foreach(a => a.updateGraph(recursive));
        }

        /****************************************/

        onParentChanged() {
            this.updateGraphVisibility();
        }

        /****************************************/

        get parent(): TParent {
            return <TParent>this.node.parentNode.value();
        }

        /****************************************/

        get children(): Linq<TChild> {
            return linq(this.node.nodes()).select(a => <TChild>a.value());
        }

        /****************************************/

        protected abstract setStateWork(state: TState);

        protected abstract getExpressions(): Desmos.Expression[];

        /****************************************/

        protected replaceVars(value: string): string {
            for (let item in this._varsMap) {
                const reg = new RegExp("\\$" + item, "g");
                value = value.replace(reg, this._varsMap[item]);
            }
            return value;
        }

        /****************************************/

        protected getGraphId(section: string) {
            return this.folderId + "/" + section;
        }

        /****************************************/

        protected addChildrenWork(value: TChild, updateGraph = true): TChild {

            const node = new TreeNode(value);

            this.node.addNode(node);

            value.attachNode(node);

            value.attachGraph(this._graphCtx);

            if (updateGraph)
                value.updateGraph();

            value.onParentChanged();

            return value;
        }

        /****************************************/

        protected createParameters(result: ParameterViewModel[]): boolean {
            return false;
        }

        /****************************************/

        protected updateParameters() {
            const values: ParameterViewModel[] = [];
            if (this.createParameters(values)) {
                this.parameters.removeAll();
                values.forEach(a => this.parameters.push(a));
            }
        }

        /****************************************/

        protected updateGraphWork() {

        }

        /****************************************/

        protected setChildrenStateWork(state: TState) {

        }

        /****************************************/

        protected onSelected() {
            if (this.mainExpression && this._graphCtx)
                this._graphCtx.setSelectedId(this.mainExpression);
        }

        /****************************************/

        protected onGraphChanged() {

        }

        /****************************************/

        protected updateColor() {

        }

        /****************************************/

        folderId: string;
        time = ko.observable(0);
        optionsTemplateName: string;
        parameters = ko.observableArray<ParameterViewModel>();
        readonly mainExpression: string;
    }
}