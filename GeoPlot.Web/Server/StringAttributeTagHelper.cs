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

        public StringAttributeTagHelper(IStringTable stringTable)
        {
            _stringTable = stringTable;
        }

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            var contentAttr = output.Attributes["content"];

            foreach (var attr in output.Attributes.Where(a=> a.Name.StartsWith("string-")).ToArray())
            {
                var name = attr.Name.Substring(7);
                output.Attributes.Add(name, _stringTable.Format(attr.Value.ToString()));
                output.Attributes.Remove(attr);
            }

            if (output.Attributes.TryGetAttribute("string", out var stringAttr))
            {
                output.Content.Clear();
                output.Content.Append(_stringTable.Format(stringAttr.Value.ToString()));
                output.Attributes.Remove(stringAttr);
            }
        }
    }
}
