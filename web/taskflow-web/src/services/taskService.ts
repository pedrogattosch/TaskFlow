import { getJson, postJson } from './httpClient';
import type { CreateTaskInput, TaskListItem } from '../types/task';

export const taskService = {
  async getTasks(accessToken: string) {
    return getJson<TaskListItem[]>('/tasks', { accessToken });
  },

  async createTask(accessToken: string, task: CreateTaskInput) {
    return postJson<TaskListItem, CreateTaskInput>('/tasks', task, { accessToken });
  },
};
