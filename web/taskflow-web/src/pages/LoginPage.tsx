import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrandMark } from '../components/BrandMark';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../contexts/AuthContext';
import { HttpClientError } from '../services/httpClient';
import type { LoginCredentials } from '../types/auth';

export function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin(credentials: LoginCredentials) {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      await login(credentials);
      const from = location.state?.from?.pathname ?? '/';
      navigate(from, { replace: true });
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
          <BrandMark
            tagline="Centralize prioridades, acompanhe prazos e mantenha o trabalho fluindo."
          />
          <h1 id="login-title">Entre na sua conta</h1>
          <p className="login-page__description">
            Acesse seu espaço para organizar as tarefas, acompanhar os prazos e manter o trabalho em
            movimento.
          </p>
          <p className="login-page__secondary-action">
            Ainda não tem conta? <Link to="/register">Criar conta</Link>
          </p>
        </div>

        <LoginForm errorMessage={errorMessage} isLoading={isLoading} onSubmit={handleLogin} />
      </section>
    </main>
  );
}
