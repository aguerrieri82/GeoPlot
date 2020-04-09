using GeoPlot.Coronavirus;
using GeoPlot.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Web.Models
{
    public interface ISvgMapViewModel
    {
        GeoAreaViewSet Geo { get;}

        IList<EnvironmentItemViewModel> Environment { get;}
    }
}
