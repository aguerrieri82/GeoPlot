namespace GeoPlot {

    export class MathUtils  {

        static discretize(value: number, steps: number): number {
            return Math.round(value * steps) / steps;
        }

        /****************************************/

        static exponential(value: number, weight: number = 2) {

            return 1 - Math.pow(1 - value, weight);
        }
    }    
}

