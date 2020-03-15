using GeoPlot.Entities;
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

        public int? Day { get; set; }

        public string District { get; set; }
    }
}
