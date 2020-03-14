using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using GeoPlot.Web.Models;
using Microsoft.AspNetCore.Hosting;
using NetTopologySuite.IO;
using NetTopologySuite.Features;
using NetTopologySuite.Geometries;
using Newtonsoft.Json;
using GeoPlot.Web.Entities;
using NetTopologySuite.Simplify;
using System.Net.Http;

namespace GeoPlot.Web.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IWebHostEnvironment _env;

        public HomeController(ILogger<HomeController> logger, IWebHostEnvironment env)
        {
            _logger = logger;
            _env = env;
        }

        [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.None, NoStore = false)]
        public async Task<IActionResult> Index()
        {
            var model = new GeoPlotViewModel();

            model.Geo = await LoadDistricts();

            model.Data = await LoadInfectionData();

            model.Data.MaxFactor = new Demography()
            {
                Total = model.Data.Days.SelectMany(a => a.Values).Max(a => a.Value.TotalPositive.GetValueOrDefault() / model.Geo.Areas[a.Key].Demography.Total.Value),
                Old = model.Data.Days.SelectMany(a => a.Values).Max(a => a.Value.TotalPositive.GetValueOrDefault() / model.Geo.Areas[a.Key].Demography.Old.Value),
            };

            return View(model);
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        async Task<DayAreaDataSet<InfectionData>> LoadInfectionData()
        {
            //var json = await System.IO.File.ReadAllTextAsync(_env.WebRootPath + "\\data\\dpc-covid19-ita-province.json");
            
            var json = await HttpGet("https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-province.json");

            var data = JsonConvert.DeserializeObject<DistrictInfectionRawItem[]>(json).Where(a => !string.IsNullOrWhiteSpace(a.sigla_provincia));

            var result = new DayAreaDataSet<InfectionData>()
            {
                Days = new List<DayAreaItem<InfectionData>>(),
                Max = new InfectionData()
                {
                    TotalPositive = data.Max(a => a.totale_casi)
                }
            };

            foreach (var item in data.GroupBy(a => a.data.Date))
            {
                var day = new DayAreaItem<InfectionData>();
                day.Data = item.Key;
                day.Values = item.ToDictionary(a => "D" + a.codice_provincia.ToString(), a => new InfectionData()
                {
                    TotalPositive = a.totale_casi,
                });

                result.Days.Add(day);
            }

            return result;
        }

        async Task<GeoAreaSet> LoadDistricts()
        {
            var result = new GeoAreaSet();
            result.Areas = new Dictionary<string, GeoArea>();

            //District
            var json = await System.IO.File.ReadAllTextAsync(_env.WebRootPath + "\\data\\limits_IT_provinces.geojson.json");
            var reader = new GeoJsonReader();
            var features = reader.Read<FeatureCollection>(json);

            var min = Geo.Project(new GeoPoint() { Lat = features.BoundingBox.MinY, Lng = features.BoundingBox.MinX });
            var max = Geo.Project(new GeoPoint() { Lat = features.BoundingBox.MaxY, Lng = features.BoundingBox.MaxX });

            result.ViewBox = new Rect2D
            {
                X = min.X,
                Y = max.Y,
                Width = (max.X - min.X),
                Height = (min.Y - max.Y)
            };

            foreach (var feature in features)
            {
                var area = new GeoArea
                {
                    Type = GeoAreaType.District,
                    Poly = new List<Poly2D>(),
                    Id = "D" + feature.Attributes["prov_istat_code_num"].ToString(),
                    Name = (string)feature.Attributes["prov_name"]
                };
                CreatePoly(feature.Geometry, area.Poly);
                result.Areas[area.Id] = area;
            }

            //Region
            json = await System.IO.File.ReadAllTextAsync(_env.WebRootPath + "\\data\\limits_IT_regions.geojson.json");
            features = reader.Read<FeatureCollection>(json);

            foreach (var feature in features)
            {
                var area = new GeoArea
                {
                    Type = GeoAreaType.Region,
                    Poly = new List<Poly2D>(),
                    Id = "R" + feature.Attributes["reg_istat_code_num"].ToString(),
                    Name = (string)feature.Attributes["reg_name"]
                };
                CreatePoly(feature.Geometry, area.Poly);
                result.Areas[area.Id] = area;
            }


            //Population
            json = await System.IO.File.ReadAllTextAsync(_env.WebRootPath + "\\data\\district-population.json");
            var distData = JsonConvert.DeserializeObject<DistrictPopulatonRawItem[]>(json);

            var popData = distData.Where(a => a.eta == "Totale").ToDictionary(a => "D" + a.codice);
            var oldPopData = distData.Where(a => a.eta != "Totale" && int.Parse(a.eta) > 65).GroupBy(a=> a.codice).ToDictionary(a => "D" + a.Key, a=> a.Sum(b=> b.totale_femmine + b.totale_maschi));
            foreach (var area in result.Areas.Where(a=> a.Value.Type == GeoAreaType.District))
            {
                DistrictPopulatonRawItem popItem;

                if (popData.TryGetValue(area.Key, out popItem))
                    area.Value.Demography = new Demography()
                    { 
                        Female  = popItem.totale_femmine,
                        Male = popItem.totale_maschi,
                        Total = popItem.totale_femmine + popItem.totale_maschi,
                        Old = oldPopData[area.Key]
                    };
            }
            return result;
        }

        async Task<string> HttpGet(string url)
        {
            using var client = new HttpClient();
            return await client.GetStringAsync(url);
        }

        void CreatePoly(Geometry geo, IList<Poly2D> result)
        {
            if (geo is Polygon geoPoly)
            {
                var simplifier = new VWSimplifier(geoPoly.ExteriorRing);
                simplifier.DistanceTolerance = 0.01;

                var simpGeo = simplifier.GetResultGeometry();
                
                if (simpGeo.IsValid)
                    result.Add(new Poly2D() { Points = simpGeo.Coordinates.Select(a => Geo.Project(new GeoPoint() { Lat = a.Y, Lng = a.X })).ToArray() });
            }
            else if (geo is MultiPolygon multiPoly)
            {
                foreach (var innerPoly in multiPoly.Geometries)
                    CreatePoly(innerPoly, result);
            }
        }
    }
}
