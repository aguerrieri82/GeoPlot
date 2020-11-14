using GeoPlot.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace GeoPlot.Core
{
    public class RegionDemoRawItem
    {
        public string Region;

        public int Population;

    }

    public class ItalyRegionDemographySource : BaseCsvDataSource<RegionDemoRawItem>
    {
        public ItalyRegionDemographySource(string dataSource)
            : base(dataSource)
        {
        }

        protected override RegionDemoRawItem Parse(string[] row)
        {
            return new RegionDemoRawItem
            {
                Region =row[0],
                Population = int.Parse(row[1])
            };
        }
    }
}
