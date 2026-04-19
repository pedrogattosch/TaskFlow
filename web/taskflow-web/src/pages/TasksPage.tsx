import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HttpClientError } from '../services/httpClient';
import { taskService } from '../services/taskService';
import type { TaskListItem, TaskPriority, TaskStatus, UpdateTaskInput } from '../types/task';

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
  categoryName: string;
};

type TaskEditErrors = Partial<Record<keyof TaskEditValues, string>>;

export function TasksPage() {
  const { logout, session } = useAuth();
  const location = useLocation();
  const createdTask = (location.state as TasksLocationState)?.createdTask ?? null;
  const [tasks, setTasks] = useState<TaskListItem[]>(() => mergeCreatedTask([], createdTask));
  const [isLoading, setIsLoading] = useState(!createdTask);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [pendingTaskAction, setPendingTaskAction] = useState<PendingTaskAction>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<TaskEditValues | null>(null);
  const [editErrors, setEditErrors] = useState<TaskEditErrors>({});

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      if (!session?.accessToken) {
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await taskService.getTasks(session.accessToken);

        if (isMounted) {
          setTasks(mergeCreatedTask(response, createdTask));
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
  }, [createdTask?.id, logout, session?.accessToken]);

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

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === taskId ? updatedTask : task)),
      );
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
      categoryName: editValues.categoryName.trim(),
    };

    try {
      setPendingTaskAction({ taskId, action: 'update' });
      setActionErrorMessage(null);

      const updatedTask = await taskService.updateTask(session.accessToken, taskId, payload);

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === taskId ? updatedTask : task)),
      );
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

        <TaskListContent
          actionErrorMessage={actionErrorMessage}
          editErrors={editErrors}
          editingTaskId={editingTaskId}
          editValues={editValues}
          errorMessage={errorMessage}
          isLoading={isLoading}
          onCancelEdit={handleCancelEdit}
          onChangeEditValue={handleChangeEditValue}
          onCompleteTask={handleCompleteTask}
          onDeleteTask={handleDeleteTask}
          onStartEdit={handleStartEdit}
          onUpdateTask={handleUpdateTask}
          pendingTaskAction={pendingTaskAction}
          tasks={tasks}
        />
      </section>
    </main>
  );
}

type TaskListContentProps = {
  actionErrorMessage: string | null;
  editErrors: TaskEditErrors;
  editingTaskId: string | null;
  editValues: TaskEditValues | null;
  errorMessage: string | null;
  isLoading: boolean;
  onCancelEdit: () => void;
  onChangeEditValue: (name: keyof TaskEditValues, value: string) => void;
  onCompleteTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onStartEdit: (task: TaskListItem) => void;
  onUpdateTask: (event: FormEvent<HTMLFormElement>, taskId: string) => void;
  pendingTaskAction: PendingTaskAction;
  tasks: TaskListItem[];
};

function TaskListContent({
  actionErrorMessage,
  editErrors,
  editingTaskId,
  editValues,
  errorMessage,
  isLoading,
  onCancelEdit,
  onChangeEditValue,
  onCompleteTask,
  onDeleteTask,
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
        <p>Nenhuma tarefa encontrada para sua conta.</p>
        <Link className="tasks-page__state-action" to="/tasks/new">
          Criar primeira tarefa
        </Link>
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
                  errors={editErrors}
                  isLoading={isUpdating}
                  onCancel={onCancelEdit}
                  onChange={onChangeEditValue}
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
  errors: TaskEditErrors;
  isLoading: boolean;
  onCancel: () => void;
  onChange: (name: keyof TaskEditValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  taskId: string;
  taskTitle: string;
  values: TaskEditValues;
};

function TaskEditForm({
  errors,
  isLoading,
  onCancel,
  onChange,
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
        <input
          id={`edit-category-${taskId}`}
          type="text"
          maxLength={80}
          value={values.categoryName}
          aria-invalid={Boolean(errors.categoryName)}
          aria-describedby={errors.categoryName ? `edit-category-${taskId}-error` : undefined}
          onChange={(event) => onChange('categoryName', event.target.value)}
          disabled={isLoading}
        />
        {errors.categoryName && (
          <span className="task-form__field-error" id={`edit-category-${taskId}-error`}>
            {errors.categoryName}
          </span>
        )}
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

function mergeCreatedTask(tasks: TaskListItem[], createdTask: TaskListItem | null) {
  if (!createdTask || tasks.some((task) => task.id === createdTask.id)) {
    return tasks;
  }

  return [createdTask, ...tasks];
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
    categoryName: task.categoryName ?? '',
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

  if (!values.categoryName.trim()) {
    errors.categoryName = 'Informe a categoria.';
  } else if (values.categoryName.trim().length > 80) {
    errors.categoryName = 'Use no máximo 80 caracteres.';
  }

  return errors;
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
