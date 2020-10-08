using GeoPlot.Core;
using GeoPlot.Coronavirus.Entities;
using GeoPlot.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace GeoPlot.Coronavirus
{
    public class ItalyInfectionRegionSource : BaseDataSourceConverter<InfectionItalyRegionRawItem, DayAreaItem<InfectionData>>
    {
        public ItalyInfectionRegionSource()
            : this("https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-regioni.json")
        {
        }

        public ItalyInfectionRegionSource(string src)
            : base(new JsonDataSource<InfectionItalyRegionRawItem>(src))
        {
        }

        protected override IEnumerable<InfectionItalyRegionRawItem> Filter(IEnumerable<InfectionItalyRegionRawItem> source)
        {
            return source.Where(a => !string.IsNullOrEmpty(a.denominazione_regione) && a.data != null);
        }

        protected override DayAreaItem<InfectionData> Convert(InfectionItalyRegionRawItem row)
        {
            return new DayAreaItem<InfectionData>()
            {
                Date = row.data.Value,
                AreaId = "R" + row.codice_regione.ToString().PadLeft(2, '0'),
                Value = new InfectionData()
                {
                    TotalPositive = row.totale_casi,
                    CurrentPositive = row.totale_positivi,
                    TotalDeath = row.deceduti,
                    TotalHealed = row.dimessi_guariti,
                    TotalHospedalized = row.ricoverati_con_sintomi,
                    TotalSevere = row.terapia_intensiva,
                    ToatlTests = row.tamponi,
                    TotalCaseTested = row.casi_testati
                }
            };
        }
    }
}
