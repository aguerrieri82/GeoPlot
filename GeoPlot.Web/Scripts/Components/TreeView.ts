namespace WebApp.GeoPlot {

    /****************************************/
    /* BaseTreeItem
    /****************************************/

    export class BaseTreeItem implements ITreeItem {

        constructor() { 
            this.canDrag = false;
        }

        /****************************************/

        canReadData(transfer: DataTransfer): boolean {
            return false;
        }

        /****************************************/

        readData(transfer: DataTransfer) {

        }

        /****************************************/

        writeData(transfer: DataTransfer): boolean {
            return false;
        }

        /****************************************/

        attachNode(node: TreeNode<ITreeItem>) {
            this.node = node;
        }

        /****************************************/

        remove(): void {

        }

        /****************************************/

        onParentChanged(): void {

        }

        /****************************************/

        canAccept(value: object): boolean {
            return false;
        }

        /****************************************/

        name = ko.observable<string>();
        color = ko.observable<string>();
        canDrag: boolean;
        itemType: string;
        icon: string;
        node: TreeNode<ITreeItem>;
    }

    /****************************************/
    /* ITreeItem
    /****************************************/

    export interface IDataTransferReader {
        canReadData(transfer: DataTransfer): boolean;
        readData(transfer: DataTransfer);
    }

    export interface IDataTransferWriter {
        writeData(transfer: DataTransfer): boolean;
    }

    export interface ITreeItem extends IDataTransferWriter, IDataTransferReader {

        attachNode(node: TreeNode<ITreeItem>);
        remove(): void;
        onParentChanged(): void;
        canAccept(value: object): boolean;

        name: KnockoutObservable<string>;
        color?: KnockoutObservable<string>;

        readonly canDrag: boolean;
        readonly itemType: string;
        readonly icon: string;
        readonly node: TreeNode<ITreeItem>;
    }

    /****************************************/
    /* ActionViewModel
    /****************************************/

    export class ActionView {
        execute() {

        }

        /****************************************/

        text: string;
        icon: string;
    }

    /****************************************/
    /* TreeNode
    /****************************************/

    export class TreeNode<T extends ITreeItem> {

        protected _treeView: TreeView<T>;
        protected _parentNode: TreeNode<T>;
        protected _element: HTMLElement;
        protected _dargEnterCount = 0;
        protected _childLoaded = false;

        constructor(value?: T) {


            this.value(value);

            this.isExpanded.subscribe(async value => {

                if (value && !this._childLoaded) {
                    await this.loadChildNodes();
                    this._childLoaded = true;
                }
            });

            this.isSelected.subscribe(a => {

                if (a)
                    this._treeView.select(this);
            });
        }

        /****************************************/

        async loadChildNodes() {

        }

        /****************************************/

        clear() {
            this._childLoaded = false;
            this.nodes.removeAll();
        }

        /****************************************/

        get element(): HTMLElement {
            return this._element;
        }

        /****************************************/

        attachNode(element: HTMLElement) {

            this._element = element;
            this._element.id = DomUtils.generateId();
            this._element["$model"] = this;

            this._element.addEventListener("keydown", ev => this.onKeyDown(ev));

            let header = <HTMLElement>this._element.querySelector("header");

            header.ondragstart = ev => this.onDrag(ev);
            header.ondragover = ev => this.onDragOver(ev);
            header.ondragenter = ev => this.onDragEnter(ev);
            header.ondragleave = ev => this.onDragLeave(ev);
            header.ondrop = ev => this.onDrop(ev);
        }


        /****************************************/

        protected onKeyDown(ev: KeyboardEvent) {

            if (ev.keyCode == 46 && (<HTMLElement>ev.target).tagName != "INPUT") {
                ev.preventDefault();
                if (this.isSelected())
                    this.value().remove();
            }
        }

        /****************************************/

        protected onDrag(ev: DragEvent) {

            if (!this.value().writeData(ev.dataTransfer) || !this.value().canDrag) {
                ev.preventDefault();
                return false;
            }
        }

        /****************************************/

        protected onDragEnter(ev: DragEvent) {
            this._dargEnterCount++;
        }

        /****************************************/

        protected onDragLeave(ev: DragEvent) {
            this._dargEnterCount--;
            if (this._dargEnterCount == 0)
                DomUtils.removeClass(this._element, "drop");
        }

        /****************************************/

        protected onDragOver(ev: DragEvent) {
            ev.preventDefault();

            if (this._dargEnterCount == 1) {

                let canDrop = true;

                if (!this.value().canReadData(ev.dataTransfer))
                    canDrop = false;

                if (canDrop) {
                    if (ev.ctrlKey)
                        ev.dataTransfer.dropEffect = "copy";
                    else
                        ev.dataTransfer.dropEffect = "move";

                    DomUtils.addClass(this._element, "drop");
                }
                else
                    ev.dataTransfer.dropEffect = "move";

            }
        }


        /****************************************/

        protected onDrop(ev: DragEvent) {
            ev.preventDefault();

            this._dargEnterCount = 0;

            DomUtils.removeClass(this._element, "drop");

            const elId = ev.dataTransfer.getData("text/html+id");

            if (elId) {

                const element = document.getElementById(elId);
                const node = <TreeNode<ITreeItem>>element["$model"];

                if (!this.value().canAccept(node.value()))
                    return;

                if (ev.ctrlKey) {

                }
                else {
                    if (node._parentNode == this)
                        return;
                    node._parentNode.nodes.remove(node);
                    node._parentNode = this;
                    this.nodes.push(<any>node);
                    this.isExpanded(true);
                    node.value().onParentChanged();
                    return;
                }
            }
            else
                this.value().readData(ev.dataTransfer);
        }

        /****************************************/

        remove() {

            if (this._parentNode)
                this._parentNode.nodes.remove(this);

            if (this._treeView.selectedNode() == this)
                this._treeView.select(null);
        }

        /****************************************/

        addNode(node: TreeNode<T>) {
            node.attach(this._treeView, this);
            this.nodes.push(node);
        }

        /****************************************/

        attach(treeView: TreeView<T>, parent?: TreeNode<T>) {
            this._treeView = treeView;
            this._parentNode = parent;
            for (let childNode of this.nodes())
                childNode.attach(treeView);
        }

        /****************************************/

        get parentNode(): TreeNode<T> {
            return this._parentNode;
        }

        /****************************************/

        toggleVisible() {
            this.isVisible(!this.isVisible());
        }

        /****************************************/

        select(expand = false) {
            this.isSelected(true);
            if (this._element)
                this._element.focus();
            if (expand) {
                let curNode: TreeNode<ITreeItem> = this;
                while (curNode) {
                    curNode.isExpanded(true);
                    curNode = curNode.parentNode;
                }
            }
        }

        /****************************************/

        expandCollapse() {
            this.isExpanded(!this.isExpanded());
        }

        /****************************************/

        nodes = ko.observableArray<TreeNode<T>>();
        value = ko.observable<T>();
        isSelected = ko.observable(false);
        isVisible = ko.observable(true);
        isExpanded = ko.observable(false);
        actions = ko.observable<ActionView[]>();
    }

    /****************************************/
    /* TreeView
    /****************************************/

    export class TreeView<T extends ITreeItem> {

        private _selectedNode: TreeNode<T>;

        /****************************************/

        select(node: TreeNode<T>) {

            if (this.selectedNode() == node)
                return;

            if (this.selectedNode())
                this.selectedNode().isSelected(false);

            this.selectedNode(node);

            if (this.selectedNode())
                this.selectedNode().isSelected(true);
        }

        /****************************************/

        setRoot(node: TreeNode<T>) {
            node.attach(this);
            this.root(node);
        }

        /****************************************/

        root = ko.observable<TreeNode<T>>();
        selectedNode = ko.observable<TreeNode<T>>();
    }
}