namespace TaskFlow.Application.DTOs.Categories;

public sealed record CategoryResponse(
    Guid Id,
    string Name,
    string? Color);
