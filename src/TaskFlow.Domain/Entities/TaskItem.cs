using TaskFlow.Domain.Exceptions;
using TaskFlow.Domain.ValueObjects;
using TaskStatusEnum = TaskFlow.Domain.Enums.TaskStatus;
using TaskPriorityEnum = TaskFlow.Domain.Enums.TaskPriority;

namespace TaskFlow.Domain.Entities;

public class TaskItem
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public Guid? CategoryId { get; private set; }

    public string Title { get; private set; }
    public string? Description { get; private set; }
    public TaskStatusEnum Status { get; private set; }
    public TaskPriorityEnum Priority { get; private set; }
    public DateTime? DueDate { get; private set; }
    public DateTime? CompletedAt { get; private set; }

    public bool IsDeleted { get; private set; }
    public AuditInfo AuditInfo { get; private set; }

    protected TaskItem() { }

    public TaskItem(
        Guid userId,
        string title,
        string? description,
        TaskPriorityEnum priority,
        DateTime? dueDate = null,
        Guid? categoryId = null)
    {
        if (userId == Guid.Empty)
            throw new DomainException("O usuário da tarefa é obrigatório.");

        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("O título da tarefa é obrigatório.");

        if (title.Trim().Length < 3 || title.Trim().Length > 120)
            throw new DomainException("O título da tarefa deve ter entre 3 e 120 caracteres.");

        if (!string.IsNullOrWhiteSpace(description) && description.Trim().Length > 1000)
            throw new DomainException("A descrição da tarefa deve ter no máximo 1000 caracteres.");

        Id = Guid.NewGuid();
        UserId = userId;
        CategoryId = categoryId;
        Title = title.Trim();
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        Priority = priority;
        Status = TaskStatusEnum.Pending;
        DueDate = dueDate;
        CompletedAt = null;
        IsDeleted = false;
        AuditInfo = new AuditInfo();

        if (DueDate.HasValue && DueDate.Value < AuditInfo.CreatedAt)
            throw new DomainException("A data de vencimento não pode ser anterior à data de criação.");
    }

    public void UpdateTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("O título da tarefa é obrigatório.");

        if (title.Trim().Length < 3 || title.Trim().Length > 120)
            throw new DomainException("O título da tarefa deve ter entre 3 e 120 caracteres.");

        Title = title.Trim();
        AuditInfo.Touch();
    }

    public void UpdateDescription(string? description)
    {
        if (!string.IsNullOrWhiteSpace(description) && description.Trim().Length > 1000)
            throw new DomainException("A descrição da tarefa deve ter no máximo 1000 caracteres.");

        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        AuditInfo.Touch();
    }

    public void UpdatePriority(TaskPriorityEnum priority)
    {
        Priority = priority;
        AuditInfo.Touch();
    }

    public void UpdateDueDate(DateTime? dueDate)
    {
        if (dueDate.HasValue && dueDate.Value < AuditInfo.CreatedAt)
            throw new DomainException("A data de vencimento não pode ser anterior à data de criação.");

        DueDate = dueDate;
        AuditInfo.Touch();
    }

    public void UpdateCategory(Guid? categoryId)
    {
        CategoryId = categoryId;
        AuditInfo.Touch();
    }

    public void ChangeStatus(TaskStatusEnum status)
    {
        Status = status;

        if (status == TaskStatusEnum.Completed)
            CompletedAt = DateTime.UtcNow;
        else
            CompletedAt = null;

        AuditInfo.Touch();
    }

    public void SoftDelete()
    {
        IsDeleted = true;
        AuditInfo.MarkAsDeleted();
    }
}