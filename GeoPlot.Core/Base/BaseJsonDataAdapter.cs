using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace GeoPlot.Core
{
    public abstract class BaseJsonDataAdapter<TData, TRow> : BaseFileDataAdapter<TData>
    {
        public BaseJsonDataAdapter(string dataSource)
            : base(dataSource)
        {
        }

        protected override IEnumerable<TData> Load(string textData)
        {
            return Process(JsonConvert.DeserializeObject<TRow[]>(textData));
        }

        protected virtual IEnumerable<TData> Process(TRow[] rows)
        {
            return rows.Select(Convert);
        }

        protected virtual TData Convert(TRow row)
        {
            throw new NotImplementedException();
        }
    }
}
