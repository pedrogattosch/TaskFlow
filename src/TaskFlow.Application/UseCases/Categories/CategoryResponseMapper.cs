using TaskFlow.Application.DTOs.Categories;
using TaskFlow.Domain.Entities;

namespace TaskFlow.Application.UseCases.Categories;

internal static class CategoryResponseMapper
{
    public static CategoryResponse ToResponse(Category category)
    {
        return new CategoryResponse(
            category.Id,
            category.Name,
            category.Color);
    }
}
