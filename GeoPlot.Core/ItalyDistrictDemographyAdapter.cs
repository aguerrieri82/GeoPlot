using GeoPlot.Core.Entities;
using GeoPlot.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace GeoPlot.Core
{
    public class ItalyDistrictDemographyAdapter : BaseJsonDataAdapter<IGeoAreaItem<Demography<int>>, ItalyDistrictPopulatonRawItem>
    {
        public ItalyDistrictDemographyAdapter(string dataSource)
            : base(dataSource)
        {
        }

        protected override IEnumerable<IGeoAreaItem<Demography<int>>> Process(ItalyDistrictPopulatonRawItem[] rows)
        {
            var popData = rows.Where(a => a.eta == "Totale").ToDictionary(a => a.codice);
            var oldPopData = rows.Where(a => a.eta != "Totale" && int.Parse(a.eta) > 65).GroupBy(a => a.codice).ToDictionary(a => a.Key, a => a.Sum(b => b.totale_femmine + b.totale_maschi));
           
            return popData.Select(a => (IGeoAreaItem<Demography<int>>)new GeoAreaItem<Demography<int>>()
            {
                AreaId = "D" + int.Parse(a.Key).ToString(),
                Value = new Demography<int>()
                {
                    Female = a.Value.totale_femmine,
                    Male = a.Value.totale_maschi,
                    Total = a.Value.totale_femmine + a.Value.totale_maschi,
                    Old = oldPopData[a.Key]
                }
            });
        }

    }
}
