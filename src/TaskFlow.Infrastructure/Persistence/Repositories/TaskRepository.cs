using Microsoft.EntityFrameworkCore;
using TaskFlow.Domain.Interfaces;
using TaskFlow.Infrastructure.Persistence.Context;
using TaskItemEntity = TaskFlow.Domain.Entities.Task;

namespace TaskFlow.Infrastructure.Persistence.Repositories;

public sealed class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _dbContext;

    public TaskRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public System.Threading.Tasks.Task<TaskItemEntity?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return _dbContext.TaskItems
            .FirstOrDefaultAsync(task => task.Id == id && !task.IsDeleted, cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<TaskItemEntity>> GetByUserIdAsync(
        Guid userId,
        TaskFilter filter,
        CancellationToken cancellationToken = default)
    {
        var query = _dbContext.TaskItems
            .AsNoTracking()
            .Where(task => task.UserId == userId && !task.IsDeleted);

        if (filter.Status.HasValue)
            query = query.Where(task => task.Status == filter.Status.Value);

        if (filter.Priority.HasValue)
            query = query.Where(task => task.Priority == filter.Priority.Value);

        if (filter.CategoryId.HasValue)
            query = query.Where(task => task.CategoryId == filter.CategoryId.Value);

        query = ApplySorting(query, filter);

        return await query
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task AddAsync(
        TaskItemEntity task,
        CancellationToken cancellationToken = default)
    {
        await _dbContext.TaskItems.AddAsync(task, cancellationToken);
    }

    public System.Threading.Tasks.Task UpdateAsync(
        TaskItemEntity task,
        CancellationToken cancellationToken = default)
    {
        _dbContext.TaskItems.Update(task);
        return System.Threading.Tasks.Task.CompletedTask;
    }

    public System.Threading.Tasks.Task DeleteAsync(
        TaskItemEntity task,
        CancellationToken cancellationToken = default)
    {
        task.SoftDelete();
        _dbContext.TaskItems.Update(task);
        return System.Threading.Tasks.Task.CompletedTask;
    }

    private static IQueryable<TaskItemEntity> ApplySorting(
        IQueryable<TaskItemEntity> query,
        TaskFilter filter)
    {
        return filter.SortBy switch
        {
            TaskSortBy.Priority => filter.SortDirection == SortDirection.Desc
                ? query.OrderByDescending(task => task.Priority)
                    .ThenBy(task => task.DueDate ?? DateTime.MaxValue)
                    .ThenByDescending(task => task.AuditInfo.CreatedAt)
                : query.OrderBy(task => task.Priority)
                    .ThenBy(task => task.DueDate ?? DateTime.MaxValue)
                    .ThenByDescending(task => task.AuditInfo.CreatedAt),
            _ => filter.SortDirection == SortDirection.Desc
                ? query.OrderBy(task => task.DueDate.HasValue ? 0 : 1)
                    .ThenByDescending(task => task.DueDate)
                    .ThenByDescending(task => task.Priority)
                    .ThenByDescending(task => task.AuditInfo.CreatedAt)
                : query.OrderBy(task => task.DueDate.HasValue ? 0 : 1)
                    .ThenBy(task => task.DueDate)
                    .ThenByDescending(task => task.Priority)
                    .ThenByDescending(task => task.AuditInfo.CreatedAt)
        };
    }
}
