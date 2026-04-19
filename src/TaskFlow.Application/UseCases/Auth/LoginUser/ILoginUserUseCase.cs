using TaskFlow.Application.DTOs.Auth;

namespace TaskFlow.Application.UseCases.Auth.LoginUser;

public interface ILoginUserUseCase
{
    Task<AuthResponse> ExecuteAsync(LoginUserRequest request, CancellationToken cancellationToken = default);
}
