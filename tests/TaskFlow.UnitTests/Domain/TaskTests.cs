using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Enums;
using TaskFlow.Domain.Exceptions;
using DomainTask = TaskFlow.Domain.Entities.Task;
using TaskStatusEnum = TaskFlow.Domain.Enums.TaskStatus;

namespace TaskFlow.UnitTests.Domain;

public class TaskTests
{
    [Fact]
    public void Constructor_ShouldCreatePendingTask_WhenDataIsValid()
    {
        var userId = Guid.NewGuid();
        var category = new Category(userId, "Trabalho", "#336699");

        var task = new DomainTask(
            userId,
            "Revisar backlog",
            "Separar itens prioritários",
            TaskPriority.Medium,
            DateTime.UtcNow.AddDays(1),
            category);

        Assert.NotEqual(Guid.Empty, task.Id);
        Assert.Equal(userId, task.UserId);
        Assert.Equal(category.Id, task.CategoryId);
        Assert.Equal("Revisar backlog", task.Title);
        Assert.Equal(TaskStatusEnum.Pending, task.Status);
        Assert.False(task.IsDeleted);
        Assert.Null(task.CompletedAt);
    }

    [Theory]
    [InlineData("")]
    [InlineData("ab")]
    public void Constructor_ShouldThrow_WhenTitleIsInvalid(string title)
    {
        var exception = Assert.Throws<DomainException>(() =>
            new DomainTask(Guid.NewGuid(), title, null, TaskPriority.Low));

        Assert.Contains("título", exception.Message);
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenDescriptionHasMoreThanLimit()
    {
        var description = new string('a', 1001);

        var exception = Assert.Throws<DomainException>(() =>
            new DomainTask(Guid.NewGuid(), "Título válido", description, TaskPriority.Low));

        Assert.Contains("descrição", exception.Message);
    }

    [Fact]
    public void Constructor_ShouldThrow_WhenDueDateIsBeforeCreatedAt()
    {
        var exception = Assert.Throws<DomainException>(() =>
            new DomainTask(Guid.NewGuid(), "Título válido", null, TaskPriority.Low, DateTime.UtcNow.AddDays(-1)));

        Assert.Contains("vencimento", exception.Message);
    }

    [Fact]
    public void Constructor_ShouldAllow_WhenDueDateIsToday()
    {
        var task = new DomainTask(Guid.NewGuid(), "Título válido", null, TaskPriority.Low, DateTime.UtcNow);

        Assert.NotNull(task.DueDate);
    }

    [Fact]
    public void ChangeStatus_ShouldSetCompletedAt_WhenTaskIsCompleted()
    {
        var task = CreateTask();

        task.ChangeStatus(TaskStatusEnum.Completed);

        Assert.Equal(TaskStatusEnum.Completed, task.Status);
        Assert.NotNull(task.CompletedAt);
    }

    [Fact]
    public void ChangeStatus_ShouldThrow_WhenCancelledTaskMovesToInProgressWithoutReactivation()
    {
        var task = CreateTask();
        task.ChangeStatus(TaskStatusEnum.Cancelled);

        var exception = Assert.Throws<DomainException>(() =>
            task.ChangeStatus(TaskStatusEnum.InProgress));

        Assert.Contains("reativação explícita", exception.Message);
    }

    [Fact]
    public void Reactivate_ShouldMoveCancelledTaskToPending()
    {
        var task = CreateTask();
        task.ChangeStatus(TaskStatusEnum.Cancelled);

        task.Reactivate();

        Assert.Equal(TaskStatusEnum.Pending, task.Status);
        Assert.Null(task.CompletedAt);
    }

    [Fact]
    public void UpdateCategory_ShouldThrow_WhenCategoryBelongsToAnotherUser()
    {
        var task = CreateTask();
        var category = new Category(Guid.NewGuid(), "Pessoal");

        var exception = Assert.Throws<DomainException>(() =>
            task.UpdateCategory(category));

        Assert.Contains("mesmo usuário", exception.Message);
    }

    [Fact]
    public void SoftDelete_ShouldMarkTaskAsDeleted()
    {
        var task = CreateTask();

        task.SoftDelete();

        Assert.True(task.IsDeleted);
        Assert.NotNull(task.AuditInfo.DeletedAt);
    }

    private static DomainTask CreateTask()
    {
        return new DomainTask(Guid.NewGuid(), "Título válido", null, TaskPriority.Low);
    }
}
