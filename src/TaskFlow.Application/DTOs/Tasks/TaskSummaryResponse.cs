namespace TaskFlow.Application.DTOs.Tasks;

public sealed record TaskSummaryResponse(
    int Pending,
    int InProgress,
    int Completed,
    int Cancelled);
