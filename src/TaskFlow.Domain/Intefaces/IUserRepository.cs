using TaskFlow.Domain.Entities;

namespace TaskFlow.Domain.Interfaces;

public interface IUserRepository
{
    System.Threading.Tasks.Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task AddAsync(User user, CancellationToken cancellationToken = default);
    System.Threading.Tasks.Task UpdateAsync(User user, CancellationToken cancellationToken = default);
}
