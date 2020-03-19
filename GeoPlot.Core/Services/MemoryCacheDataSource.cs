using NetTopologySuite.Triangulate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GeoPlot.Core
{
    public class MemoryCacheDataSource<TData> : IDataSource<TData>
    {
        protected TData[] _data;
        protected IDataSource<TData> _source;

        public MemoryCacheDataSource(IDataSource<TData> source)
        {
            _source = source;
        }

        public async Task<IEnumerable<TData>> LoadAsync()
        {
            if (_data == null)
                await Update();
            return _data;
        }

        public async Task Update()
        {
            _data = (await _source.LoadAsync()).ToArray();
        }
    }
}
