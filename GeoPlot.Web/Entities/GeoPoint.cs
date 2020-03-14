using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eusoft.Mathematics.Geometry
{
    public struct GeoPoint
    {
        public GeoPoint(double lat, double lng)
        {
            Lat = lat;
            Lng = lng;
        }

        public double Lat;

        public double Lng;
    }
}
