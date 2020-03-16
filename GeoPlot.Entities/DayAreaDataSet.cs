using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Entities
{
    public interface IDayItem<TValue>
    {
        DateTime Date { get; set; }

        TValue Value { get; }
    }

    public class DayAreaItem<TValue> : IGeoAreaItem<TValue>, IDayItem<TValue>
    {
        public DateTime Date { get; set; }

        public string AreaId { get; set; }

        public TValue Value { get; set; }
    }

    public class DayAreaGroupItem<TValue>
    {
        public DateTime Date { get; set; }

        public IDictionary<string, TValue> Values { get; set; }
    }

    public class DayAreaDataSet<TData>
    {
        public IList<DayAreaGroupItem<TData>> Days { get; set; }
    }
}
