namespace GeoPlot {

    export class DomUtils {

        static isParentOrSelf(element: HTMLElement, parent: HTMLElement) : boolean {

            let curElement = element;

            while (curElement) {
                if (curElement == parent)
                    return true;
                curElement = curElement.parentElement;
            }
            return false;
        }
    }
}

/****************************************/

function formatNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}