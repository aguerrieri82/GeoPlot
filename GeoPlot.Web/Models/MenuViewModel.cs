using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace GeoPlot.Web.Models
{
    public class MenuViewModel 
    {
        public string Name { get; set; }

        public string Icon { get; set; }

        public string Action { get; set; }

        public string Controller { get; set; }

        public object RouteData { get; set; }

        public string Url(IUrlHelper url)
        {
            return url.Action(Action, Controller, RouteData);
        }
    }
}
