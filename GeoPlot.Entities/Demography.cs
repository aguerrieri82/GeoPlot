using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Entities
{
    public enum Gender
    {
        All,
        Male,
        Female
    }

    public class Demography
    {
        public int? FromAge { get; set; }

        public int? ToAge { get; set; }

        public int Value { get; set; }

        public Gender Gender { get; set; }
    }
}
