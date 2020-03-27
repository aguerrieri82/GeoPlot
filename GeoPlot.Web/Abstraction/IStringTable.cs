using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace GeoPlot.Web
{
    public interface IStringTable
    {
        string Get(string language, string id);

        string ToJson(string language);
    }

    public static class StringTableExtensions 
    {
        public static string Format(this IStringTable table, string language, string format, params object[] args)
        {
            var REP_EXP = new Regex(@"\$\((?<id>[^)]+)\)", RegexOptions.IgnoreCase);
            var text = REP_EXP.Replace(format, a => table.Get(language, a.Groups["id"].Value));
            return string.Format(text, args);
        }
    }

}
