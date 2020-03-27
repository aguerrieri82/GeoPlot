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
            public string Language;
            public IDictionary<string, string> Values;
        }

        IDictionary<string, IDictionary<string, string>> _table;
        string _basePath;
        string _currentLanguage;

        public JsonStringTable(string basePath)
        {
            _basePath = basePath;
            _currentLanguage = "en";
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

        public string this[string id] 
        {
            get
            {
                if (_table[_currentLanguage].TryGetValue(id, out var result))
                    return result;
                return id;                    
            }
        }

        public string CurrentLanguage => _currentLanguage;

        public void SetLanguage(string code)
        {
            if (!_table.ContainsKey(code))
                _currentLanguage = "en";
            else
                _currentLanguage = "code";
        }

        public string ToJson()
        {
            return JsonConvert.SerializeObject(_table[CurrentLanguage]);
        }

    }
}
