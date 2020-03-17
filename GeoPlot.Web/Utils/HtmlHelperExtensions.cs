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
        public static string ActiveClass(this IHtmlHelper htmlHelper, string action, string controller = null)
        {
            string curAction = htmlHelper.ViewContext.RouteData.Values["action"] as string;
            string curController = htmlHelper.ViewContext.RouteData.Values["controller"] as string;
            if ((!string.IsNullOrWhiteSpace(controller) && controller != curController) || action != curAction)
                return "";
            return "active";
        }

        // Laura 2019-09-19
        public static string ActiveClass(this IHtmlHelper htmlHelper, List<String> actions, List<String> controllers = null)
        {
            string curAction = htmlHelper.ViewContext.RouteData.Values["action"] as string;
            string curController = htmlHelper.ViewContext.RouteData.Values["controller"] as string;

            int index = 0;
            while (index < actions.Count)
            {
                if (controllers[index] == curController && actions[index] == curAction)
                    return "active";
                index += 1;
            }
            return "";
        }
        public static IHtmlContent Json<TModel>(this IHtmlHelper<TModel> html, object obj)
        {
            return html.Raw(JsonConvert.SerializeObject(obj, Formatting.None, new JsonSerializerSettings()
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                NullValueHandling = NullValueHandling.Ignore
            }));
        }
    }
}
