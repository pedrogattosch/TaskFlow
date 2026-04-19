using Microsoft.AspNetCore.Mvc;
using TaskFlow.Application.DTOs.Tasks;
using TaskFlow.Application.Exceptions;
using TaskFlow.Application.Interfaces.Auth;
using TaskFlow.Application.UseCases.Tasks.CreateTask;
using TaskFlow.Application.UseCases.Tasks.GetTasks;
using TaskFlow.Domain.Exceptions;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/tasks")]
public sealed class TasksController : ControllerBase
{
    private readonly ICreateTaskUseCase _createTaskUseCase;
    private readonly IGetTasksUseCase _getTasksUseCase;
    private readonly IJwtTokenValidator _jwtTokenValidator;

    public TasksController(
        ICreateTaskUseCase createTaskUseCase,
        IGetTasksUseCase getTasksUseCase,
        IJwtTokenValidator jwtTokenValidator)
    {
        _createTaskUseCase = createTaskUseCase;
        _getTasksUseCase = getTasksUseCase;
        _jwtTokenValidator = jwtTokenValidator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<TaskResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetTasks(CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();

        if (!userId.HasValue)
            return Unauthorized(CreateProblem("Usuário não autenticado.", StatusCodes.Status401Unauthorized));

        try
        {
            var response = await _getTasksUseCase.ExecuteAsync(userId.Value, cancellationToken);
            return Ok(response);
        }
        catch (ApplicationUnauthorizedException exception)
        {
            return Unauthorized(CreateProblem(exception.Message, StatusCodes.Status401Unauthorized));
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(TaskResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateTask(
        [FromBody] CreateTaskRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();

        if (!userId.HasValue)
            return Unauthorized(CreateProblem("Usuário não autenticado.", StatusCodes.Status401Unauthorized));

        try
        {
            var response = await _createTaskUseCase.ExecuteAsync(
                userId.Value,
                request,
                cancellationToken);

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
        catch (ApplicationUnauthorizedException exception)
        {
            return Unauthorized(CreateProblem(exception.Message, StatusCodes.Status401Unauthorized));
        }
    }

    private Guid? GetAuthenticatedUserId()
    {
        var authorizationHeader = Request.Headers.Authorization.ToString();

        if (string.IsNullOrWhiteSpace(authorizationHeader) ||
            !authorizationHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        return _jwtTokenValidator.GetUserId(authorizationHeader["Bearer ".Length..].Trim());
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
