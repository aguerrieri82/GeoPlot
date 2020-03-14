namespace GeoPlot {

    interface IDistrictData {
        totalPositive: number;
        totalPopulation: number;
    }

    interface IInfectionDayGroup<TValue>
    {
        data: string;
        values: IDictionary<TValue>;
    }

    interface IDistrictSet<TValue>  {
        days: IInfectionDayGroup<TValue>[];
        max: TValue;
        maxFactor: number;
    }

    /****************************************/

    export class PlotPage {

        _data: IDistrictSet<IDistrictData>;

        constructor(data: IDistrictSet<IDistrictData>) {
            let svg = document.getElementsByTagName("svg").item(0);
            this._data = data;
            this.dayNumber.subscribe(a => this.updateData());
            this.updateData();
        }

        /****************************************/

        updateData() {
            let day = this._data.days[this.dayNumber()];

            for (let key in day.values) {
                let element = document.getElementById("district_" + key.toUpperCase());
                if (element) {


                    let factor1 = (day.values[key].totalPositive / day.values[key].totalPopulation) / this._data.maxFactor;

                    let factor2 = (day.values[key].totalPositive / day.values[key].totalPopulation) * 100000;

                    let value = 0;
                    if (factor2 > 0.01 && factor2 <= 10)
                        value = 0.2;
                    else if (factor2 > 10 && factor2 <= 20)
                        value = 0.4;
                    else if (factor2 > 20 && factor2 <= 100)
                        value = 0.6;
                    else if (factor2 > 100 && factor2 <= 200)
                        value = 0.8;
                    else if (factor2 > 200)
                        value = 1;

                    if (day.values[key].totalPositive == 0) {
                        element.style.fill = "#fff";
                        element.style.fillOpacity = "1";
                    }
                    else {
                        factor1 = 1 - Math.pow(1 - factor1, 3);
                        value = Math.ceil(factor1 * 20) / 20;
                        element.style.fill = "#f00";
                        element.style.fillOpacity = (value).toString();
                    }
                }
            }
        }

        dayNumber = ko.observable(0);
    }
}