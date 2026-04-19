import { FormEvent, useState } from 'react';
import type { RegisterCredentials } from '../types/auth';

type RegisterFormProps = {
  errorMessage: string | null;
  isLoading: boolean;
  onSubmit: (credentials: RegisterCredentials) => Promise<void>;
};

type FormErrors = Partial<Record<keyof RegisterCredentials, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const minimumPasswordLength = 8;

export function RegisterForm({ errorMessage, isLoading, onSubmit }: RegisterFormProps) {
  const [values, setValues] = useState<RegisterCredentials>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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
        <label htmlFor="name">Nome</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'name-error' : undefined}
          onChange={(event) => {
            setValues((current) => ({ ...current, name: event.target.value }));
          }}
          disabled={isLoading}
        />
        {errors.name && (
          <span className="login-form__field-error" id="name-error">
            {errors.name}
          </span>
        )}
      </div>

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
          autoComplete="new-password"
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

      <div className="login-form__field">
        <label htmlFor="confirmPassword">Confirmar senha</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
          onChange={(event) => {
            setValues((current) => ({ ...current, confirmPassword: event.target.value }));
          }}
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <span className="login-form__field-error" id="confirm-password-error">
            {errors.confirmPassword}
          </span>
        )}
      </div>

      <button className="login-form__submit" type="submit" disabled={isLoading}>
        {isLoading ? 'Criando conta...' : 'Criar conta'}
      </button>
    </form>
  );
}

function validate(values: RegisterCredentials): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Informe seu nome.';
  }

  if (!values.email.trim()) {
    errors.email = 'Informe seu email.';
  } else if (!emailPattern.test(values.email)) {
    errors.email = 'Informe um email válido.';
  }

  if (!values.password) {
    errors.password = 'Informe uma senha.';
  } else if (values.password.length < minimumPasswordLength) {
    errors.password = `Use pelo menos ${minimumPasswordLength} caracteres.`;
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirme sua senha.';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'As senhas não conferem.';
  }

  return errors;
}
