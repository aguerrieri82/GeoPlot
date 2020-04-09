using System;
using System.Collections.Generic;
using System.Text;

namespace GeoPlot.Entities
{
    public class AggregateDemografy
    {
        public static AggregateDemografy Sum(IEnumerable<AggregateDemografy> values)
        {
            var result = new AggregateDemografy()
            {
                Male = 0,
                Female = 0,
                Over65 = 0,
                Total = 0
            };
            foreach (var item in values)
            {
                if (item.Male != null)
                    result.Male += item.Male.Value;
                if (item.Female != null)
                    result.Female += item.Female.Value;
                if (item.Over65 != null)
                    result.Over65 += item.Over65.Value;
                result.Total += item.Total;
            }
            return result;
        }

        public long? Total { get; set; }

        public long? Male { get; set; }

        public long? Female { get; set; }

        public long? Over65 { get; set; }
    }
}
