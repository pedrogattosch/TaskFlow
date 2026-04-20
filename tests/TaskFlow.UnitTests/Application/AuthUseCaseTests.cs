using TaskFlow.Application.DTOs.Auth;
using TaskFlow.Application.Exceptions;
using TaskFlow.Application.UseCases.Auth.LoginUser;
using TaskFlow.Application.UseCases.Auth.RegisterUser;
using TaskFlow.Domain.Entities;
using Task = System.Threading.Tasks.Task;

namespace TaskFlow.UnitTests.Application;

public class AuthUseCaseTests
{
    [Fact]
    public async Task Register_ShouldCreateUserAndReturnToken_WhenDataIsValid()
    {
        var users = new InMemoryUserRepository();
        var unitOfWork = new CountingUnitOfWork();
        var useCase = new RegisterUserUseCase(
            users,
            new TestPasswordHasher(),
            new TestJwtTokenGenerator(),
            unitOfWork);

        var response = await useCase.ExecuteAsync(new RegisterUserRequest(
            "  Pedro  ",
            " PEDRO@EXAMPLE.COM ",
            "ChangeMe123"));

        Assert.NotEqual(Guid.Empty, response.UserId);
        Assert.Equal("Pedro", response.Name);
        Assert.Equal("pedro@example.com", response.Email);
        Assert.StartsWith("token:", response.AccessToken);
        Assert.Single(users.Users);
        Assert.Equal(1, unitOfWork.SaveChangesCalls);
    }

    [Fact]
    public async Task Register_ShouldThrowConflict_WhenEmailAlreadyExists()
    {
        var users = new InMemoryUserRepository();
        await users.AddAsync(new User("Pedro", "pedro@example.com", "hashed:ChangeMe123"));
        var useCase = new RegisterUserUseCase(
            users,
            new TestPasswordHasher(),
            new TestJwtTokenGenerator(),
            new CountingUnitOfWork());

        await Assert.ThrowsAsync<ApplicationConflictException>(() =>
            useCase.ExecuteAsync(new RegisterUserRequest("Outro", "PEDRO@example.com", "ChangeMe123")));
    }

    [Fact]
    public async Task Register_ShouldThrowValidation_WhenPasswordIsTooShort()
    {
        var useCase = new RegisterUserUseCase(
            new InMemoryUserRepository(),
            new TestPasswordHasher(),
            new TestJwtTokenGenerator(),
            new CountingUnitOfWork());

        await Assert.ThrowsAsync<ApplicationValidationException>(() =>
            useCase.ExecuteAsync(new RegisterUserRequest("Pedro", "pedro@example.com", "short")));
    }

    [Fact]
    public async Task Login_ShouldReturnToken_WhenCredentialsAreValid()
    {
        var users = new InMemoryUserRepository();
        await users.AddAsync(new User("Pedro", "pedro@example.com", "hashed:ChangeMe123"));
        var useCase = new LoginUserUseCase(
            users,
            new TestPasswordHasher(),
            new TestJwtTokenGenerator());

        var response = await useCase.ExecuteAsync(new LoginUserRequest(
            " PEDRO@example.com ",
            "ChangeMe123"));

        Assert.Equal("pedro@example.com", response.Email);
        Assert.StartsWith("token:", response.AccessToken);
    }

    [Fact]
    public async Task Login_ShouldThrowUnauthorized_WhenPasswordIsInvalid()
    {
        var users = new InMemoryUserRepository();
        await users.AddAsync(new User("Pedro", "pedro@example.com", "hashed:ChangeMe123"));
        var useCase = new LoginUserUseCase(
            users,
            new TestPasswordHasher(),
            new TestJwtTokenGenerator());

        await Assert.ThrowsAsync<ApplicationUnauthorizedException>(() =>
            useCase.ExecuteAsync(new LoginUserRequest("pedro@example.com", "wrong-password")));
    }
}
