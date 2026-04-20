import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { categoryService } from '../services/categoryService';
import { HttpClientError } from '../services/httpClient';
import { taskService } from '../services/taskService';
import type { CategoryListItem } from '../types/category';
import type {
  TaskListItem,
  TaskPriority,
  TaskSortBy,
  TaskSortDirection,
  TaskStatus,
  UpdateTaskInput,
} from '../types/task';

const priorityLabels: Record<TaskPriority, string> = {
  1: 'Baixa',
  2: 'Média',
  3: 'Alta',
};

const statusLabels: Record<TaskStatus, string> = {
  1: 'Pendente',
  2: 'Em andamento',
  3: 'Concluída',
  4: 'Cancelada',
};

const priorityOptions: Array<{ label: string; value: TaskPriority }> = [
  { label: 'Baixa', value: 1 },
  { label: 'Média', value: 2 },
  { label: 'Alta', value: 3 },
];

const statusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: 'Pendente', value: 1 },
  { label: 'Em andamento', value: 2 },
  { label: 'Concluída', value: 3 },
  { label: 'Cancelada', value: 4 },
];

const sortOptions: Array<{ label: string; sortBy: TaskSortBy; sortDirection: TaskSortDirection }> = [
  { label: 'Prazo mais próximo', sortBy: 'dueDate', sortDirection: 'asc' },
  { label: 'Prazo mais distante', sortBy: 'dueDate', sortDirection: 'desc' },
  { label: 'Maior prioridade', sortBy: 'priority', sortDirection: 'desc' },
  { label: 'Menor prioridade', sortBy: 'priority', sortDirection: 'asc' },
];

const completedTaskStatus: TaskStatus = 3;

type TasksLocationState = {
  createdTask?: TaskListItem;
} | null;

type TaskAction = 'complete' | 'delete' | 'update';

type PendingTaskAction = {
  taskId: string;
  action: TaskAction;
} | null;

type TaskEditValues = {
  title: string;
  description: string;
  priority: TaskPriority | '';
  dueDate: string;
  categoryId: string;
};

type TaskEditErrors = Partial<Record<keyof TaskEditValues, string>>;

type TaskListFilters = {
  status: TaskStatus | '';
  priority: TaskPriority | '';
  categoryId: string;
  sortBy: TaskSortBy;
  sortDirection: TaskSortDirection;
};

