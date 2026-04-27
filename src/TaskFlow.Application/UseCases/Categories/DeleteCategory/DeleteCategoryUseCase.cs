using TaskFlow.Application.Exceptions;
using TaskFlow.Application.Interfaces.Persistence;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.UseCases.Categories.DeleteCategory;

public sealed class DeleteCategoryUseCase : IDeleteCategoryUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteCategoryUseCase(
        IUserRepository userRepository,
        ICategoryRepository categoryRepository,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task ExecuteAsync(
        Guid userId,
        Guid categoryId,
        CancellationToken cancellationToken = default)
    {
        Validate(userId, categoryId);
        await EnsureUserExistsAsync(userId, cancellationToken);

        var category = await _categoryRepository.GetByIdAsync(categoryId, cancellationToken);

        if (category is null || category.UserId != userId)
            throw new ApplicationNotFoundException("Categoria não encontrada.");

        await _categoryRepository.DeleteAsync(category, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureUserExistsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);

        if (user is null)
            throw new ApplicationUnauthorizedException("Usuário não autenticado.");
    }

    private static void Validate(Guid userId, Guid categoryId)
    {
        if (userId == Guid.Empty)
            throw new ApplicationUnauthorizedException("Usuário não autenticado.");

        if (categoryId == Guid.Empty)
            throw new ApplicationValidationException("A categoria informada é inválida.");
    }
}
