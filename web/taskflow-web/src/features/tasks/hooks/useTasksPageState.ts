import { type DragEvent, type FormEvent, useEffect, useMemo, useState } from 'react';
import type { Location } from 'react-router-dom';
import { categoryService } from '../../../services/categoryService';
import { HttpClientError } from '../../../services/httpClient';
import { taskService } from '../../../services/taskService';
import type { CategoryListItem } from '../../../types/category';
import type { UpdateTaskInput } from '../../../types/task';
import { defaultCategoryColor } from '../constants';
import type {
  DraggingTaskState,
  PendingTaskAction,
  StatusTaskAction,
  TaskEditErrors,
  TaskEditValues,
  TaskListFilters,
  TaskPriority,
  TaskStatus,
  TaskSummary,
  TasksLocationState,
  TaskViewMode,
} from '../types';
import {
  addOrReplaceCategory,
  createOptimisticTaskStatusUpdate,
  getFiltersFromSearchParams,
  getStatusActionErrorMessage,
  getTaskStatusActionForTransition,
  mergeCreatedTask,
  removeCategory,
  replaceTaskForFilters,
  taskMatchesFilters,
  toEditValues,
  toTaskQueryInput,
  updateTaskSummaryForStatusChange,
  validateEditValues,
} from '../utils';

type UseTasksPageStateParams = {
  accessToken: string | undefined;
  location: Location;
  logout: () => void;
  searchParams: URLSearchParams;
  setSearchParams: (nextInit: URLSearchParams | Record<string, string>) => void;
};

export function useTasksPageState({
  accessToken,
  location,
  logout,
  searchParams,
  setSearchParams,
}: UseTasksPageStateParams) {
  const filters = useMemo(() => getFiltersFromSearchParams(searchParams), [searchParams]);
  const createdTask = (location.state as TasksLocationState)?.createdTask ?? null;
  const [tasks, setTasks] = useState(() => mergeCreatedTask([], createdTask, filters));
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
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [updatingCategoryId, setUpdatingCategoryId] = useState<string | null>(null);
  const [categoryActionErrorMessage, setCategoryActionErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<TaskViewMode>('list');
  const [draggingTask, setDraggingTask] = useState<DraggingTaskState>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTaskSummary() {
      if (!accessToken) {
        return;
      }

      try {
        setIsLoadingSummary(true);
        setSummaryErrorMessage(null);

        const response = await taskService.getTaskSummary(accessToken);

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
          error instanceof Error ? error.message : 'Não foi possível carregar o resumo.',
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
  }, [accessToken, logout, summaryReloadKey]);

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      if (!accessToken) {
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await taskService.getTasks(accessToken, toTaskQueryInput(filters));

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
    accessToken,
    createdTask?.id,
    filters.categoryId,
    filters.priority,
    filters.sortBy,
    filters.sortDirection,
    filters.status,
    logout,
  ]);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      if (!accessToken) {
        return;
      }

      try {
        setIsLoadingCategories(true);
        setCategoryErrorMessage(null);

        const response = await categoryService.getCategories(accessToken);

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
  }, [accessToken, logout]);

  async function handleChangeTaskStatus(
    taskId: string,
    status: TaskStatus,
    action: StatusTaskAction,
  ) {
    if (!accessToken || pendingTaskAction) {
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

      const updatedTask = await taskService.updateTaskStatus(accessToken, taskId, status);

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
    if (!accessToken || pendingTaskAction) {
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

      await taskService.deleteTask(accessToken, taskId);

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

    if (!editValues || !accessToken || pendingTaskAction) {
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

      const updatedTask = await taskService.updateTask(accessToken, taskId, payload);

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
    if (!accessToken || isCreatingCategory) {
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

      const createdCategory = await categoryService.createCategory(accessToken, {
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
    if (!accessToken || updatingCategoryId || deletingCategoryId) {
      return;
    }

    try {
      setUpdatingCategoryId(category.id);
      setCategoryActionErrorMessage(null);

      const updatedCategory = await categoryService.updateCategory(accessToken, category.id, {
        name: category.name,
        color,
      });

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

  async function handleDeleteCategory(category: CategoryListItem) {
    if (!accessToken || updatingCategoryId || deletingCategoryId) {
      return;
    }

    const confirmed = window.confirm(
      `Excluir a categoria "${category.name}"?\n\nAs tarefas vinculadas a ela continuarão existindo, mas ficarão sem categoria.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingCategoryId(category.id);
      setCategoryActionErrorMessage(null);

      await categoryService.deleteCategory(accessToken, category.id);

      setCategories((current) => removeCategory(current, category.id));
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.categoryId === category.id
            ? { ...task, categoryId: null, categoryName: null }
            : task,
        ),
      );
      setEditValues((current) =>
        current && current.categoryId === category.id
          ? { ...current, categoryId: '' }
          : current,
      );

      if (filters.categoryId === category.id) {
        updateSearchParams({
          ...filters,
          categoryId: '',
        });
      }
    } catch (error) {
      if (error instanceof HttpClientError && error.status === 401) {
        logout();
        return;
      }

      setCategoryActionErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível excluir a categoria.',
      );
    } finally {
      setDeletingCategoryId(null);
    }
  }

  function handleStartEdit(task: Parameters<typeof toEditValues>[0]) {
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
    const [sortBy, sortDirection] = value.split(':') as [TaskListFilters['sortBy'], TaskListFilters['sortDirection']];

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

  function handleTaskDragStart(task: Parameters<typeof handleStartEdit>[0]) {
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

  return {
    actionErrorMessage,
    categories,
    deletingCategoryId,
    categoryActionErrorMessage,
    categoryErrorMessage,
    dragOverStatus,
    draggingTask,
    editErrors,
    editingTaskId,
    editValues,
    errorMessage,
    filters,
    isCreatingCategory,
    isEditingCategories,
    isLoading,
    isLoadingCategories,
    isLoadingSummary,
    newCategoryColor,
    newCategoryName,
    pendingTaskAction,
    summaryErrorMessage,
    taskSummary,
    tasks,
    updatingCategoryId,
    viewMode,
    setIsEditingCategories,
    setNewCategoryColor,
    setNewCategoryName,
    setViewMode,
    handleCancelEdit,
    handleChangeEditValue,
    handleChangeTaskStatus,
    handleClearFilters,
    handleCreateCategory,
    handleDeleteCategory,
    handleDeleteTask,
    handleFilterChange,
    handleKanbanColumnDragOver,
    handleKanbanColumnDrop,
    handleSortChange,
    handleStartEdit,
    handleTaskDragEnd,
    handleTaskDragStart,
    handleUpdateCategoryColor,
    handleUpdateTask,
  };
}
