import { useAuth } from '../contexts/AuthContext';

export function DashboardPage() {
  const { logout, session } = useAuth();

  return (
    <main className="dashboard-page">
      <section className="dashboard-page__panel" aria-labelledby="dashboard-title">
        <div>
          <p className="dashboard-page__eyebrow">TaskFlow</p>
          <h1 id="dashboard-title">Olá, {session?.name}</h1>
          <p className="dashboard-page__description">
            Este é o espaço inicial da sua sessão. O gerenciamento de tarefas entra no próximo
            passo.
          </p>
        </div>

        <div className="dashboard-page__summary" aria-label="Resumo da sessão">
          <span>Conta conectada</span>
          <strong>{session?.email}</strong>
        </div>

        <button className="dashboard-page__logout" type="button" onClick={logout}>
          Sair
        </button>
      </section>
    </main>
  );
}
