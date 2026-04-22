using Microsoft.AspNetCore.HttpOverrides;
using TaskFlow.Application.DependencyInjection;
using TaskFlow.Infrastructure.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

ConfigureServices(builder);

var app = builder.Build();

ConfigurePipeline(app);

app.Run();

static void ConfigureServices(WebApplicationBuilder builder)
{
    var services = builder.Services;

    services.AddControllers();
    services.AddEndpointsApiExplorer();
    services.AddSwaggerGen();
    services.AddHealthChecks();
    services.AddCors(options =>
    {
        options.AddPolicy("TaskFlowCors", policy =>
        {
            var allowedOrigins = builder.Configuration
                .GetSection("Cors:AllowedOrigins")
                .Get<string[]>()?
                .Where(origin => !string.IsNullOrWhiteSpace(origin))
                .ToArray()
                ?? [];

            if (allowedOrigins.Length == 0)
                return;

            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
    });

    services.Configure<ForwardedHeadersOptions>(options =>
    {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
        options.KnownIPNetworks.Clear();
        options.KnownProxies.Clear();
    });

    services.AddApplication();
    services.AddInfrastructure(builder.Configuration);
}

static void ConfigurePipeline(WebApplication app)
{
    var useHttpsRedirection = app.Configuration.GetValue("Http:UseHttpsRedirection", true);

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }
    else
    {
        app.UseHsts();
    }

    app.UseForwardedHeaders();

    if (useHttpsRedirection)
        app.UseHttpsRedirection();

    app.UseCors("TaskFlowCors");

    app.MapHealthChecks("/health");
    app.MapControllers();
}

public partial class Program;
