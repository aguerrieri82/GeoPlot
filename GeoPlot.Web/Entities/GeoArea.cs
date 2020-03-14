using GeoPlot.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Web.Entities
{
    public enum GeoAreaType
    {
        Country,
        State,
        Region,
        District
    }

    public class GeoArea
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public Demography Demography { get; set; }

        public GeoAreaType Type { get; set; }

        public IList<Poly2D> Poly { get; set; }
    }
}
