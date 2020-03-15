using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Entities
{
    public class GeoAreaSet
    {
        public Rect2D ViewBox { get; set; }

        public IDictionary<string, GeoArea> Areas { get; set; }
    }
}
