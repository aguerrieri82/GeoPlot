using GeoPlot.Entities;
using NetTopologySuite.Geometries;
using NetTopologySuite.Simplify;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace GeoPlot.Core
{
    public static class GeoUtils
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

        public static IList<Poly2D> ProjectAndSimplify(Geometry geo, double tollerance = 0.01)
        {
            var result = new List<Poly2D>();
            ProjectAndSimplify(geo, tollerance, result);
            return result;
        }


        static void ProjectAndSimplify(Geometry geo, double tollerance, IList<Poly2D> result)
        {
            if (geo is Polygon geoPoly)
            {
                Geometry curGeo = geoPoly.ExteriorRing;
                if (tollerance != 0)
                {
                    var simplifier = new VWSimplifier(curGeo);
                    simplifier.DistanceTolerance = tollerance;
                    curGeo = simplifier.GetResultGeometry();
                }

                if (curGeo.IsValid)
                    result.Add(new Poly2D() { Points = curGeo.Coordinates.Select(a => Project(new GeoPoint() { Lat = a.Y, Lng = a.X })).ToArray() });
            }
            else if (geo is MultiPolygon multiPoly)
            {
                foreach (var innerPoly in multiPoly.Geometries)
                    ProjectAndSimplify(innerPoly, tollerance, result);
            }
        }

        public static Rect2D GetViewBox(IList<Poly2D> geometry)
        {
            var min = new Point2D()
            {
                X = double.PositiveInfinity,
                Y = double.PositiveInfinity
            };

            var max = new Point2D()
            {
                X = double.NegativeInfinity,
                Y = double.NegativeInfinity
            };

            foreach (var point in geometry.SelectMany(a=> a.Points))
            {
                min.X = Math.Min(min.X, point.X);
                max.X = Math.Max(max.X, point.X);

                min.Y = Math.Min(min.Y, point.Y);
                max.Y = Math.Max(max.Y, point.Y);
            }

            return new Rect2D()
            {
                X = min.X,
                Y = min.Y,
                Width = (max.X - min.X),
                Height = (max.Y - min.Y)
            };
        }
    }
}
