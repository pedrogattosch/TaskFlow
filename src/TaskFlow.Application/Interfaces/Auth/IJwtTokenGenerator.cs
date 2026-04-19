using TaskFlow.Domain.Entities;

namespace TaskFlow.Application.Interfaces.Auth;

public interface IJwtTokenGenerator
{
    JwtToken Generate(User user);
}