export function TasksPage() {
  const { logout, session } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => getFiltersFromSearchParams(searchParams), [searchParams]);
  const createdTask = (location.state as TasksLocationState)?.createdTask ?? null;
  const [tasks, setTasks] = useState<TaskListItem[]>(() =>
    mergeCreatedTask([], createdTask, filters),
  );
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(
    !createdTask || !taskMatchesFilters(createdTask, filters),
  );
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [categoryErrorMessage, setCategoryErrorMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [pendingTaskAction, setPendingTaskAction] = useState<PendingTaskAction>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<TaskEditValues | null>(null);
  const [editErrors, setEditErrors] = useState<TaskEditErrors>({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      if (!session?.accessToken) {
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await taskService.getTasks(session.accessToken, toTaskQueryInput(filters));

        if (isMounted) {
          setTasks(mergeCreatedTask(response, createdTask, filters));
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error instanceof HttpClientError && error.status === 401) {
          logout();
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : 'Não foi possível carregar suas tarefas.',
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, [
    createdTask?.id,
    filters.categoryId,
    filters.priority,
    filters.sortBy,
    filters.sortDirection,
    filters.status,
    logout,
    session?.accessToken,
  ]);

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

  async function handleCompleteTask(taskId: string) {
    if (!session?.accessToken || pendingTaskAction) {
      return;
    }

    try {
      setPendingTaskAction({ taskId, action: 'complete' });
      setActionErrorMessage(null);

      const updatedTask = await taskService.updateTaskStatus(
        session.accessToken,
        taskId,
        completedTaskStatus,
      );

      setTasks((currentTasks) => replaceTaskForFilters(currentTasks, updatedTask, filters));
    } catch (error) {
      if (error instanceof HttpClientError && error.status === 401) {
        logout();
        return;
      }

      setActionErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível concluir a tarefa.',
      );
    } finally {
      setPendingTaskAction(null);
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!session?.accessToken || pendingTaskAction) {
      return;
    }

    try {
      setPendingTaskAction({ taskId, action: 'delete' });
      setActionErrorMessage(null);

      await taskService.deleteTask(session.accessToken, taskId);

      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));

      if (editingTaskId === taskId) {
        handleCancelEdit();
      }
    } catch (error) {
      if (error instanceof HttpClientError && error.status === 401) {
        logout();
        return;
      }

      setActionErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível excluir a tarefa.',
      );
    } finally {
      setPendingTaskAction(null);
    }
  }

  async function handleUpdateTask(event: FormEvent<HTMLFormElement>, taskId: string) {
    event.preventDefault();

    if (!editValues || !session?.accessToken || pendingTaskAction) {
      return;
    }

    const validationErrors = validateEditValues(editValues);
    setEditErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0 || !editValues.priority) {
      return;
    }

    const payload: UpdateTaskInput = {
      title: editValues.title.trim(),
      description: editValues.description.trim() || null,
      priority: editValues.priority,
      dueDate: editValues.dueDate,
      categoryId: editValues.categoryId,
      categoryName: null,
    };

    try {
      setPendingTaskAction({ taskId, action: 'update' });
      setActionErrorMessage(null);

      const updatedTask = await taskService.updateTask(session.accessToken, taskId, payload);

      setTasks((currentTasks) => replaceTaskForFilters(currentTasks, updatedTask, filters));
      handleCancelEdit();
    } catch (error) {
      if (error instanceof HttpClientError && error.status === 401) {
        logout();
        return;
      }

      setActionErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível editar a tarefa.',
      );
    } finally {
      setPendingTaskAction(null);
    }
  }

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
        color: null,
      });

      setCategories((current) => addOrReplaceCategory(current, createdCategory));
      setEditValues((current) => current ? { ...current, categoryId: createdCategory.id } : current);
      setNewCategoryName('');
      setEditErrors((current) => ({ ...current, categoryId: undefined }));
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

  function handleStartEdit(task: TaskListItem) {
    setEditingTaskId(task.id);
    setEditValues(toEditValues(task));
    setEditErrors({});
    setActionErrorMessage(null);
  }

  function handleCancelEdit() {
    setEditingTaskId(null);
    setEditValues(null);
    setEditErrors({});
  }

  function handleChangeEditValue(name: keyof TaskEditValues, value: string) {
    setEditValues((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [name]: name === 'priority' && value ? Number(value) as TaskPriority : value,
      };
    });
  }

  function handleFilterChange(name: keyof TaskListFilters, value: string) {
    const nextFilters: TaskListFilters = {
      ...filters,
      [name]:
        (name === 'status' || name === 'priority') && value
          ? Number(value)
          : value,
    } as TaskListFilters;

    updateSearchParams(nextFilters);
  }

  function handleSortChange(value: string) {
    const [sortBy, sortDirection] = value.split(':') as [TaskSortBy, TaskSortDirection];

    updateSearchParams({
      ...filters,
      sortBy,
      sortDirection,
    });
  }

  function handleClearFilters() {
    updateSearchParams({
      status: '',
      priority: '',
      categoryId: '',
      sortBy: 'dueDate',
      sortDirection: 'asc',
    });
  }

  function updateSearchParams(nextFilters: TaskListFilters) {
    const nextParams = new URLSearchParams();

    if (nextFilters.status) {
      nextParams.set('status', String(nextFilters.status));
    }

    if (nextFilters.priority) {
      nextParams.set('priority', String(nextFilters.priority));
    }

    if (nextFilters.categoryId) {
      nextParams.set('categoryId', nextFilters.categoryId);
    }

    if (nextFilters.sortBy !== 'dueDate' || nextFilters.sortDirection !== 'asc') {
      nextParams.set('sortBy', nextFilters.sortBy);
      nextParams.set('sortDirection', nextFilters.sortDirection);
    }

    setSearchParams(nextParams);
  }

  return (
    <main className="tasks-page">
      <section className="tasks-page__content" aria-labelledby="tasks-title">
        <header className="tasks-page__header">
          <div>
            <p className="tasks-page__eyebrow">TaskFlow</p>
            <h1 id="tasks-title">Minhas tarefas</h1>
            <p className="tasks-page__description">
              Acompanhe seus compromissos cadastrados e mantenha foco no que precisa avançar.
            </p>
          </div>

          <div className="tasks-page__session" aria-label="Sessão atual">
            <span>Conectado como</span>
            <strong>{session?.email}</strong>
            <Link className="tasks-page__primary-action" to="/tasks/new">
              Criar tarefa
            </Link>
            <button type="button" onClick={logout}>
              Sair
            </button>
          </div>
        </header>

        <CategorySummary
          categories={categories}
          errorMessage={categoryErrorMessage}
          isLoading={isLoadingCategories}
        />

        <TaskFiltersPanel
          categories={categories}
          filters={filters}
          isLoading={isLoading || isLoadingCategories}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          onSortChange={handleSortChange}
        />

        <TaskListContent
          actionErrorMessage={actionErrorMessage}
          categories={categories}
          categoryErrorMessage={categoryErrorMessage}
          editErrors={editErrors}
          editingTaskId={editingTaskId}
          editValues={editValues}
          errorMessage={errorMessage}
          hasActiveFilters={Boolean(filters.status || filters.priority || filters.categoryId)}
          isCreatingCategory={isCreatingCategory}
          isLoadingCategories={isLoadingCategories}
          isLoading={isLoading}
          newCategoryName={newCategoryName}
          onCancelEdit={handleCancelEdit}
          onChangeEditValue={handleChangeEditValue}
          onCreateCategory={handleCreateCategory}
          onCompleteTask={handleCompleteTask}
          onDeleteTask={handleDeleteTask}
          onNewCategoryNameChange={setNewCategoryName}
          onStartEdit={handleStartEdit}
          onUpdateTask={handleUpdateTask}
          pendingTaskAction={pendingTaskAction}
          tasks={tasks}
        />
      </section>
    </main>
  );
}

