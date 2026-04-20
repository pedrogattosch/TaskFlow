namespace TaskFlow.Application.DTOs.Categories;

public sealed record CreateCategoryRequest(
    string Name,
    string? Color);
