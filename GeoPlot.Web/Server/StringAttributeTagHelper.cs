using Microsoft.AspNetCore.Razor.TagHelpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Web
{
    [HtmlTargetElement("*", Attributes = "string")]
    [HtmlTargetElement("meta", Attributes = "content")]
    [HtmlTargetElement("a", Attributes = "title")]
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
            if (output.TagName == "meta")
            {
                output.Attributes.SetAttribute("content", _stringTable.Format(contentAttr.Value.ToString()));
                return;
            }
            if (output.TagName == "a")
            {
                if (output.Attributes.TryGetAttribute("title", out var titleAttr))
                    output.Attributes.SetAttribute("title", _stringTable.Format(titleAttr.Value.ToString()));
            }

            if (output.Attributes.TryGetAttribute("string", out var stringAttr))
            {
                    output.Content.Clear();
                    output.Content.Append(_stringTable.Format(stringAttr.Value.ToString()));
                    output.Attributes.RemoveAll("string");
            }
        }
    }
}
