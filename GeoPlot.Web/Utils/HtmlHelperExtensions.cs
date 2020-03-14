using Microsoft.AspNetCore.Mvc.Rendering;
using System.Collections.Generic;
using System;
using Microsoft.AspNetCore.Html;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace GeoPlot.Web
{
    public static class HtmlHelperExtensions
    {
    
        public static IHtmlContent Json<TModel>(this IHtmlHelper<TModel> html, object obj)
        {
            return html.Raw(JsonConvert.SerializeObject(obj, new JsonSerializerSettings()
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            }));
        }
    }
}
