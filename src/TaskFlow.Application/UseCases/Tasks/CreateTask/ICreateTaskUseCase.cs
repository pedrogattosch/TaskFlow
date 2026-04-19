using TaskFlow.Application.DTOs.Tasks;

namespace TaskFlow.Application.UseCases.Tasks.CreateTask;

public interface ICreateTaskUseCase
{
    Task<TaskResponse> ExecuteAsync(
        Guid userId,
        CreateTaskRequest request,
        CancellationToken cancellationToken = default);
}
