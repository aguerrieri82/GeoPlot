using Microsoft.AspNetCore.Razor.TagHelpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Web
{
    [HtmlTargetElement("string")]
    public class StringTagHelper :  TagHelper
    {
        readonly IStringTable _stringTable;

        public StringTagHelper(IStringTable stringTable)
        {
            _stringTable = stringTable;
        }


        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            var pattern = (await output.GetChildContentAsync()).GetContent();
            var text = _stringTable.Format(pattern);
            output.Content.Clear();
            output.Content.AppendHtml(text);
            output.TagName = "";
        }
  
    }
}
