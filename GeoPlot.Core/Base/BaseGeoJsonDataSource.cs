using GeoPlot.Entities;
using NetTopologySuite.Features;
using NetTopologySuite.Geometries;
using NetTopologySuite.GeometriesGraph.Index;
using NetTopologySuite.IO;
using NetTopologySuite.Simplify;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace GeoPlot.Core
{
    public class BaseGeoJsonDataSource : BaseFileDataSource<GeoAreaView>
    {
        public BaseGeoJsonDataSource(string src, double tollerance)
            : base(src)
        {
            SimplifyTollerance = tollerance;
        }

        protected override IEnumerable<GeoAreaView> Load(string textData)
        {
            var reader = new GeoJsonReader();
            var features = reader.Read<FeatureCollection>(textData);
            var result = new List<GeoAreaView>();

            ProcessFeatures(features, result);

            if (features.BoundingBox != null)
            {
                var min = GeoUtils.Project(new GeoPoint() { Lat = features.BoundingBox.MinY, Lng = features.BoundingBox.MinX });
                var max = GeoUtils.Project(new GeoPoint() { Lat = features.BoundingBox.MaxY, Lng = features.BoundingBox.MaxX });

                ViewBox = new Rect2D
                {
                    X = min.X,
                    Y = max.Y,
                    Width = (max.X - min.X),
                    Height = (min.Y - max.Y)
                };
            }

            return result;
        }

        protected virtual void ProcessFeatures(FeatureCollection features, IList<GeoAreaView> result)
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

        protected virtual void ProcessFeature(IFeature feature, IList<GeoAreaView> result)
        {
            var geoArea = new GeoAreaView();
            geoArea.Geometry = GeoUtils.ProjectAndSimplify(feature.Geometry, SimplifyTollerance);
            ProcessFeature(feature, geoArea);
            result.Add(geoArea);
        }

        protected virtual void ProcessFeature(IFeature feature, GeoAreaView geoArea)
        {

        }


        public Rect2D ViewBox { get; set; }

        public double SimplifyTollerance { get; set; }

        public double Shrink { get; set; }

    }
}
