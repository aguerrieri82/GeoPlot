using Geo.Data.Types;
using GeoPlot.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoPlot.Core
{
    public class ItalyGeoSource : IDataSource<GeoAreaView>
    {
        string _districtDemoSrc;
        string _districtSurfaceDemoSrc;
        string _regionDemoSrc;

        public ItalyGeoSource(string districtDemoSrc, string districtSurfaceDemoSrc, string regionDemoSrc)
        {
            _districtDemoSrc = districtDemoSrc;
            _districtSurfaceDemoSrc = districtSurfaceDemoSrc;
            _regionDemoSrc = regionDemoSrc;
        }


        public async Task<IEnumerable<GeoAreaView>> LoadAsync()
        {
            var district = (await new ItalyDistrictSource().LoadAsync()).ToArray();
            var districtDemo = (await new ItalyDistrictDemographySource(_districtDemoSrc).LoadAsync()).GroupBy(a=> a.DistrictId).ToDictionary(a=> a.Key, a=> a.ToArray());
            var districtSurface = (await new ItalyDistrictSurfaceSource(_districtSurfaceDemoSrc).LoadAsync()).ToDictionary(a => a.AreaId, a => a.Value);
            var regionDemo = (await new ItalyRegionDemographySource(_regionDemoSrc).LoadAsync()).ToDictionary(a => a.Region, a => a.Population);

            var result = new List<GeoAreaView>();
            /*
            var municipality = (await new ItalyMunicipalitySource().LoadAsync()).ToArray();

            foreach (var item in municipality)
                result.Add(item);*/

            foreach (var item in district)
            {
                item.Demography = new AggregateDemografy()
                {
                    Male = districtDemo[item.Id].Where(a => a.Age == null).Sum(a => a.Male),
                    Female = districtDemo[item.Id].Where(a => a.Age == null).Sum(a => a.Female),
                    Over65 = districtDemo[item.Id].Where(a => a.Age != null && a.Age >= 65).Sum(a => a.Male + a.Female)
                };
                item.Demography.Total = item.Demography.Male.Value + item.Demography.Female.Value;
                item.Surface = districtSurface[item.Id];
                result.Add(item);
            }

            var regionSource = new ItalyRegionSource();
            var region = (await regionSource.LoadAsync()).ToArray();
            foreach (var item in region)
            {
                var districts = result.Where(a => a.ParentId == item.Id);
                item.Demography = AggregateDemografy.Sum(districts.Select(a => a.Demography));
                item.Surface = districts.Sum(a => a.Surface);
                result.Add(item);
            }

            var regions = result.Where(a => a.ParentId == "IT");
            result.Add(new GeoAreaView()
            {
                Id = "IT",
                Name = "Italia",
                Type = GeoAreaType.Country,
                Demography = AggregateDemografy.Sum(regions.Select(a => a.Demography)),
                Surface = regions.Sum(a => a.Surface)
             });

            ViewBox = new Rect2D()
            {
                X = regionSource.ViewBox.X,
                Y = regionSource.ViewBox.Y,
                Width = regionSource.ViewBox.Width,
                Height = 1595892
            };

            return result;
        }

        public Rect2D ViewBox { get; set; }
    }
}
