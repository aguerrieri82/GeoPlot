using Microsoft.AspNetCore.Mvc.Rendering;
using System.Collections.Generic;
using System;
using Microsoft.AspNetCore.Html;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace GeoPlot.Web
{
    public static class UriHelperExtensions
    {
        public static string ChangeLanguage(this IUrlHelper uriHelper, string language)
        {
            var newData = new RouteValueDictionary(uriHelper.ActionContext.RouteData.Values);
            string curAction = newData["action"] as string;
            string curController = newData["controller"] as string;
            newData["lang"] = language;

            return uriHelper.Action("SetLanguage", "Home", new { id = language, returnUrl = uriHelper.Action(curAction, curController, newData) });
        }
    }
}
