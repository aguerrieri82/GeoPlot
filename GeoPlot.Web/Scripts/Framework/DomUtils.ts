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

        /****************************************/

        static async copyText(value: string) {
            if (navigator["clipboard"])
                await navigator.clipboard.writeText(value);
            else {
                let input = document.createElement("textarea");
                document.body.appendChild(input);
                input.value = value
                input.select();
                //input.setSelectionRange(0, input.value.length);
                document.execCommand("copy");
                document.body.removeChild(input);
            }

        }
    }
}


