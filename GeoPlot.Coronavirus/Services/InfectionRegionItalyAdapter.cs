using GeoPlot.Core;
using GeoPlot.Coronavirus.Entities;
using GeoPlot.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace GeoPlot.Coronavirus
{
    public class InfectionRegionItalyAdapter : BaseJsonDataAdapter<DayAreaItem<InfectionData>, RegionInfectionItalyRawItem>
    {
        public InfectionRegionItalyAdapter()
            : this("https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-regioni.json")
        {
        }

        public InfectionRegionItalyAdapter(string dataSource)
            : base(dataSource)
        {
        }

        protected override IEnumerable<DayAreaItem<InfectionData>> Process(RegionInfectionItalyRawItem[] rows)
        {
            return rows.Where(a => !string.IsNullOrEmpty(a.denominazione_regione)).Select(Convert);
        }

        protected override DayAreaItem<InfectionData> Convert(RegionInfectionItalyRawItem row)
        {
            return new DayAreaItem<InfectionData>()
            {
                Date = row.data,
                AreaId = "R" + row.codice_regione,
                Value = new InfectionData()
                {
                    TotalPositive = row.totale_casi,
                    CurrentPositive = row.totale_attualmente_positivi,
                    TotalDeath = row.deceduti,
                    TotalHealed = row.dimessi_guariti,
                    TotalHospedalized = row.ricoverati_con_sintomi,
                    TotalSevere = row.terapia_intensiva,
                    ToatlTests = row.tamponi
                }
            };
        }
    }
}
