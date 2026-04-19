using TaskPriorityEnum = TaskFlow.Domain.Enums.TaskPriority;
using TaskStatusEnum = TaskFlow.Domain.Enums.TaskStatus;

namespace TaskFlow.Application.DTOs.Tasks;

public sealed record TaskResponse(
    Guid Id,
    string Title,
    string? Description,
    TaskPriorityEnum Priority,
    TaskStatusEnum Status,
    DateTime? DueDate,
    DateTime? CompletedAt,
    Guid? CategoryId,
    string? CategoryName);
