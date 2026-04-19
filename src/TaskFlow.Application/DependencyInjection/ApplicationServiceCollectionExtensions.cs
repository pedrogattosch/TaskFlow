using Microsoft.Extensions.DependencyInjection;
using TaskFlow.Application.UseCases.Auth.LoginUser;
using TaskFlow.Application.UseCases.Auth.RegisterUser;
using TaskFlow.Application.UseCases.Tasks.CreateTask;
using TaskFlow.Application.UseCases.Tasks.DeleteTask;
using TaskFlow.Application.UseCases.Tasks.GetTasks;
using TaskFlow.Application.UseCases.Tasks.UpdateTask;
using TaskFlow.Application.UseCases.Tasks.UpdateTaskStatus;

namespace TaskFlow.Application.DependencyInjection;

public static class ApplicationServiceCollectionExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IRegisterUserUseCase, RegisterUserUseCase>();
        services.AddScoped<ILoginUserUseCase, LoginUserUseCase>();
        services.AddScoped<ICreateTaskUseCase, CreateTaskUseCase>();
        services.AddScoped<IGetTasksUseCase, GetTasksUseCase>();
        services.AddScoped<IUpdateTaskUseCase, UpdateTaskUseCase>();
        services.AddScoped<IUpdateTaskStatusUseCase, UpdateTaskStatusUseCase>();
        services.AddScoped<IDeleteTaskUseCase, DeleteTaskUseCase>();

        return services;
    }
}
