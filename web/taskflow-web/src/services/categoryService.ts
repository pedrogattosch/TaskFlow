import { getJson, postJson } from './httpClient';
import type { CategoryListItem, CreateCategoryInput } from '../types/category';

export const categoryService = {
  async getCategories(accessToken: string) {
    return getJson<CategoryListItem[]>('/categories', { accessToken });
  },

  async createCategory(accessToken: string, category: CreateCategoryInput) {
    return postJson<CategoryListItem, CreateCategoryInput>('/categories', category, {
      accessToken,
    });
  },
};
