using Microsoft.AspNetCore.Mvc;
using TaskFlow.Application.DTOs.Tasks;
using TaskFlow.Application.Exceptions;
using TaskFlow.Application.Interfaces.Auth;
using TaskFlow.Application.UseCases.Tasks.CreateTask;
using TaskFlow.Application.UseCases.Tasks.DeleteTask;
using TaskFlow.Application.UseCases.Tasks.GetTasks;
using TaskFlow.Application.UseCases.Tasks.UpdateTask;
using TaskFlow.Application.UseCases.Tasks.UpdateTaskStatus;
using TaskFlow.Domain.Exceptions;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/tasks")]
public sealed class TasksController : ControllerBase
{
    private readonly ICreateTaskUseCase _createTaskUseCase;
    private readonly IGetTasksUseCase _getTasksUseCase;
    private readonly IUpdateTaskUseCase _updateTaskUseCase;
    private readonly IUpdateTaskStatusUseCase _updateTaskStatusUseCase;
    private readonly IDeleteTaskUseCase _deleteTaskUseCase;
    private readonly IJwtTokenValidator _jwtTokenValidator;

    public TasksController(
        ICreateTaskUseCase createTaskUseCase,
        IGetTasksUseCase getTasksUseCase,
        IUpdateTaskUseCase updateTaskUseCase,
        IUpdateTaskStatusUseCase updateTaskStatusUseCase,
        IDeleteTaskUseCase deleteTaskUseCase,
        IJwtTokenValidator jwtTokenValidator)
    {
        _createTaskUseCase = createTaskUseCase;
        _getTasksUseCase = getTasksUseCase;
        _updateTaskUseCase = updateTaskUseCase;
        _updateTaskStatusUseCase = updateTaskStatusUseCase;
        _deleteTaskUseCase = deleteTaskUseCase;
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

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(TaskResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTask(
        Guid id,
        [FromBody] UpdateTaskRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();

        if (!userId.HasValue)
            return Unauthorized(CreateProblem("Usuário não autenticado.", StatusCodes.Status401Unauthorized));

        try
        {
            var response = await _updateTaskUseCase.ExecuteAsync(
                userId.Value,
                id,
                request,
                cancellationToken);

            return Ok(response);
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
        catch (ApplicationNotFoundException exception)
        {
            return NotFound(CreateProblem(exception.Message, StatusCodes.Status404NotFound));
        }
    }

    [HttpPatch("{id:guid}/status")]
    [ProducesResponseType(typeof(TaskResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTaskStatus(
        Guid id,
        [FromBody] UpdateTaskStatusRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();

        if (!userId.HasValue)
            return Unauthorized(CreateProblem("Usuário não autenticado.", StatusCodes.Status401Unauthorized));

        try
        {
            var response = await _updateTaskStatusUseCase.ExecuteAsync(
                userId.Value,
                id,
                request,
                cancellationToken);

            return Ok(response);
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
        catch (ApplicationNotFoundException exception)
        {
            return NotFound(CreateProblem(exception.Message, StatusCodes.Status404NotFound));
        }
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTask(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();

        if (!userId.HasValue)
            return Unauthorized(CreateProblem("Usuário não autenticado.", StatusCodes.Status401Unauthorized));

        try
        {
            await _deleteTaskUseCase.ExecuteAsync(userId.Value, id, cancellationToken);
            return NoContent();
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
        catch (ApplicationNotFoundException exception)
        {
            return NotFound(CreateProblem(exception.Message, StatusCodes.Status404NotFound));
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
