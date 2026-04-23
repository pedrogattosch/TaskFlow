import { Button } from '../../../components/Button';
import type { TaskEditFormProps } from '../types';
import { priorityOptions } from '../constants';
import { CategoryColorInput } from './CategoryColorInput';
import { TaskIcon } from './TaskIcon';

export function TaskEditForm({
  categories,
  categoryErrorMessage,
  errors,
  isCreatingCategory,
  isLoadingCategories,
  isLoading,
  newCategoryColor,
  newCategoryName,
  onCancel,
  onChange,
  onCreateCategory,
  onNewCategoryColorChange,
  onNewCategoryNameChange,
  onSubmit,
  taskId,
  taskTitle,
  values,
}: TaskEditFormProps) {
  return (
    <form
      className="task-card__edit-form"
      onSubmit={onSubmit}
      aria-label={`Editar tarefa ${taskTitle}`}
      noValidate
    >
      <div className="task-card__edit-header">
        <h2>Editar tarefa</h2>
        <span className="task-card__status">Editando</span>
      </div>

      <div className="task-form__field">
        <label htmlFor={`edit-title-${taskId}`}>Título</label>
        <input
          id={`edit-title-${taskId}`}
          type="text"
          maxLength={120}
          value={values.title}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? `edit-title-${taskId}-error` : undefined}
          onChange={(event) => onChange('title', event.target.value)}
          disabled={isLoading}
        />
        {errors.title && (
          <span className="task-form__field-error" id={`edit-title-${taskId}-error`}>
            {errors.title}
          </span>
        )}
      </div>

      <div className="task-form__field">
        <label htmlFor={`edit-description-${taskId}`}>Descrição</label>
        <textarea
          id={`edit-description-${taskId}`}
          rows={4}
          maxLength={1000}
          value={values.description}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? `edit-description-${taskId}-error` : undefined
          }
          onChange={(event) => onChange('description', event.target.value)}
          disabled={isLoading}
        />
        {errors.description && (
          <span className="task-form__field-error" id={`edit-description-${taskId}-error`}>
            {errors.description}
          </span>
        )}
      </div>

      <div className="task-form__grid">
        <div className="task-form__field">
          <label htmlFor={`edit-priority-${taskId}`}>Prioridade</label>
          <select
            id={`edit-priority-${taskId}`}
            value={values.priority}
            aria-invalid={Boolean(errors.priority)}
            aria-describedby={errors.priority ? `edit-priority-${taskId}-error` : undefined}
            onChange={(event) => onChange('priority', event.target.value)}
            disabled={isLoading}
          >
            <option value="">Selecione</option>
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.priority && (
            <span className="task-form__field-error" id={`edit-priority-${taskId}-error`}>
              {errors.priority}
            </span>
          )}
        </div>

        <div className="task-form__field">
          <label htmlFor={`edit-due-date-${taskId}`}>Prazo</label>
          <input
            id={`edit-due-date-${taskId}`}
            type="date"
            value={values.dueDate}
            aria-invalid={Boolean(errors.dueDate)}
            aria-describedby={errors.dueDate ? `edit-due-date-${taskId}-error` : undefined}
            onChange={(event) => onChange('dueDate', event.target.value)}
            disabled={isLoading}
          />
          {errors.dueDate && (
            <span className="task-form__field-error" id={`edit-due-date-${taskId}-error`}>
              {errors.dueDate}
            </span>
          )}
        </div>
      </div>

      <div className="task-form__field">
        <label htmlFor={`edit-category-${taskId}`}>Categoria</label>
        <select
          id={`edit-category-${taskId}`}
          value={values.categoryId}
          aria-invalid={Boolean(errors.categoryId)}
          aria-describedby={errors.categoryId ? `edit-category-${taskId}-error` : undefined}
          onChange={(event) => onChange('categoryId', event.target.value)}
          disabled={isLoading || isLoadingCategories || categories.length === 0}
        >
          <option value="">
            {isLoadingCategories ? 'Carregando categorias...' : 'Selecione'}
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <span className="task-form__field-error" id={`edit-category-${taskId}-error`}>
            {errors.categoryId}
          </span>
        )}
        {!isLoadingCategories && categories.length === 0 && (
          <span className="task-form__hint">Nenhuma categoria cadastrada.</span>
        )}
        {categoryErrorMessage && (
          <span className="task-form__field-error" role="alert">
            {categoryErrorMessage}
          </span>
        )}
        <div className="task-form__inline-action">
          <input
            type="text"
            maxLength={80}
            placeholder="Nova categoria"
            value={newCategoryName}
            onChange={(event) => onNewCategoryNameChange(event.target.value)}
            disabled={isLoading || isCreatingCategory}
            aria-label="Nome da nova categoria"
          />
          <CategoryColorInput
            className="task-form__color-picker"
            value={newCategoryColor}
            ariaLabel="Cor da nova categoria"
            disabled={isLoading || isCreatingCategory}
            onChange={onNewCategoryColorChange}
          />
          <Button
            className="task-card__action"
            type="button"
            variant="secondary"
            icon={<TaskIcon name="plus" />}
            onClick={onCreateCategory}
            disabled={isLoading || isCreatingCategory}
          >
            {isCreatingCategory ? 'Criando...' : 'Criar categoria'}
          </Button>
        </div>
      </div>

      <div className="task-card__actions">
        <Button className="task-card__action" type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button
          className="task-card__action"
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
