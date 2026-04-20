using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using TaskFlow.Application.DTOs.Auth;
using TaskFlow.Application.DTOs.Categories;
using TaskFlow.Application.DTOs.Tasks;
using TaskFlow.Domain.Enums;
using TaskStatusEnum = TaskFlow.Domain.Enums.TaskStatus;

namespace TaskFlow.IntegrationTests;

public class ApiEndpointTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ApiEndpointTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task AuthEndpoints_ShouldRegisterLoginAndRejectDuplicateEmail()
    {
        var email = UniqueEmail();

        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            name = "Pedro",
            email,
            password = "ChangeMe123"
        });

        Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);
        var registered = await registerResponse.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(registered);
        Assert.Equal(email, registered.Email);
        Assert.False(string.IsNullOrWhiteSpace(registered.AccessToken));

        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password = "ChangeMe123"
        });

        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
        var loggedIn = await loginResponse.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(loggedIn);
        Assert.Equal(registered.UserId, loggedIn.UserId);

        var duplicateResponse = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            name = "Outro",
            email,
            password = "ChangeMe123"
        });

        Assert.Equal(HttpStatusCode.Conflict, duplicateResponse.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoints_ShouldReturnUnauthorizedWithoutToken()
    {
        var categoriesResponse = await _client.GetAsync("/api/categories");
        var tasksResponse = await _client.GetAsync("/api/tasks");
        var summaryResponse = await _client.GetAsync("/api/tasks/summary");

        Assert.Equal(HttpStatusCode.Unauthorized, categoriesResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, tasksResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, summaryResponse.StatusCode);
    }

    [Fact]
    public async Task CategoryEndpoints_ShouldCreateAndListCategoriesForAuthenticatedUser()
    {
        await AuthenticateAsync();

        var createResponse = await _client.PostAsJsonAsync("/api/categories", new
        {
            name = "Trabalho",
            color = "#336699"
        });

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var createdCategory = await createResponse.Content.ReadFromJsonAsync<CategoryResponse>();
        Assert.NotNull(createdCategory);
        Assert.Equal("Trabalho", createdCategory.Name);

        var listResponse = await _client.GetAsync("/api/categories");

        Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);
        var categories = await listResponse.Content.ReadFromJsonAsync<List<CategoryResponse>>();
        Assert.NotNull(categories);
        Assert.Contains(categories, category => category.Id == createdCategory.Id);
    }

    [Fact]
    public async Task TaskEndpoints_ShouldCreateFilterSummarizeTransitionAndDeleteTask()
    {
        await AuthenticateAsync();
        var category = await CreateCategoryAsync("Trabalho");
        var task = await CreateTaskAsync(
            "Revisar backlog",
            TaskPriority.High,
            category.Id,
            DateTime.UtcNow.AddDays(2));

        Assert.Equal(TaskStatusEnum.Pending, task.Status);

        var started = await UpdateStatusAsync(task.Id, TaskStatusEnum.InProgress);
        Assert.Equal(TaskStatusEnum.InProgress, started.Status);

        var filteredResponse = await _client.GetAsync(
            $"/api/tasks?status={(int)TaskStatusEnum.InProgress}&priority={(int)TaskPriority.High}&categoryId={category.Id}&sortBy=priority&sortDirection=desc");

        Assert.True(
            filteredResponse.StatusCode == HttpStatusCode.OK,
            await filteredResponse.Content.ReadAsStringAsync());
        var filteredTasks = await filteredResponse.Content.ReadFromJsonAsync<List<TaskResponse>>();
        Assert.NotNull(filteredTasks);
        Assert.Contains(filteredTasks, current => current.Id == task.Id);

        var completed = await UpdateStatusAsync(task.Id, TaskStatusEnum.Completed);
        Assert.Equal(TaskStatusEnum.Completed, completed.Status);
        Assert.NotNull(completed.CompletedAt);

        var reopened = await UpdateStatusAsync(task.Id, TaskStatusEnum.Pending);
        Assert.Equal(TaskStatusEnum.Pending, reopened.Status);
        Assert.Null(reopened.CompletedAt);

        var cancelled = await UpdateStatusAsync(task.Id, TaskStatusEnum.Cancelled);
        Assert.Equal(TaskStatusEnum.Cancelled, cancelled.Status);

        var reactivated = await UpdateStatusAsync(task.Id, TaskStatusEnum.Pending);
        Assert.Equal(TaskStatusEnum.Pending, reactivated.Status);

        var summaryResponse = await _client.GetAsync("/api/tasks/summary");
        Assert.Equal(HttpStatusCode.OK, summaryResponse.StatusCode);
        var summary = await summaryResponse.Content.ReadFromJsonAsync<TaskSummaryResponse>();
        Assert.NotNull(summary);
        Assert.True(summary.Pending >= 1);

        var deleteResponse = await _client.DeleteAsync($"/api/tasks/{task.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var listResponse = await _client.GetAsync("/api/tasks");
        Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);
        var remainingTasks = await listResponse.Content.ReadFromJsonAsync<List<TaskResponse>>();
        Assert.NotNull(remainingTasks);
        Assert.DoesNotContain(remainingTasks, current => current.Id == task.Id);
    }

    [Fact]
    public async Task TaskEndpoints_ShouldRejectInvalidStatusTransitionFromCancelledToInProgress()
    {
        await AuthenticateAsync();
        var category = await CreateCategoryAsync("Pessoal");
        var task = await CreateTaskAsync(
            "Cancelar tarefa",
            TaskPriority.Low,
            category.Id,
            DateTime.UtcNow.AddDays(1));
        await UpdateStatusAsync(task.Id, TaskStatusEnum.Cancelled);

        var response = await _client.PatchAsJsonAsync($"/api/tasks/{task.Id}/status", new
        {
            status = TaskStatusEnum.InProgress
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private async Task AuthenticateAsync()
    {
        var email = UniqueEmail();
        var response = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            name = "Pedro",
            email,
            password = "ChangeMe123"
        });

        response.EnsureSuccessStatusCode();
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.NotNull(auth);
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", auth.AccessToken);
    }

    private async Task<CategoryResponse> CreateCategoryAsync(string name)
    {
        var response = await _client.PostAsJsonAsync("/api/categories", new
        {
            name,
            color = (string?)null
        });

        response.EnsureSuccessStatusCode();
        var category = await response.Content.ReadFromJsonAsync<CategoryResponse>();
        Assert.NotNull(category);
        return category;
    }

    private async Task<TaskResponse> CreateTaskAsync(
        string title,
        TaskPriority priority,
        Guid categoryId,
        DateTime dueDate)
    {
        var response = await _client.PostAsJsonAsync("/api/tasks", new
        {
            title,
            description = (string?)null,
            priority,
            dueDate,
            categoryId,
            categoryName = (string?)null
        });

        response.EnsureSuccessStatusCode();
        var task = await response.Content.ReadFromJsonAsync<TaskResponse>();
        Assert.NotNull(task);
        return task;
    }

    private async Task<TaskResponse> UpdateStatusAsync(Guid taskId, TaskStatusEnum status)
    {
        var response = await _client.PatchAsJsonAsync($"/api/tasks/{taskId}/status", new
        {
            status
        });

        response.EnsureSuccessStatusCode();
        var task = await response.Content.ReadFromJsonAsync<TaskResponse>();
        Assert.NotNull(task);
        return task;
    }

    private static string UniqueEmail()
    {
        return $"user-{Guid.NewGuid():N}@example.com";
    }
}
