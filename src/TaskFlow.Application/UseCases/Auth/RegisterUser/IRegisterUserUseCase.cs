using TaskFlow.Application.DTOs.Auth;

namespace TaskFlow.Application.UseCases.Auth.RegisterUser;

public interface IRegisterUserUseCase
{
    Task<AuthResponse> ExecuteAsync(RegisterUserRequest request, CancellationToken cancellationToken = default);
}
