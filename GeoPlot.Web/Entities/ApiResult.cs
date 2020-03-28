using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Web.Entities
{
    public class ApiResult<T>
    {
        public T Data { get; set; }

        public bool IsSuccess { get; set; }

        public string Error { get; set; }
    }
}
