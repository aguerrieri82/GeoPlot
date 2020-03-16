using GeoPlot.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace GeoPlot.Core
{
    public class ItalyRegionDemographyAdapter : BaseCsvAdapter<IGeoAreaItem<Demography<int>>>
    {
        static readonly List<string> REGIONS = new List<string> { "Piemonte" ,"Valle d'Aosta/Vallée d'Aoste" ,"Lombardia" ,"Trentino-Alto Adige/Südtirol" ,"Veneto" ,"Friuli-Venezia Giulia" ,"Liguria" ,"Emilia-Romagna" ,"Toscana" ,"Umbria" ,"Marche" ,"Lazio" ,"Abruzzo" ,"Molise" ,"Campania" ,"Puglia" ,"Basilicata" ,"Calabria" ,"Sicilia" ,"Sardegna"};

        public ItalyRegionDemographyAdapter(string dataSource)
            : base(dataSource)
        {
        }

        protected override bool IsRowValid(string[] row)
        {
            return row[1] == "Totale";
        }

        protected override IGeoAreaItem<Demography<int>> Convert(string[] row)
        {
            return new GeoAreaItem<Demography<int>>()
            {
                AreaId = "R" + (REGIONS.IndexOf(row[0]) + 1).ToString(),
                Value = new Demography<int>()
                {
                    Female = int.Parse(row[17]),
                    Male = int.Parse(row[9]),
                    Total = int.Parse(row[17]) + int.Parse(row[9])
                }
            };
        }
    }
}
