import { deleteJson, getJson, patchJson, postJson, putJson } from './httpClient';
import type { CreateTaskInput, TaskListItem, TaskStatus, UpdateTaskInput } from '../types/task';

export const taskService = {
  async getTasks(accessToken: string) {
    return getJson<TaskListItem[]>('/tasks', { accessToken });
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
