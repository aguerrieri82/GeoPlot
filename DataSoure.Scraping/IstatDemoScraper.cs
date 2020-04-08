using System;
using System.Collections.Generic;

namespace DataSoure.Scraping
{
    public enum Gender
    {
        Total,
        Male,
        Female,
    }

    public class IstatDemoItem
    {
        public int Month { get; set; }

        public Gender Gender { get; set; }

        public int Resident { get; set; }

        public int BornAlive { get; set; }

        public int New { get; set; }

        public int Cancelled { get; set; }

        public int Death { get; set; }
    }

    
    public class IstatDemoScraper : BaseHtmlScraper
    {

        public IEnumerable<IstatDemoItem> GetData(int year, string subCode, string regionCode, string districtCode, string munCode)
        {
            return null;
        }
    }
}
