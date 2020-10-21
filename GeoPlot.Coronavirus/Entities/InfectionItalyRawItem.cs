using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Coronavirus.Entities
{
    public struct InfectionItalyRawItem
    {
        public DateTime? data;

        public string stato;

        public int? ricoverati_con_sintomi;

        public int? terapia_intensiva;

        public int? totale_ospedalizzati;

        public int? isolamento_domiciliare;

        public int? totale_positivi;

        public int? nuovi_positivi;

        public int? dimessi_guariti;

        public int? deceduti;

        public int? totale_casi;

        public int? tamponi;

        public double? casi_testati;
    }
}
