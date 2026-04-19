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
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.TaskItems
            .AsNoTracking()
            .Where(task => task.UserId == userId && !task.IsDeleted)
            .OrderBy(task => task.DueDate ?? DateTime.MaxValue)
            .ThenByDescending(task => task.AuditInfo.CreatedAt)
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
}
