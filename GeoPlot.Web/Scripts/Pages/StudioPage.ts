namespace WebApp {

    export class StudioPage {

        private _calculator: Desmos.IGraphingCalculator;

        constructor() {

            this._calculator = Desmos.GraphingCalculator(document.getElementById("calculator"), {
                xAxisArrowMode: Desmos.AxisArrowModes.BOTH,
                pasteGraphLink: true,
                administerSecretFolders: true
            });
            this._calculator.setExpression({
                id: "xxx",
                type: "table", columns: [{
                    latex: "x_{1}",
                    values: [0, 1, 2, 3]
                }, {
                        latex: "y_{1}",
                    lines: true,
                    points: true,
                    values: [10, 12, 25, 11] 
                }]
            })

        } 

        /****************************************/

        test() {
            let state = this._calculator.getState();
        }
    }
}