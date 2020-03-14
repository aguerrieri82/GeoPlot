using GeoPlot.Web.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Web.Models
{
    
    public struct Point2D
    {
        public double X;

        public double Y;
    }

    public struct Rect2D
    {
        public double X;

        public double Y;

        public double Width;

        public double Height;
    }

    public class RegionViewModel
    {
        public string Id { get; set; }      

        public IList< IList<Point2D>> Polys { get; set; }
    }

    public class PlotViewModel
    {
        public Rect2D ViewBox { get; set; }

        public IList<RegionViewModel> Regions { get; set; }

        public DayAreaDataSet<InfectionData> Data { get; set; }
    }
}
