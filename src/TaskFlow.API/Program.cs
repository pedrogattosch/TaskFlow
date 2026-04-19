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
    services.AddOpenApi();

    services.AddApplication();
    services.AddInfrastructure(builder.Configuration);
}

static void ConfigurePipeline(WebApplication app)
{
    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
    }

    app.UseHttpsRedirection();

    app.MapControllers();
}
