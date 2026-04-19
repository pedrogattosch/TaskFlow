import { useState } from 'react';
import { RegisterForm } from '../components/RegisterForm';
import { authService } from '../services/authService';
import { HttpClientError } from '../services/httpClient';
import type { RegisterCredentials } from '../types/auth';

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleRegister(credentials: RegisterCredentials) {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      await authService.register(credentials);
      window.location.assign('/');
    } catch (error) {
      if (error instanceof HttpClientError && error.status === 409) {
        setErrorMessage('Já existe uma conta com este email.');
        return;
      }

      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível criar sua conta agora.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-page__content" aria-labelledby="register-title">
        <div className="login-page__intro">
          <p className="login-page__eyebrow">TaskFlow</p>
          <h1 id="register-title">Crie sua conta</h1>
          <p className="login-page__description">
            Comece com um espaço simples para organizar prioridades, manter prazos visíveis e
            acompanhar o que precisa avançar.
          </p>
          <p className="login-page__secondary-action">
            Já tem conta? <a href="/">Entrar</a>
          </p>
        </div>

        <RegisterForm
          errorMessage={errorMessage}
          isLoading={isLoading}
          onSubmit={handleRegister}
        />
      </section>
    </main>
  );
}
