using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Web.Entities
{
    public struct DistrictInfectionRawItem
    {
        public DateTime data;

        public string sigla_provincia;

        public int? totale_casi;

        public int codice_provincia;
    }
}
