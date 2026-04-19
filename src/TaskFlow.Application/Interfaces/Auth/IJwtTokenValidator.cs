namespace TaskFlow.Application.Interfaces.Auth;

public interface IJwtTokenValidator
{
    Guid? GetUserId(string token);
}
