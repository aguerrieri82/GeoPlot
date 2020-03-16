using GeoPlot.Entities;
using NetTopologySuite.Features;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoPlot.Core
{
    public class ItalyRegionAdapter : BaseGeoJsonAdapter
    {
        IDictionary<string, Demography<int>> _demoData;
        string _demoSource;

        public ItalyRegionAdapter(string demoSource)
            : this("https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_regions.geojson", demoSource)
        {
        }

        public ItalyRegionAdapter(string dataSource, string demoSource)
            : base(dataSource)
        {
            _demoSource = demoSource;
        }

        public override async Task<IEnumerable<GeoArea>> LoadAsync()
        {
            var demoAdapter = new ItalyRegionDemographyAdapter(_demoSource);
            var demoData = await demoAdapter.LoadAsync();
            _demoData = demoData.ToDictionary(a => a.AreaId, a => a.Value);
            return await base.LoadAsync();
        }


        protected override void ProcessFeature(IFeature feature, GeoArea geoArea)
        {
            geoArea.Type = GeoAreaType.Region;
            geoArea.Id = "R" + feature.Attributes["reg_istat_code_num"].ToString();
            geoArea.Name = (string)feature.Attributes["reg_name"];
            geoArea.Demography = _demoData[geoArea.Id];
        }
    }
}
