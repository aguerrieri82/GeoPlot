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
using System.Net.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using GeoPlot.Web.Entities;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Geo.Data;
using Microsoft.EntityFrameworkCore;
using Geo.Data.Types;
using Geo.Data.Entities;

namespace GeoPlot.Web.Controllers
{
    public class HomeController : Controller
    {
        public enum RenderMode
        {
            Json,
            Svg
        }

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

        //[ResponseCache(Duration = 3600, VaryByHeader ="X-App-Version")]
        public async Task<IActionResult> Overview(string state)
        {
            var lastUpdate = await GetLastCommit();

            var model = new GeoPlotViewModel()
            {
                Geo = await LoadGeoAreasFromJson(),
                Data = await LoadInfectionData(lastUpdate),
                DebugMode = Debugger.IsAttached,
                Environment = await LoadEnvironmentData(),
                LastUpdate = lastUpdate
            };

            return View(model);
        }

        public IActionResult Studio(Guid? id)
        {
            ViewBag.ProjectId = id;
            return View();
        }

        public async Task<IActionResult> LoadState(Guid id)
        {
            var result = new ApiResult<object>();
            try
            {
                var json = await System.IO.File.ReadAllTextAsync(_env.WebRootPath + "/states/" + id + ".json");
                var token = JsonConvert.DeserializeObject(json);
                result.Data = token;
                result.IsSuccess = true;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.Error = ex.Message;
            }
            return Json(result);
        }

        [HttpPost]
        [RequestSizeLimit(2 * 1024 * 1024)]
        public async Task<IActionResult> SaveState(Guid id)
        {
            var reader = new System.IO.StreamReader(HttpContext.Request.Body);
            var json = await reader.ReadToEndAsync();
            var result = new ApiResult<bool>();
            try
            {
                await System.IO.File.WriteAllTextAsync(_env.WebRootPath + "/states/" + id + ".json", json);
                result.Data = true;
                result.IsSuccess = true;
            }
            catch (Exception ex)
            {
                result.IsSuccess = false;
                result.Error = ex.Message;
            }
            return Json(result);
        }

        public async Task<IActionResult> StudioData()
        {
            var lastUpdate = await GetLastCommit();

            var model = new StudioViewModel()
            {
                Geo = await LoadGeoAreasFromJson(),
                Data = await LoadInfectionData(lastUpdate),
            };

            foreach (var area in model.Geo.Areas)
                area.Value.Geometry = null;

            return Json(model, new JsonSerializerSettings()
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                NullValueHandling = NullValueHandling.Ignore
            });
        }

        public async Task<IActionResult> RegionData(string id)
        {
            var cacheFile = _env.WebRootPath + $"\\data\\region_{id}_data.json";
            if (System.IO.File.Exists(cacheFile))
                return Content(await System.IO.File.ReadAllTextAsync(cacheFile), "application/json");

            var model = new StudioViewModel()
            {
                Geo = await LoadGeoRegionFromDb(id, false)
            };

            model.Data = new DayAreaDataSet<InfectionData>()
            {
                Days = new List<DayAreaGroupItem<InfectionData>>()
            };

            await FillDeathDataRegional(model.Data, id, 60, false);

      
            var json = JsonConvert.SerializeObject(model, new JsonSerializerSettings()
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                NullValueHandling = NullValueHandling.Ignore
            });

            await System.IO.File.WriteAllTextAsync(cacheFile, json);

