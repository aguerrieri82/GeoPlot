using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GeoPlot.Core
{
    public interface IDataAdapter<T>
    {
        Task<IEnumerable<T>> LoadAsync();
    }
}
