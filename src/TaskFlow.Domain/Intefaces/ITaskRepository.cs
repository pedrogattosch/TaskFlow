namespace TaskFlow.Domain.Interfaces;

public interface ITaskRepository
{
    System.Threading.Tasks.Task<TaskFlow.Domain.Entities.Task?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IReadOnlyList<TaskFlow.Domain.Entities.Task>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task AddAsync(TaskFlow.Domain.Entities.Task task, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task UpdateAsync(TaskFlow.Domain.Entities.Task task, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task DeleteAsync(TaskFlow.Domain.Entities.Task task, CancellationToken cancellationToken = default);
}
