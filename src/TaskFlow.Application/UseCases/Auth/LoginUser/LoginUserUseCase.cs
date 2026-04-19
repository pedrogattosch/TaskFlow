using TaskFlow.Application.DTOs.Auth;
using TaskFlow.Application.Exceptions;
using TaskFlow.Application.Interfaces.Auth;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.UseCases.Auth.LoginUser;

public sealed class LoginUserUseCase : ILoginUserUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public LoginUserUseCase(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponse> ExecuteAsync(
        LoginUserRequest request,
        CancellationToken cancellationToken = default)
    {
        Validate(request);

        var normalizedEmail = request.Email.Trim().ToLower();
        var user = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);

        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new ApplicationUnauthorizedException("E-mail ou senha inválidos.");

        var token = _jwtTokenGenerator.Generate(user);

        return new AuthResponse(
            user.Id,
            user.Name,
            user.Email,
            token.Value,
            token.ExpiresAt);
    }

    private static void Validate(LoginUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            throw new ApplicationValidationException("O e-mail é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.Password))
            throw new ApplicationValidationException("A senha é obrigatória.");
    }
}
