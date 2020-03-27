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
        class TableData
        {
            public string Language { get; set; }

            public IDictionary<string, string> Values { get; set; }
        }

        IDictionary<string, IDictionary<string, string>> _table;
        string _basePath;

        public JsonStringTable(string basePath)
        {
            _basePath = basePath;
            Load();
        }

        void Load()
        {
            if (_table == null)
                _table = new Dictionary<string, IDictionary<string, string>>();
            else
                _table.Clear();

            foreach (var fileName in Directory.GetFiles(_basePath, "*.json"))
            {
                var curData = JsonConvert.DeserializeObject<TableData[]>(File.ReadAllText(fileName));
                foreach (var item in curData)
                    _table[item.Language] = item.Values;
            }
        }

        protected IDictionary<string, string> GetTable(string language)
        {
            if (_table.TryGetValue(language, out var table))
                return table;
            return _table["en"];
        }

        public string Get(string language, string id)
        {
            var table = GetTable(language);
            if (table.TryGetValue(id, out var result))
                return result;
            return id;
        }

        public string ToJson(string language)
        {
            return JsonConvert.SerializeObject(GetTable(language));
        }

    }
}
