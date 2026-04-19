using TaskFlow.Application.DTOs.Tasks;
using TaskFlow.Application.Exceptions;
using TaskFlow.Application.Interfaces.Persistence;
using TaskFlow.Application.UseCases.Tasks;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Interfaces;
using TaskItemEntity = TaskFlow.Domain.Entities.Task;

namespace TaskFlow.Application.UseCases.Tasks.CreateTask;

public sealed class CreateTaskUseCase : ICreateTaskUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly ITaskRepository _taskRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTaskUseCase(
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
        CreateTaskRequest request,
        CancellationToken cancellationToken = default)
    {
        Validate(userId, request);

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);

        if (user is null)
            throw new ApplicationUnauthorizedException("Usuário não autenticado.");

        var category = await GetOrCreateCategoryAsync(userId, request.CategoryName, cancellationToken);
        var task = new TaskItemEntity(
            userId,
            request.Title,
            request.Description,
            request.Priority,
            request.DueDate,
            category);

        await _taskRepository.AddAsync(task, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return TaskResponseMapper.ToResponse(task, category);
    }

    private async Task<Category?> GetOrCreateCategoryAsync(
        Guid userId,
        string? categoryName,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(categoryName))
            return null;

        var normalizedName = categoryName.Trim();
        var category = await _categoryRepository.GetByUserIdAndNameAsync(
            userId,
            normalizedName,
            cancellationToken);

        if (category is not null)
            return category;

        category = new Category(userId, normalizedName);
        await _categoryRepository.AddAsync(category, cancellationToken);

        return category;
    }

    private static void Validate(Guid userId, CreateTaskRequest request)
    {
        if (userId == Guid.Empty)
            throw new ApplicationUnauthorizedException("Usuário não autenticado.");

        if (string.IsNullOrWhiteSpace(request.Title))
            throw new ApplicationValidationException("O título da tarefa é obrigatório.");

        if (request.Title.Trim().Length > 120)
            throw new ApplicationValidationException("O título da tarefa deve ter no máximo 120 caracteres.");

        if (!string.IsNullOrWhiteSpace(request.Description) && request.Description.Trim().Length > 1000)
            throw new ApplicationValidationException("A descrição da tarefa deve ter no máximo 1000 caracteres.");

        if (!Enum.IsDefined(request.Priority))
            throw new ApplicationValidationException("A prioridade da tarefa é inválida.");

        if (request.DueDate.HasValue && request.DueDate.Value.Date < DateTime.UtcNow.Date)
            throw new ApplicationValidationException("A data de vencimento não pode ser anterior à data atual.");

        if (string.IsNullOrWhiteSpace(request.CategoryName))
            throw new ApplicationValidationException("A categoria da tarefa é obrigatória.");

        if (request.CategoryName.Trim().Length > 80)
            throw new ApplicationValidationException("A categoria deve ter no máximo 80 caracteres.");
    }
}
