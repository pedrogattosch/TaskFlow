import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HttpClientError } from '../services/httpClient';
import { taskService } from '../services/taskService';
import type { CreateTaskInput, TaskPriority } from '../types/task';

type TaskFormValues = {
  title: string;
  description: string;
  priority: TaskPriority | '';
  dueDate: string;
  categoryName: string;
};

type FormErrors = Partial<Record<keyof TaskFormValues, string>>;

const priorityOptions: Array<{ label: string; value: TaskPriority }> = [
  { label: 'Baixa', value: 1 },
  { label: 'Média', value: 2 },
  { label: 'Alta', value: 3 },
];

const initialValues: TaskFormValues = {
  title: '',
  description: '',
  priority: '',
  dueDate: '',
  categoryName: '',
};

export function CreateTaskPage() {
  const { logout, session } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState<TaskFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      categoryName: values.categoryName.trim(),
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

  return (
    <main className="tasks-page">
      <section className="task-form-page" aria-labelledby="create-task-title">
        <header className="task-form-page__header">
          <div>
            <p className="tasks-page__eyebrow">Nova tarefa</p>
            <h1 id="create-task-title">Criar tarefa</h1>
            <p className="tasks-page__description">
              Registre uma tarefa com prioridade, prazo e categoria para acompanhar no painel.
            </p>
          </div>

          <Link className="task-form-page__back" to="/tasks">
            Voltar para tarefas
          </Link>
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
              disabled={isLoading}
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
              disabled={isLoading}
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
                disabled={isLoading}
              />
              {errors.dueDate && (
                <span className="task-form__field-error" id="due-date-error">
                  {errors.dueDate}
                </span>
              )}
            </div>
          </div>

          <div className="task-form__field">
            <label htmlFor="categoryName">Categoria</label>
            <input
              id="categoryName"
              name="categoryName"
              type="text"
              maxLength={80}
              value={values.categoryName}
              aria-invalid={Boolean(errors.categoryName)}
              aria-describedby={errors.categoryName ? 'category-error' : undefined}
              onChange={(event) => {
                setValues((current) => ({ ...current, categoryName: event.target.value }));
              }}
              disabled={isLoading}
            />
            {errors.categoryName && (
              <span className="task-form__field-error" id="category-error">
                {errors.categoryName}
              </span>
            )}
          </div>

          <button className="task-form__submit" type="submit" disabled={isLoading}>
            {isLoading ? 'Criando tarefa...' : 'Criar tarefa'}
          </button>
        </form>
      </section>
    </main>
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

  if (!values.categoryName.trim()) {
    errors.categoryName = 'Informe a categoria.';
  } else if (values.categoryName.trim().length > 80) {
    errors.categoryName = 'Use no máximo 80 caracteres.';
  }

  return errors;
}

function isBeforeToday(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = new Date(`${value}T00:00:00`);
  return selectedDate < today;
}
