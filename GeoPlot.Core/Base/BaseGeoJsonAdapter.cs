using GeoPlot.Entities;
using NetTopologySuite.Features;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using NetTopologySuite.Simplify;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace GeoPlot.Core
{
    public class BaseGeoJsonAdapter : BaseFileDataAdapter<GeoArea>
    {
        public BaseGeoJsonAdapter(string dataSource)
            : base(dataSource)
        {
            SimplifyTollerance = 0.01;
        }

        protected override IEnumerable<GeoArea> Load(string textData)
        {
            var reader = new GeoJsonReader();
            var features = reader.Read<FeatureCollection>(textData);
            var result = new List<GeoArea>();

            ProcessFeatures(features, result);

            var min = Geo.Project(new GeoPoint() { Lat = features.BoundingBox.MinY, Lng = features.BoundingBox.MinX });
            var max = Geo.Project(new GeoPoint() { Lat = features.BoundingBox.MaxY, Lng = features.BoundingBox.MaxX });

            ViewBox = new Rect2D
            {
                X = min.X,
                Y = max.Y,
                Width = (max.X - min.X),
                Height = (min.Y - max.Y)
            };

            return result;
        }

        protected virtual void ProcessFeatures(FeatureCollection features, IList<GeoArea> result)
        {
            foreach (var feature in features)
            {
                if (MustProcess(feature))
                    ProcessFeature(feature, result);
            }
        }

        protected virtual bool MustProcess(IFeature feature)
        {
            return true;
        }

        protected virtual void ProcessFeature(IFeature feature, IList<GeoArea> result)
        {
            var geoArea = new GeoArea();
            geoArea.Geometry = new List<Poly2D>();
            CreatePoly(feature.Geometry, geoArea.Geometry);
            ProcessFeature(feature, geoArea);
            result.Add(geoArea);
        }

        protected virtual void ProcessFeature(IFeature feature, GeoArea geoArea)
        {

        }

        protected virtual void CreatePoly(Geometry geo, IList<Poly2D> result)
        {
            if (geo is Polygon geoPoly)
            {
                Geometry curGeo = geoPoly.ExteriorRing;
                if (SimplifyTollerance != 0)
                {
                    var simplifier = new VWSimplifier(curGeo);
                    simplifier.DistanceTolerance = SimplifyTollerance;
                    curGeo = simplifier.GetResultGeometry();
                }
                if (curGeo.IsValid)
                    result.Add(new Poly2D() { Points = curGeo.Coordinates.Select(a => Geo.Project(new GeoPoint() { Lat = a.Y, Lng = a.X })).ToArray() });
            }
            else if (geo is MultiPolygon multiPoly)
            {
                foreach (var innerPoly in multiPoly.Geometries)
                    CreatePoly(innerPoly, result);
            }
        }

        public Rect2D ViewBox { get; set; }

        public double SimplifyTollerance { get; set; }

    }
}
