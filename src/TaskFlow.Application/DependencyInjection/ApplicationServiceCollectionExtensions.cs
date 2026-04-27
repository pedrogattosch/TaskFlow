using Microsoft.Extensions.DependencyInjection;
using TaskFlow.Application.UseCases.Auth.LoginUser;
using TaskFlow.Application.UseCases.Auth.RegisterUser;
using TaskFlow.Application.UseCases.Categories.CreateCategory;
using TaskFlow.Application.UseCases.Categories.DeleteCategory;
using TaskFlow.Application.UseCases.Categories.GetCategories;
using TaskFlow.Application.UseCases.Categories.UpdateCategory;
using TaskFlow.Application.UseCases.Tasks.CreateTask;
using TaskFlow.Application.UseCases.Tasks.DeleteTask;
using TaskFlow.Application.UseCases.Tasks.GetTaskSummary;
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
        services.AddScoped<ICreateCategoryUseCase, CreateCategoryUseCase>();
        services.AddScoped<IDeleteCategoryUseCase, DeleteCategoryUseCase>();
        services.AddScoped<IGetCategoriesUseCase, GetCategoriesUseCase>();
        services.AddScoped<IUpdateCategoryUseCase, UpdateCategoryUseCase>();
        services.AddScoped<ICreateTaskUseCase, CreateTaskUseCase>();
        services.AddScoped<IGetTasksUseCase, GetTasksUseCase>();
        services.AddScoped<IGetTaskSummaryUseCase, GetTaskSummaryUseCase>();
        services.AddScoped<IUpdateTaskUseCase, UpdateTaskUseCase>();
        services.AddScoped<IUpdateTaskStatusUseCase, UpdateTaskStatusUseCase>();
        services.AddScoped<IDeleteTaskUseCase, DeleteTaskUseCase>();

        return services;
    }
}
