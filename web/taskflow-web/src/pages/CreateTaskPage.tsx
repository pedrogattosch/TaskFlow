import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandMark } from '../components/BrandMark';
import { Button, ButtonLink } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { CategoryColorInput } from '../features/tasks/components/CategoryColorInput';
import { categoryService } from '../services/categoryService';
import { HttpClientError } from '../services/httpClient';
import { taskService } from '../services/taskService';
import type { CategoryListItem } from '../types/category';
import type { CreateTaskInput, TaskPriority } from '../types/task';

type TaskFormValues = {
  title: string;
  description: string;
  priority: TaskPriority | '';
  dueDate: string;
  categoryId: string;
};

type FormErrors = Partial<Record<keyof TaskFormValues, string>>;

const priorityOptions: Array<{ label: string; value: TaskPriority }> = [
  { label: 'Baixa', value: 1 },
  { label: 'Média', value: 2 },
  { label: 'Alta', value: 3 },
];

const defaultCategoryColor = '#27675d';

const initialValues: TaskFormValues = {
  title: '',
  description: '',
  priority: '',
  dueDate: '',
  categoryId: '',
};

export function CreateTaskPage() {
  const { logout, session } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState<TaskFormValues>(initialValues);
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(defaultCategoryColor);
  const [errors, setErrors] = useState<FormErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [categoryErrorMessage, setCategoryErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      if (!session?.accessToken) {
        return;
      }

      try {
        setIsLoadingCategories(true);
        setCategoryErrorMessage(null);

        const response = await categoryService.getCategories(session.accessToken);

        if (isMounted) {
          setCategories(response);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error instanceof HttpClientError && error.status === 401) {
          logout();
          return;
        }

        setCategoryErrorMessage(
          error instanceof Error ? error.message : 'Não foi possível carregar as categorias.',
        );
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [logout, session?.accessToken]);

  async function handleCreateCategory() {
    if (!session?.accessToken || isCreatingCategory) {
      return;
    }

    const normalizedName = newCategoryName.trim();

    if (!normalizedName) {
      setCategoryErrorMessage('Informe o nome da nova categoria.');
      return;
    }

    if (normalizedName.length > 80) {
      setCategoryErrorMessage('Use no máximo 80 caracteres na categoria.');
      return;
    }

    try {
      setIsCreatingCategory(true);
      setCategoryErrorMessage(null);

      const createdCategory = await categoryService.createCategory(session.accessToken, {
        name: normalizedName,
        color: newCategoryColor,
      });

      setCategories((current) => addOrReplaceCategory(current, createdCategory));
      setValues((current) => ({ ...current, categoryId: createdCategory.id }));
      setNewCategoryName('');
      setNewCategoryColor(defaultCategoryColor);
      setErrors((current) => ({ ...current, categoryId: undefined }));
    } catch (error) {
      if (error instanceof HttpClientError && error.status === 401) {
        logout();
        return;
      }

      setCategoryErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível criar a categoria.',
      );
    } finally {
      setIsCreatingCategory(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0 || !session?.accessToken || !values.priority) {
      return;
    }

    const payload: CreateTaskInput = {
      title: values.title.trim(),
      description: values.description.trim() || null,
      priority: values.priority,
      dueDate: values.dueDate,
      categoryId: values.categoryId,
      categoryName: null,
    };

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const createdTask = await taskService.createTask(session.accessToken, payload);
      navigate('/tasks', { state: { createdTask } });
    } catch (error) {
      if (error instanceof HttpClientError && error.status === 401) {
        logout();
        return;
      }

      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível criar a tarefa.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  const isFormDisabled = isLoading || isLoadingCategories;

  return (
    <main className="tasks-page">
      <section className="task-form-page" aria-labelledby="create-task-title">
        <header className="task-form-page__header">
          <div>
            <BrandMark size="compact" />
            <h1 id="create-task-title">Criar tarefa</h1>
            <p className="tasks-page__description">
              Registre uma tarefa com prioridade, prazo e categoria.
            </p>
          </div>

          <ButtonLink
            className="task-form-page__back"
            to="/tasks"
            variant="secondary"
          >
            Voltar para tarefas
          </ButtonLink>
        </header>

        <form className="task-form" onSubmit={handleSubmit} noValidate>
          {errorMessage && (
            <div className="task-form__error" role="alert">
              {errorMessage}
            </div>
          )}

          <div className="task-form__field">
            <label htmlFor="title">Título</label>
            <input
              id="title"
              name="title"
              type="text"
              maxLength={120}
              value={values.title}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'title-error' : undefined}
              onChange={(event) => {
                setValues((current) => ({ ...current, title: event.target.value }));
              }}
              disabled={isFormDisabled}
            />
            {errors.title && (
              <span className="task-form__field-error" id="title-error">
                {errors.title}
              </span>
            )}
          </div>

          <div className="task-form__field">
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              rows={5}
              maxLength={1000}
              value={values.description}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'description-error' : undefined}
              onChange={(event) => {
                setValues((current) => ({ ...current, description: event.target.value }));
              }}
              disabled={isFormDisabled}
            />
            {errors.description && (
              <span className="task-form__field-error" id="description-error">
                {errors.description}
              </span>
            )}
          </div>

          <div className="task-form__grid">
            <div className="task-form__field">
              <label htmlFor="priority">Prioridade</label>
              <select
                id="priority"
                name="priority"
                value={values.priority}
                aria-invalid={Boolean(errors.priority)}
                aria-describedby={errors.priority ? 'priority-error' : undefined}
                onChange={(event) => {
                  setValues((current) => ({
                    ...current,
                    priority: event.target.value ? Number(event.target.value) as TaskPriority : '',
                  }));
                }}
                disabled={isFormDisabled}
              >
                <option value="">Selecione</option>
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.priority && (
                <span className="task-form__field-error" id="priority-error">
                  {errors.priority}
                </span>
              )}
            </div>

            <div className="task-form__field">
              <label htmlFor="dueDate">Prazo</label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={values.dueDate}
                aria-invalid={Boolean(errors.dueDate)}
                aria-describedby={errors.dueDate ? 'due-date-error' : undefined}
                onChange={(event) => {
                  setValues((current) => ({ ...current, dueDate: event.target.value }));
                }}
                disabled={isFormDisabled}
              />
              {errors.dueDate && (
                <span className="task-form__field-error" id="due-date-error">
                  {errors.dueDate}
                </span>
              )}
            </div>
          </div>

          <CategorySelector
            categories={categories}
            categoryErrorMessage={categoryErrorMessage}
            error={errors.categoryId}
            isCreatingCategory={isCreatingCategory}
            isLoadingCategories={isLoadingCategories}
            newCategoryColor={newCategoryColor}
            newCategoryName={newCategoryName}
            onCategoryChange={(categoryId) => {
              setValues((current) => ({ ...current, categoryId }));
            }}
            onCreateCategory={handleCreateCategory}
            onNewCategoryColorChange={setNewCategoryColor}
            onNewCategoryNameChange={setNewCategoryName}
            selectId="categoryId"
            selectedCategoryId={values.categoryId}
            disabled={isLoading}
          />

          <Button
            className="task-form__submit"
            type="submit"
            variant="primary"
            disabled={isFormDisabled}
          >
            {isLoading ? 'Criando tarefa...' : 'Criar tarefa'}
          </Button>
        </form>
      </section>
    </main>
  );
}

