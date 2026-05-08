namespace TaskFlow.Application.DTOs.Auth;

public sealed record LoginUserRequest(
    string Email,
    string Password,
    bool RememberMe = false);
