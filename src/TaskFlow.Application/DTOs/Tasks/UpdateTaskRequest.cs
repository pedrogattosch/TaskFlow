using TaskFlow.Domain.Enums;

namespace TaskFlow.Application.DTOs.Tasks;

public sealed record UpdateTaskRequest(
    string Title,
    string? Description,
    TaskPriority Priority,
    DateTime? DueDate,
    string? CategoryName);
