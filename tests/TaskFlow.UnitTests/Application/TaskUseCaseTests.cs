using TaskFlow.Application.DTOs.Tasks;
using TaskFlow.Application.Exceptions;
using TaskFlow.Application.UseCases.Tasks.CreateTask;
using TaskFlow.Application.UseCases.Tasks.GetTasks;
using TaskFlow.Application.UseCases.Tasks.GetTaskSummary;
using TaskFlow.Application.UseCases.Tasks.UpdateTaskStatus;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Enums;
using Task = System.Threading.Tasks.Task;
using DomainTask = TaskFlow.Domain.Entities.Task;
using TaskStatusEnum = TaskFlow.Domain.Enums.TaskStatus;

namespace TaskFlow.UnitTests.Application;

public class TaskUseCaseTests
{
    [Fact]
    public async Task CreateTask_ShouldCreateTaskWithExistingCategory()
    {
        var context = await CreateContextAsync();
        var unitOfWork = new CountingUnitOfWork();
        var useCase = new CreateTaskUseCase(
            context.Users,
            context.Tasks,
            context.Categories,
            unitOfWork);

        var response = await useCase.ExecuteAsync(
            context.User.Id,
            new CreateTaskRequest(
                "Revisar backlog",
                "Separar prioridades",
                TaskPriority.High,
                DateTime.UtcNow.AddDays(1),
                context.Category.Id,
                null));

        Assert.Equal("Revisar backlog", response.Title);
        Assert.Equal(TaskStatusEnum.Pending, response.Status);
        Assert.Equal(context.Category.Id, response.CategoryId);
        Assert.Equal(1, unitOfWork.SaveChangesCalls);
        Assert.Single(context.Tasks.Tasks);
    }

    [Fact]
    public async Task CreateTask_ShouldCreateCategoryWhenCategoryNameIsProvided()
    {
        var context = await CreateContextAsync();
        var useCase = new CreateTaskUseCase(
            context.Users,
            context.Tasks,
            context.Categories,
            new CountingUnitOfWork());

        var response = await useCase.ExecuteAsync(
            context.User.Id,
            new CreateTaskRequest(
                "Planejar semana",
                null,
                TaskPriority.Medium,
                DateTime.UtcNow.AddDays(2),
                null,
                "Pessoal"));

        Assert.Equal("Pessoal", response.CategoryName);
        Assert.Equal(2, context.Categories.Categories.Count);
    }

    [Fact]
    public async Task CreateTask_ShouldThrowValidation_WhenCategoryIsMissing()
    {
        var context = await CreateContextAsync();
        var useCase = new CreateTaskUseCase(
            context.Users,
            context.Tasks,
            context.Categories,
            new CountingUnitOfWork());

        await Assert.ThrowsAsync<ApplicationValidationException>(() =>
            useCase.ExecuteAsync(
                context.User.Id,
                new CreateTaskRequest(
                    "Planejar semana",
                    null,
                    TaskPriority.Medium,
                    DateTime.UtcNow.AddDays(1),
                    null,
                    null)));
    }

    [Fact]
    public async Task GetTasks_ShouldApplyStatusPriorityCategoryAndSortingFilters()
    {
        var context = await CreateContextAsync();
        var first = new DomainTask(
            context.User.Id,
            "Alta prioridade",
            null,
            TaskPriority.High,
            DateTime.UtcNow.AddDays(3),
            context.Category);
        first.ChangeStatus(TaskStatusEnum.InProgress);
        var second = new DomainTask(
            context.User.Id,
            "Baixa prioridade",
            null,
            TaskPriority.Low,
            DateTime.UtcNow.AddDays(1),
            context.Category);
        second.ChangeStatus(TaskStatusEnum.InProgress);
        await context.Tasks.AddAsync(first);
        await context.Tasks.AddAsync(second);

        var useCase = new GetTasksUseCase(context.Users, context.Tasks, context.Categories);

        var response = await useCase.ExecuteAsync(
            context.User.Id,
            new GetTasksRequest
            {
                Status = TaskStatusEnum.InProgress,
                CategoryId = context.Category.Id,
                SortBy = "priority",
                SortDirection = "desc"
            });

        Assert.Equal(2, response.Count);
        Assert.Equal("Alta prioridade", response[0].Title);
        Assert.All(response, task => Assert.Equal(TaskStatusEnum.InProgress, task.Status));
    }

