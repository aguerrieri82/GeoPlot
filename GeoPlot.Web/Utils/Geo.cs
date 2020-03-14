using GeoPlot.Web.Entities;
using GeoPlot.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace GeoPlot.Web
{
    public static class Geo
    {
        private const int EarthRadius = 6378137;
        private const double OriginShift = 2 * Math.PI * EarthRadius / 2;
        private const double OFFSET_X = 0;
        private const double OFFSET_Y = 0;

        public static Point2D Project(GeoPoint point)
        {
            var result = new Point2D();
            result.X = point.Lng * OriginShift / 180;
            result.Y = Math.Log(Math.Tan((90 + point.Lat) * Math.PI / 360)) / (Math.PI / 180);
            result.Y = -(result.Y * OriginShift / 180);
            result.X -= OFFSET_X;
            result.Y -= OFFSET_Y;
            return result;
        }

    }
}
