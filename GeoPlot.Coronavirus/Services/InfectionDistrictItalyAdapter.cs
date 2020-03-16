using GeoPlot.Core;
using GeoPlot.Coronavirus.Entities;
using GeoPlot.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace GeoPlot.Coronavirus
{
    public class InfectionDistrictItalyAdapter : BaseJsonDataAdapter<DayAreaItem<InfectionData>, DistrictInfectionItalyRawItem>
    {
        public InfectionDistrictItalyAdapter()
            : this("https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-province.json")
        {
        }

        public InfectionDistrictItalyAdapter(string dataSource)
            : base(dataSource)
        {
        }

        protected override IEnumerable<DayAreaItem<InfectionData>> Process(DistrictInfectionItalyRawItem[] rows)
        {
            return rows.Where(a => !string.IsNullOrEmpty(a.sigla_provincia)).Select(Convert);
        }

        protected override DayAreaItem<InfectionData> Convert(DistrictInfectionItalyRawItem row)
        {
            return new DayAreaItem<InfectionData>()
            {
                Date = row.data,
                AreaId = "D" + row.codice_provincia,
                Value = new InfectionData()
                {
                    TotalPositive = row.totale_casi
                }
            };
        }
    }
}