    [Fact]
    public async Task GetTasks_ShouldThrowValidation_WhenSortByIsInvalid()
    {
        var context = await CreateContextAsync();
        var useCase = new GetTasksUseCase(context.Users, context.Tasks, context.Categories);

        await Assert.ThrowsAsync<ApplicationValidationException>(() =>
            useCase.ExecuteAsync(context.User.Id, new GetTasksRequest { SortBy = "unknown" }));
    }

    [Fact]
    public async Task GetTaskSummary_ShouldReturnCountsForEveryStatus()
    {
        var context = await CreateContextAsync();
        await context.Tasks.AddAsync(new DomainTask(context.User.Id, "Pendente", null, TaskPriority.Low));
        var inProgress = new DomainTask(context.User.Id, "Em andamento", null, TaskPriority.Low);
        inProgress.ChangeStatus(TaskStatusEnum.InProgress);
        await context.Tasks.AddAsync(inProgress);
        var completed = new DomainTask(context.User.Id, "Concluida", null, TaskPriority.Low);
        completed.ChangeStatus(TaskStatusEnum.Completed);
        await context.Tasks.AddAsync(completed);
        var cancelled = new DomainTask(context.User.Id, "Cancelada", null, TaskPriority.Low);
        cancelled.ChangeStatus(TaskStatusEnum.Cancelled);
        await context.Tasks.AddAsync(cancelled);

        var useCase = new GetTaskSummaryUseCase(context.Users, context.Tasks);

        var response = await useCase.ExecuteAsync(context.User.Id);

        Assert.Equal(1, response.Pending);
        Assert.Equal(1, response.InProgress);
        Assert.Equal(1, response.Completed);
        Assert.Equal(1, response.Cancelled);
    }

    [Fact]
    public async Task UpdateTaskStatus_ShouldReactivateCancelledTaskToPending()
    {
        var context = await CreateContextAsync();
        var task = new DomainTask(context.User.Id, "Cancelada", null, TaskPriority.Low);
        task.ChangeStatus(TaskStatusEnum.Cancelled);
        await context.Tasks.AddAsync(task);
        var useCase = new UpdateTaskStatusUseCase(
            context.Users,
            context.Tasks,
            context.Categories,
            new CountingUnitOfWork());

        var response = await useCase.ExecuteAsync(
            context.User.Id,
            task.Id,
            new UpdateTaskStatusRequest(TaskStatusEnum.Pending));

        Assert.Equal(TaskStatusEnum.Pending, response.Status);
        Assert.Equal(TaskStatusEnum.Pending, task.Status);
    }

    [Fact]
    public async Task UpdateTaskStatus_ShouldMoveCompletedTaskBackToInProgress()
    {
        var context = await CreateContextAsync();
        var task = new DomainTask(context.User.Id, "Concluida", null, TaskPriority.Low);
        task.ChangeStatus(TaskStatusEnum.Completed);
        await context.Tasks.AddAsync(task);
        var useCase = new UpdateTaskStatusUseCase(
            context.Users,
            context.Tasks,
            context.Categories,
            new CountingUnitOfWork());

        var response = await useCase.ExecuteAsync(
            context.User.Id,
            task.Id,
            new UpdateTaskStatusRequest(TaskStatusEnum.InProgress));

        Assert.Equal(TaskStatusEnum.InProgress, response.Status);
        Assert.Null(response.CompletedAt);
    }

    private static async Task<TestContext> CreateContextAsync()
    {
        var user = new User("Pedro", "pedro@example.com", "hash");
        var category = new Category(user.Id, "Trabalho");
        var users = new InMemoryUserRepository();
        var categories = new InMemoryCategoryRepository();
        await users.AddAsync(user);
        await categories.AddAsync(category);

        return new TestContext(
            user,
            category,
            users,
            categories,
            new InMemoryTaskRepository());
    }

    private sealed record TestContext(
        User User,
        Category Category,
        InMemoryUserRepository Users,
        InMemoryCategoryRepository Categories,
        InMemoryTaskRepository Tasks);
}
