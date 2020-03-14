using GeoPlot.Web.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Web.Models
{

    public class GeoPlotViewModel
    {
        public GeoAreaSet Geo { get; set; }

        public DayAreaDataSet<InfectionData> Data { get; set; }
    }
}
