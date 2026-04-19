using TaskFlow.Application.DTOs.Tasks;
using TaskFlow.Application.Exceptions;
using TaskFlow.Application.UseCases.Tasks;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.UseCases.Tasks.GetTasks;

public sealed class GetTasksUseCase : IGetTasksUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly ITaskRepository _taskRepository;
    private readonly ICategoryRepository _categoryRepository;

    public GetTasksUseCase(
        IUserRepository userRepository,
        ITaskRepository taskRepository,
        ICategoryRepository categoryRepository)
    {
        _userRepository = userRepository;
        _taskRepository = taskRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<IReadOnlyList<TaskResponse>> ExecuteAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        if (userId == Guid.Empty)
            throw new ApplicationUnauthorizedException("Usuário não autenticado.");

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);

        if (user is null)
            throw new ApplicationUnauthorizedException("Usuário não autenticado.");

        var tasks = await _taskRepository.GetByUserIdAsync(userId, cancellationToken);
        var categories = await _categoryRepository.GetByUserIdAsync(userId, cancellationToken);
        var categoriesById = categories.ToDictionary(category => category.Id);

        return tasks
            .Select(task => TaskResponseMapper.ToResponse(
                task,
                GetCategory(task.CategoryId, categoriesById)))
            .ToList();
    }

    private static Category? GetCategory(Guid? categoryId, IReadOnlyDictionary<Guid, Category> categoriesById)
    {
        if (!categoryId.HasValue)
            return null;

        return categoriesById.TryGetValue(categoryId.Value, out var category)
            ? category
            : null;
    }
}
