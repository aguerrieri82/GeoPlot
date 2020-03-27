using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GeoPlot.Web.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace GeoPlot.Web
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            var mvcOptions = services.AddControllersWithViews(options =>
            {
                options.Filters.Add(new AppendVersionFilter());
                options.Filters.AddService<LanguageFilter>();
            }).AddNewtonsoftJson();
#if DEBUG
            mvcOptions.AddRazorRuntimeCompilation();
#endif

            services.Configure<CookiePolicyOptions>(options =>
            {
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.Strict;
            });

            services.AddResponseCaching();
            services.AddScoped<RequestLanguage>();
            services.AddScoped<LanguageFilter>();

            services.AddSingleton<IStringTable, JsonStringTable>(sp =>
            {
                var env = sp.GetService<IWebHostEnvironment>();
                return new JsonStringTable(env.WebRootPath + "\\lang\\");
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }

            

            app.UseRequestLocalization("en-US");

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseResponseCaching();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "home-lang",
                    defaults: new { controller = "Home" },
                    pattern: "{lang:length(2)}/{action=Index}/{id?}");

                endpoints.MapControllerRoute(
                    name: "home",
                    defaults: new { controller = "Home" },
                    pattern: "{action=Index}/{id?}");

                endpoints.MapControllerRoute(
                    name: "default-lang",
                    pattern: "{lang:length(2)}/{controller=Home}/{action=Index}/{id?}");

                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}
