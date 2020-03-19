using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoPlot.Core
{
    public abstract class BaseDataSourceConverter<TSource, TDest> : IDataConverter<TSource, TDest>, IDataSource<TDest>
    {
        protected IDataSource<TSource> _src;

        public BaseDataSourceConverter(IDataSource<TSource> src)
        {
            _src = src;
        }

        public IEnumerable<TDest> Convert(IEnumerable<TSource> source)
        {
            return Filter(source).Select(Convert);
        }

        public async Task<IEnumerable<TDest>> LoadAsync()
        {
            var data = await _src.LoadAsync();
            return Convert(data);
        }

        protected virtual IEnumerable<TSource> Filter(IEnumerable<TSource> source)
        {
            return source;
        }

        protected abstract TDest Convert(TSource value);

    }
}