type CategorySummaryProps = {
  categories: CategoryListItem[];
  errorMessage: string | null;
  isLoading: boolean;
};

function CategorySummary({ categories, errorMessage, isLoading }: CategorySummaryProps) {
  if (isLoading) {
    return (
      <section className="categories-panel" aria-labelledby="categories-title">
        <h2 id="categories-title">Categorias</h2>
        <p role="status">Carregando categorias...</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="categories-panel categories-panel--error" aria-labelledby="categories-title">
        <h2 id="categories-title">Categorias</h2>
        <p role="alert">{errorMessage}</p>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="categories-panel" aria-labelledby="categories-title">
        <h2 id="categories-title">Categorias</h2>
        <p>Nenhuma categoria cadastrada.</p>
      </section>
    );
  }

  return (
    <section className="categories-panel" aria-labelledby="categories-title">
      <h2 id="categories-title">Categorias</h2>
      <ul className="categories-panel__list">
        {categories.map((category) => (
          <li key={category.id}>{category.name}</li>
        ))}
      </ul>
    </section>
  );
}

type TaskFiltersPanelProps = {
  categories: CategoryListItem[];
  filters: TaskListFilters;
  isLoading: boolean;
  onChange: (name: keyof TaskListFilters, value: string) => void;
  onClear: () => void;
  onSortChange: (value: string) => void;
};

