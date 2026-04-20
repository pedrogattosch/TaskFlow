using TaskFlow.Application.Interfaces.Auth;
using TaskFlow.Application.Interfaces.Persistence;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Enums;
using TaskFlow.Domain.Interfaces;
using Task = System.Threading.Tasks.Task;
using DomainTask = TaskFlow.Domain.Entities.Task;
using TaskStatusEnum = TaskFlow.Domain.Enums.TaskStatus;

namespace TaskFlow.UnitTests;

internal sealed class InMemoryUserRepository : IUserRepository
{
    private readonly List<User> _users = [];

    public IReadOnlyList<User> Users => _users;

    public Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(_users.FirstOrDefault(user => user.Id == id));
    }

    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(_users.FirstOrDefault(user =>
            user.Email.Equals(email.Trim().ToLowerInvariant(), StringComparison.OrdinalIgnoreCase)));
    }

    public Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        _users.Add(user);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }
}

internal sealed class InMemoryCategoryRepository : ICategoryRepository
{
    private readonly List<Category> _categories = [];

    public IReadOnlyList<Category> Categories => _categories;

    public Task<Category?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(_categories.FirstOrDefault(category => category.Id == id));
    }

    public Task<Category?> GetByUserIdAndNameAsync(
        Guid userId,
        string name,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(_categories.FirstOrDefault(category =>
            category.UserId == userId &&
            category.Name.Equals(name.Trim(), StringComparison.OrdinalIgnoreCase)));
    }

    public Task<IReadOnlyList<Category>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return Task.FromResult<IReadOnlyList<Category>>(
            _categories
                .Where(category => category.UserId == userId)
                .OrderBy(category => category.Name)
                .ToList());
    }

    public Task AddAsync(Category category, CancellationToken cancellationToken = default)
    {
        _categories.Add(category);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Category category, CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }

    public Task DeleteAsync(Category category, CancellationToken cancellationToken = default)
    {
        _categories.Remove(category);
        return Task.CompletedTask;
    }
}

internal sealed class InMemoryTaskRepository : ITaskRepository
{
    private readonly List<DomainTask> _tasks = [];

    public IReadOnlyList<DomainTask> Tasks => _tasks;

    public Task<DomainTask?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(_tasks.FirstOrDefault(task => task.Id == id && !task.IsDeleted));
    }

    public Task<IReadOnlyList<DomainTask>> GetByUserIdAsync(
        Guid userId,
        TaskFilter filter,
        CancellationToken cancellationToken = default)
    {
        IEnumerable<DomainTask> query = _tasks.Where(task => task.UserId == userId && !task.IsDeleted);

        if (filter.Status.HasValue)
            query = query.Where(task => task.Status == filter.Status.Value);

        if (filter.Priority.HasValue)
            query = query.Where(task => task.Priority == filter.Priority.Value);

        if (filter.CategoryId.HasValue)
            query = query.Where(task => task.CategoryId == filter.CategoryId.Value);

        query = filter.SortBy switch
        {
            TaskSortBy.Priority => filter.SortDirection == SortDirection.Desc
                ? query.OrderByDescending(task => task.Priority)
                : query.OrderBy(task => task.Priority),
            _ => filter.SortDirection == SortDirection.Desc
                ? query.OrderByDescending(task => task.DueDate)
                : query.OrderBy(task => task.DueDate)
        };

        return Task.FromResult<IReadOnlyList<DomainTask>>(query.ToList());
    }

    public Task<IReadOnlyDictionary<TaskStatusEnum, int>> CountByStatusAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        IReadOnlyDictionary<TaskStatusEnum, int> counts = _tasks
            .Where(task => task.UserId == userId && !task.IsDeleted)
            .GroupBy(task => task.Status)
            .ToDictionary(group => group.Key, group => group.Count());

        return Task.FromResult(counts);
    }

    public Task AddAsync(DomainTask task, CancellationToken cancellationToken = default)
    {
        _tasks.Add(task);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(DomainTask task, CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }

    public Task DeleteAsync(DomainTask task, CancellationToken cancellationToken = default)
    {
        task.SoftDelete();
        return Task.CompletedTask;
    }
}

internal sealed class CountingUnitOfWork : IUnitOfWork
{
    public int SaveChangesCalls { get; private set; }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        SaveChangesCalls++;
        return Task.FromResult(1);
    }
}

internal sealed class TestPasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        return $"hashed:{password}";
    }

    public bool Verify(string password, string passwordHash)
    {
        return passwordHash == Hash(password);
    }
}

internal sealed class TestJwtTokenGenerator : IJwtTokenGenerator
{
    public JwtToken Generate(User user)
    {
        return new JwtToken($"token:{user.Id}", DateTime.UtcNow.AddHours(1));
    }
}
