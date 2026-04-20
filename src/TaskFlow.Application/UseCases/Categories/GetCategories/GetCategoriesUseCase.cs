using TaskFlow.Application.DTOs.Categories;
using TaskFlow.Application.Exceptions;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.UseCases.Categories.GetCategories;

public sealed class GetCategoriesUseCase : IGetCategoriesUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly ICategoryRepository _categoryRepository;

    public GetCategoriesUseCase(
        IUserRepository userRepository,
        ICategoryRepository categoryRepository)
    {
        _userRepository = userRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<IReadOnlyList<CategoryResponse>> ExecuteAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        if (userId == Guid.Empty)
            throw new ApplicationUnauthorizedException("Usuário não autenticado.");

        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);

        if (user is null)
            throw new ApplicationUnauthorizedException("Usuário não autenticado.");

        var categories = await _categoryRepository.GetByUserIdAsync(userId, cancellationToken);

        return categories
            .Select(CategoryResponseMapper.ToResponse)
            .ToList();
    }
}
