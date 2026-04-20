using TaskFlow.Application.DTOs.Categories;
using TaskFlow.Application.Exceptions;
using TaskFlow.Application.Interfaces.Persistence;
using TaskFlow.Domain.Exceptions;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.UseCases.Categories.UpdateCategory;

public sealed class UpdateCategoryUseCase : IUpdateCategoryUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCategoryUseCase(
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
        Guid categoryId,
        UpdateCategoryRequest request,
        CancellationToken cancellationToken = default)
    {
        Validate(userId, categoryId, request);
        await EnsureUserExistsAsync(userId, cancellationToken);

        var category = await _categoryRepository.GetByIdAsync(categoryId, cancellationToken);

        if (category is null || category.UserId != userId)
            throw new ApplicationNotFoundException("Categoria não encontrada.");

        var normalizedName = request.Name.Trim();

        if (!string.Equals(category.Name, normalizedName, StringComparison.Ordinal))
        {
            var existingCategory = await _categoryRepository.GetByUserIdAndNameAsync(
                userId,
                normalizedName,
                cancellationToken);

            if (existingCategory is not null && existingCategory.Id != category.Id)
                throw new ApplicationConflictException("Já existe uma categoria com esse nome.");

            category.UpdateName(normalizedName);
        }

        category.UpdateColor(request.Color);

        await _categoryRepository.UpdateAsync(category, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return CategoryResponseMapper.ToResponse(category);
    }

    private async Task EnsureUserExistsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);

        if (user is null)
            throw new ApplicationUnauthorizedException("Usuário não autenticado.");
    }

    private static void Validate(Guid userId, Guid categoryId, UpdateCategoryRequest request)
    {
        if (userId == Guid.Empty)
            throw new ApplicationUnauthorizedException("Usuário não autenticado.");

        if (categoryId == Guid.Empty)
            throw new ApplicationValidationException("A categoria informada é inválida.");

        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ApplicationValidationException("O nome da categoria é obrigatório.");

        if (request.Name.Trim().Length > 80)
            throw new ApplicationValidationException("O nome da categoria deve ter no máximo 80 caracteres.");

        if (!string.IsNullOrWhiteSpace(request.Color) && request.Color.Trim().Length > 20)
            throw new ApplicationValidationException("A cor da categoria deve ter no máximo 20 caracteres.");
    }
}
