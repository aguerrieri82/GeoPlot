using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Coronavirus.Entities
{
    public struct InfectionItalyRegionRawItem
    {
        public DateTime? data;

        public int codice_regione;

        public string sigla_provincia;

        public string denominazione_regione;

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

        public double? ingressi_terapia_intensiva;

        public double? tamponi_test_molecolare;

        public double? tamponi_test_antigenico_rapido;

        public double? totale_positivi_test_molecolare;

        public double? totale_positivi_test_antigenico_rapido;

    }
}
