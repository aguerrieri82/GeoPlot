import { IInfectionData } from "../Data/InfectionDataSet";
import { IndicatorCalculator } from "../Indicators";
import { IFunctionPoint } from "../Types";
import { IDictionary, linq } from "../WebApp";
import { ITreeItem } from "./TreeView";

type TData = IInfectionData;

type GraphVarMap = IDictionary<string>;

export interface IGraphItem {

    attachGraph(ctx: GraphContext);
    updateGraphVisibility(recursive?: boolean);
    updateGraph(recursive?: boolean);
    folderId: string;
}

/****************************************/

export class GraphContext {

    setExpressions(values: Desmos.Expression[]) {

        const state = this.calculator.getState();

        for (let value of values) {

            const curExp = <Desmos.IFolderExpression>linq(state.expressions.list).first(a => a.id == value.id);
            if (!curExp)
                state.expressions.list.push(value);
            else {
                for (let prop of Object.getOwnPropertyNames(value))
                    curExp[prop] = value[prop];
            }
        }

        const groups = linq(state.expressions.list).where(a => a.type != "folder").groupBy(a => a.folderId ? a.folderId : "").toDictionary(a => a.key, a => a.values.toArray());

        const newList = [];

        for (let folder of linq(state.expressions.list).where(a => a.type == "folder")) {
            newList.push(folder);
            const items = groups[folder.id];
            if (items)
                for (let item of items)
                    newList.push(item);
        }

        const items = groups[""];
        if (items)
            for (let item of items)
                newList.push(item);

        state.expressions.list = newList;

        this.calculator.setState(state);
    }

    /****************************************/

    setSelectedId(id: string) {
        if (this.calculator.controller.listModel.selectedItem && this.calculator.controller.listModel.selectedItem.id == id)
            return;
        this.calculator.controller.dispatch({ type: "set-selected-id", id: id });
    }

    /****************************************/

    setColor(id: string, color: string) {
        this.calculator.controller.dispatch({ type: "set-item-color", id: id, color: color });
    }

    /****************************************/

    updateTable(id: string, values: IFunctionPoint[]) {
        const exp = <Desmos.ITableExpression>linq(this.calculator.getExpressions()).where(a => a.id == id).first();
        if (exp) {
            exp.columns[0].values = linq(values).select(a => a.x.toString()).toArray();
            exp.columns[1].values = linq(values).select(a => a.y.toString()).toArray();
            this.calculator.setExpression(exp);
        }
        /*

        this.calculator.setExpression({
            id: id,
            type: "table",
            columns: [
                {
                    values: linq(values).select(a => a.x.toString()).toArray()
                },
                {
                    values: linq(values).select(a => a.y.toString()).toArray(),
                    hidden: false
                },
            ]
        });*/
    }

    /****************************************/

    updateExpression(value: Desmos.Expression) {
        //const exp = <Desmos.IMathExpression>linq(this.calculator.getExpressions()).where(a => a.id == value.id).first();
        /*if (exp) {
            for (let prop of Object.getOwnPropertyNames(value))
                exp[prop] = value[prop];
            this.calculator.setExpression(exp);
        }*/
        this.calculator.setExpression(value);
    }

    /****************************************/

    updateVariable(id: string, varName, value: number) {
        if (!varName)
            return;
        this.updateExpression(<Desmos.IMathExpression>{ id: id, latex: varName + "=" + value.toString() });
    }

    /****************************************/

    expressionZoomFit(id: string) {
        this.calculator.controller.dispatch({ type: "expression-zoom-fit", id: id });
    }

    /****************************************/

    setItemVisibile(id: string, value: boolean) {
        this.updateExpression(<any>{ id: id, hidden: !value });
        //this.calculator.controller._setItemHidden(id, !value);
        //this.calculator.updateSettings({});
    }

    /****************************************/

    generateVars(map: GraphVarMap) {

        for (let key in map) {
            if (!map[key])
                map[key] = this.generateVar(key);
        }
    }

    /****************************************/

    generateVar(prefix = "a"): string {
        if (!this.vars[prefix[0]])
            this.vars[prefix[0]] = 0;
        this.vars[prefix[0]]++;
        return prefix[0] + "_{" + this.vars[prefix[0]] + "}";
    }

    /****************************************/

    serieCalculator: IndicatorCalculator<TData>;
    calculator: Desmos.IGraphingCalculator;
    vars: IDictionary<number> = {};
    treeItems: IDictionary<ITreeItem> = {};
}
