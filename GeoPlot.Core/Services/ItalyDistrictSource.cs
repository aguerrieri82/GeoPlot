using Geo.Data.Types;
using GeoPlot.Entities;
using NetTopologySuite.Features;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoPlot.Core
{
    public class ItalyDistrictSource : BaseGeoJsonDataSource
    {
        public ItalyDistrictSource(double tollerance = 0.01)
            : base("https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_provinces.geojson", tollerance)
        {
        }

        public ItalyDistrictSource(string src, double tollerance = 0.01)
            : base(src, tollerance)
        {
        }

        protected override void ProcessFeature(IFeature feature, GeoAreaView geoArea)
        {
            geoArea.Type = GeoAreaType.District;
            geoArea.Id = "D" + feature.Attributes["prov_istat_code"].ToString();
            geoArea.Name = (string)feature.Attributes["prov_name"];
            geoArea.ParentId = "R" + feature.Attributes["reg_istat_code"].ToString();
        }
    }
}
