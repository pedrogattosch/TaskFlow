using TaskFlow.Domain.Exceptions;
using TaskFlow.Domain.ValueObjects;
using TaskPriorityEnum = TaskFlow.Domain.Enums.TaskPriority;
using TaskStatusEnum = TaskFlow.Domain.Enums.TaskStatus;

namespace TaskFlow.Domain.Entities;

public class Task
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public Guid? CategoryId { get; private set; }
    public string Title { get; private set; }
    public string? Description { get; private set; }
    public TaskPriorityEnum Priority { get; private set; }
    public TaskStatusEnum Status { get; private set; }
    public DateTime? DueDate { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public bool IsDeleted { get; private set; }
    public AuditInfo AuditInfo { get; private set; }

    protected Task()
    {
        Title = string.Empty;
        AuditInfo = new AuditInfo();
    }

    public Task(
        Guid userId,
        string title,
        string? description,
        TaskPriorityEnum priority,
        DateTime? dueDate = null,
        Category? category = null)
    {
        ValidateUser(userId);
        ValidateTitle(title);
        ValidateDescription(description);
        ValidatePriority(priority);
        ValidateCategory(userId, category);

        Id = Guid.NewGuid();
        UserId = userId;
        CategoryId = category?.Id;
        Title = title.Trim();
        Description = NormalizeOptionalText(description);
        Priority = priority;
        Status = TaskStatusEnum.Pending;
        DueDate = dueDate;
        CompletedAt = null;
        IsDeleted = false;
        AuditInfo = new AuditInfo();

        ValidateDueDate(dueDate);
    }

    public void UpdateTitle(string title)
    {
        EnsureCanBeChanged();
        ValidateTitle(title);

        Title = title.Trim();
        AuditInfo.Touch();
    }

    public void UpdateDescription(string? description)
    {
        EnsureCanBeChanged();
        ValidateDescription(description);

        Description = NormalizeOptionalText(description);
        AuditInfo.Touch();
    }

    public void UpdatePriority(TaskPriorityEnum priority)
    {
        EnsureCanBeChanged();
        ValidatePriority(priority);

        Priority = priority;
        AuditInfo.Touch();
    }

    public void UpdateDueDate(DateTime? dueDate)
    {
        EnsureCanBeChanged();
        ValidateDueDate(dueDate);

        DueDate = dueDate;
        AuditInfo.Touch();
    }

    public void UpdateCategory(Category? category)
    {
        EnsureCanBeChanged();
        ValidateCategory(UserId, category);

        CategoryId = category?.Id;
        AuditInfo.Touch();
    }

    public void ChangeStatus(TaskStatusEnum status)
    {
        EnsureCanBeChanged();
        ValidateStatus(status);

        if (Status == TaskStatusEnum.Cancelled && status != TaskStatusEnum.Cancelled)
            throw new DomainException("Uma tarefa cancelada precisa ser reativada antes de mudar para outro status.");

        ApplyStatus(status);
        AuditInfo.Touch();
    }

    public void Reactivate()
    {
        EnsureCanBeChanged();

        if (Status != TaskStatusEnum.Cancelled)
            throw new DomainException("Apenas tarefas canceladas podem ser reativadas.");

        ApplyStatus(TaskStatusEnum.Pending);
        AuditInfo.Touch();
    }

    public void SoftDelete()
    {
        if (IsDeleted)
            return;

        IsDeleted = true;
        AuditInfo.MarkAsDeleted();
    }

    private void ApplyStatus(TaskStatusEnum status)
    {
        Status = status;
        CompletedAt = status == TaskStatusEnum.Completed ? DateTime.UtcNow : null;
    }

    private void EnsureCanBeChanged()
    {
        if (IsDeleted)
            throw new DomainException("Uma tarefa excluída não pode ser alterada.");
    }

    private void ValidateDueDate(DateTime? dueDate)
    {
        if (dueDate.HasValue && dueDate.Value.Date < AuditInfo.CreatedAt.Date)
            throw new DomainException("A data de vencimento não pode ser anterior à data de criação.");
    }

    private static void ValidateUser(Guid userId)
    {
        if (userId == Guid.Empty)
            throw new DomainException("O usuário da tarefa é obrigatório.");
    }

    private static void ValidateTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new DomainException("O título da tarefa é obrigatório.");

        var length = title.Trim().Length;

        if (length < 3 || length > 120)
            throw new DomainException("O título da tarefa deve ter entre 3 e 120 caracteres.");
    }

    private static void ValidateDescription(string? description)
    {
        if (!string.IsNullOrWhiteSpace(description) && description.Trim().Length > 1000)
            throw new DomainException("A descrição da tarefa deve ter no máximo 1000 caracteres.");
    }

    private static void ValidatePriority(TaskPriorityEnum priority)
    {
        if (!Enum.IsDefined(priority))
            throw new DomainException("A prioridade da tarefa é inválida.");
    }

    private static void ValidateCategory(Guid userId, Category? category)
    {
        if (category is not null && category.UserId != userId)
            throw new DomainException("A categoria deve pertencer ao mesmo usuário da tarefa.");
    }

    private static void ValidateStatus(TaskStatusEnum status)
    {
        if (!Enum.IsDefined(status))
            throw new DomainException("O status da tarefa é inválido.");
    }

    private static string? NormalizeOptionalText(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
