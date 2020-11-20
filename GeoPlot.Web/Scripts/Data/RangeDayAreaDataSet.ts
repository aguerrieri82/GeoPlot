
namespace WebApp.GeoPlot {

    export class RangeDayAreaDataSet<TData>  {

        protected _days: IDayAreaGroupItem<TData>[];

        constructor(data: IDayAreaDataSet<TData>) {
            this._days = data.days;
        }

        get days(): Linq<IDayAreaGroupItem<TData>> {
            const startIndex = this.startDay ?? 0;
            const endIndex = this.endDay ?? this._days.length - 1;
            return linq(this._days).skip(startIndex).take(endIndex - startIndex + 1);
        }

        get(index: number | string): IDayAreaGroupItem<TData> {
            index = typeof index == "string" ? parseInt(index) : index;
            return this._days[(this.startDay ?? 0) + index];
        }

        get count() : number {
            const startIndex = this.startDay ?? 0;
            const endIndex = this.endDay ?? this._days.length - 1;
            return endIndex - startIndex + 1;
        }

        startDay?: number;
        endDay?: number;
    }
}


