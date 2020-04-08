using Geo.Data.Types;
using NetTopologySuite.Geometries;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Geo.Data.Entities
{

    [Table("GeoArea")]
    public class GeoArea
    {
        public Guid? Id { get; set; }

        public Guid? ParentId { get; set; }

        public string Name { get; set; }

        public string InternationalName { get; set; }

        public GeoAreaType Type { get; set; }

        public string Code { get; set; }

        public string CodeAlt { get; set; }

        public string NationalCode { get; set; }

        public string InternationalCode { get; set; }

        public Geometry Geometry { get; set; }

        public GeoArea Parent { get; set; }
    }
}
