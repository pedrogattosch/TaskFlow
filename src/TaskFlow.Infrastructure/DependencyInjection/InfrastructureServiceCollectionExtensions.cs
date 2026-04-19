using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TaskFlow.Application.Interfaces.Auth;
using TaskFlow.Application.Interfaces.Persistence;
using TaskFlow.Domain.Interfaces;
using TaskFlow.Infrastructure.Identity.Jwt;
using TaskFlow.Infrastructure.Identity.Password;
using TaskFlow.Infrastructure.Persistence.Context;
using TaskFlow.Infrastructure.Persistence.Repositories;

namespace TaskFlow.Infrastructure.DependencyInjection;

public static class InfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("A connection string 'DefaultConnection' não foi configurada.");

        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(connectionString));

        var jwtSection = configuration.GetSection(JwtOptions.SectionName);

        services.Configure<JwtOptions>(options =>
        {
            options.Issuer = jwtSection["Issuer"] ?? string.Empty;
            options.Audience = jwtSection["Audience"] ?? string.Empty;
            options.SecretKey = jwtSection["SecretKey"] ?? string.Empty;

            if (int.TryParse(jwtSection["ExpirationMinutes"], out var expirationMinutes))
                options.ExpirationMinutes = expirationMinutes;
        });

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddSingleton<IPasswordHasher, Pbkdf2PasswordHasher>();
        services.AddSingleton<IJwtTokenGenerator, HmacJwtTokenGenerator>();

        return services;
    }
}
