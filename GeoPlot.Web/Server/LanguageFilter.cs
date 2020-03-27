 using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace GeoPlot.Web
{
    public class LanguageFilter : IAsyncActionFilter
    {
        readonly RequestLanguage _reqLanguage;

        public LanguageFilter(RequestLanguage reqLanguage)
        {
            _reqLanguage = reqLanguage;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var lang = context.RouteData.Values["lang"] as string;

            if (lang == null)
            {
                lang = context.HttpContext.Request.Cookies["lang"];
                if (lang == null)
                {
                    lang = context.HttpContext.Request.GetTypedHeaders().AcceptLanguage.OrderByDescending(x => x.Quality ?? 1).Select(x => x.Value.ToString()).Where(a => !a.StartsWith("en")).FirstOrDefault();
                    if (lang != null)
                        lang = lang.Split("-")[0];
                    else
                        lang = "en";
                }
            }
            _reqLanguage.Code = lang;

            await next();
        }
    }
}
