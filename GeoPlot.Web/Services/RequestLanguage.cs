namespace GeoPlot.Web
{
    public class RequestLanguage
    {
        public string Code { get; set; }

        public string FullCode
        {
            get
            {
                if (Code == "en")
                    return "en-US";
                return Code + "-" + Code.ToUpper();
            }
        }
    }
}