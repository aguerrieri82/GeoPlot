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
        public ItalyDistrictSource()
            : base("https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_provinces.geojson")
        {
        }

        public ItalyDistrictSource(string src)
            : base(src)
        {
        }

        protected override void ProcessFeature(IFeature feature, GeoArea geoArea)
        {
            geoArea.Type = GeoAreaType.District;
            geoArea.Id = "D" + feature.Attributes["prov_istat_code_num"].ToString();
            geoArea.Name = (string)feature.Attributes["prov_name"];
            geoArea.ParentId = "R" + feature.Attributes["reg_istat_code_num"].ToString();
        }
    }
}
