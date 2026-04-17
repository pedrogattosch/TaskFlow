using TaskFlow.Domain.Exceptions;
using TaskFlow.Domain.ValueObjects;

namespace TaskFlow.Domain.Entities;

public class Category
{
    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string Name { get; private set; }
    public string? Color { get; private set; }
    public AuditInfo AuditInfo { get; private set; }

    protected Category() { }

    public Category(Guid userId, string name, string? color = null)
    {
        if (userId == Guid.Empty)
            throw new DomainException("O usuário da categoria é obrigatório.");

        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("O nome da categoria é obrigatório.");

        Id = Guid.NewGuid();
        UserId = userId;
        Name = name.Trim();
        Color = string.IsNullOrWhiteSpace(color) ? null : color.Trim();
        AuditInfo = new AuditInfo();
    }

    public void UpdateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new DomainException("O nome da categoria é obrigatório.");

        Name = name.Trim();
        AuditInfo.Touch();
    }

    public void UpdateColor(string? color)
    {
        Color = string.IsNullOrWhiteSpace(color) ? null : color.Trim();
        AuditInfo.Touch();
    }
}