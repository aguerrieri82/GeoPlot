namespace GeoPlot {

    export class MathUtils  {

        static discretize(value: number, steps: number): number {
            return Math.round(value * steps) / steps;
        }

        /****************************************/

        static round(value: number, digits: number): number {
            return Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
        }

        /****************************************/

        static exponential(value: number, weight: number = 2) {

            return 1 - Math.pow(1 - value, weight);
        }
    }    
}

