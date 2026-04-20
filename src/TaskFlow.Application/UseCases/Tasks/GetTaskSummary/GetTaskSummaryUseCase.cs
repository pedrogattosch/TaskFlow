using TaskFlow.Application.DTOs.Tasks;
using TaskFlow.Application.Exceptions;
using TaskFlow.Domain.Interfaces;
using TaskStatusEnum = TaskFlow.Domain.Enums.TaskStatus;

namespace TaskFlow.Application.UseCases.Tasks.GetTaskSummary;

public sealed class GetTaskSummaryUseCase : IGetTaskSummaryUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly ITaskRepository _taskRepository;

    public GetTaskSummaryUseCase(
        IUserRepository userRepository,
        ITaskRepository taskRepository)
    {
        _userRepository = userRepository;
        _taskRepository = taskRepository;
    }

    public async Task<TaskSummaryResponse> ExecuteAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        if (userId == Guid.Empty)
            throw new ApplicationUnauthorizedException("UsuÃ¡rio nÃ£o autenticado.");

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);

        if (user is null)
            throw new ApplicationUnauthorizedException("UsuÃ¡rio nÃ£o autenticado.");

        var countsByStatus = await _taskRepository.CountByStatusAsync(userId, cancellationToken);

        return new TaskSummaryResponse(
            GetCount(countsByStatus, TaskStatusEnum.Pending),
            GetCount(countsByStatus, TaskStatusEnum.InProgress),
            GetCount(countsByStatus, TaskStatusEnum.Completed),
            GetCount(countsByStatus, TaskStatusEnum.Cancelled));
    }

    private static int GetCount(
        IReadOnlyDictionary<TaskStatusEnum, int> countsByStatus,
        TaskStatusEnum status)
    {
        return countsByStatus.TryGetValue(status, out var count) ? count : 0;
    }
}
