import type { CSSProperties } from 'react';
import type { CategoryListItem } from '../../types/category';
import type { TaskListItem, TaskSummary } from '../../types/task';
import {
  cancelledTaskStatus,
  completedTaskStatus,
  defaultCategoryColor,
  inProgressTaskStatus,
  pendingTaskStatus,
  priorityOptions,
  statusOptions,
} from './constants';
import type {
  PendingTaskAction,
  StatusTaskAction,
  TaskAction,
  TaskEditErrors,
  TaskEditValues,
  TaskListFilters,
  TaskPriority,
  TaskSortDirection,
  TaskStatus,
  TaskStatusActionConfig,
} from './types';

export function categoryColorStyle(color: string | null | undefined): CSSProperties {
  return {
    '--category-color': color ?? defaultCategoryColor,
  } as CSSProperties;
}

export function getStatusClassName(status: TaskStatus) {
  const classNames: Record<TaskStatus, string> = {
    1: 'task-card__status--pending',
    2: 'task-card__status--in-progress',
    3: 'task-card__status--completed',
    4: 'task-card__status--cancelled',
  };

  return classNames[status];
}

export function getPriorityClassName(priority: TaskPriority) {
  const classNames: Record<TaskPriority, string> = {
    1: 'task-card__priority--low',
    2: 'task-card__priority--medium',
    3: 'task-card__priority--high',
  };

  return classNames[priority];
}

export function getTaskStatusActions(status: TaskStatus): TaskStatusActionConfig[] {
  switch (status) {
    case pendingTaskStatus:
      return [
        {
          action: 'start',
          label: 'Iniciar',
          loadingLabel: 'Iniciando...',
          status: inProgressTaskStatus,
        },
        {
          action: 'complete',
          label: 'Concluir',
          loadingLabel: 'Concluindo...',
          status: completedTaskStatus,
        },
        {
          action: 'cancel',
          label: 'Cancelar',
          loadingLabel: 'Cancelando...',
          status: cancelledTaskStatus,
          variant: 'danger',
        },
      ];
    case inProgressTaskStatus:
      return [
        {
          action: 'pause',
          label: 'Retornar',
          loadingLabel: 'Voltando...',
          status: pendingTaskStatus,
        },
        {
          action: 'complete',
          label: 'Concluir',
          loadingLabel: 'Concluindo...',
          status: completedTaskStatus,
        },
        {
          action: 'cancel',
          label: 'Cancelar',
          loadingLabel: 'Cancelando...',
          status: cancelledTaskStatus,
          variant: 'danger',
        },
      ];
    case completedTaskStatus:
      return [
        {
          action: 'reopen',
          label: 'Reabrir',
          loadingLabel: 'Reabrindo...',
          status: pendingTaskStatus,
        },
        {
          action: 'resume',
          label: 'Retomar',
          loadingLabel: 'Retomando...',
          status: inProgressTaskStatus,
        },
      ];
    case cancelledTaskStatus:
      return [
        {
          action: 'reactivate',
          label: 'Reativar',
          loadingLabel: 'Reativando...',
          status: pendingTaskStatus,
        },
      ];
    default:
      return [];
  }
}

export function getTaskStatusActionForTransition(
  currentStatus: TaskStatus,
  nextStatus: TaskStatus,
): StatusTaskAction | null {
  if (currentStatus === nextStatus) {
    return null;
  }

  const action = getTaskStatusActions(currentStatus).find(
    (candidate) => candidate.status === nextStatus,
  );

  return action?.action ?? null;
}

export function canMoveTaskToStatus(currentStatus: TaskStatus, nextStatus: TaskStatus) {
  return currentStatus === nextStatus ||
    Boolean(getTaskStatusActionForTransition(currentStatus, nextStatus));
}

export function getStatusActionErrorMessage(action: StatusTaskAction) {
  const messages: Record<StatusTaskAction, string> = {
    start: 'Não foi possível iniciar a tarefa.',
    pause: 'Não foi possível retornar a tarefa.',
    complete: 'Não foi possível concluir a tarefa.',
    cancel: 'Não foi possível cancelar a tarefa.',
    reopen: 'Não foi possível reabrir a tarefa.',
    resume: 'Não foi possível retomar a tarefa.',
    reactivate: 'Não foi possível reativar a tarefa.',
  };

  return messages[action];
}

export function mergeCreatedTask(
  tasks: TaskListItem[],
  createdTask: TaskListItem | null,
  filters: TaskListFilters,
) {
  if (
    !createdTask ||
    !taskMatchesFilters(createdTask, filters) ||
    tasks.some((task) => task.id === createdTask.id)
  ) {
    return tasks;
  }

  return [createdTask, ...tasks];
}

export function getFiltersFromSearchParams(searchParams: URLSearchParams): TaskListFilters {
  return {
    status: parseStatus(searchParams.get('status')),
    priority: parsePriority(searchParams.get('priority')),
    categoryId: searchParams.get('categoryId') ?? '',
    sortBy: parseSortBy(searchParams.get('sortBy')),
    sortDirection: parseSortDirection(searchParams.get('sortDirection')),
  };
}

export function toTaskQueryInput(filters: TaskListFilters) {
  return {
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    categoryId: filters.categoryId || undefined,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
  };
}

export function taskMatchesFilters(task: TaskListItem, filters: TaskListFilters) {
  if (filters.status && task.status !== filters.status) {
    return false;
  }

  if (filters.priority && task.priority !== filters.priority) {
    return false;
  }

  if (filters.categoryId && task.categoryId !== filters.categoryId) {
    return false;
  }

  return true;
}

