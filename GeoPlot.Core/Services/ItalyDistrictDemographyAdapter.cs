using GeoPlot.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace GeoPlot.Core
{
    public class ItalyDistrictDemographyAdapter : BaseCsvAdapter<IGeoAreaItem<Demography<int>>>
    {
        public ItalyDistrictDemographyAdapter(string dataSource)
            : base(dataSource)
        {
        }

        protected override bool IsRowValid(string[] row)
        {
            return row[2] == "Totale";
        }

        protected override IGeoAreaItem<Demography<int>> Convert(string[] row)
        {
            return new GeoAreaItem<Demography<int>>()
            {
                AreaId = "D" + int.Parse(row[0]).ToString(),
                Value = new Demography<int>()
                {
                    Female = int.Parse(row[18]),
                    Male = int.Parse(row[10]),
                    Total = int.Parse(row[18]) + int.Parse(row[10])
                }
            };
        }
    }
}
