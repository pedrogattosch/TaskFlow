namespace TaskFlow.Application.DTOs.Auth;

public sealed record AuthResponse(
    Guid UserId,
    string Name,
    string Email,
    string AccessToken,
    DateTime ExpiresAt);
