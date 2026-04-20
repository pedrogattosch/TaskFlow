export type TaskPriority = 1 | 2 | 3;

export type TaskStatus = 1 | 2 | 3 | 4;

export type TaskSortBy = 'dueDate' | 'priority';

export type TaskSortDirection = 'asc' | 'desc';

export type TaskQueryInput = {
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryId?: string;
  sortBy?: TaskSortBy;
  sortDirection?: TaskSortDirection;
};

export type TaskSummary = {
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
};

export type TaskListItem = {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  completedAt: string | null;
  categoryId: string | null;
  categoryName: string | null;
};

export type CreateTaskInput = {
  title: string;
  description: string | null;
  priority: TaskPriority;
  dueDate: string;
  categoryId: string;
  categoryName: string | null;
};

export type UpdateTaskInput = CreateTaskInput;
