using Microsoft.AspNetCore.Mvc;
using TaskFlow.Application.DTOs.Auth;
using TaskFlow.Application.Exceptions;
using TaskFlow.Application.UseCases.Auth.LoginUser;
using TaskFlow.Application.UseCases.Auth.RegisterUser;
using TaskFlow.Domain.Exceptions;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IRegisterUserUseCase _registerUserUseCase;
    private readonly ILoginUserUseCase _loginUserUseCase;

    public AuthController(
        IRegisterUserUseCase registerUserUseCase,
        ILoginUserUseCase loginUserUseCase)
    {
        _registerUserUseCase = registerUserUseCase;
        _loginUserUseCase = loginUserUseCase;
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register(
        [FromBody] RegisterUserRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await _registerUserUseCase.ExecuteAsync(request, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, response);
        }
        catch (ApplicationValidationException exception)
        {
            return BadRequest(CreateProblem(exception.Message, StatusCodes.Status400BadRequest));
        }
        catch (DomainException exception)
        {
            return BadRequest(CreateProblem(exception.Message, StatusCodes.Status400BadRequest));
        }
        catch (ApplicationConflictException exception)
        {
            return Conflict(CreateProblem(exception.Message, StatusCodes.Status409Conflict));
        }
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        [FromBody] LoginUserRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var response = await _loginUserUseCase.ExecuteAsync(request, cancellationToken);
            return Ok(response);
        }
        catch (ApplicationValidationException exception)
        {
            return BadRequest(CreateProblem(exception.Message, StatusCodes.Status400BadRequest));
        }
        catch (ApplicationUnauthorizedException exception)
        {
            return Unauthorized(CreateProblem(exception.Message, StatusCodes.Status401Unauthorized));
        }
    }

    private static ProblemDetails CreateProblem(string detail, int statusCode)
    {
        return new ProblemDetails
        {
            Detail = detail,
            Status = statusCode
        };
    }
}
