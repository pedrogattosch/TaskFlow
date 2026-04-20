using TaskFlow.Application.DTOs.Categories;

namespace TaskFlow.Application.UseCases.Categories.CreateCategory;

public interface ICreateCategoryUseCase
{
    Task<CategoryResponse> ExecuteAsync(
        Guid userId,
        CreateCategoryRequest request,
        CancellationToken cancellationToken = default);
}
