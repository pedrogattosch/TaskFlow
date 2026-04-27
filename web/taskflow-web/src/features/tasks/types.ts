import type { CSSProperties, DragEvent, FormEvent } from 'react';
import type { CategoryListItem } from '../../types/category';
import type {
  TaskListItem,
  TaskPriority,
  TaskSortBy,
  TaskSortDirection,
  TaskStatus,
  TaskSummary,
} from '../../types/task';

export type { TaskListItem, TaskPriority, TaskSortBy, TaskSortDirection, TaskStatus, TaskSummary };

export type TasksLocationState = {
  createdTask?: TaskListItem;
} | null;

export type TaskAction =
  | 'start'
  | 'pause'
  | 'complete'
  | 'cancel'
  | 'reopen'
  | 'resume'
  | 'reactivate'
  | 'delete'
  | 'update';

export type StatusTaskAction = Extract<
  TaskAction,
  'start' | 'pause' | 'complete' | 'cancel' | 'reopen' | 'resume' | 'reactivate'
>;

export type TaskStatusActionConfig = {
  action: StatusTaskAction;
  label: string;
  loadingLabel: string;
  status: TaskStatus;
  variant?: 'danger';
};

export type PendingTaskAction = {
  taskId: string;
  action: TaskAction;
} | null;

export type TaskEditValues = {
  title: string;
  description: string;
  priority: TaskPriority | '';
  dueDate: string;
  categoryId: string;
};

export type TaskEditErrors = Partial<Record<keyof TaskEditValues, string>>;

export type TaskListFilters = {
  status: TaskStatus | '';
  priority: TaskPriority | '';
  categoryId: string;
  sortBy: TaskSortBy;
  sortDirection: TaskSortDirection;
};

export type TaskViewMode = 'list' | 'blocks' | 'kanban';

export type DraggingTaskState = {
  taskId: string;
  fromStatus: TaskStatus;
} | null;

export type CategorySummaryProps = {
  categories: CategoryListItem[];
  deletingCategoryId: string | null;
  errorMessage: string | null;
  isEditing: boolean;
  isLoading: boolean;
  onDeleteCategory: (category: CategoryListItem) => void;
  onToggleEditing: () => void;
  onUpdateCategoryColor: (category: CategoryListItem, color: string) => void;
  updatingCategoryId: string | null;
};

export type TaskSummaryPanelProps = {
  errorMessage: string | null;
  isLoading: boolean;
  summary: TaskSummary | null;
};

export type TaskFiltersPanelProps = {
  categories: CategoryListItem[];
  filters: TaskListFilters;
  isLoading: boolean;
  onChange: (name: keyof TaskListFilters, value: string) => void;
  onClear: () => void;
  onSortChange: (value: string) => void;
};

export type TaskViewSelectorProps = {
  taskCount: number;
  viewMode: TaskViewMode;
  onChange: (viewMode: TaskViewMode) => void;
};

export type TaskEditFormProps = {
  categories: CategoryListItem[];
  categoryErrorMessage: string | null;
  errors: TaskEditErrors;
  isCreatingCategory: boolean;
  isLoadingCategories: boolean;
  isLoading: boolean;
  newCategoryColor: string;
  newCategoryName: string;
  onCancel: () => void;
  onChange: (name: keyof TaskEditValues, value: string) => void;
  onCreateCategory: () => void;
  onNewCategoryColorChange: (color: string) => void;
  onNewCategoryNameChange: (name: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  taskId: string;
  taskTitle: string;
  values: TaskEditValues;
};

export type TaskCardProps = {
  categories: CategoryListItem[];
  categoryErrorMessage: string | null;
  editErrors: TaskEditErrors;
  editValues: TaskEditValues | null;
  editingTaskId: string | null;
  isCreatingCategory: boolean;
  isLoadingCategories: boolean;
  newCategoryColor: string;
  newCategoryName: string;
  onCancelEdit: () => void;
  onChangeEditValue: (name: keyof TaskEditValues, value: string) => void;
  onCreateCategory: () => void;
  onChangeTaskStatus: (
    taskId: string,
    status: TaskStatus,
    action: StatusTaskAction,
  ) => void;
  onDeleteTask: (taskId: string) => void;
  onNewCategoryColorChange: (color: string) => void;
  onNewCategoryNameChange: (name: string) => void;
  onStartEdit: (task: TaskListItem) => void;
  onTaskDragEnd: () => void;
  onTaskDragStart: (task: TaskListItem) => void;
  onUpdateTask: (event: FormEvent<HTMLFormElement>, taskId: string) => void;
  pendingTaskAction: PendingTaskAction;
  task: TaskListItem;
  viewMode: TaskViewMode;
  draggingTask: DraggingTaskState;
};

export type TaskListContentProps = {
  actionErrorMessage: string | null;
  categories: CategoryListItem[];
  categoryErrorMessage: string | null;
  dragOverStatus: TaskStatus | null;
  draggingTask: DraggingTaskState;
  editErrors: TaskEditErrors;
  editingTaskId: string | null;
  editValues: TaskEditValues | null;
  errorMessage: string | null;
  filters: TaskListFilters;
  hasActiveFilters: boolean;
  isCreatingCategory: boolean;
  isLoadingCategories: boolean;
  isLoading: boolean;
  newCategoryColor: string;
  newCategoryName: string;
  onCancelEdit: () => void;
  onChangeEditValue: (name: keyof TaskEditValues, value: string) => void;
  onCreateCategory: () => void;
  onChangeTaskStatus: (
    taskId: string,
    status: TaskStatus,
    action: StatusTaskAction,
  ) => void;
  onDeleteTask: (taskId: string) => void;
  onKanbanColumnDragOver: (event: DragEvent<HTMLElement>, status: TaskStatus) => void;
  onKanbanColumnDrop: (event: DragEvent<HTMLElement>, status: TaskStatus) => void;
  onNewCategoryColorChange: (color: string) => void;
  onNewCategoryNameChange: (name: string) => void;
  onStartEdit: (task: TaskListItem) => void;
  onTaskDragEnd: () => void;
  onTaskDragStart: (task: TaskListItem) => void;
  onUpdateTask: (event: FormEvent<HTMLFormElement>, taskId: string) => void;
  pendingTaskAction: PendingTaskAction;
  tasks: TaskListItem[];
  viewMode: TaskViewMode;
};

export type IconName =
  | 'user'
  | 'plus'
  | 'pencil'
  | 'x'
  | 'list'
  | 'grid'
  | 'kanban'
  | 'logout'
  | 'palette'
  | 'sparkles'
  | 'trash';

export type CategoryColorStyle = CSSProperties;
