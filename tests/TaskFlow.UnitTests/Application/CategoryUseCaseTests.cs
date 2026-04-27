using TaskFlow.Application.DTOs.Categories;
using TaskFlow.Application.Exceptions;
using TaskFlow.Application.UseCases.Categories.CreateCategory;
using TaskFlow.Application.UseCases.Categories.DeleteCategory;
using TaskFlow.Application.UseCases.Categories.GetCategories;
using TaskFlow.Domain.Entities;
using Task = System.Threading.Tasks.Task;

namespace TaskFlow.UnitTests.Application;

public class CategoryUseCaseTests
{
    [Fact]
    public async Task CreateCategory_ShouldCreateCategory_WhenNameIsUniqueForUser()
    {
        var user = new User("Pedro", "pedro@example.com", "hash");
        var users = new InMemoryUserRepository();
        var categories = new InMemoryCategoryRepository();
        var unitOfWork = new CountingUnitOfWork();
        await users.AddAsync(user);

        var useCase = new CreateCategoryUseCase(users, categories, unitOfWork);

        var response = await useCase.ExecuteAsync(
            user.Id,
            new CreateCategoryRequest(" Trabalho ", "#336699"));

        Assert.Equal("Trabalho", response.Name);
        Assert.Equal("#336699", response.Color);
        Assert.Single(categories.Categories);
        Assert.Equal(1, unitOfWork.SaveChangesCalls);
    }

    [Fact]
    public async Task CreateCategory_ShouldThrowConflict_WhenCategoryNameAlreadyExistsForUser()
    {
        var user = new User("Pedro", "pedro@example.com", "hash");
        var users = new InMemoryUserRepository();
        var categories = new InMemoryCategoryRepository();
        await users.AddAsync(user);
        await categories.AddAsync(new Category(user.Id, "Trabalho"));

        var useCase = new CreateCategoryUseCase(users, categories, new CountingUnitOfWork());

        await Assert.ThrowsAsync<ApplicationConflictException>(() =>
            useCase.ExecuteAsync(user.Id, new CreateCategoryRequest("trabalho", null)));
    }

    [Fact]
    public async Task CreateCategory_ShouldThrowUnauthorized_WhenUserDoesNotExist()
    {
        var useCase = new CreateCategoryUseCase(
            new InMemoryUserRepository(),
            new InMemoryCategoryRepository(),
            new CountingUnitOfWork());

        await Assert.ThrowsAsync<ApplicationUnauthorizedException>(() =>
            useCase.ExecuteAsync(Guid.NewGuid(), new CreateCategoryRequest("Trabalho", null)));
    }

    [Fact]
    public async Task GetCategories_ShouldReturnOnlyCategoriesFromAuthenticatedUser()
    {
        var user = new User("Pedro", "pedro@example.com", "hash");
        var otherUser = new User("Ana", "ana@example.com", "hash");
        var users = new InMemoryUserRepository();
        var categories = new InMemoryCategoryRepository();
        await users.AddAsync(user);
        await users.AddAsync(otherUser);
        await categories.AddAsync(new Category(user.Id, "Trabalho"));
        await categories.AddAsync(new Category(otherUser.Id, "Pessoal"));

        var useCase = new GetCategoriesUseCase(users, categories);

        var response = await useCase.ExecuteAsync(user.Id);

        Assert.Single(response);
        Assert.Equal("Trabalho", response[0].Name);
    }

    [Fact]
    public async Task DeleteCategory_ShouldRemoveCategory_WhenItBelongsToAuthenticatedUser()
    {
        var user = new User("Pedro", "pedro@example.com", "hash");
        var users = new InMemoryUserRepository();
        var categories = new InMemoryCategoryRepository();
        var unitOfWork = new CountingUnitOfWork();
        var category = new Category(user.Id, "Trabalho");
        await users.AddAsync(user);
        await categories.AddAsync(category);

        var useCase = new DeleteCategoryUseCase(users, categories, unitOfWork);

        await useCase.ExecuteAsync(user.Id, category.Id);

        Assert.Empty(categories.Categories);
        Assert.Equal(1, unitOfWork.SaveChangesCalls);
    }

    [Fact]
    public async Task DeleteCategory_ShouldThrowNotFound_WhenCategoryDoesNotBelongToAuthenticatedUser()
    {
        var user = new User("Pedro", "pedro@example.com", "hash");
        var otherUser = new User("Ana", "ana@example.com", "hash");
        var users = new InMemoryUserRepository();
        var categories = new InMemoryCategoryRepository();
        var category = new Category(otherUser.Id, "Pessoal");
        await users.AddAsync(user);
        await users.AddAsync(otherUser);
        await categories.AddAsync(category);

        var useCase = new DeleteCategoryUseCase(users, categories, new CountingUnitOfWork());

        await Assert.ThrowsAsync<ApplicationNotFoundException>(() =>
            useCase.ExecuteAsync(user.Id, category.Id));
    }
}
