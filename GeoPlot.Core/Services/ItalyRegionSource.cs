using GeoPlot.Entities;
using NetTopologySuite.Features;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoPlot.Core
{
    public class ItalyRegionSource : BaseGeoJsonDataSource
    {
        public ItalyRegionSource()
            : base("https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_regions.geojson")
        {
            
        }

        public ItalyRegionSource(string src)
            : base(src)
        {
        }

        protected override void ProcessFeature(IFeature feature, GeoArea geoArea)
        {
            geoArea.Type = GeoAreaType.Region;
            geoArea.Id = "R" + feature.Attributes["reg_istat_code_num"].ToString();
            geoArea.ParentId = "IT";
            geoArea.Name = (string)feature.Attributes["reg_name"];
        }
    }
}
