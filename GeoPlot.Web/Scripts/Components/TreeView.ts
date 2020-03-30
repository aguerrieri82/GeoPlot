namespace WebApp.GeoPlot {


    /****************************************/
    /* TreeViewModel
    /****************************************/

    export interface IDataTransferReader {
        canReadData(transfer: DataTransfer): boolean;
        readData(transfer: DataTransfer);
    }

    export interface IDataTransferWriter {
        writeData(transfer: DataTransfer): boolean;
    }

    export interface ITreeItem extends IDataTransferWriter, IDataTransferReader {

        attachNode(node: TreeNodeViewModel<ITreeItem>);
        remove(): void;
        onParentChanged(): void;
        canAccept(value: object): boolean;

        name: KnockoutObservable<string>;
        color?: KnockoutObservable<string>;

        readonly canDrag: boolean;
        readonly itemType: string;
        readonly icon: string;
        readonly node: TreeNodeViewModel<ITreeItem>;
    }

    /****************************************/

    export class ActionViewModel {
        execute() {

        }

        /****************************************/

        text: string;
        icon: string;
    }

    /****************************************/

    export class TreeNodeViewModel<T extends ITreeItem> {

        protected _treeView: TreeViewModel<T>;
        protected _parentNode: TreeNodeViewModel<T>;
        protected _element: HTMLElement;
        protected _dargEnterCount = 0;

        constructor(value?: T) {

            this.value(value);
            this.isSelected.subscribe(a => {

                if (a)
                    this._treeView.select(this);
            });
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

            let header = <HTMLElement>this._element.querySelector("header");

            header.ondragstart = ev => this.onDrag(ev);
            header.ondragover = ev => this.onDragOver(ev);
            header.ondragenter = ev => this.onDragEnter(ev);
            header.ondragleave = ev => this.onDragLeave(ev);
            header.ondrop = ev => this.onDrop(ev);
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
                const node = <TreeNodeViewModel<ITreeItem>>element["$model"];

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

        addNode(node: TreeNodeViewModel<T>) {
            node.attach(this._treeView, this);
            this.nodes.push(node);
        }

        /****************************************/

        attach(treeView: TreeViewModel<T>, parent?: TreeNodeViewModel<T>) {
            this._treeView = treeView;
            this._parentNode = parent;
            for (let childNode of this.nodes())
                childNode.attach(treeView);
        }

        /****************************************/

        get parentNode(): TreeNodeViewModel<T> {
            return this._parentNode;
        }

        /****************************************/

        toggleVisible() {
            this.isVisible(!this.isVisible());
        }

        /****************************************/

        toggleSelection() {
            this.isSelected(!this.isSelected());
        }

        /****************************************/

        expandCollapse() {
            this.isExpanded(!this.isExpanded());
        }

        /****************************************/

        nodes = ko.observableArray<TreeNodeViewModel<T>>();
        value = ko.observable<T>();
        isSelected = ko.observable(false);
        isVisible = ko.observable(true);
        isExpanded = ko.observable(false);
        actions = ko.observable<ActionViewModel[]>();
    }

    /****************************************/

    export class TreeViewModel<T extends ITreeItem> {

        private _selectedNode: TreeNodeViewModel<T>;

        /****************************************/

        select(node: TreeNodeViewModel<T>) {

            if (this.selectedNode() == node)
                return;

            if (this.selectedNode())
                this.selectedNode().isSelected(false);

            this.selectedNode(node);

            if (this.selectedNode())
                this.selectedNode().isSelected(true);
        }

        /****************************************/

        setRoot(node: TreeNodeViewModel<T>) {
            node.attach(this);
            this.root(node);
        }

        /****************************************/

        root = ko.observable<TreeNodeViewModel<T>>();
        selectedNode = ko.observable<TreeNodeViewModel<T>>();
    }
}