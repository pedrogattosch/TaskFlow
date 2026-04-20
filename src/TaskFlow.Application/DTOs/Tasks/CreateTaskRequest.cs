using TaskFlow.Domain.Enums;

namespace TaskFlow.Application.DTOs.Tasks;

public sealed record CreateTaskRequest(
    string Title,
    string? Description,
    TaskPriority Priority,
    DateTime? DueDate,
    Guid? CategoryId,
    string? CategoryName);
