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

        /****************************************/

        static removeClass(element: Element, className: string) {
            if (element.classList.contains(className))
                element.classList.remove(className);
        }

        /****************************************/

        static addClass(element: Element, className: string) {
            if (!element.classList.contains(className))
                element.classList.add(className);
        }
    }
}


