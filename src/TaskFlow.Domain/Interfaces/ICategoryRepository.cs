using TaskFlow.Domain.Entities;

namespace TaskFlow.Domain.Interfaces;

public interface ICategoryRepository
{
    System.Threading.Tasks.Task<Category?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<Category?> GetByUserIdAndNameAsync(Guid userId, string name, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<IReadOnlyList<Category>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task AddAsync(Category category, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task UpdateAsync(Category category, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task DeleteAsync(Category category, CancellationToken cancellationToken = default);
}
