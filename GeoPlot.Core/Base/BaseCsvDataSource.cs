using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace GeoPlot.Core
{
    public abstract class BaseCsvDataSource<TData> : BaseFileDataSource<TData>
    {
        public BaseCsvDataSource(string dataSource)
            : base(dataSource)
        {
        }

        protected override IEnumerable<TData> Load(string textData)
        {
            var regex = new Regex("(?<=^|,)(\"(?:[^\"]|\"\")*\"|[^,]*)");
            var reader = new StringReader(textData);

            string line = reader.ReadLine();

            while ((line = reader.ReadLine()) != null)
            {
                var row = regex.Matches(line).Select(a => a.Value.Trim('"')).ToArray();
                if (IsRowValid(row))
                    yield return Parse(row);
            }
        }

        protected virtual bool IsRowValid(string[] row)
        {
            return true;
        }

        protected abstract TData Parse(string[] row);
    }
}
