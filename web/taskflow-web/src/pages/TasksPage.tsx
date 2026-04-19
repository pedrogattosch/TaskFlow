import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HttpClientError } from '../services/httpClient';
import { taskService } from '../services/taskService';
import type { TaskListItem, TaskPriority, TaskStatus } from '../types/task';

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

export function TasksPage() {
  const { logout, session } = useAuth();
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
          setTasks(response);
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
  }, [logout, session?.accessToken]);

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

        <TaskListContent errorMessage={errorMessage} isLoading={isLoading} tasks={tasks} />
      </section>
    </main>
  );
}

type TaskListContentProps = {
  errorMessage: string | null;
  isLoading: boolean;
  tasks: TaskListItem[];
};

function TaskListContent({ errorMessage, isLoading, tasks }: TaskListContentProps) {
  if (isLoading) {
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
    <div className="tasks-page__list" aria-label="Lista de tarefas">
      {tasks.map((task) => (
        <article className="task-card" key={task.id}>
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
        </article>
      ))}
    </div>
  );
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
