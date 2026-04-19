using TaskFlow.Application.Exceptions;
using TaskFlow.Application.Interfaces.Persistence;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.UseCases.Tasks.DeleteTask;

public sealed class DeleteTaskUseCase : IDeleteTaskUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly ITaskRepository _taskRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteTaskUseCase(
        IUserRepository userRepository,
        ITaskRepository taskRepository,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _taskRepository = taskRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task ExecuteAsync(
        Guid userId,
        Guid taskId,
        CancellationToken cancellationToken = default)
    {
        Validate(userId, taskId);
        await EnsureUserExistsAsync(userId, cancellationToken);

        var task = await _taskRepository.GetByIdAsync(taskId, cancellationToken);

        if (task is null || task.UserId != userId)
            throw new ApplicationNotFoundException("Tarefa não encontrada.");

        await _taskRepository.DeleteAsync(task, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureUserExistsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);

        if (user is null)
            throw new ApplicationUnauthorizedException("Usuário não autenticado.");
    }

    private static void Validate(Guid userId, Guid taskId)
    {
        if (userId == Guid.Empty)
            throw new ApplicationUnauthorizedException("Usuário não autenticado.");

        if (taskId == Guid.Empty)
            throw new ApplicationValidationException("A tarefa informada é inválida.");
    }
}
