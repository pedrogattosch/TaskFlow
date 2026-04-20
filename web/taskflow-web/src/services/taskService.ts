import { deleteJson, getJson, patchJson, postJson, putJson } from './httpClient';
import type {
  CreateTaskInput,
  TaskListItem,
  TaskQueryInput,
  TaskSummary,
  TaskStatus,
  UpdateTaskInput,
} from '../types/task';

export const taskService = {
  async getTasks(accessToken: string, query: TaskQueryInput = {}) {
    return getJson<TaskListItem[]>(buildTasksPath(query), { accessToken });
  },

  async getTaskSummary(accessToken: string) {
    return getJson<TaskSummary>('/tasks/summary', { accessToken });
  },

  async createTask(accessToken: string, task: CreateTaskInput) {
    return postJson<TaskListItem, CreateTaskInput>('/tasks', task, { accessToken });
  },

  async updateTask(accessToken: string, taskId: string, task: UpdateTaskInput) {
    return putJson<TaskListItem, UpdateTaskInput>(
      `/tasks/${encodeURIComponent(taskId)}`,
      task,
      { accessToken },
    );
  },

  async updateTaskStatus(accessToken: string, taskId: string, status: TaskStatus) {
    return patchJson<TaskListItem, { status: TaskStatus }>(
      `/tasks/${encodeURIComponent(taskId)}/status`,
      { status },
      { accessToken },
    );
  },

  async deleteTask(accessToken: string, taskId: string) {
    return deleteJson(`/tasks/${encodeURIComponent(taskId)}`, { accessToken });
  },
};

function buildTasksPath(query: TaskQueryInput) {
  const params = new URLSearchParams();

  if (query.status) {
    params.set('status', String(query.status));
  }

  if (query.priority) {
    params.set('priority', String(query.priority));
  }

  if (query.categoryId) {
    params.set('categoryId', query.categoryId);
  }

  params.set('sortBy', query.sortBy ?? 'dueDate');
  params.set('sortDirection', query.sortDirection ?? 'asc');

  return `/tasks?${params.toString()}`;
}
