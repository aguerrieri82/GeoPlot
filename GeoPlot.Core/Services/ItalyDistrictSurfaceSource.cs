using GeoPlot.Entities;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;

namespace GeoPlot.Core
{
    public class ItalyDistrictSurfaceSource : BaseCsvDataSource<IGeoAreaItem<double>>
    {
        public ItalyDistrictSurfaceSource(string dataSource)
            : base(dataSource)
        {
        }

        protected override IGeoAreaItem<double> Parse(string[] row)
        {
            return new GeoAreaItem<double>()
            {
                AreaId = "D" + row[0].PadLeft(3, '0'),
                Value = double.Parse(row[2], CultureInfo.InvariantCulture)
            };
        }
    }
}
