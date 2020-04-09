using GeoPlot.Coronavirus;
using GeoPlot.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Web.Models
{
    public class StudioViewModel : ISvgMapViewModel
    {
        public DayAreaDataSet<InfectionData> Data { get; set; }

        public GeoAreaViewSet Geo { get; set; }

        IList<EnvironmentItemViewModel> ISvgMapViewModel.Environment => null;
    }
}