export function replaceTaskForFilters(
  tasks: TaskListItem[],
  updatedTask: TaskListItem,
  filters: TaskListFilters,
) {
  const withoutTask = tasks.filter((task) => task.id !== updatedTask.id);

  if (!taskMatchesFilters(updatedTask, filters)) {
    return withoutTask;
  }

  return sortTasksForFilters([...withoutTask, updatedTask], filters);
}

export function createOptimisticTaskStatusUpdate(
  task: TaskListItem,
  status: TaskStatus,
): TaskListItem {
  return {
    ...task,
    status,
    completedAt: status === completedTaskStatus ? new Date().toISOString() : null,
  };
}

export function updateTaskSummaryForStatusChange(
  summary: TaskSummary | null,
  previousStatus: TaskStatus,
  nextStatus: TaskStatus,
) {
  if (!summary || previousStatus === nextStatus) {
    return summary;
  }

  return adjustTaskSummaryCount(
    adjustTaskSummaryCount(summary, previousStatus, -1),
    nextStatus,
    1,
  );
}

export function sortTasksForFilters(tasks: TaskListItem[], filters: TaskListFilters) {
  return [...tasks].sort((left, right) => compareTasks(left, right, filters));
}

export function parseStatus(value: string | null): TaskStatus | '' {
  const status = Number(value);
  return isTaskStatus(status) ? status : '';
}

export function parsePriority(value: string | null): TaskPriority | '' {
  const priority = Number(value);
  return isTaskPriority(priority) ? priority : '';
}

export function parseSortBy(value: string | null) {
  return value === 'priority' ? 'priority' : 'dueDate';
}

export function parseSortDirection(value: string | null) {
  return value === 'desc' ? 'desc' : 'asc';
}

export function isTaskActionPending(
  pendingTaskAction: PendingTaskAction,
  taskId: string,
  action: TaskAction,
) {
  return pendingTaskAction?.taskId === taskId && pendingTaskAction.action === action;
}

export function toEditValues(task: TaskListItem): TaskEditValues {
  return {
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    dueDate: toDateInputValue(task.dueDate),
    categoryId: task.categoryId ?? '',
  };
}

export function validateEditValues(values: TaskEditValues): TaskEditErrors {
  const errors: TaskEditErrors = {};

  if (!values.title.trim()) {
    errors.title = 'Informe o título da tarefa.';
  } else if (values.title.trim().length > 120) {
    errors.title = 'Use no máximo 120 caracteres.';
  }

  if (values.description.trim().length > 1000) {
    errors.description = 'Use no máximo 1000 caracteres.';
  }

  if (!values.priority) {
    errors.priority = 'Selecione a prioridade.';
  }

  if (!values.dueDate) {
    errors.dueDate = 'Informe o prazo.';
  } else if (isBeforeToday(values.dueDate)) {
    errors.dueDate = 'Informe uma data de hoje em diante.';
  }

  if (!values.categoryId) {
    errors.categoryId = 'Selecione a categoria.';
  }

  return errors;
}

export function addOrReplaceCategory(categories: CategoryListItem[], category: CategoryListItem) {
  const nextCategories = categories.filter((current) => current.id !== category.id);
  nextCategories.push(category);

  return nextCategories.sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
}

export function formatDate(value: string | null) {
  if (!value) {
    return 'Sem prazo';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function adjustTaskSummaryCount(
  summary: TaskSummary,
  status: TaskStatus,
  amount: number,
): TaskSummary {
  switch (status) {
    case pendingTaskStatus:
      return { ...summary, pending: Math.max(0, summary.pending + amount) };
    case inProgressTaskStatus:
      return { ...summary, inProgress: Math.max(0, summary.inProgress + amount) };
    case completedTaskStatus:
      return { ...summary, completed: Math.max(0, summary.completed + amount) };
    case cancelledTaskStatus:
      return { ...summary, cancelled: Math.max(0, summary.cancelled + amount) };
    default:
      return summary;
  }
}

function compareTasks(left: TaskListItem, right: TaskListItem, filters: TaskListFilters) {
  if (filters.sortBy === 'priority') {
    const priorityComparison = compareNumbers(left.priority, right.priority, filters.sortDirection);

    if (priorityComparison !== 0) {
      return priorityComparison;
    }

    return compareDueDates(left.dueDate, right.dueDate, 'asc');
  }

  const dueDateComparison = compareDueDates(left.dueDate, right.dueDate, filters.sortDirection);

  if (dueDateComparison !== 0) {
    return dueDateComparison;
  }

  return compareNumbers(left.priority, right.priority, 'desc');
}

function compareNumbers(left: number, right: number, direction: TaskSortDirection) {
  return direction === 'desc' ? right - left : left - right;
}

function compareDueDates(left: string | null, right: string | null, direction: TaskSortDirection) {
  if (!left && !right) {
    return 0;
  }

  if (!left) {
    return 1;
  }

  if (!right) {
    return -1;
  }

  const leftValue = new Date(left).getTime();
  const rightValue = new Date(right).getTime();

  return direction === 'desc' ? rightValue - leftValue : leftValue - rightValue;
}

function isTaskStatus(value: number): value is TaskStatus {
  return statusOptions.some((option) => option.value === value);
}

function isTaskPriority(value: number): value is TaskPriority {
  return priorityOptions.some((option) => option.value === value);
}

function toDateInputValue(value: string | null) {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
}

function isBeforeToday(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = new Date(`${value}T00:00:00`);
  return selectedDate < today;
}
