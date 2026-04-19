using TaskFlow.Application.DTOs.Tasks;

namespace TaskFlow.Application.UseCases.Tasks.UpdateTaskStatus;

public interface IUpdateTaskStatusUseCase
{
    Task<TaskResponse> ExecuteAsync(
        Guid userId,
        Guid taskId,
        UpdateTaskStatusRequest request,
        CancellationToken cancellationToken = default);
}
