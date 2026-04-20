namespace TaskFlow.Domain.Interfaces;

public interface ITaskRepository
{
    System.Threading.Tasks.Task<TaskFlow.Domain.Entities.Task?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IReadOnlyList<TaskFlow.Domain.Entities.Task>> GetByUserIdAsync(
        Guid userId,
        TaskFilter filter,
        CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task AddAsync(TaskFlow.Domain.Entities.Task task, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task UpdateAsync(TaskFlow.Domain.Entities.Task task, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task DeleteAsync(TaskFlow.Domain.Entities.Task task, CancellationToken cancellationToken = default);
}

public sealed record TaskFilter(
    TaskFlow.Domain.Enums.TaskStatus? Status,
    TaskFlow.Domain.Enums.TaskPriority? Priority,
    Guid? CategoryId,
    TaskSortBy SortBy,
    SortDirection SortDirection);

public enum TaskSortBy
{
    DueDate,
    Priority
}

public enum SortDirection
{
    Asc,
    Desc
}
