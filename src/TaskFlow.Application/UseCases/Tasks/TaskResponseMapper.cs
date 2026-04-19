using TaskFlow.Application.DTOs.Tasks;
using TaskFlow.Domain.Entities;
using TaskItemEntity = TaskFlow.Domain.Entities.Task;

namespace TaskFlow.Application.UseCases.Tasks;

internal static class TaskResponseMapper
{
    public static TaskResponse ToResponse(TaskItemEntity task, Category? category)
    {
        return new TaskResponse(
            task.Id,
            task.Title,
            task.Description,
            task.Priority,
            task.Status,
            task.DueDate,
            task.CompletedAt,
            task.CategoryId,
            category?.Name);
    }
}
