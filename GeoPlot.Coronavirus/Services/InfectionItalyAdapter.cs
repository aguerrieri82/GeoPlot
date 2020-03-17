﻿using GeoPlot.Core;
using GeoPlot.Coronavirus.Entities;
using GeoPlot.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace GeoPlot.Coronavirus
{
    public class InfectionItalyAdapter : BaseJsonDataAdapter<DayAreaItem<InfectionData>, InfectionItalyRawItem>
    {
        public InfectionItalyAdapter()
            : this("https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json")
        {
        }

        public InfectionItalyAdapter(string dataSource)
            : base(dataSource)
        {
        }

        protected override DayAreaItem<InfectionData> Convert(InfectionItalyRawItem row)
        {
            return new DayAreaItem<InfectionData>()
            {
                Date = row.data,
                AreaId = "IT",
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