type CategorySelectorProps = {
  categories: CategoryListItem[];
  categoryErrorMessage: string | null;
  disabled: boolean;
  error?: string;
  isCreatingCategory: boolean;
  isLoadingCategories: boolean;
  newCategoryColor: string;
  newCategoryName: string;
  onCategoryChange: (categoryId: string) => void;
  onCreateCategory: () => void;
  onNewCategoryColorChange: (color: string) => void;
  onNewCategoryNameChange: (name: string) => void;
  selectId: string;
  selectedCategoryId: string;
};

function CategorySelector({
  categories,
  categoryErrorMessage,
  disabled,
  error,
  isCreatingCategory,
  isLoadingCategories,
  newCategoryColor,
  newCategoryName,
  onCategoryChange,
  onCreateCategory,
  onNewCategoryColorChange,
  onNewCategoryNameChange,
  selectId,
  selectedCategoryId,
}: CategorySelectorProps) {
  const errorId = `${selectId}-error`;

  return (
    <div className="task-form__field">
      <label htmlFor={selectId}>Categoria</label>
      <select
        id={selectId}
        name={selectId}
        value={selectedCategoryId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onCategoryChange(event.target.value)}
        disabled={disabled || isLoadingCategories || categories.length === 0}
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
      {error && (
        <span className="task-form__field-error" id={errorId}>
          {error}
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
          disabled={disabled || isCreatingCategory}
          aria-label="Nome da nova categoria"
        />
        <CategoryColorInput
          className="task-form__color-picker"
          value={newCategoryColor}
          ariaLabel="Cor da nova categoria"
          disabled={disabled || isCreatingCategory}
          onChange={onNewCategoryColorChange}
        />
        <Button
          className="task-form__inline-button"
          type="button"
          variant="secondary"
          onClick={onCreateCategory}
          disabled={disabled || isCreatingCategory}
        >
          {isCreatingCategory ? 'Criando...' : 'Criar categoria'}
        </Button>
      </div>
    </div>
  );
}

function validate(values: TaskFormValues): FormErrors {
  const errors: FormErrors = {};

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

function addOrReplaceCategory(categories: CategoryListItem[], category: CategoryListItem) {
  const nextCategories = categories.filter((current) => current.id !== category.id);
  nextCategories.push(category);

  return nextCategories.sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
}

function isBeforeToday(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = new Date(`${value}T00:00:00`);
  return selectedDate < today;
}
