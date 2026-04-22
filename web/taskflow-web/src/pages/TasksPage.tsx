import { type CSSProperties, type DragEvent, type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { BrandMark } from '../components/BrandMark';
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
  TaskSummary,
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

const defaultCategoryColor = '#27675d';

const pendingTaskStatus: TaskStatus = 1;
const inProgressTaskStatus: TaskStatus = 2;
const completedTaskStatus: TaskStatus = 3;
const cancelledTaskStatus: TaskStatus = 4;

type TasksLocationState = {
  createdTask?: TaskListItem;
} | null;

type TaskAction =
  | 'start'
  | 'pause'
  | 'complete'
  | 'cancel'
  | 'reopen'
  | 'resume'
  | 'reactivate'
  | 'delete'
  | 'update';

type StatusTaskAction = Extract<
  TaskAction,
  'start' | 'pause' | 'complete' | 'cancel' | 'reopen' | 'resume' | 'reactivate'
>;

type TaskStatusActionConfig = {
  action: StatusTaskAction;
  label: string;
  loadingLabel: string;
  status: TaskStatus;
  variant?: 'danger';
};

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

type TaskViewMode = 'list' | 'blocks' | 'kanban';

type DraggingTaskState = {
  taskId: string;
  fromStatus: TaskStatus;
} | null;

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
  const [taskSummary, setTaskSummary] = useState<TaskSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summaryErrorMessage, setSummaryErrorMessage] = useState<string | null>(null);
  const [categoryErrorMessage, setCategoryErrorMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [summaryReloadKey, setSummaryReloadKey] = useState(0);
  const [pendingTaskAction, setPendingTaskAction] = useState<PendingTaskAction>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<TaskEditValues | null>(null);
  const [editErrors, setEditErrors] = useState<TaskEditErrors>({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(defaultCategoryColor);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isEditingCategories, setIsEditingCategories] = useState(false);
  const [updatingCategoryId, setUpdatingCategoryId] = useState<string | null>(null);
  const [categoryActionErrorMessage, setCategoryActionErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<TaskViewMode>('list');
  const [draggingTask, setDraggingTask] = useState<DraggingTaskState>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTaskSummary() {
      if (!session?.accessToken) {
        return;
      }

      try {
        setIsLoadingSummary(true);
        setSummaryErrorMessage(null);

        const response = await taskService.getTaskSummary(session.accessToken);

        if (isMounted) {
          setTaskSummary(response);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (error instanceof HttpClientError && error.status === 401) {
          logout();
          return;
        }

        setSummaryErrorMessage(
          error instanceof Error ? error.message : 'NÃ£o foi possÃ­vel carregar o resumo.',
        );
      } finally {
        if (isMounted) {
          setIsLoadingSummary(false);
        }
      }
    }

    loadTaskSummary();

    return () => {
      isMounted = false;
    };
  }, [logout, session?.accessToken, summaryReloadKey]);

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

  async function handleChangeTaskStatus(
    taskId: string,
    status: TaskStatus,
    action: StatusTaskAction,
  ) {
    if (!session?.accessToken || pendingTaskAction) {
      return;
    }

    try {
      const currentTask = tasks.find((task) => task.id === taskId);

      if (!currentTask) {
        return;
      }

      setPendingTaskAction({ taskId, action });
      setActionErrorMessage(null);
      setTasks((currentTasks) =>
        replaceTaskForFilters(
          currentTasks,
          createOptimisticTaskStatusUpdate(currentTask, status),
          filters,
        ),
      );
      setTaskSummary((currentSummary) =>
        updateTaskSummaryForStatusChange(currentSummary, currentTask.status, status),
      );

      const updatedTask = await taskService.updateTaskStatus(
        session.accessToken,
        taskId,
        status,
      );

      setTasks((currentTasks) => replaceTaskForFilters(currentTasks, updatedTask, filters));
      setSummaryReloadKey((current) => current + 1);
    } catch (error) {
      if (error instanceof HttpClientError && error.status === 401) {
        logout();
        return;
      }

      const currentTask = tasks.find((task) => task.id === taskId);

      if (currentTask) {
        setTasks((currentTasks) => replaceTaskForFilters(currentTasks, currentTask, filters));
        setTaskSummary((currentSummary) =>
          updateTaskSummaryForStatusChange(currentSummary, status, currentTask.status),
        );
      }

      setActionErrorMessage(
        error instanceof Error ? error.message : getStatusActionErrorMessage(action),
      );
    } finally {
      setPendingTaskAction(null);
    }
  }
  async function handleDeleteTask(taskId: string) {
    if (!session?.accessToken || pendingTaskAction) {
      return;
    }

    const confirmed = window.confirm(
      'Excluir esta tarefa?\n\nEsta ação é permanente e a tarefa não poderá ser recuperada após a exclusão.',
    );

    if (!confirmed) {
      return;
    }

    try {
      setPendingTaskAction({ taskId, action: 'delete' });
      setActionErrorMessage(null);

      await taskService.deleteTask(session.accessToken, taskId);

      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
      setSummaryReloadKey((current) => current + 1);

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
      setSummaryReloadKey((current) => current + 1);
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
        color: newCategoryColor,
      });

      setCategories((current) => addOrReplaceCategory(current, createdCategory));
      setEditValues((current) => current ? { ...current, categoryId: createdCategory.id } : current);
      setNewCategoryName('');
      setNewCategoryColor(defaultCategoryColor);
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

  async function handleUpdateCategoryColor(category: CategoryListItem, color: string) {
    if (!session?.accessToken || updatingCategoryId) {
      return;
    }

    try {
      setUpdatingCategoryId(category.id);
      setCategoryActionErrorMessage(null);

      const updatedCategory = await categoryService.updateCategory(
        session.accessToken,
        category.id,
        {
          name: category.name,
          color,
        },
      );

      setCategories((current) => addOrReplaceCategory(current, updatedCategory));
    } catch (error) {
      if (error instanceof HttpClientError && error.status === 401) {
        logout();
        return;
      }

      setCategoryActionErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível atualizar a categoria.',
      );
    } finally {
      setUpdatingCategoryId(null);
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

  function handleTaskDragStart(task: TaskListItem) {
    if (pendingTaskAction || editingTaskId === task.id) {
      return;
    }

    setDraggingTask({ taskId: task.id, fromStatus: task.status });
    setDragOverStatus(null);
    setActionErrorMessage(null);
  }

  function handleTaskDragEnd() {
    setDraggingTask(null);
    setDragOverStatus(null);
  }

  function handleKanbanColumnDragOver(event: DragEvent<HTMLElement>, status: TaskStatus) {
    if (!draggingTask) {
      return;
    }

    event.preventDefault();
    setDragOverStatus(status);
  }

  function handleKanbanColumnDrop(event: DragEvent<HTMLElement>, status: TaskStatus) {
    event.preventDefault();

    if (!draggingTask) {
      return;
    }

    const task = tasks.find((currentTask) => currentTask.id === draggingTask.taskId);
    setDragOverStatus(null);
    setDraggingTask(null);

    if (!task || task.status === status) {
      return;
    }

    const action = getTaskStatusActionForTransition(task.status, status);

    if (!action) {
      setActionErrorMessage('Essa mudança de status não está disponível para a tarefa selecionada.');
      return;
    }

    void handleChangeTaskStatus(task.id, status, action);
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
          <div className="tasks-page__session" aria-label="Sessão atual">
            <div className="tasks-page__session-user">
              <Icon name="user" />
              <div>
                <span>Conectado como </span>
                <strong>{session?.email}</strong>
              </div>
            </div>
            <button type="button" onClick={logout}>
              Sair
            </button>
          </div>

          <div className="tasks-page__intro">
            <BrandMark size="compact" />
            <h1 id="tasks-title">Minhas tarefas</h1>
            <p className="tasks-page__description">
              Acompanhe suas tarefas e mantenha foco no que precisa avançar.
            </p>
            <Link className="tasks-page__primary-action" to="/tasks/new">
              <Icon name="plus" />
              Criar tarefa
            </Link>
          </div>
        </header>

        <CategorySummary
          categories={categories}
          errorMessage={categoryErrorMessage ?? categoryActionErrorMessage}
          isEditing={isEditingCategories}
          isLoading={isLoadingCategories}
          onToggleEditing={() => setIsEditingCategories((current) => !current)}
          onUpdateCategoryColor={handleUpdateCategoryColor}
          updatingCategoryId={updatingCategoryId}
        />

        <TaskSummaryPanel
          errorMessage={summaryErrorMessage}
          isLoading={isLoadingSummary}
          summary={taskSummary}
        />

        <TaskFiltersPanel
          categories={categories}
          filters={filters}
          isLoading={isLoading || isLoadingCategories}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          onSortChange={handleSortChange}
        />

        <TaskViewSelector
          taskCount={tasks.length}
          viewMode={viewMode}
          onChange={setViewMode}
        />

        <TaskListContent
          actionErrorMessage={actionErrorMessage}
          categories={categories}
          categoryErrorMessage={categoryErrorMessage}
          dragOverStatus={dragOverStatus}
          draggingTask={draggingTask}
          editErrors={editErrors}
          editingTaskId={editingTaskId}
          editValues={editValues}
          errorMessage={errorMessage}
          filters={filters}
          hasActiveFilters={Boolean(filters.status || filters.priority || filters.categoryId)}
          isCreatingCategory={isCreatingCategory}
          isLoadingCategories={isLoadingCategories}
          isLoading={isLoading}
          newCategoryColor={newCategoryColor}
          newCategoryName={newCategoryName}
          onCancelEdit={handleCancelEdit}
          onChangeEditValue={handleChangeEditValue}
          onCreateCategory={handleCreateCategory}
          onChangeTaskStatus={handleChangeTaskStatus}
          onDeleteTask={handleDeleteTask}
          onKanbanColumnDragOver={handleKanbanColumnDragOver}
          onKanbanColumnDrop={handleKanbanColumnDrop}
          onNewCategoryColorChange={setNewCategoryColor}
          onNewCategoryNameChange={setNewCategoryName}
          onStartEdit={handleStartEdit}
          onTaskDragEnd={handleTaskDragEnd}
          onTaskDragStart={handleTaskDragStart}
          onUpdateTask={handleUpdateTask}
          pendingTaskAction={pendingTaskAction}
          tasks={tasks}
          viewMode={viewMode}
        />
      </section>
    </main>
  );
}

type CategorySummaryProps = {
  categories: CategoryListItem[];
  errorMessage: string | null;
  isEditing: boolean;
  isLoading: boolean;
  onToggleEditing: () => void;
  onUpdateCategoryColor: (category: CategoryListItem, color: string) => void;
  updatingCategoryId: string | null;
};

function CategorySummary({
  categories,
  errorMessage,
  isEditing,
  isLoading,
  onToggleEditing,
  onUpdateCategoryColor,
  updatingCategoryId,
}: CategorySummaryProps) {
  if (isLoading) {
    return (
      <section className="categories-panel" aria-labelledby="categories-title">
        <div className="categories-panel__header">
          <h2 id="categories-title">Categorias</h2>
        </div>
        <p role="status">Carregando categorias...</p>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="categories-panel" aria-labelledby="categories-title">
        <div className="categories-panel__header">
          <h2 id="categories-title">Categorias</h2>
        </div>
        {errorMessage && <p className="categories-panel__error" role="alert">{errorMessage}</p>}
        <p>Nenhuma categoria cadastrada.</p>
      </section>
    );
  }

  return (
    <section className="categories-panel" aria-labelledby="categories-title">
      <div className="categories-panel__header">
        <div>
          <h2 id="categories-title">Categorias</h2>
        </div>

        <button className="categories-panel__edit-button" type="button" onClick={onToggleEditing}>
          {isEditing ? 'Concluir edição' : 'Editar categorias'}
        </button>
      </div>

      {errorMessage && <p className="categories-panel__error" role="alert">{errorMessage}</p>}

      <ul className="categories-panel__list">
        {categories.map((category) => (
          <li
            key={category.id}
            style={categoryColorStyle(category.color)}
          >
            <span className="categories-panel__swatch" aria-hidden="true" />
            <span>{category.name}</span>

            {isEditing && (
              <label className="categories-panel__color-field">
                <span>Cor</span>
                <input
                  type="color"
                  value={category.color ?? defaultCategoryColor}
                  aria-label={`Cor da categoria ${category.name}`}
                  disabled={updatingCategoryId === category.id}
                  onChange={(event) => onUpdateCategoryColor(category, event.target.value)}
                />
              </label>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

type TaskSummaryPanelProps = {
  errorMessage: string | null;
  isLoading: boolean;
  summary: TaskSummary | null;
};

function TaskSummaryPanel({ errorMessage, isLoading, summary }: TaskSummaryPanelProps) {
  if (errorMessage && !summary) {
    return (
      <section
        className="task-summary-panel task-summary-panel--error"
        aria-labelledby="task-summary-title"
      >
        <div>
          <h2 id="task-summary-title">Resumo das tarefas</h2>
          <p role="alert">{errorMessage}</p>
        </div>
      </section>
    );
  }

  const items = [
    { label: 'Pendentes', value: summary?.pending ?? 0 },
    { label: 'Em andamento', value: summary?.inProgress ?? 0 },
    { label: 'Concluídas', value: summary?.completed ?? 0 },
    { label: 'Canceladas', value: summary?.cancelled ?? 0 },
  ];

  return (
    <section className="task-summary-panel" aria-labelledby="task-summary-title">
      <div className="task-summary-panel__header">
        <div>
          <h2 id="task-summary-title">Resumo das tarefas</h2>
        </div>

        {isLoading && (
          <span className="task-summary-panel__status" role="status">
            {summary ? 'Atualizando...' : 'Carregando...'}
          </span>
        )}
      </div>

      {errorMessage && (
        <p className="task-summary-panel__error" role="alert">
          {errorMessage}
        </p>
      )}

      <dl className="task-summary-panel__grid">
        {items.map((item) => (
          <div className="task-summary-panel__item" key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
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

type TaskViewSelectorProps = {
  taskCount: number;
  viewMode: TaskViewMode;
  onChange: (viewMode: TaskViewMode) => void;
};

function TaskViewSelector({ taskCount, viewMode, onChange }: TaskViewSelectorProps) {
  return (
    <section className="task-view-selector" aria-labelledby="task-view-title">
      <div>
        <h2 id="task-view-title">Visualização</h2>
        <p>{taskCount} tarefa(s) carregada(s)</p>
      </div>

      <div className="task-view-selector__controls" aria-label="Modo de visualização">
        <button
          className={viewMode === 'list' ? 'task-view-selector__button task-view-selector__button--active' : 'task-view-selector__button'}
          type="button"
          onClick={() => onChange('list')}
          aria-pressed={viewMode === 'list'}
        >
          <Icon name="list" />
          Lista
        </button>

        <button
          className={viewMode === 'blocks' ? 'task-view-selector__button task-view-selector__button--active' : 'task-view-selector__button'}
          type="button"
          onClick={() => onChange('blocks')}
          aria-pressed={viewMode === 'blocks'}
        >
          <Icon name="grid" />
          Blocos
        </button>

        <button
          className={viewMode === 'kanban' ? 'task-view-selector__button task-view-selector__button--active' : 'task-view-selector__button'}
          type="button"
          onClick={() => onChange('kanban')}
          aria-pressed={viewMode === 'kanban'}
        >
          <Icon name="kanban" />
          Kanban
        </button>
      </div>
    </section>
  );
}

type TaskListContentProps = {
  actionErrorMessage: string | null;
  categories: CategoryListItem[];
  categoryErrorMessage: string | null;
  dragOverStatus: TaskStatus | null;
  draggingTask: DraggingTaskState;
  editErrors: TaskEditErrors;
  editingTaskId: string | null;
  editValues: TaskEditValues | null;
  errorMessage: string | null;
  filters: TaskListFilters;
  hasActiveFilters: boolean;
  isCreatingCategory: boolean;
  isLoadingCategories: boolean;
  isLoading: boolean;
  newCategoryColor: string;
  newCategoryName: string;
  onCancelEdit: () => void;
  onChangeEditValue: (name: keyof TaskEditValues, value: string) => void;
  onCreateCategory: () => void;
  onChangeTaskStatus: (
    taskId: string,
    status: TaskStatus,
    action: StatusTaskAction,
  ) => void;
  onDeleteTask: (taskId: string) => void;
  onKanbanColumnDragOver: (event: DragEvent<HTMLElement>, status: TaskStatus) => void;
  onKanbanColumnDrop: (event: DragEvent<HTMLElement>, status: TaskStatus) => void;
  onNewCategoryColorChange: (color: string) => void;
  onNewCategoryNameChange: (name: string) => void;
  onStartEdit: (task: TaskListItem) => void;
  onTaskDragEnd: () => void;
  onTaskDragStart: (task: TaskListItem) => void;
  onUpdateTask: (event: FormEvent<HTMLFormElement>, taskId: string) => void;
  pendingTaskAction: PendingTaskAction;
  tasks: TaskListItem[];
  viewMode: TaskViewMode;
};

function TaskListContent({
  actionErrorMessage,
  categories,
  categoryErrorMessage,
  dragOverStatus,
  draggingTask,
  editErrors,
  editingTaskId,
  editValues,
  errorMessage,
  filters,
  hasActiveFilters,
  isCreatingCategory,
  isLoadingCategories,
  isLoading,
  newCategoryColor,
  newCategoryName,
  onCancelEdit,
  onChangeEditValue,
  onCreateCategory,
  onChangeTaskStatus,
  onDeleteTask,
  onKanbanColumnDragOver,
  onKanbanColumnDrop,
  onNewCategoryColorChange,
  onNewCategoryNameChange,
  onStartEdit,
  onTaskDragEnd,
  onTaskDragStart,
  onUpdateTask,
  pendingTaskAction,
  tasks,
  viewMode,
}: TaskListContentProps) {
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );
  const kanbanColumns = useMemo(
    () =>
      statusOptions.map((option) => ({
        ...option,
        tasks: sortTasksForFilters(
          tasks.filter((task) => task.status === option.value),
          filters,
        ),
      })),
    [filters, tasks],
  );

  function handleKanbanBoardDragOver(event: DragEvent<HTMLDivElement>) {
    if (!draggingTask) {
      return;
    }

    const board = event.currentTarget;
    const bounds = board.getBoundingClientRect();
    const scrollEdgeThreshold = 120;
    const scrollStep = 28;

    if (event.clientX >= bounds.right - scrollEdgeThreshold) {
      board.scrollBy({ left: scrollStep, behavior: 'auto' });
    } else if (event.clientX <= bounds.left + scrollEdgeThreshold) {
      board.scrollBy({ left: -scrollStep, behavior: 'auto' });
    }
  }

  function renderTaskCard(task: TaskListItem) {
    const isEditing = task.id === editingTaskId && editValues;
    const isUpdating = isTaskActionPending(pendingTaskAction, task.id, 'update');
    const statusActions = getTaskStatusActions(task.status);
    const category = task.categoryId ? categoriesById.get(task.categoryId) : null;
    const isDragging = draggingTask?.taskId === task.id;

    return (
      <article
        className={isEditing ? 'task-card task-card--editing' : 'task-card'}
        key={task.id}
        style={categoryColorStyle(category?.color)}
        draggable={viewMode === 'kanban' && !isEditing && !pendingTaskAction}
        onDragStart={() => onTaskDragStart(task)}
        onDragEnd={onTaskDragEnd}
        data-dragging={isDragging ? 'true' : undefined}
      >
        {isEditing ? (
          <TaskEditForm
            categories={categories}
            categoryErrorMessage={categoryErrorMessage}
            errors={editErrors}
            isCreatingCategory={isCreatingCategory}
            isLoadingCategories={isLoadingCategories}
            isLoading={isUpdating}
            newCategoryColor={newCategoryColor}
            newCategoryName={newCategoryName}
            onCancel={onCancelEdit}
            onChange={onChangeEditValue}
            onCreateCategory={onCreateCategory}
            onNewCategoryColorChange={onNewCategoryColorChange}
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

              <span className={`task-card__status ${getStatusClassName(task.status)}`}>
                {statusLabels[task.status]}
              </span>
            </div>

            <dl className="task-card__meta">
              <div>
                <dt>Prioridade</dt>
                <dd>
                  <span className={`task-card__priority ${getPriorityClassName(task.priority)}`}>
                    {priorityLabels[task.priority]}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Vencimento</dt>
                <dd>{formatDate(task.dueDate)}</dd>
              </div>
              <div>
                <dt>Categoria</dt>
                <dd>
                  <span className="task-card__category-chip">
                    <span className="task-card__category-dot" aria-hidden="true" />
                    {task.categoryName ?? 'Sem categoria'}
                  </span>
                </dd>
              </div>
            </dl>

            <div className="task-card__actions" aria-label={`Ações da tarefa ${task.title}`}>
              <div className="task-card__status-actions">
                {statusActions.map((statusAction) => (
                  <button
                    className={
                      statusAction.variant === 'danger'
                        ? 'task-card__action task-card__action--danger'
                        : 'task-card__action'
                    }
                    type="button"
                    key={statusAction.action}
                    onClick={() =>
                      onChangeTaskStatus(task.id, statusAction.status, statusAction.action)
                    }
                    disabled={Boolean(pendingTaskAction)}
                  >
                    {isTaskActionPending(pendingTaskAction, task.id, statusAction.action)
                      ? statusAction.loadingLabel
                      : statusAction.label}
                  </button>
                ))}
              </div>

              <div className="task-card__management-actions">
                <button
                  className="task-card__icon-action"
                  type="button"
                  onClick={() => onStartEdit(task)}
                  disabled={Boolean(pendingTaskAction)}
                  aria-label={`Editar tarefa ${task.title}`}
                  title="Editar tarefa"
                >
                  <Icon name="pencil" />
                  <span>Editar</span>
                </button>

                <button
                  className="task-card__icon-action task-card__icon-action--danger"
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  disabled={Boolean(pendingTaskAction)}
                  aria-label={`Excluir tarefa ${task.title}`}
                  title="Excluir tarefa"
                >
                  <Icon name="x" />
                  <span>
                    {isTaskActionPending(pendingTaskAction, task.id, 'delete')
                      ? 'Excluindo...'
                      : 'Excluir'}
                  </span>
                </button>
              </div>
            </div>
          </>
        )}
      </article>
    );
  }

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

      {viewMode === 'kanban' ? (
        <div
          className="tasks-page__kanban"
          aria-label="Kanban de tarefas"
          onDragOver={handleKanbanBoardDragOver}
        >
          {kanbanColumns.map((column) => {
            const isActiveDropTarget = dragOverStatus === column.value;
            const isDroppable = Boolean(
              draggingTask && canMoveTaskToStatus(draggingTask.fromStatus, column.value),
            );

            return (
              <section
                className={
                  isActiveDropTarget && isDroppable
                    ? 'kanban-column kanban-column--drag-over'
                    : isDroppable
                      ? 'kanban-column kanban-column--droppable'
                      : 'kanban-column'
                }
                key={column.value}
                onDragOver={(event) => onKanbanColumnDragOver(event, column.value)}
                onDrop={(event) => onKanbanColumnDrop(event, column.value)}
              >
                <header className="kanban-column__header">
                  <div>
                    <h3>{column.label}</h3>
                    <p>{column.tasks.length} tarefa(s)</p>
                  </div>
                  <span className={`task-card__status ${getStatusClassName(column.value)}`}>
                    {column.tasks.length}
                  </span>
                </header>

                <div className="kanban-column__body">
                  {column.tasks.length === 0 ? (
                    <div className="kanban-column__empty">
                      {draggingTask && isDroppable
                        ? 'Solte aqui para atualizar o status.'
                        : 'Nenhuma tarefa nesta coluna.'}
                    </div>
                  ) : (
                    column.tasks.map(renderTaskCard)
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div
          className={
            viewMode === 'blocks'
              ? 'tasks-page__list tasks-page__list--blocks'
              : 'tasks-page__list'
          }
          aria-label={viewMode === 'blocks' ? 'Tarefas em blocos' : 'Lista de tarefas'}
        >
          {tasks.map(renderTaskCard)}
        </div>
      )}
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
  newCategoryColor: string;
  newCategoryName: string;
  onCancel: () => void;
  onChange: (name: keyof TaskEditValues, value: string) => void;
  onCreateCategory: () => void;
  onNewCategoryColorChange: (color: string) => void;
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
          <label className="task-form__color-picker">
            <span>Cor</span>
            <input
              type="color"
              value={newCategoryColor}
              onChange={(event) => onNewCategoryColorChange(event.target.value)}
              disabled={isLoading || isCreatingCategory}
              aria-label="Cor da nova categoria"
            />
          </label>
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

type IconName = 'user' | 'plus' | 'pencil' | 'x' | 'list' | 'grid' | 'kanban';

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 8a7 7 0 0 0-14 0',
    plus: 'M12 5v14M5 12h14',
    pencil: 'm4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Zm11.5-14.5 3 3',
    x: 'M6 6l12 12M18 6 6 18',
    list: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
    grid: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
    kanban: 'M4 5h5v14H4V5Zm11 0h5v8h-5V5ZM10 5h4v5h-4V5Zm0 7h4v7h-4v-7Zm5 3h5v4h-5v-4Z',
  };

  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d={paths[name]} />
    </svg>
  );
}

function categoryColorStyle(color: string | null | undefined): CSSProperties {
  return {
    '--category-color': color ?? defaultCategoryColor,
  } as CSSProperties;
}

function getStatusClassName(status: TaskStatus) {
  const classNames: Record<TaskStatus, string> = {
    1: 'task-card__status--pending',
    2: 'task-card__status--in-progress',
    3: 'task-card__status--completed',
    4: 'task-card__status--cancelled',
  };

  return classNames[status];
}

function getPriorityClassName(priority: TaskPriority) {
  const classNames: Record<TaskPriority, string> = {
    1: 'task-card__priority--low',
    2: 'task-card__priority--medium',
    3: 'task-card__priority--high',
  };

  return classNames[priority];
}

function getTaskStatusActions(status: TaskStatus): TaskStatusActionConfig[] {
  switch (status) {
    case pendingTaskStatus:
      return [
        {
          action: 'start',
          label: 'Iniciar',
          loadingLabel: 'Iniciando...',
          status: inProgressTaskStatus,
        },
        {
          action: 'complete',
          label: 'Concluir',
          loadingLabel: 'Concluindo...',
          status: completedTaskStatus,
        },
        {
          action: 'cancel',
          label: 'Cancelar',
          loadingLabel: 'Cancelando...',
          status: cancelledTaskStatus,
          variant: 'danger',
        },
      ];
    case inProgressTaskStatus:
      return [
        {
          action: 'pause',
          label: 'Voltar para pendente',
          loadingLabel: 'Voltando...',
          status: pendingTaskStatus,
        },
        {
          action: 'complete',
          label: 'Concluir',
          loadingLabel: 'Concluindo...',
          status: completedTaskStatus,
        },
        {
          action: 'cancel',
          label: 'Cancelar',
          loadingLabel: 'Cancelando...',
          status: cancelledTaskStatus,
          variant: 'danger',
        },
      ];
    case completedTaskStatus:
      return [
        {
          action: 'reopen',
          label: 'Reabrir',
          loadingLabel: 'Reabrindo...',
          status: pendingTaskStatus,
        },
        {
          action: 'resume',
          label: 'Retomar',
          loadingLabel: 'Retomando...',
          status: inProgressTaskStatus,
        },
      ];
    case cancelledTaskStatus:
      return [
        {
          action: 'reactivate',
          label: 'Reativar',
          loadingLabel: 'Reativando...',
          status: pendingTaskStatus,
        },
      ];
    default:
      return [];
  }
}

function getTaskStatusActionForTransition(
  currentStatus: TaskStatus,
  nextStatus: TaskStatus,
): StatusTaskAction | null {
  if (currentStatus === nextStatus) {
    return null;
  }

  const action = getTaskStatusActions(currentStatus).find(
    (candidate) => candidate.status === nextStatus,
  );

  return action?.action ?? null;
}

function canMoveTaskToStatus(currentStatus: TaskStatus, nextStatus: TaskStatus) {
  return currentStatus === nextStatus ||
    Boolean(getTaskStatusActionForTransition(currentStatus, nextStatus));
}

function getStatusActionErrorMessage(action: StatusTaskAction) {
  const messages: Record<StatusTaskAction, string> = {
    start: 'Não foi possível iniciar a tarefa.',
    pause: 'Não foi possível voltar a tarefa para pendente.',
    complete: 'Não foi possível concluir a tarefa.',
    cancel: 'Não foi possível cancelar a tarefa.',
    reopen: 'Não foi possível reabrir a tarefa.',
    resume: 'Não foi possível retomar a tarefa.',
    reactivate: 'Não foi possível reativar a tarefa.',
  };

  return messages[action];
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

function createOptimisticTaskStatusUpdate(task: TaskListItem, status: TaskStatus): TaskListItem {
  return {
    ...task,
    status,
    completedAt: status === completedTaskStatus ? new Date().toISOString() : null,
  };
}

function updateTaskSummaryForStatusChange(
  summary: TaskSummary | null,
  previousStatus: TaskStatus,
  nextStatus: TaskStatus,
) {
  if (!summary || previousStatus === nextStatus) {
    return summary;
  }

  return adjustTaskSummaryCount(
    adjustTaskSummaryCount(summary, previousStatus, -1),
    nextStatus,
    1,
  );
}

function adjustTaskSummaryCount(
  summary: TaskSummary,
  status: TaskStatus,
  amount: number,
): TaskSummary {
  switch (status) {
    case pendingTaskStatus:
      return { ...summary, pending: Math.max(0, summary.pending + amount) };
    case inProgressTaskStatus:
      return { ...summary, inProgress: Math.max(0, summary.inProgress + amount) };
    case completedTaskStatus:
      return { ...summary, completed: Math.max(0, summary.completed + amount) };
    case cancelledTaskStatus:
      return { ...summary, cancelled: Math.max(0, summary.cancelled + amount) };
    default:
      return summary;
  }
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

