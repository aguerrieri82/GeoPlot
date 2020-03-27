using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace GeoPlot.Web
{
    public interface IStringTable
    {
        string this[string id] { get; }

        string ToJson();
    }

    public static class StringTableExtensions 
    {
        public static string Format(this IStringTable table, string format, params object[] args)
        {
            var REP_EXP = new Regex(@"\$\((?<id>[^)]+)\)", RegexOptions.IgnoreCase);
            var text = REP_EXP.Replace(format, a => table[a.Groups["id"].Value]);
            return string.Format(text, args);
        }
    }

}
