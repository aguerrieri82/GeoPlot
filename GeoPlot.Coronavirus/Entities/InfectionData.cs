using System.Collections.Generic;

namespace GeoPlot.Coronavirus
{
    public class InfectionData
    {
        public void CombineWith(InfectionData value)
        {
            TotalPositive += value.TotalPositive;
            CurrentPositive += value.CurrentPositive;
            TotalDeath += value.TotalDeath;
            TotalSevere += value.TotalSevere;
            TotalHospedalized += value.TotalHospedalized;
            TotalHealed += value.TotalHealed;
            ToatlTests += value.ToatlTests;
        }

        public static InfectionData Combine(IEnumerable<InfectionData> values)
        {
            InfectionData result  = null;
            foreach (var value in values)
            {
                if (result == null)
                    result = value;
                else
                    result.CombineWith(value);
            }
            return result;
        }

        public int? TotalPositive { get; set; }

        public int? CurrentPositive { get; set; }

        public int? TotalDeath { get; set; }

        public int? TotalSevere { get; set; }

        public int? TotalHospedalized { get; set; }

        public int? TotalHealed { get; set; }

        public int? ToatlTests { get; set; }

        public int? TotalCaseTested { get; set; }

        public int? NewICU { get; set; }

        public int? TotalMolecularTests { get; set; }

        public int? TotalAntigenicTests { get; set; }

        public int? TotalMolecularPositive { get; set; }

        public int? TotalAntigenicPositive { get; set; }

        public Dictionary<int, int?> HistoricDeaths { get; set; }
    }
}
