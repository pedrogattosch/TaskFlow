using TaskFlow.Application.DTOs.Tasks;

namespace TaskFlow.Application.UseCases.Tasks.UpdateTask;

public interface IUpdateTaskUseCase
{
    Task<TaskResponse> ExecuteAsync(
        Guid userId,
        Guid taskId,
        UpdateTaskRequest request,
        CancellationToken cancellationToken = default);
}
