export type TaskPriority = 1 | 2 | 3;

export type TaskStatus = 1 | 2 | 3 | 4;

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
  categoryName: string;
};
