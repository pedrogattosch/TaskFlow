namespace TaskFlow.Application.DTOs.Auth;

public sealed record RegisterUserRequest(
    string Name,
    string Email,
    string Password);
