namespace TaskFlow.Application.Exceptions;

public sealed class ApplicationConflictException : Exception
{
    public ApplicationConflictException(string message)
        : base(message)
    {
    }
}
