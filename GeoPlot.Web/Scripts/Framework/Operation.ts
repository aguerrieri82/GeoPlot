namespace WebApp.GeoPlot {

    class BaseOperation implements IOperation {

        private _progress: IOperationProgress;
        private _type: OperationType;

        /****************************************/

        constructor(config: IOperationConfig) {

            if (!config.type)
                this._type = OperationType.Global;
            else
                this._type = config.type;

            this.parentOperation = config.parentOperation;
        }

        /****************************************/

        end(): void {
            Operation.end(this);
        }

        /****************************************/

        get type(): OperationType {
            return this._type;
        }

        /****************************************/

        get progress(): IOperationProgress {
            return this._progress;
        }

        /****************************************/

        set progress(value: IOperationProgress) {

            this._progress = value;

            if (this._progress) {

                console.log(this.getProgressDescription(this._progress));

                if (this._progress.message)
                    this.message = this._progress.message;

                Operation.onProgress.raise(this, { operation: this, progress: value });
            }
            else
                this.message = undefined;
        }

        /****************************************/

        addSubOperation(op: IOperation) {

        }
        /****************************************/

        removeSubOperation(op: IOperation) {

        }

        /****************************************/

        getProgressDescription(value: IOperationProgress): string {

            let msg = "Progress (" +  this.message + "): ";

            if (value.message)
                msg += "'" + value.message + "'";

            if (value.current != null && value.totCount != null)
                msg += " - " + value.current + "/" + value.totCount + " (" + Math.round(100 / value.totCount * value.current) + "%)";
            else if (value.current != null)
                msg +=  value.current;

            return msg;
        }

        /****************************************/

        message: LocalString = null;

        parentOperation: IOperation = null;
    }

    /****************************************/

    export class BaseOperationManager implements IOperationManager {

        private _oprations: IOperation[] = [];

        progress(progress: IOperationProgress | string) {

            if (ObjectUtils.isString(progress))
                progress = <IOperationProgress>{ message: progress };

            if (this.current)
                this.current.progress = <IOperationProgress>progress;
        }

        /****************************************/

        begin(configOrMessge: IOperationConfig | string): IOperation {

            if (ObjectUtils.isString(configOrMessge))
                configOrMessge = <IOperationProgress>{ message: configOrMessge };

            let operation = new BaseOperation(configOrMessge);

            console.group("Begin operation: ", $string(<string>operation.message ?? ""));

            operation.progress = configOrMessge;

            if (operation.parentOperation === undefined) 
                operation.parentOperation = this.current;

            this._oprations.push(operation);

            if (!operation.parentOperation) {

                if (operation.type == OperationType.Global) {

                }
            }
            else
                operation.parentOperation.addSubOperation(operation);

            this.onBegin.raise(this, operation);

            return operation;
        }

        /****************************************/
         
        end(operation: IOperation) {

            console.groupEnd();

            console.log("End operation: ", $string(<string>operation.message ?? ""));

            const index = this._oprations.indexOf(operation);
            this._oprations.splice(index, 1);

            if (operation.parentOperation)
                operation.parentOperation.removeSubOperation(operation);
            else {
                if (operation.type == OperationType.Global) {
                }
            }
            this.onEnd.raise(this, operation);
        }

        /****************************************/

        get current(): IOperation {
            return this._oprations.length > 0 ? this._oprations[this._oprations.length - 1] : null;
        }

        /****************************************/

        get operations(): Iterable<IOperation> {
            return this._oprations;
        }

        /****************************************/

        readonly onBegin = event<IOperation>();
        readonly onEnd = event<IOperation>();
        readonly onProgress = event<{ operation: IOperation, progress: IOperationProgress }>();
    }

    /****************************************/
}

namespace WebApp {

    export var Operation: IOperationManager = new GeoPlot.BaseOperationManager();
}