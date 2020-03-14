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
using Eusoft.Mathematics.Geometry;
using Newtonsoft.Json;
using GeoPlot.Web.Entities;

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

        public IActionResult Index()
        {
            var model = new PlotViewModel()
            {
                Regions = new List<RegionViewModel>()
            };

            var json = System.IO.File.ReadAllText(_env.WebRootPath + "\\data\\it_districts.json");
            var reader = new GeoJsonReader();
            var features = reader.Read<FeatureCollection>(json);

            var min = Geo.Project(new GeoPoint() { Lat = features.BoundingBox.MinY, Lng = features.BoundingBox.MinX });
            var max = Geo.Project(new GeoPoint() { Lat = features.BoundingBox.MaxY, Lng = features.BoundingBox.MaxX });

            model.ViewBox = new Rect2D
            {
                X = min.X,
                Y = max.Y,
                Width = (max.X - min.X),
                Height = (min.Y - max.Y)
            };

            foreach (var feature in features)
            {
                var region = new RegionViewModel();
                if (feature.Geometry is Polygon geoPoly)
                {
                    region.Polys = new[] { geoPoly.Boundary.Coordinates.Select(a => Geo.Project(new GeoPoint() { Lat = a.Y, Lng = a.X })).ToArray() };
                }
                else if (feature.Geometry is MultiPolygon multiPoly)
                {
                    region.Polys = multiPoly.Geometries.OfType<Polygon>().Select(p => p.Boundary.Coordinates.Select(a => Geo.Project(new GeoPoint() { Lat = a.Y, Lng = a.X })).ToArray()).ToArray();
                }
                region.Id = (string)feature.Attributes["prov_acr"];
                model.Regions.Add(region);
            }

            json = System.IO.File.ReadAllText(_env.WebRootPath + "\\data\\district-population.json");
            var distData = JsonConvert.DeserializeObject<DistrictPopulatonRawItem[]>(json);

            var popData = distData.Where(a=> a.eta == "Totale").GroupBy(a => a.codice).ToDictionary(a => a.Key, a => a.Sum(b => b.totale_femmine + b.totale_maschi));

            json = System.IO.File.ReadAllText(_env.WebRootPath + "\\data\\dpc-covid19-ita-province.json");
            var data = JsonConvert.DeserializeObject<DistrictInfectionRawItem[]>(json);
            

            model.Data = new DayAreaDataSet<InfectionData>()
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
                day.Values = item.Where(a=> !string.IsNullOrWhiteSpace( a.sigla_provincia)).ToDictionary(a => a.sigla_provincia, a => new InfectionData()
                {
                    TotalPositive = a.totale_casi,
                    TotalPopulation = popData[a.codice_provincia]
                });

                model.Data.Days.Add(day);
            }
            model.Data.MaxFactor = model.Data.Days.SelectMany(a => a.Values).Max(a => a.Value.TotalPositive.GetValueOrDefault() / (double)a.Value.TotalPopulation);

            return View(model);
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
