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
    public class ItalyMunicipalitySource : BaseGeoJsonDataSource
    {
        public ItalyMunicipalitySource(double tollerance = 0.01)
            : base("https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_municipalities.geojson", tollerance)
        {
        }

        public ItalyMunicipalitySource(string src, double tollerance = 0.01)
            : base(src, tollerance)
        {
        }

        protected override void ProcessFeature(IFeature feature, GeoArea geoArea)
        {
            geoArea.Type = GeoAreaType.Municipality;
            geoArea.Id = "C" + feature.Attributes["com_istat_code"].ToString();
            geoArea.Name = (string)feature.Attributes["name"];
            geoArea.ParentId = "D" + feature.Attributes["prov_istat_code"].ToString();
        }
    }
}
