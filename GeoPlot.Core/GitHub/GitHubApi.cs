using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace GeoPlot.Core
{    
    public class GitHubCommitResponse
    {
        public class Person
        {
            public string name;
            public string email;
            public DateTime date;
        }

        public string node_id;
        public string sha;
        public string url;
        public string html_url;
        public Person author;
        public Person committer;
        public string message;
    }
 

    public class GitHubHeadResponse
    {
        public class Object
        {
            public string sha;
            public string type;
            public string url;
        }

        [JsonProperty("ref")]
        public string reference;
        public string node_id;
        public string url;
        [JsonProperty("object")]
        public Object obj;
    }

    public class GitHubApi
    {
    }
}
