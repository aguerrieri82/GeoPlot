using System;
using System.Collections.Generic;
using System.Text;

namespace GeoPlot.Entities
{
    public enum PollutantType
    { 
        PM10,
        PM25
    }

    public enum EnvironmentDataVerification
    {
        Verified,
        NotVerified,
        PreliminaryVerified

    }

    public class EnvironmentData
    {
        public string StationId { get; set; }

        public GeoPoint Location { get; set; }

        public int ReportingYear { get; set; }

        public DateTime LastUpdateTime { get; set; }

        public DateTime BeginPosition { get; set; }

        public DateTime EndPosition { get; set; }

        public PollutantType Pollutant { get; set; }

        public EnvironmentDataVerification Verified { get; set; }

        public double Value { get; set; }

        public bool IsValid { get; set; }
    }
}
