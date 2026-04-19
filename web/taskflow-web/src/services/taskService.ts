import { getJson } from './httpClient';
import type { TaskListItem } from '../types/task';

export const taskService = {
  async getTasks(accessToken: string) {
    return getJson<TaskListItem[]>('/tasks', { accessToken });
  },
};
