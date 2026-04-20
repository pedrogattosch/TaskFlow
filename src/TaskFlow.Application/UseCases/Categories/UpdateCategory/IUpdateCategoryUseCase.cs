using TaskFlow.Application.DTOs.Categories;

namespace TaskFlow.Application.UseCases.Categories.UpdateCategory;

public interface IUpdateCategoryUseCase
{
    Task<CategoryResponse> ExecuteAsync(
        Guid userId,
        Guid categoryId,
        UpdateCategoryRequest request,
        CancellationToken cancellationToken = default);
}
