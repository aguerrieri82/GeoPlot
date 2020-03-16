using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace GeoPlot.Core
{
    public abstract class BaseCsvAdapter<TData> : BaseFileDataAdapter<TData>
    {
        public BaseCsvAdapter(string dataSource)
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
                    yield return Convert(row);
            }
        }

        protected virtual bool IsRowValid(string[] row)
        {
            return true;
        }

        protected abstract TData Convert(string[] row);
    }
}
