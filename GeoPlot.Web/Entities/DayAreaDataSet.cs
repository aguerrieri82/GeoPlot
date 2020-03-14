using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Web.Entities
{

    public struct DayAreaItem<TValue>
    {
        public DateTime Data { get; set; }

        public IDictionary<string, TValue> Values { get; set; }
    }

    public class DayAreaDataSet<TData>
    {
        public TData Max { get; set; }

        public double MaxFactor { get; set; }

        public IList<DayAreaItem<TData>> Days { get; set; }
    }
}
