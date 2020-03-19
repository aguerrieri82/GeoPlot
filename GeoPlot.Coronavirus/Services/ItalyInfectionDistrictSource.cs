using GeoPlot.Core;
using GeoPlot.Coronavirus.Entities;
using GeoPlot.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace GeoPlot.Coronavirus
{
    public class ItalyInfectionDistrictSource : BaseDataSourceConverter<InfectionItalyDistrictRawItem, DayAreaItem<InfectionData>>
    {
        public ItalyInfectionDistrictSource()
            : this("https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-province.json")
        {
        }

        public ItalyInfectionDistrictSource(string src)
            : base(new JsonDataSource<InfectionItalyDistrictRawItem>(src))
        {
        }

        protected override IEnumerable<InfectionItalyDistrictRawItem> Filter(IEnumerable<InfectionItalyDistrictRawItem> source)
        {
            return source.Where(a => !string.IsNullOrEmpty(a.sigla_provincia) && a.data != null);
        }

        protected override DayAreaItem<InfectionData> Convert(InfectionItalyDistrictRawItem row)
        {
            return new DayAreaItem<InfectionData>()
            {
                Date = row.data.Value,
                AreaId = "D" + row.codice_provincia,
                Value = new InfectionData()
                {
                    TotalPositive = row.totale_casi
                }
            };
        }
    }
}
