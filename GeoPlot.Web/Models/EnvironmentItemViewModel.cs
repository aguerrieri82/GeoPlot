using GeoPlot.Entities;
using Microsoft.CodeAnalysis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GeoPlot.Web.Models
{
    public enum PollutantSeverity 
    { 
        Good,
        Medium,
        Bad,
        Sever,
        VerySevere
    }


    public class EnvironmentItemViewModel
    {
        public EnvironmentData Value { get; set; }

        public Point2D Position { get; set; }

        public double Radius { get; set; }

        public PollutantSeverity Severity  { get; set; }
}
}
