using Geo.Data;
using Geo.Data.Entities;
using GeoPlot.Core;
using NetTopologySuite.Features;
using NetTopologySuite.IO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace GeoPlot.ServiceHost
{
    public static class Tasks
    {
        public static async Task ImportGeography()
        {
            var client = new HttpClient();
            var reader = new GeoJsonReader();

            using (var ctx = DataContextFactory.Instance.CreateDbContext(null))
            {
                var munText = await client.GetStringAsync("https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_municipalities.geojson");
                var munFeatures = reader.Read<FeatureCollection>(munText).ToDictionary(a => a.Attributes["com_istat_code"].ToString());
                var munDb = ctx.GeoAreas.Where(a => a.Type == Geo.Data.Types.GeoAreaType.Municipality).ToDictionary(a => a.NationalCode);

                foreach (var item in munFeatures)
                {
                    try
                    {
                        Console.WriteLine(item.Value.Attributes["name"]);
                        var area = munDb[item.Key];
                        area.Geometry = item.Value.Geometry;
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex);
                    }
                }

                await ctx.SaveChangesAsync();

                var disText = await client.GetStringAsync("https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_provinces.geojson");
                var disFeatures = reader.Read<FeatureCollection>(disText).ToDictionary(a => a.Attributes["prov_istat_code_num"].ToString());
                var disDb = ctx.GeoAreas.Where(a => a.Type == Geo.Data.Types.GeoAreaType.District).ToDictionary(a => a.Code);

                foreach (var item in disFeatures)
                {
                    try
                    {
                        Console.WriteLine(item.Value.Attributes["prov_name"]);
                        var area = disDb[item.Key];
                        area.Geometry = item.Value.Geometry;

                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex);
                    }
                }

                await ctx.SaveChangesAsync();

                var regText = await client.GetStringAsync("https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_regions.geojson");
                var regFeatures = reader.Read<FeatureCollection>(regText).ToDictionary(a => a.Attributes["reg_istat_code_num"].ToString());
                var regDB = ctx.GeoAreas.Where(a => a.Type == Geo.Data.Types.GeoAreaType.Region).ToDictionary(a => a.Code);

                foreach (var item in regFeatures)
                {
                    try
                    {
                        Console.WriteLine(item.Value.Attributes["reg_name"]);
                        var area = regDB[item.Key];
                        area.Geometry = item.Value.Geometry;

                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex);
                    }
                }

                await ctx.SaveChangesAsync();
            }
        }
    }
}
