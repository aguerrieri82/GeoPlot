using Geo.Data;
using Geo.Data.Entities;
using GeoPlot.Core;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Features;
using NetTopologySuite.Geometries;
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
        public static Geometry FixGeometry(Geometry geometry)
        {
            if (geometry is Polygon poly)
            {
                if (!poly.Shell.IsCCW) 
                    return poly.Reverse();
            }
            else if (geometry is GeometryCollection mPoly)
            {
                for (var i = 0; i < mPoly.Geometries.Length; i++)
                    mPoly.Geometries[i] = FixGeometry(mPoly.Geometries[i]);
            }
            return geometry;
        }

        public static async Task ImportGeography()
        {
            var client = new HttpClient();
            var reader = new GeoJsonReader();

            using (var ctx = DataContextFactory.Instance.CreateDbContext(null))
            {
                
                var munText = await client.GetStringAsync("https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_municipalities.geojson");
                var munFeatures = reader.Read<FeatureCollection>(munText).ToDictionary(a => a.Attributes["com_istat_code"].ToString());
                var munDb = ctx.GeoAreas.Include(a=> a.Parent).Where(a => a.Type == Geo.Data.Types.GeoAreaType.Municipality).ToDictionary(a => a.NationalCode);

                foreach (var item in munFeatures)
                {
                    try
                    {
                        Console.ResetColor();
                        Console.WriteLine(item.Value.Attributes["name"]);
                        if (!munDb.TryGetValue(item.Key, out var area))
                        {
                            Console.ForegroundColor = ConsoleColor.Yellow;
                            Console.WriteLine($"Comune {item.Key} non trovato, provo con nome");
                            area = munDb.Select(a => a.Value).
                                         Where(a => a.Parent.CodeAlt == (string)item.Value.Attributes["prov_istat_code"] && a.Name == (string)item.Value.Attributes["name"]).FirstOrDefault();
                            if (area == null)
                            {
                                Console.WriteLine($"Comune {item.Value.Attributes["name"]} non trovato.");
                                continue;
                            }
                        }
                        if (area.Geometry != null)
                            continue;
                        area.Geometry = FixGeometry(item.Value.Geometry);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex);
                    }
                }

                await ctx.SaveChangesAsync();
                

                var disText = await client.GetStringAsync("https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_provinces.geojson");
                var disFeatures = reader.Read<FeatureCollection>(disText).ToDictionary(a => a.Attributes["prov_istat_code"].ToString());
                var disDb = ctx.GeoAreas.Where(a => a.Type == Geo.Data.Types.GeoAreaType.District).ToDictionary(a => a.CodeAlt);

                foreach (var item in disFeatures)
                {
                    try
                    {
                        Console.WriteLine(item.Value.Attributes["prov_name"]);
                        var area = disDb[item.Key];
                        if (area.Geometry != null)
                            continue;

                        area.Geometry = FixGeometry(item.Value.Geometry);

                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex);
                    }
                }

                await ctx.SaveChangesAsync();

                var regText = await client.GetStringAsync("https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_regions.geojson");
                var regFeatures = reader.Read<FeatureCollection>(regText).ToDictionary(a => a.Attributes["reg_istat_code"].ToString());
                var regDB = ctx.GeoAreas.Where(a => a.Type == Geo.Data.Types.GeoAreaType.Region).ToDictionary(a => a.Code);

                foreach (var item in regFeatures)
                {
                    try
                    {
                        Console.WriteLine(item.Value.Attributes["reg_name"]);
                        var area = regDB[item.Key];
                        if (area.Geometry != null)
                            continue;

                        area.Geometry = FixGeometry(item.Value.Geometry);

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
