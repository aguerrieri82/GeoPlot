using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Entities
{
    public class Demography<T> where T : struct
    {
        public T? Total { get; set; }

        public T? Male { get; set; }

        public T? Female { get; set; }

        public T? Old { get; set; }
    }
}
