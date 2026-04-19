using Microsoft.EntityFrameworkCore;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Interfaces;
using TaskFlow.Infrastructure.Persistence.Context;

namespace TaskFlow.Infrastructure.Persistence.Repositories;

public sealed class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _dbContext;

    public CategoryRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public System.Threading.Tasks.Task<Category?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return _dbContext.Categories.FirstOrDefaultAsync(category => category.Id == id, cancellationToken);
    }

    public System.Threading.Tasks.Task<Category?> GetByUserIdAndNameAsync(
        Guid userId,
        string name,
        CancellationToken cancellationToken = default)
    {
        var normalizedName = name.Trim();

        return _dbContext.Categories.FirstOrDefaultAsync(
            category => category.UserId == userId && category.Name == normalizedName,
            cancellationToken);
    }

    public async System.Threading.Tasks.Task<IReadOnlyList<Category>> GetByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext.Categories
            .AsNoTracking()
            .Where(category => category.UserId == userId)
            .OrderBy(category => category.Name)
            .ToListAsync(cancellationToken);
    }

    public async System.Threading.Tasks.Task AddAsync(
        Category category,
        CancellationToken cancellationToken = default)
    {
        await _dbContext.Categories.AddAsync(category, cancellationToken);
    }

    public System.Threading.Tasks.Task UpdateAsync(
        Category category,
        CancellationToken cancellationToken = default)
    {
        _dbContext.Categories.Update(category);
        return System.Threading.Tasks.Task.CompletedTask;
    }

    public System.Threading.Tasks.Task DeleteAsync(
        Category category,
        CancellationToken cancellationToken = default)
    {
        _dbContext.Categories.Remove(category);
        return System.Threading.Tasks.Task.CompletedTask;
    }
}
