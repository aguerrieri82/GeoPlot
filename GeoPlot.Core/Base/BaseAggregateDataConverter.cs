using System;
using System.Collections.Generic;
using System.Text;

namespace GeoPlot.Core.Base
{
    public abstract class BaseAggregateDataConverter<TSource, TDest> : IDataConverter<TSource, TDest>
    {
        public IEnumerable<TDest> Convert(IEnumerable<TSource> source)
        {
            throw new NotImplementedException();
        }
    }
}
