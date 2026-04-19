import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export function App() {
  if (window.location.pathname === '/register') {
    return <RegisterPage />;
  }

  return <LoginPage />;
}
