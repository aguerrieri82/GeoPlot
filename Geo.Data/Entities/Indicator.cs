using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Geo.Data.Entities
{
    [Table("Indicator")]
    public class Indicator
    {
        public Guid Id { get; set; }

        public string Name { get; set; }

        [Column(TypeName = "decimal(12, 8)")]
        public decimal? MinValue { get; set; }

        [Column(TypeName = "decimal(12, 8)")]
        public decimal? MaxValue { get; set; }
    }
}
