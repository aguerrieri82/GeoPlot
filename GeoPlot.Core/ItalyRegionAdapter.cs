using GeoPlot.Entities;
using NetTopologySuite.Features;
using System;
using System.Collections.Generic;
using System.Text;

namespace GeoPlot.Core
{
    public class ItalyRegionAdapter : BaseGeoJsonAdapter
    {
        public ItalyRegionAdapter()
            : this("https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_regions.geojson")
        {
        }

        public ItalyRegionAdapter(string dataSource)
            : base(dataSource)
        {
        }

        protected override void ProcessFeature(IFeature feature, GeoArea geoArea)
        {
            geoArea.Type = GeoAreaType.Region;
            geoArea.Id = "R" + feature.Attributes["reg_istat_code_num"].ToString();
            geoArea.Name = (string)feature.Attributes["reg_name"];
        }
    }
}
