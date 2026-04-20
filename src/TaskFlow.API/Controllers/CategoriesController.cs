using Microsoft.AspNetCore.Mvc;
using TaskFlow.Application.DTOs.Categories;
using TaskFlow.Application.Exceptions;
using TaskFlow.Application.Interfaces.Auth;
using TaskFlow.Application.UseCases.Categories.CreateCategory;
using TaskFlow.Application.UseCases.Categories.GetCategories;
using TaskFlow.Domain.Exceptions;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/categories")]
public sealed class CategoriesController : ControllerBase
{
    private readonly ICreateCategoryUseCase _createCategoryUseCase;
    private readonly IGetCategoriesUseCase _getCategoriesUseCase;
    private readonly IJwtTokenValidator _jwtTokenValidator;

    public CategoriesController(
        ICreateCategoryUseCase createCategoryUseCase,
        IGetCategoriesUseCase getCategoriesUseCase,
        IJwtTokenValidator jwtTokenValidator)
    {
        _createCategoryUseCase = createCategoryUseCase;
        _getCategoriesUseCase = getCategoriesUseCase;
        _jwtTokenValidator = jwtTokenValidator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<CategoryResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCategories(CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();

        if (!userId.HasValue)
            return Unauthorized(CreateProblem("Usuário não autenticado.", StatusCodes.Status401Unauthorized));

        try
        {
            var response = await _getCategoriesUseCase.ExecuteAsync(userId.Value, cancellationToken);
            return Ok(response);
        }
        catch (ApplicationUnauthorizedException exception)
        {
            return Unauthorized(CreateProblem(exception.Message, StatusCodes.Status401Unauthorized));
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(CategoryResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateCategory(
        [FromBody] CreateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetAuthenticatedUserId();

        if (!userId.HasValue)
            return Unauthorized(CreateProblem("Usuário não autenticado.", StatusCodes.Status401Unauthorized));

        try
        {
            var response = await _createCategoryUseCase.ExecuteAsync(
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
        catch (ApplicationConflictException exception)
        {
            return Conflict(CreateProblem(exception.Message, StatusCodes.Status409Conflict));
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
