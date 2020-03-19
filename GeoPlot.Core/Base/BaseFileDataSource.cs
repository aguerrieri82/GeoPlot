using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace GeoPlot.Core
{
    public abstract class BaseFileDataSource<TData> : IDataSource<TData>
    {
        protected string _src;

        public BaseFileDataSource(string src)
        {
            _src = src;
        }
 
        public virtual async Task<IEnumerable<TData>> LoadAsync()
        {
            Uri uri;
            string text;
            if (Uri.TryCreate(_src, UriKind.Absolute, out uri) && !uri.IsFile)
                text = await HttpGet(_src);
            else
                text = await File.ReadAllTextAsync(_src);
            return Load(text);
        }

        static async Task<string> HttpGet(string url)
        {
            using (var client = new HttpClient())
                return await client.GetStringAsync(url);
        }

        protected abstract IEnumerable<TData> Load(string textData);
    }
}
