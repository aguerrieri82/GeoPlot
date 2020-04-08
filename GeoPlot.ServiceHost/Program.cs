using Eusoft.ServiceModel;
using Geo.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.IO;

namespace GeoPlot.ServiceHost
{
    class Program
    {
        static void Main(string[] args)
        {
            InitServices();
            
            Tasks.ImportGeography().Wait();

            Console.WriteLine("Hello World!");

        }

        static void InitServices()
        {
            var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

            var config = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddNewtonsoftJsonFile("appsettings.json", optional: true, reloadOnChange: true)
            .AddNewtonsoftJsonFile($"appsettings.{environment}.json", optional: true, reloadOnChange: true)
            .Build();

            var services = new ServiceCollection()
                .AddLogging(log => log
                    .AddConfiguration(config.GetSection("Logging")));

            services.AddDbContext<GeoDataDbContext>(options => options.UseSqlServer(config.GetConnectionString("GeoData"), a=> a.UseNetTopologySuite()), ServiceLifetime.Scoped);

            var serviceProvider = services.BuildServiceProvider();

            Context.Implement(serviceProvider);
            Context.Implement(config);
        }
    }
}
