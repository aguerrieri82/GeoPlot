using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace GeoPlot.Core
{
    public class JsonDataSource<TData> : BaseFileDataSource<TData>
    {
        public JsonDataSource(string src)
            : base(src)
        {
        }

        protected override IEnumerable<TData> Load(string textData)
        {
            return Filter(JsonConvert.DeserializeObject<TData[]>(textData, new JsonSerializerSettings() {
                Error = HandleDeserializationError
            }));
        }

        void HandleDeserializationError(object sender, ErrorEventArgs errorArgs)
        {
            var currentError = errorArgs.ErrorContext.Error.Message;
            errorArgs.ErrorContext.Handled = true;
        }

        protected virtual IEnumerable<TData> Filter(TData[] rows)
        {
            return rows;
        }
    }
}
