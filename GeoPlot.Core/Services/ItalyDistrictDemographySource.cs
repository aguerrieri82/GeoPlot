using GeoPlot.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace GeoPlot.Core
{
    public class DistrictDemoRawItem
    {
        public string DistrictId;

        public int? Age;

        public int Male;

        public int Female;
    }

    public class ItalyDistrictDemographySource : BaseCsvDataSource<DistrictDemoRawItem>
    {
        public ItalyDistrictDemographySource(string dataSource)
            : base(dataSource)
        {
        }

        protected override DistrictDemoRawItem Parse(string[] row)
        {
            return new DistrictDemoRawItem
            {
                DistrictId = "D" + int.Parse(row[0]).ToString(),
                Age = row[2] == "Totale" ? null : (int?)int.Parse(row[2]),
                Female = int.Parse(row[18]),
                Male = int.Parse(row[10])
            };
        }
    }
}
