using TaskFlow.Application.DTOs.Categories;
using TaskFlow.Application.Exceptions;
using TaskFlow.Application.Interfaces.Persistence;
using TaskFlow.Domain.Interfaces;
using CategoryEntity = TaskFlow.Domain.Entities.Category;

namespace TaskFlow.Application.UseCases.Categories.CreateCategory;

public sealed class CreateCategoryUseCase : ICreateCategoryUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateCategoryUseCase(
        IUserRepository userRepository,
        ICategoryRepository categoryRepository,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<CategoryResponse> ExecuteAsync(
        Guid userId,
        CreateCategoryRequest request,
        CancellationToken cancellationToken = default)
    {
        Validate(userId, request);
        await EnsureUserExistsAsync(userId, cancellationToken);

        var normalizedName = request.Name.Trim();
        var existingCategory = await _categoryRepository.GetByUserIdAndNameAsync(
            userId,
            normalizedName,
            cancellationToken);

        if (existingCategory is not null)
            throw new ApplicationConflictException("Já existe uma categoria com esse nome.");

        var category = new CategoryEntity(userId, normalizedName, request.Color);

        await _categoryRepository.AddAsync(category, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CategoryResponseMapper.ToResponse(category);
    }

    private async Task EnsureUserExistsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);

        if (user is null)
            throw new ApplicationUnauthorizedException("Usuário não autenticado.");
    }

    private static void Validate(Guid userId, CreateCategoryRequest request)
    {
        if (userId == Guid.Empty)
            throw new ApplicationUnauthorizedException("Usuário não autenticado.");

        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ApplicationValidationException("O nome da categoria é obrigatório.");

        if (request.Name.Trim().Length > 80)
            throw new ApplicationValidationException("O nome da categoria deve ter no máximo 80 caracteres.");

        if (!string.IsNullOrWhiteSpace(request.Color) && request.Color.Trim().Length > 20)
            throw new ApplicationValidationException("A cor da categoria deve ter no máximo 20 caracteres.");
    }
}
