using System.Net.Mail;
using TaskFlow.Application.DTOs.Auth;
using TaskFlow.Application.Exceptions;
using TaskFlow.Application.Interfaces.Auth;
using TaskFlow.Application.Interfaces.Persistence;
using TaskFlow.Domain.Entities;
using TaskFlow.Domain.Interfaces;

namespace TaskFlow.Application.UseCases.Auth.RegisterUser;

public sealed class RegisterUserUseCase : IRegisterUserUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IUnitOfWork _unitOfWork;

    public RegisterUserUseCase(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _unitOfWork = unitOfWork;
    }

    public async Task<AuthResponse> ExecuteAsync(
        RegisterUserRequest request,
        CancellationToken cancellationToken = default)
    {
        Validate(request);

        var normalizedEmail = request.Email.Trim().ToLower();
        var existingUser = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);

        if (existingUser is not null)
            throw new ApplicationConflictException("Já existe um usuário cadastrado com este e-mail.");

        var passwordHash = _passwordHasher.Hash(request.Password);
        var user = new User(request.Name, normalizedEmail, passwordHash);

        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var token = _jwtTokenGenerator.Generate(user);

        return new AuthResponse(
            user.Id,
            user.Name,
            user.Email,
            token.Value,
            token.ExpiresAt);
    }

    private static void Validate(RegisterUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ApplicationValidationException("O nome é obrigatório.");

        if (request.Name.Trim().Length > 120)
            throw new ApplicationValidationException("O nome deve ter no máximo 120 caracteres.");

        if (string.IsNullOrWhiteSpace(request.Email))
            throw new ApplicationValidationException("O e-mail é obrigatório.");

        if (!IsValidEmail(request.Email))
            throw new ApplicationValidationException("O e-mail informado é inválido.");

        if (string.IsNullOrWhiteSpace(request.Password))
            throw new ApplicationValidationException("A senha é obrigatória.");

        if (request.Password.Length < 8)
            throw new ApplicationValidationException("A senha deve ter pelo menos 8 caracteres.");
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            _ = new MailAddress(email);
            return true;
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
