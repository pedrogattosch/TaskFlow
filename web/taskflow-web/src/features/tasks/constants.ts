import type { TaskPriority, TaskSortBy, TaskSortDirection, TaskStatus } from './types';

export const priorityLabels: Record<TaskPriority, string> = {
  1: 'Baixa',
  2: 'Média',
  3: 'Alta',
};

export const statusLabels: Record<TaskStatus, string> = {
  1: 'Pendente',
  2: 'Em andamento',
  3: 'Concluída',
  4: 'Cancelada',
};

export const priorityOptions: Array<{ label: string; value: TaskPriority }> = [
  { label: 'Baixa', value: 1 },
  { label: 'Média', value: 2 },
  { label: 'Alta', value: 3 },
];

export const statusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: 'Pendente', value: 1 },
  { label: 'Em andamento', value: 2 },
  { label: 'Concluída', value: 3 },
  { label: 'Cancelada', value: 4 },
];

export const sortOptions: Array<{
  label: string;
  sortBy: TaskSortBy;
  sortDirection: TaskSortDirection;
}> = [
  { label: 'Prazo mais próximo', sortBy: 'dueDate', sortDirection: 'asc' },
  { label: 'Prazo mais distante', sortBy: 'dueDate', sortDirection: 'desc' },
  { label: 'Maior prioridade', sortBy: 'priority', sortDirection: 'desc' },
  { label: 'Menor prioridade', sortBy: 'priority', sortDirection: 'asc' },
];

export const defaultCategoryColor = '#27675d';

export const pendingTaskStatus: TaskStatus = 1;
export const inProgressTaskStatus: TaskStatus = 2;
export const completedTaskStatus: TaskStatus = 3;
export const cancelledTaskStatus: TaskStatus = 4;
