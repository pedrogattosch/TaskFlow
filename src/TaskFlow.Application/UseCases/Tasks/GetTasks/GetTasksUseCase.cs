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
        GetTasksRequest request,
        CancellationToken cancellationToken = default)
    {
        if (userId == Guid.Empty)
            throw new ApplicationUnauthorizedException("Usuário não autenticado.");

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);

        if (user is null)
            throw new ApplicationUnauthorizedException("Usuário não autenticado.");

        var filter = BuildFilter(request);
        var tasks = await _taskRepository.GetByUserIdAsync(userId, filter, cancellationToken);
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

    private static TaskFilter BuildFilter(GetTasksRequest request)
    {
        if (request.Status.HasValue && !Enum.IsDefined(request.Status.Value))
            throw new ApplicationValidationException("O status informado para filtro Ã© invÃ¡lido.");

        if (request.Priority.HasValue && !Enum.IsDefined(request.Priority.Value))
            throw new ApplicationValidationException("A prioridade informada para filtro Ã© invÃ¡lida.");

        return new TaskFilter(
            request.Status,
            request.Priority,
            request.CategoryId,
            ParseSortBy(request.SortBy),
            ParseSortDirection(request.SortDirection));
    }

    private static TaskSortBy ParseSortBy(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return TaskSortBy.DueDate;

        return value.Trim().ToLowerInvariant() switch
        {
            "duedate" or "due-date" or "prazo" => TaskSortBy.DueDate,
            "priority" or "prioridade" => TaskSortBy.Priority,
            _ => throw new ApplicationValidationException("A ordenaÃ§Ã£o informada Ã© invÃ¡lida.")
        };
    }

    private static SortDirection ParseSortDirection(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return SortDirection.Asc;

        return value.Trim().ToLowerInvariant() switch
        {
            "asc" or "ascending" => SortDirection.Asc,
            "desc" or "descending" => SortDirection.Desc,
            _ => throw new ApplicationValidationException("A direÃ§Ã£o da ordenaÃ§Ã£o informada Ã© invÃ¡lida.")
        };
    }
}
