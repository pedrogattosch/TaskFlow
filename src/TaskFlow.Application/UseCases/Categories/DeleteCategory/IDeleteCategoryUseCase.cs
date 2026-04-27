namespace TaskFlow.Application.UseCases.Categories.DeleteCategory;

public interface IDeleteCategoryUseCase
{
    Task ExecuteAsync(
        Guid userId,
        Guid categoryId,
        CancellationToken cancellationToken = default);
}
