using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using GeoPlot.Web.Models;
using Microsoft.AspNetCore.Hosting;
using GeoPlot.Entities;
using GeoPlot.Coronavirus;
using GeoPlot.Core;

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
            return RedirectToAction("Overview");
        }

        [ResponseCache(Duration = 3600, VaryByHeader ="X-App-Version")]
        public async Task<IActionResult> Overview(string state)
        {
            var model = new GeoPlotViewModel() 
            {
                Geo = await LoadGeoAreas(),
                Data = await LoadInfectionData()
            };

            return View(model);
        }

        public async Task<IActionResult> Studio()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        async Task<DayAreaDataSet<InfectionData>> LoadInfectionData()
        {
            var adapters = new IDataAdapter<DayAreaItem<InfectionData>>[]
            {
                new InfectionDistrictItalyAdapter(),
                new InfectionRegionItalyAdapter(),
                new InfectionItalyAdapter()
            };

            var items = await Task.WhenAll(adapters.Select(a => a.LoadAsync()));

            var data = items.SelectMany(a => a);

            var result = new DayAreaDataSet<InfectionData>()
            {
                Days = new List<DayAreaGroupItem<InfectionData>>()
            };

            var tomorrow = DateTime.Today.AddDays(1);
            foreach (var day in data.GroupBy(a => a.Date.Date).Where(a=> a.Key < tomorrow))
            {
                var item = new DayAreaGroupItem<InfectionData>()
                {
                    Date = day.Key,
                    Values = new Dictionary<string, InfectionData>()
                };

                foreach (var area in day.GroupBy(a => a.AreaId))
                {
                    var value = area.OrderByDescending(a => a.Date).First();
                    item.Values[area.Key] = value.Value;
                }

                result.Days.Add(item);
            };

            return result;
        }

        async Task<GeoAreaSet> LoadGeoAreas()
        {
            var adapters = new BaseGeoJsonAdapter[]
            {
                new ItalyDistrictAdapter(_env.WebRootPath + "\\data\\province.csv"),
                new ItalyRegionAdapter(_env.WebRootPath + "\\data\\regioni.csv")
            };

            var items = await Task.WhenAll(adapters.Select(a => a.LoadAsync()));

            var data = items.SelectMany(a => a);

            var result = new GeoAreaSet
            {
                Areas = data.ToDictionary(a => a.Id, a => a),
                ViewBox = adapters[0].ViewBox
            };

            result.Areas["IT"] = new GeoArea()
            {
                Id = "IT",
                Name = "Italia",
                Type = GeoAreaType.Country,
                Demography = new Demography<int>()
                {
                    Female = result.Areas.Where(a=> a.Key[0] == 'R').Sum(a=> a.Value.Demography.Female),
                    Male = result.Areas.Where(a => a.Key[0] == 'R').Sum(a => a.Value.Demography.Male),
                    Total = result.Areas.Where(a => a.Key[0] == 'R').Sum(a => a.Value.Demography.Total)
                }                                
            };

            result.ViewBox = new Rect2D()
            {
                X = adapters[0].ViewBox.X,
                Y = adapters[0].ViewBox.Y,
                Width = adapters[0].ViewBox.Width,
                Height = 1595892
            };
            

            return result;
        }



    }
}
