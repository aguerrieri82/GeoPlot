using GeoPlot.Entities;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace GeoPlot.Core
{
    public class ItalyEnvironmentSource : BaseCsvDataSource<EnvironmentData>
    {
        public ItalyEnvironmentSource(string dataSource)
            : base(dataSource)
        {
        }

        protected override EnvironmentData Parse(string[] row)
        {
            return new EnvironmentData
            {
                ReportingYear = int.Parse(row[1]),
                LastUpdateTime = DateTime.Parse(row[2]),
                StationId = row[3],
                Location = new GeoPoint
                {
                    Lat = double.Parse(row[5], CultureInfo.InvariantCulture),
                    Lng = double.Parse(row[6], CultureInfo.InvariantCulture)
                },
                Pollutant = PollutantType.PM10,
                BeginPosition = DateTime.Parse(row[11]),
                EndPosition = DateTime.Parse(row[12]),
                IsValid = row[13] == "Valid",
                Verified = row[14] == "Verified" ? EnvironmentDataVerification.Verified : (row[14] == "Not verified" ? EnvironmentDataVerification.NotVerified : EnvironmentDataVerification.PreliminaryVerified),
                Value = double.Parse(row[18], CultureInfo.InvariantCulture)
            };
        }
    }
}
