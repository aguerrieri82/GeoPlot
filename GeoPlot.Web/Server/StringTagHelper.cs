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
        readonly RequestLanguage _reqLanguage;
        public StringTagHelper(IStringTable stringTable, RequestLanguage reqLanguage)
        {
            _stringTable = stringTable;
            _reqLanguage = reqLanguage;
        }


        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            var pattern = (await output.GetChildContentAsync()).GetContent();
            
            var text = _stringTable.Format(_reqLanguage.Language, pattern);
            output.Content.Clear();
            output.Content.AppendHtml(text);
            output.TagName = "";
        }
  
    }
}
