using Microsoft.Extensions.DependencyInjection;
using TaskFlow.Application.UseCases.Auth.LoginUser;
using TaskFlow.Application.UseCases.Auth.RegisterUser;

namespace TaskFlow.Application.DependencyInjection;

public static class ApplicationServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IRegisterUserUseCase, RegisterUserUseCase>();
        services.AddScoped<ILoginUserUseCase, LoginUserUseCase>();

        return services;
    }
}
