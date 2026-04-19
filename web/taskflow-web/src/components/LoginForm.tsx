import { FormEvent, useState } from 'react';
import type { LoginCredentials } from '../types/auth';

type LoginFormProps = {
  errorMessage: string | null;
  isLoading: boolean;
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
};

type FormErrors = Partial<Record<keyof LoginCredentials, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm({ errorMessage, isLoading, onSubmit }: LoginFormProps) {
  const [values, setValues] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    await onSubmit(values);
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      {errorMessage && (
        <div className="login-form__error" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="login-form__field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
          onChange={(event) => {
            setValues((current) => ({ ...current, email: event.target.value }));
          }}
          disabled={isLoading}
        />
        {errors.email && (
          <span className="login-form__field-error" id="email-error">
            {errors.email}
          </span>
        )}
      </div>

      <div className="login-form__field">
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'password-error' : undefined}
          onChange={(event) => {
            setValues((current) => ({ ...current, password: event.target.value }));
          }}
          disabled={isLoading}
        />
        {errors.password && (
          <span className="login-form__field-error" id="password-error">
            {errors.password}
          </span>
        )}
      </div>

      <button className="login-form__submit" type="submit" disabled={isLoading}>
        {isLoading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}

function validate(values: LoginCredentials): FormErrors {
  const errors: FormErrors = {};

  if (!values.email.trim()) {
    errors.email = 'Informe seu email.';
  } else if (!emailPattern.test(values.email)) {
    errors.email = 'Informe um email válido.';
  }

  if (!values.password) {
    errors.password = 'Informe sua senha.';
  }

  return errors;
}
