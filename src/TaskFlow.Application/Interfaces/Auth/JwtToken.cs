namespace TaskFlow.Application.Interfaces.Auth;

public sealed record JwtToken(string Value, DateTime ExpiresAt);
