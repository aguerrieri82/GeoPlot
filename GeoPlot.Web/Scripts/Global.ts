if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function (callback, type, quality) {
            let canvas = this;
            setTimeout(() => {
                const binStr = atob(canvas.toDataURL(type, quality).split(',')[1]);
                const len = binStr.length;
                const arr = new Uint8Array(len);

                for (let i = 0; i < len; i++)
                    arr[i] = binStr.charCodeAt(i);

                callback(new Blob([arr], { type: type || 'image/png' }));
            });
        }
    });
}

/****************************************/

export function capitalizeFirst(value: string) {
    return value.substr(0, 1).toUpperCase() + value.substr(1);
}


/****************************************/

export function expandCollapse(elment: HTMLElement) {
    let container = elment.parentElement;
    let content = <HTMLElement>container.querySelector(".section-content");
    if (container.classList.contains("closed")) {
        content.style.removeProperty("display");
        container.classList.remove("closed");
    }
    else {
        container.classList.add("closed");
        setTimeout(() => content.style.display = "none", 300);
    }
}

declare global {

    const $language: string;

    function formatNumber(value: number, emptyValue?: string): string;

    function $string(format: string): string;
}
