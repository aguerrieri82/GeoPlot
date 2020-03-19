using System;
using System.Collections.Generic;
using System.Text;

namespace GeoPlot.Core
{
    public interface IDataConverter<TSource, TDest>
    {
        IEnumerable<TDest> Convert(IEnumerable<TSource> source);
    }
}
