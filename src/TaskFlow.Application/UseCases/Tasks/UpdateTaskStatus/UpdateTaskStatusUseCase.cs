using TaskFlow.Application.DTOs.Tasks;
using TaskFlow.Application.Exceptions;
using TaskFlow.Application.Interfaces.Persistence;
using TaskFlow.Domain.Interfaces;
using CategoryEntity = TaskFlow.Domain.Entities.Category;

namespace TaskFlow.Application.UseCases.Tasks.UpdateTaskStatus;

public sealed class UpdateTaskStatusUseCase : IUpdateTaskStatusUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly ITaskRepository _taskRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTaskStatusUseCase(
        IUserRepository userRepository,
        ITaskRepository taskRepository,
        ICategoryRepository categoryRepository,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _taskRepository = taskRepository;
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TaskResponse> ExecuteAsync(
        Guid userId,
        Guid taskId,
        UpdateTaskStatusRequest request,
        CancellationToken cancellationToken = default)
    {
        Validate(userId, taskId, request);
        await EnsureUserExistsAsync(userId, cancellationToken);

        var task = await GetOwnedTaskAsync(userId, taskId, cancellationToken);
        task.ChangeStatus(request.Status);

        await _taskRepository.UpdateAsync(task, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var category = await GetCategoryAsync(task.CategoryId, cancellationToken);
        return TaskResponseMapper.ToResponse(task, category);
    }

    private async Task EnsureUserExistsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);

        if (user is null)
            throw new ApplicationUnauthorizedException("Usuário não autenticado.");
    }

    private async Task<TaskFlow.Domain.Entities.Task> GetOwnedTaskAsync(
        Guid userId,
        Guid taskId,
        CancellationToken cancellationToken)
    {
        var task = await _taskRepository.GetByIdAsync(taskId, cancellationToken);

        if (task is null || task.UserId != userId)
            throw new ApplicationNotFoundException("Tarefa não encontrada.");

        return task;
    }

    private async Task<CategoryEntity?> GetCategoryAsync(Guid? categoryId, CancellationToken cancellationToken)
    {
        if (!categoryId.HasValue)
            return null;

        return await _categoryRepository.GetByIdAsync(categoryId.Value, cancellationToken);
    }

    private static void Validate(Guid userId, Guid taskId, UpdateTaskStatusRequest request)
    {
        if (userId == Guid.Empty)
            throw new ApplicationUnauthorizedException("Usuário não autenticado.");

        if (taskId == Guid.Empty)
            throw new ApplicationValidationException("A tarefa informada é inválida.");

        if (!Enum.IsDefined(request.Status))
            throw new ApplicationValidationException("O status da tarefa é inválido.");
    }
}
