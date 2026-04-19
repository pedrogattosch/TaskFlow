import { useState } from 'react';
import { LoginForm } from '../components/LoginForm';
import { authService } from '../services/authService';
import { HttpClientError } from '../services/httpClient';
import type { LoginCredentials } from '../types/auth';

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin(credentials: LoginCredentials) {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      await authService.login(credentials);
    } catch (error) {
      if (error instanceof HttpClientError && error.status === 401) {
        setErrorMessage('Email ou senha inválidos.');
        return;
      }

      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível acessar sua conta agora.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-page__content" aria-labelledby="login-title">
        <div className="login-page__intro">
          <p className="login-page__eyebrow">TaskFlow</p>
          <h1 id="login-title">Entre na sua conta</h1>
          <p className="login-page__description">
            Acesse seu espaço para organizar as tarefas, acompanhar os prazos e manter o trabalho em
            movimento.
          </p>
        </div>

        <LoginForm errorMessage={errorMessage} isLoading={isLoading} onSubmit={handleLogin} />
      </section>
    </main>
  );
}
