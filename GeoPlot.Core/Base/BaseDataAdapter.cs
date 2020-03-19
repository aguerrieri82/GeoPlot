using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GeoPlot.Core
{
    public abstract class BaseDataAdapter<TRow, TData> : IDataSource<TRow>
    {
        protected IDataConverter<TRow, TData> _converter;

        public BaseDataAdapter(IDataConverter<TRow, TData> converter)
        {
            _converter = converter;
        }

        public abstract Task<IEnumerable<TRow>> LoadAsync();
    }
}
