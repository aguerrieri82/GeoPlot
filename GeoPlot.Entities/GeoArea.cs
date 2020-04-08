using Geo.Data.Types;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Entities
{
    public interface IGeoAreaItem<out TValue>
    {
        string AreaId { get;  }

        TValue Value { get;  }
    }

    public class GeoAreaItem<TValue> : IGeoAreaItem<TValue>
    { 
        public string AreaId { get; set; }

        public TValue Value { get; set; }
    }


    public class GeoArea
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public string ParentId { get; set; }

        public double Surface { get; set; }

        public AggregateDemografy Demography { get; set; }

        public GeoAreaType Type { get; set; }

        public IList<Poly2D> Geometry { get; set; }
    }
}
