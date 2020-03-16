using GeoPlot.Entities;
using NetTopologySuite.Features;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoPlot.Core
{
    public class ItalyDistrictAdapter : BaseGeoJsonAdapter
    {
        IDictionary<string, Demography<int>> _demoData;
        string _demoSource;

        public ItalyDistrictAdapter(string demoSource)
            : this("https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_provinces.geojson", demoSource)
        {
        }

        public ItalyDistrictAdapter(string districtSource, string demoSource)
            : base(districtSource)
        {
            _demoSource = demoSource;
        }

        public override async Task<IEnumerable<GeoArea>> LoadAsync()
        {
            var demoAdapter = new ItalyDistrictDemographyAdapter(_demoSource);
            var demoData = await demoAdapter.LoadAsync();
            _demoData = demoData.ToDictionary(a => a.AreaId, a => a.Value);
            return await base.LoadAsync();
        }


        protected override void ProcessFeature(IFeature feature, GeoArea geoArea)
        {
            geoArea.Type = GeoAreaType.District;
            geoArea.Id = "D" + feature.Attributes["prov_istat_code_num"].ToString();
            geoArea.Name = (string)feature.Attributes["prov_name"];
            geoArea.Demography = _demoData[geoArea.Id];
            geoArea.ParentId = "R" + feature.Attributes["reg_istat_code_num"].ToString();
        }
    }
}
