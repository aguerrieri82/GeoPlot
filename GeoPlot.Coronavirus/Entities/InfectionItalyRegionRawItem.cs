using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Coronavirus.Entities
{
    public struct InfectionItalyRegionRawItem
    {
        public DateTime data;

        public int codice_regione;

        public string sigla_provincia;

        public string denominazione_regione;

        public int? ricoverati_con_sintomi;

        public int? terapia_intensiva;

        public int? totale_ospedalizzati;

        public int? isolamento_domiciliare;

        public int? totale_attualmente_positivi;

        public int? nuovi_attualmente_positivi;

        public int? dimessi_guariti;

        public int? deceduti;

        public int? totale_casi;

        public int? tamponi;
    }
}
