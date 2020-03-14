using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Web.Entities
{
    public struct DistrictPopulatonRawItem
    {
        public int codice { get; set; }

        public int totale_maschi { get; set; }

        public int totale_femmine { get; set; }

        public string eta { get; set; }
    }
}
