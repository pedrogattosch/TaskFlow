import { getJson, postJson, putJson } from './httpClient';
import type { CategoryListItem, CreateCategoryInput, UpdateCategoryInput } from '../types/category';

export const categoryService = {
  async getCategories(accessToken: string) {
    return getJson<CategoryListItem[]>('/categories', { accessToken });
  },

  async createCategory(accessToken: string, category: CreateCategoryInput) {
    return postJson<CategoryListItem, CreateCategoryInput>('/categories', category, {
      accessToken,
    });
  },

  async updateCategory(accessToken: string, categoryId: string, category: UpdateCategoryInput) {
    return putJson<CategoryListItem, UpdateCategoryInput>(`/categories/${categoryId}`, category, {
      accessToken,
    });
  },
};
