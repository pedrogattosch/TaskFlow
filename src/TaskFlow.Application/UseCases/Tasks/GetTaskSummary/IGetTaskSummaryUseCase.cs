using TaskFlow.Application.DTOs.Tasks;

namespace TaskFlow.Application.UseCases.Tasks.GetTaskSummary;

public interface IGetTaskSummaryUseCase
{
    Task<TaskSummaryResponse> ExecuteAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}
