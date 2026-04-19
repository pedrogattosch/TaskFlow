using TaskStatusEnum = TaskFlow.Domain.Enums.TaskStatus;

namespace TaskFlow.Application.DTOs.Tasks;

public sealed record UpdateTaskStatusRequest(TaskStatusEnum Status);
