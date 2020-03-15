using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace GeoPlot.Core
{
    public abstract class BaseFileDataAdapter<T> : IDataAdapter<T>
    {
        string _dataSource;

        public BaseFileDataAdapter(string dataSource)
        {
            _dataSource = dataSource;
        }
 
        public virtual async Task<IEnumerable<T>> LoadAsync()
        {
            Uri uri;
            string text;
            if (Uri.TryCreate(_dataSource, UriKind.Absolute, out uri) && !uri.IsFile)
                text = await HttpGet(_dataSource);
            else
                text = await File.ReadAllTextAsync(_dataSource);
            return Load(text);
        }

        static async Task<string> HttpGet(string url)
        {
            using (var client = new HttpClient())
                return await client.GetStringAsync(url);
        }

        protected abstract IEnumerable<T> Load(string textData);
    }
}
