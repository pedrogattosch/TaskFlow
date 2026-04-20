export type CategoryListItem = {
  id: string;
  name: string;
  color: string | null;
};

export type CreateCategoryInput = {
  name: string;
  color: string | null;
};

export type UpdateCategoryInput = CreateCategoryInput;
