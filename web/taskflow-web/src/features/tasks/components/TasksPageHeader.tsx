import { BrandMark } from '../../../components/BrandMark';
import { Button, ButtonLink } from '../../../components/Button';
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
        <Button type="button" variant="destructive" icon={<TaskIcon name="logout" />} onClick={onLogout}>
          Sair
        </Button>
      </div>

      <div className="tasks-page__intro">
        <BrandMark size="compact" />
        <h1 id="tasks-title">Minhas tarefas</h1>
        <p className="tasks-page__description">
          Acompanhe suas tarefas e mantenha foco no que precisa avançar.
        </p>
        <ButtonLink
          className="tasks-page__primary-action"
          to="/tasks/new"
          variant="primary"
          icon={<TaskIcon name="plus" />}
        >
          Criar tarefa
        </ButtonLink>
      </div>
    </header>
  );
}
