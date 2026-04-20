using TaskFlow.Application.DTOs.Categories;

namespace TaskFlow.Application.UseCases.Categories.GetCategories;

public interface IGetCategoriesUseCase
{
    Task<IReadOnlyList<CategoryResponse>> ExecuteAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}
