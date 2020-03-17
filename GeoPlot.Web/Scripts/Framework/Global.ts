
function formatNumber(value: number) {
    if (!value)
        return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/****************************************/

function capitalizeFirst(value: string) {
    return value.substr(0, 1).toUpperCase() + value.substr(1);
}

/****************************************/

if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function (callback, type, quality)  {
            let canvas = this;
            setTimeout(() =>  {
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

function expandCollapse(elment: HTMLElement) {
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

/****************************************/
/* Definitions
/****************************************/

interface Clipboard {
    write(data: Iterable<ClipboardItem>): Promise<void>;
}

interface ClipboardItem {
}

declare var ClipboardItem: {
    prototype: ClipboardItem;
    new(items: { [type: string]: Blob | string }): ClipboardItem;
};


/****************************************/

Chart.plugins.register({
    beforeDraw: function (chartInstance) {
        var ctx = chartInstance.ctx;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, chartInstance.width, chartInstance.height);
    }
});