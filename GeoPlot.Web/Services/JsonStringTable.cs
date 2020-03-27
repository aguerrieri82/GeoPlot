using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Web.Services
{
    public class JsonStringTable : IStringTable
    {
        IDictionary<string, string> _table;
        string _src;

        public JsonStringTable(string src)
        {
            _src = src;
            _table = JsonConvert.DeserializeObject<IDictionary<string, string>>(ToJson());
        }

        public string this[string id] 
        {
            get
            {
                if (_table.TryGetValue(id, out var result))
                    return result;
                return id;                    
            }
        }

        public string ToJson()
        {
            return File.ReadAllText(_src);
        }

    }
}
