namespace TaskFlow.Application.UseCases.Tasks.DeleteTask;

public interface IDeleteTaskUseCase
{
    Task ExecuteAsync(
        Guid userId,
        Guid taskId,
        CancellationToken cancellationToken = default);
}
