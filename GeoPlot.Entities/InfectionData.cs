namespace GeoPlot.Entities
{
    public struct InfectionData
    {
        public int? TotalPositive { get; set; }

        public int? CurrentPositive { get; set; }

        public int? TotalDeath { get; set; }

        public int? TotalSevere { get; set; }

        public int? TotalHospedalized { get; set; }

        public int? TotalHealed { get; set; }
    }
}
