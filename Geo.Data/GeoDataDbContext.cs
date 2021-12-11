using Eusoft.ServiceModel;
using Geo.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Geo.Data
{
    public class DataContextFactory : IDesignTimeDbContextFactory<GeoDataDbContext>
    {
        public GeoDataDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<GeoDataDbContext>();
            var config = Context.Require<IConfigurationRoot>();
            var connection = config == null|| config.GetConnectionString("GeoData") == null ? "Server=eusoft.net,42000;Database=GeoData;User Id=sa;Password=37MU0p$jem" : config.GetConnectionString("GeoData");
            
            optionsBuilder.UseSqlServer(connection, a => a.UseNetTopologySuite());

            return new GeoDataDbContext(optionsBuilder.Options);
        }

        public static readonly DataContextFactory Instance = new DataContextFactory();
    }

    public class GeoDataDbContext : DbContext
    {
        public GeoDataDbContext(DbContextOptions options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

        }

        public DbSet<GeoArea> GeoAreas { get; set; }

        public DbSet<Indicator> Indicators { get; set; }

        public DbSet<TimeSerie> TimeSeries { get; set; }
    }
}
