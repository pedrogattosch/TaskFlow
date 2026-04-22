import { Link } from 'react-router-dom';
import { BrandMark } from '../../../components/BrandMark';
import { TaskIcon } from './TaskIcon';

type TasksPageHeaderProps = {
  email: string | undefined;
  onLogout: () => void;
};

export function TasksPageHeader({ email, onLogout }: TasksPageHeaderProps) {
  return (
    <header className="tasks-page__header">
      <div className="tasks-page__session" aria-label="Sessão atual">
        <div className="tasks-page__session-user">
          <TaskIcon name="user" />
          <div>
            <span>Conectado como </span>
            <strong>{email}</strong>
          </div>
        </div>
        <button type="button" onClick={onLogout}>
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
          <TaskIcon name="plus" />
          Criar tarefa
        </Link>
      </div>
    </header>
  );
}