            return Content(json, "application/json");
        }

        public async Task<IActionResult> RegionDataMap(string id)
        {
            var cacheFile = _env.WebRootPath + $"\\data\\region_{id}_map.svg";
            if (System.IO.File.Exists(cacheFile))
                return Content(await System.IO.File.ReadAllTextAsync(cacheFile), "text/xml+svg");

            var model = new StudioViewModel()
            {
                Geo = await LoadGeoRegionFromDb(id, true)
            };

            var view = await ViewUtils.RenderViewAsync(this, "_SvgMap", model, true);
            
            await System.IO.File.WriteAllTextAsync(cacheFile, view);

            return Content(view, "text/xml+svg");
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        #region UTILS

        async Task<EnvironmentItemViewModel[]> LoadEnvironmentData()
        {
            var data = (await new ItalyEnvironmentSource(_env.WebRootPath + "\\data\\air_quality.csv").LoadAsync()).Select(a =>
            {
                var item = new EnvironmentItemViewModel()
                {
                    Value = a,
                    Position = GeoUtils.Project(a.Location),
                    Radius = 100
                };
                if (a.Value < 20)
                    item.Severity = PollutantSeverity.Good;
                else if (a.Value < 40)
                    item.Severity = PollutantSeverity.Medium;
                else if (a.Value < 50)
                    item.Severity = PollutantSeverity.Bad;
                else if (a.Value < 75)
                    item.Severity = PollutantSeverity.Sever;
                else
                    item.Severity = PollutantSeverity.VerySevere;

                return item;
            }).ToArray();

            return data;
        }

        async Task<DayAreaDataSet<InfectionData>> LoadInfectionData(DateTime lastUpdate)
        {
            var cacheFile = _env.WebRootPath + "\\data\\infection_data.json";
            var file = new System.IO.FileInfo(cacheFile);

            if (file.Exists && file.LastWriteTime >= lastUpdate)
                return JsonConvert.DeserializeObject<DayAreaDataSet<InfectionData>>(await System.IO.File.ReadAllTextAsync(cacheFile));

            var sources = new IDataSource<DayAreaItem<InfectionData>>[]
            {
                new ItalyInfectionDistrictSource(),
                new ItalyInfectionRegionSource(),
                new ItalyInfectionSource()
            };

            var items = await Task.WhenAll(sources.Select(a => a.LoadAsync()));

            var data = items.SelectMany(a => a);

            var result = new DayAreaDataSet<InfectionData>()
            {
                Days = new List<DayAreaGroupItem<InfectionData>>()
            };

            var tomorrow = DateTime.Today.AddDays(1);
            foreach (var day in data.GroupBy(a => a.Date.Date).Where(a => a.Key < tomorrow))
            {
                var item = new DayAreaGroupItem<InfectionData>()
                {
                    Date = day.Key,
                    Values = new Dictionary<string, InfectionData>()
                };

                foreach (var area in day.GroupBy(a => a.AreaId))
                {
                    if (area.Key == "R4")
                        item.Values[area.Key] = InfectionData.Combine(area.Select(a => a.Value));
                    else
                    {
                        var value = area.OrderByDescending(a => a.Date).First();
                        item.Values[area.Key] = value.Value;
                    }
                }

                result.Days.Add(item);
            };

            await FillDeathDataNational(result, 60, true);

            await System.IO.File.WriteAllTextAsync(cacheFile, JsonConvert.SerializeObject(result, new JsonSerializerSettings() { NullValueHandling = NullValueHandling.Ignore }));

            return result;
        }

        async Task<GeoAreaViewSet> LoadGeoAreasFromJson(bool includePoly = true)
        {
            var cacheFile = _env.WebRootPath + "\\data\\italy_geo.json";
            if (System.IO.File.Exists(cacheFile))
                return JsonConvert.DeserializeObject<GeoAreaViewSet>(await System.IO.File.ReadAllTextAsync(cacheFile));

            var source = new ItalyGeoSource(_env.WebRootPath + "\\data\\province_demo.csv", _env.WebRootPath + "\\data\\province_superficie.csv");

            var data = await source.LoadAsync();

            var result = new GeoAreaViewSet
            {
                Areas = data.ToDictionary(a => a.Id, a => a),
                ViewBox = source.ViewBox
            };

            await System.IO.File.WriteAllTextAsync(cacheFile, JsonConvert.SerializeObject(result, new JsonSerializerSettings() { NullValueHandling = NullValueHandling.Ignore }));

            return result;
        }

        static async Task<GeoAreaViewSet> LoadGeoRegionFromDb(string regionCode, bool includePoly = true)
        {
            var result = new GeoAreaViewSet
            {
                Areas = new Dictionary<string, GeoAreaView>()
            };

            using (var ctx = DataContextFactory.Instance.CreateDbContext(null))
            {
                var region = await ctx.GeoAreas.Include(a=> a.Parent).Where(a => a.Type == GeoAreaType.Region && a.Code == regionCode).AsNoTracking().SingleAsync();
                var districts = await ctx.GeoAreas.Include(a => a.Parent).Where(a => a.Type == GeoAreaType.District &&  a.ParentId == region.Id).AsNoTracking().ToArrayAsync();
                var cities = await ctx.GeoAreas.Include(a => a.Parent).Where(a => a.Type == GeoAreaType.Municipality && a.Parent.ParentId == region.Id).AsNoTracking().ToArrayAsync();

                var regionView = CreateGeoArea(region, includePoly, result);

                foreach (var district in districts)
                    CreateGeoArea(district, includePoly, result);

                foreach (var city in cities)
                    CreateGeoArea(city, includePoly, result);

                if (includePoly)
                    result.ViewBox = GeoUtils.GetViewBox(regionView.Geometry);
            }
            return result;
        }

        static GeoAreaView CreateGeoArea(GeoArea geoArea, bool includePoly, GeoAreaViewSet result)
        {
            var view = new GeoAreaView
            {
                Id = CreateId(geoArea),
                Name = geoArea.Name,
                ParentId = CreateId(geoArea.Parent),
                Type = geoArea.Type,
                Demography = new AggregateDemografy()
                {
                    Total = geoArea.Population
                },
                Geometry = includePoly ? GeoUtils.ProjectAndSimplify(geoArea.Geometry, 0) : null
            };
            result.Areas[view.Id] = view;
            return view;
        }

        static string CreateId(GeoArea geoArea)
        {
            if (geoArea.Type == GeoAreaType.Country)
                return geoArea.Code;
            if (geoArea.Type == GeoAreaType.Region)
                return "R" + int.Parse(geoArea.Code);
            if (geoArea.Type == GeoAreaType.District)
                return "D" + int.Parse(geoArea.Code);
            if (geoArea.Type == GeoAreaType.Municipality)
                return "M" + geoArea.NationalCode;
            return null;
        }

        static async Task FillDeathDataRegional(DayAreaDataSet<InfectionData> result, string regionCode, int minAge, bool onlyInRange)
        {
            using (var ctx = DataContextFactory.Instance.CreateDbContext(null))
            {
                var deathRawItems = await ctx.TimeSeries.Where(a => 
                                a.IndicatorId == Consts.InfectionSerieId && 
                                a.GeoArea.Type == GeoAreaType.Municipality && 
                                a.GeoArea.Parent.Parent.Code == regionCode && 
                                a.Value != null && 
                                a.FromAge >= minAge)
                            .GroupBy(a => new 
                            { 
                                Date = a.StartDate, 
                                Code = a.GeoArea.NationalCode 
                            })
                            .Select(a => new DayAreaItem<int>()
                            {
                                Date = a.Key.Date,
                                AreaId = "M" + a.Key.Code,
                                Value = (int)a.Sum(b => b.Value)
                            })
                            .ToArrayAsync();

                FillDeathData(result, deathRawItems, onlyInRange);
            }
        }

        static async Task FillDeathDataNational(DayAreaDataSet<InfectionData> result, int minAge, bool onlyInRange)
        {
            using (var ctx = DataContextFactory.Instance.CreateDbContext(null))
            {
                var deathRawItems = await ctx.TimeSeries.Where(a => a.IndicatorId == Consts.InfectionSerieId && a.Value != null && a.FromAge >= minAge)
                            .GroupBy(a => new { Date = a.StartDate, Code = a.GeoArea.Parent.Parent.Code })
                            .Select(a => new DayAreaItem<int>()
                            {
                                Date = a.Key.Date,
                                AreaId = "R" + Convert.ToInt32(a.Key.Code).ToString(),
                                Value = (int)a.Sum(b => b.Value)
                            })
                            .ToListAsync();

                deathRawItems.AddRange(await ctx.TimeSeries.Where(a => a.IndicatorId == Consts.InfectionSerieId && a.Value != null && a.FromAge >= minAge)
                           .GroupBy(a => new { Date = a.StartDate, Code = a.GeoArea.Parent.CodeAlt })
                           .Select(a => new DayAreaItem<int>()
                           {
                               Date = a.Key.Date,
                               AreaId = "D" + Convert.ToInt32(a.Key.Code).ToString(),
                               Value = (int)a.Sum(b => b.Value)
                           }).ToArrayAsync());


                FillDeathData(result, deathRawItems, onlyInRange);
            }
        }

        static void FillDeathData(DayAreaDataSet<InfectionData> result, IList<DayAreaItem<int>> deathRawItems, bool onlyInRange)
        {
            var groups = deathRawItems.GroupBy(a => a.Date.Year).ToDictionary(a => a.Key, a => a.GroupBy(b => b.AreaId).ToDictionary(b => b.Key));
            var daysMap = result.Days.ToDictionary(a => a.Date);

            foreach (var yearGroup in groups)
            {
                foreach (var areaGroup in yearGroup.Value)
                {
                    InfectionData prevAreaData = null;
                    var dateGroup = areaGroup.Value.ToDictionary(a => a.Date);
                    var minDate = new DateTime(yearGroup.Key, 1, 1);
                    var maxDate = new DateTime(yearGroup.Key, 4, 30);
                    var curDate = minDate;
                    while (curDate <= maxDate)
                    {
                        dateGroup.TryGetValue(curDate, out var entry);

                        var curDay = new DateTime(2020, curDate.Month, curDate.Day);

                        if (!daysMap.TryGetValue(curDay, out var dayData))
                        {
                            if (onlyInRange)
                                goto nextDay;

                            dayData = new DayAreaGroupItem<InfectionData>()
                            {
                                Date = curDay,
                                Values = new Dictionary<string, InfectionData>()
                            };
                            daysMap[curDay] = dayData;
                            result.Days.Add(dayData);
                        }

                        if (!dayData.Values.TryGetValue(areaGroup.Key, out var areaData))
                        {
                            areaData = new InfectionData();
                            dayData.Values[areaGroup.Key] = areaData;
                        }

                        if (areaData.HistoricDeaths == null)
                            areaData.HistoricDeaths = new Dictionary<int, int?>();

                        areaData.HistoricDeaths[yearGroup.Key] = entry != null ? entry.Value : 0;
                        if (prevAreaData != null)
                            areaData.HistoricDeaths[yearGroup.Key] += prevAreaData.HistoricDeaths[yearGroup.Key];

                        prevAreaData = areaData;

                        nextDay:

                        curDate = curDate.AddDays(1);
                    }
                }
            }
                ((List<DayAreaGroupItem<InfectionData>>)result.Days).Sort((a, b) => a.Date.CompareTo(b.Date));
        }

        static async Task<DateTime> GetLastCommit()
        {
            try
            {
                var head = await HttpGetJson<GitHubHeadResponse>("https://api.github.com/repos/pcm-dpc/COVID-19/git/refs/heads/master");
                var commit = await HttpGetJson<GitHubCommitResponse>(head.obj.url);
                return commit.committer.date;
            }
            catch
            {
                return DateTime.Now;
            }
        }

        static async Task<T> HttpGetJson<T>(string url)
        {
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9");
            client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36");
            client.DefaultRequestHeaders.Add("Accept-Language", "en,it-IT;q=0.9,it;q=0.8,en-US;q=0.7");
            var json = await client.GetStringAsync(url);
            return JsonConvert.DeserializeObject<T>(json);
        }


        #endregion
    }
}

