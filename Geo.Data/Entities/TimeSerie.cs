using Geo.Data.Types;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Geo.Data.Entities
{

    [Table("TimeSerie")]
    public class TimeSerie
    {
        public long Id { get; set; }

        public Guid GeoAreaId  { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public int? FromAge { get; set; }

        public int? ToAge { get; set; }

        public Gender Gender { get; set; }

        public Guid IndicatorId { get; set; }

        [Column(TypeName = "decimal(12, 8)")]
        public decimal? Value { get; set; }

        public virtual Indicator Indicator { get; set; }
}
}
