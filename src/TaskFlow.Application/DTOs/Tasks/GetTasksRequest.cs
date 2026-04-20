using TaskPriorityEnum = TaskFlow.Domain.Enums.TaskPriority;
using TaskStatusEnum = TaskFlow.Domain.Enums.TaskStatus;

namespace TaskFlow.Application.DTOs.Tasks;

public sealed class GetTasksRequest
{
    public TaskStatusEnum? Status { get; init; }
    public TaskPriorityEnum? Priority { get; init; }
    public Guid? CategoryId { get; init; }
    public string? SortBy { get; init; }
    public string? SortDirection { get; init; }
}
