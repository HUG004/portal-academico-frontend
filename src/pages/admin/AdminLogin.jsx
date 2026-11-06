import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShieldCheck, Mail, LockKeyhole } from 'lucide-react';

import { useAdminAuth } from '../../context/AdminAuthContext';

import '../../styles/admin.css';

export default function AdminLogin() {
  const { login, autenticado, cargando } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (cargando) {
    return <div className="admin-login-page">Verificando sesión...</div>;
  }

  if (autenticado) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function manejarLogin(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);

    try {
      await login(email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'No se pudo iniciar sesión'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-icon">
          <ShieldCheck size={32} />
        </div>

        <h1>Acceso administrativo</h1>

        <p>
          Portal Académico SII
          <br />
          Instituto Tecnológico de Celaya
        </p>

        <form onSubmit={manejarLogin}>
          <label htmlFor="admin-email">
            Correo electrónico
          </label>

          <div className="admin-input">
            <Mail size={19} />

            <input
              id="admin-email"
              type="email"
              placeholder="administrador@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <label htmlFor="admin-password">
            Contraseña
          </label>

          <div className="admin-input">
            <LockKeyhole size={19} />

            <input
              id="admin-password"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="admin-login-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" disabled={enviando}>
            {enviando ? 'Verificando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="admin-login-footer">
          Acceso exclusivo para personal autorizado
        </div>
      </div>
    </div>
  );
}