function TaskFiltersPanel({
  categories,
  filters,
  isLoading,
  onChange,
  onClear,
  onSortChange,
}: TaskFiltersPanelProps) {
  const hasActiveFilters = Boolean(filters.status || filters.priority || filters.categoryId);
  const sortValue = `${filters.sortBy}:${filters.sortDirection}`;

  return (
    <section className="tasks-filter-panel" aria-labelledby="tasks-filter-title">
      <div className="tasks-filter-panel__header">
        <div>
          <h2 id="tasks-filter-title">Filtros e ordenação</h2>
          <p>Refine a lista mantendo a consulta da API atualizada.</p>
        </div>

        <button
          className="task-card__action"
          type="button"
          onClick={onClear}
          disabled={isLoading || !hasActiveFilters}
        >
          Limpar filtros
        </button>
      </div>

      <div className="tasks-filter-panel__grid">
        <label className="tasks-filter-panel__field">
          <span>Status</span>
          <select
            value={filters.status}
            onChange={(event) => onChange('status', event.target.value)}
            disabled={isLoading}
          >
            <option value="">Todos</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="tasks-filter-panel__field">
          <span>Prioridade</span>
          <select
            value={filters.priority}
            onChange={(event) => onChange('priority', event.target.value)}
            disabled={isLoading}
          >
            <option value="">Todas</option>
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="tasks-filter-panel__field">
          <span>Categoria</span>
          <select
            value={filters.categoryId}
            onChange={(event) => onChange('categoryId', event.target.value)}
            disabled={isLoading || categories.length === 0}
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="tasks-filter-panel__field">
          <span>Ordenar por</span>
          <select
            value={sortValue}
            onChange={(event) => onSortChange(event.target.value)}
            disabled={isLoading}
          >
            {sortOptions.map((option) => (
              <option
                key={`${option.sortBy}:${option.sortDirection}`}
                value={`${option.sortBy}:${option.sortDirection}`}
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

type TaskListContentProps = {
  actionErrorMessage: string | null;
  categories: CategoryListItem[];
  categoryErrorMessage: string | null;
  editErrors: TaskEditErrors;
  editingTaskId: string | null;
  editValues: TaskEditValues | null;
  errorMessage: string | null;
  hasActiveFilters: boolean;
  isCreatingCategory: boolean;
  isLoadingCategories: boolean;
  isLoading: boolean;
  newCategoryName: string;
  onCancelEdit: () => void;
  onChangeEditValue: (name: keyof TaskEditValues, value: string) => void;
  onCreateCategory: () => void;
  onCompleteTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onNewCategoryNameChange: (name: string) => void;
  onStartEdit: (task: TaskListItem) => void;
  onUpdateTask: (event: FormEvent<HTMLFormElement>, taskId: string) => void;
  pendingTaskAction: PendingTaskAction;
  tasks: TaskListItem[];
};

function TaskListContent({
  actionErrorMessage,
  categories,
  categoryErrorMessage,
  editErrors,
  editingTaskId,
  editValues,
  errorMessage,
  hasActiveFilters,
  isCreatingCategory,
  isLoadingCategories,
  isLoading,
  newCategoryName,
  onCancelEdit,
  onChangeEditValue,
  onCreateCategory,
  onCompleteTask,
  onDeleteTask,
  onNewCategoryNameChange,
  onStartEdit,
  onUpdateTask,
  pendingTaskAction,
  tasks,
}: TaskListContentProps) {
  if (isLoading && tasks.length === 0) {
    return (
      <div className="tasks-page__state" role="status">
        Carregando tarefas...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="tasks-page__state tasks-page__state--error" role="alert">
        {errorMessage}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="tasks-page__state">
        <p>
          {hasActiveFilters
            ? 'Nenhuma tarefa encontrada para os filtros selecionados.'
            : 'Nenhuma tarefa encontrada para sua conta.'}
        </p>
        {!hasActiveFilters && (
          <Link className="tasks-page__state-action" to="/tasks/new">
            Criar primeira tarefa
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="tasks-page__state" role="status">
          Atualizando tarefas...
        </div>
      )}

      {actionErrorMessage && (
        <div className="tasks-page__state tasks-page__state--error" role="alert">
          {actionErrorMessage}
        </div>
      )}

      <div className="tasks-page__list" aria-label="Lista de tarefas">
        {tasks.map((task) => {
          const isEditing = task.id === editingTaskId && editValues;
          const isUpdating = isTaskActionPending(pendingTaskAction, task.id, 'update');

          return (
            <article
              className={isEditing ? 'task-card task-card--editing' : 'task-card'}
              key={task.id}
            >
              {isEditing ? (
                <TaskEditForm
                  categories={categories}
                  categoryErrorMessage={categoryErrorMessage}
                  errors={editErrors}
                  isCreatingCategory={isCreatingCategory}
                  isLoadingCategories={isLoadingCategories}
                  isLoading={isUpdating}
                  newCategoryName={newCategoryName}
                  onCancel={onCancelEdit}
                  onChange={onChangeEditValue}
                  onCreateCategory={onCreateCategory}
                  onNewCategoryNameChange={onNewCategoryNameChange}
                  onSubmit={(event) => onUpdateTask(event, task.id)}
                  taskId={task.id}
                  taskTitle={task.title}
                  values={editValues}
                />
              ) : (
                <>
                  <div className="task-card__main">
                    <div>
                      <h2>{task.title}</h2>
                      {task.description && <p>{task.description}</p>}
                    </div>

                    <span className="task-card__status">{statusLabels[task.status]}</span>
                  </div>

                  <dl className="task-card__meta">
                    <div>
                      <dt>Prioridade</dt>
                      <dd>{priorityLabels[task.priority]}</dd>
                    </div>
                    <div>
                      <dt>Vencimento</dt>
                      <dd>{formatDate(task.dueDate)}</dd>
                    </div>
                    <div>
                      <dt>Categoria</dt>
                      <dd>{task.categoryName ?? 'Sem categoria'}</dd>
                    </div>
                  </dl>

                  <div className="task-card__actions" aria-label={`Ações da tarefa ${task.title}`}>
                    <button
                      className="task-card__action"
                      type="button"
                      onClick={() => onCompleteTask(task.id)}
                      disabled={task.status === completedTaskStatus || Boolean(pendingTaskAction)}
                    >
                      {isTaskActionPending(pendingTaskAction, task.id, 'complete')
                        ? 'Concluindo...'
                        : 'Concluir'}
                    </button>

                    <button
                      className="task-card__action"
                      type="button"
                      onClick={() => onStartEdit(task)}
                      disabled={Boolean(pendingTaskAction)}
                    >
                      Editar
                    </button>

                    <button
                      className="task-card__action task-card__action--danger"
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      disabled={Boolean(pendingTaskAction)}
                    >
                      {isTaskActionPending(pendingTaskAction, task.id, 'delete')
                        ? 'Excluindo...'
                        : 'Excluir'}
                    </button>
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}

type TaskEditFormProps = {
  categories: CategoryListItem[];
  categoryErrorMessage: string | null;
  errors: TaskEditErrors;
  isCreatingCategory: boolean;
  isLoadingCategories: boolean;
  isLoading: boolean;
  newCategoryName: string;
  onCancel: () => void;
  onChange: (name: keyof TaskEditValues, value: string) => void;
  onCreateCategory: () => void;
  onNewCategoryNameChange: (name: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  taskId: string;
  taskTitle: string;
  values: TaskEditValues;
};

function TaskEditForm({
  categories,
  categoryErrorMessage,
  errors,
  isCreatingCategory,
  isLoadingCategories,
  isLoading,
  newCategoryName,
  onCancel,
  onChange,
  onCreateCategory,
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
          <button
            className="task-card__action"
            type="button"
            onClick={onCreateCategory}
            disabled={isLoading || isCreatingCategory}
          >
            {isCreatingCategory ? 'Criando...' : 'Criar categoria'}
          </button>
        </div>
      </div>

      <div className="task-card__actions">
        <button className="task-card__action" type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar'}
        </button>
        <button className="task-card__action" type="button" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function mergeCreatedTask(
  tasks: TaskListItem[],
  createdTask: TaskListItem | null,
  filters: TaskListFilters,
) {
  if (
    !createdTask ||
    !taskMatchesFilters(createdTask, filters) ||
    tasks.some((task) => task.id === createdTask.id)
  ) {
    return tasks;
  }

  return [createdTask, ...tasks];
}

function getFiltersFromSearchParams(searchParams: URLSearchParams): TaskListFilters {
  return {
    status: parseStatus(searchParams.get('status')),
    priority: parsePriority(searchParams.get('priority')),
    categoryId: searchParams.get('categoryId') ?? '',
    sortBy: parseSortBy(searchParams.get('sortBy')),
    sortDirection: parseSortDirection(searchParams.get('sortDirection')),
  };
}

function toTaskQueryInput(filters: TaskListFilters) {
  return {
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    categoryId: filters.categoryId || undefined,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
  };
}

function taskMatchesFilters(task: TaskListItem, filters: TaskListFilters) {
  if (filters.status && task.status !== filters.status) {
    return false;
  }

  if (filters.priority && task.priority !== filters.priority) {
    return false;
  }

  if (filters.categoryId && task.categoryId !== filters.categoryId) {
    return false;
  }

  return true;
}

function replaceTaskForFilters(
  tasks: TaskListItem[],
  updatedTask: TaskListItem,
  filters: TaskListFilters,
) {
  const withoutTask = tasks.filter((task) => task.id !== updatedTask.id);

  if (!taskMatchesFilters(updatedTask, filters)) {
    return withoutTask;
  }

  return sortTasksForFilters([...withoutTask, updatedTask], filters);
}

function sortTasksForFilters(tasks: TaskListItem[], filters: TaskListFilters) {
  return [...tasks].sort((left, right) => compareTasks(left, right, filters));
}

function compareTasks(left: TaskListItem, right: TaskListItem, filters: TaskListFilters) {
  if (filters.sortBy === 'priority') {
    const priorityComparison = compareNumbers(left.priority, right.priority, filters.sortDirection);

    if (priorityComparison !== 0) {
      return priorityComparison;
    }

    return compareDueDates(left.dueDate, right.dueDate, 'asc');
  }

  const dueDateComparison = compareDueDates(left.dueDate, right.dueDate, filters.sortDirection);

  if (dueDateComparison !== 0) {
    return dueDateComparison;
  }

  return compareNumbers(left.priority, right.priority, 'desc');
}

function compareNumbers(left: number, right: number, direction: TaskSortDirection) {
  return direction === 'desc' ? right - left : left - right;
}

function compareDueDates(left: string | null, right: string | null, direction: TaskSortDirection) {
  if (!left && !right) {
    return 0;
  }

  if (!left) {
    return 1;
  }

  if (!right) {
    return -1;
  }

  const leftValue = new Date(left).getTime();
  const rightValue = new Date(right).getTime();

  return direction === 'desc' ? rightValue - leftValue : leftValue - rightValue;
}

function parseStatus(value: string | null): TaskStatus | '' {
  const status = Number(value);
  return isTaskStatus(status) ? status : '';
}

function parsePriority(value: string | null): TaskPriority | '' {
  const priority = Number(value);
  return isTaskPriority(priority) ? priority : '';
}

function parseSortBy(value: string | null): TaskSortBy {
  return value === 'priority' ? 'priority' : 'dueDate';
}

function parseSortDirection(value: string | null): TaskSortDirection {
  return value === 'desc' ? 'desc' : 'asc';
}

function isTaskStatus(value: number): value is TaskStatus {
  return statusOptions.some((option) => option.value === value);
}

function isTaskPriority(value: number): value is TaskPriority {
  return priorityOptions.some((option) => option.value === value);
}

function isTaskActionPending(
  pendingTaskAction: PendingTaskAction,
  taskId: string,
  action: TaskAction,
) {
  return pendingTaskAction?.taskId === taskId && pendingTaskAction.action === action;
}

function toEditValues(task: TaskListItem): TaskEditValues {
  return {
    title: task.title,
    description: task.description ?? '',
    priority: task.priority,
    dueDate: toDateInputValue(task.dueDate),
    categoryId: task.categoryId ?? '',
  };
}

function validateEditValues(values: TaskEditValues): TaskEditErrors {
  const errors: TaskEditErrors = {};

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

function formatDate(value: string | null) {
  if (!value) {
    return 'Sem prazo';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function toDateInputValue(value: string | null) {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
}

function isBeforeToday(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = new Date(`${value}T00:00:00`);
  return selectedDate < today;
}
