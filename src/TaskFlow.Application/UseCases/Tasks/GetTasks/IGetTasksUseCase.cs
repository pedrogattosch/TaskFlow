using TaskFlow.Application.DTOs.Tasks;

namespace TaskFlow.Application.UseCases.Tasks.GetTasks;

public interface IGetTasksUseCase
{
    Task<IReadOnlyList<TaskResponse>> ExecuteAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}
