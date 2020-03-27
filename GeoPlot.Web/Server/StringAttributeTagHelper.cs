using Microsoft.AspNetCore.Razor.TagHelpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Web
{
    [HtmlTargetElement("*", Attributes = "string")]
    [HtmlTargetElement("*", Attributes = "string-*")]
    public class StringAttributeTagHelper :  TagHelper
    {
        readonly IStringTable _stringTable;
        readonly RequestLanguage _reqLanguage;

        public StringAttributeTagHelper(IStringTable stringTable, RequestLanguage reqLanguage)
        {
            _stringTable = stringTable;
            _reqLanguage = reqLanguage;
        }

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            var contentAttr = output.Attributes["content"];

            foreach (var attr in output.Attributes.Where(a=> a.Name.StartsWith("string-")).ToArray())
            {
                var name = attr.Name.Substring(7);
                output.Attributes.Add(name, _stringTable.Format(_reqLanguage.Code, attr.Value.ToString()));
                output.Attributes.Remove(attr);
            }

            if (output.Attributes.TryGetAttribute("string", out var stringAttr))
            {
                output.Content.Clear();
                output.Content.Append(_stringTable.Format(_reqLanguage.Code, stringAttr.Value.ToString()));
                output.Attributes.Remove(stringAttr);
            }
        }
    }
}
