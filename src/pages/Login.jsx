import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogIn } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

import '../styles/auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function manejarLogin(evento) {
    evento.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Completa todos los campos.');
      return;
    }

    setCargando(true);

    try {
      await login(email.trim(), password);

      navigate('/dashboard', { replace: true });
    } catch (error) {
      const status = error.response?.status;

      if (status === 401) {
        setError('Correo o contraseña incorrectos.');
      } else if (status === 422) {
        setError('Verifica los datos ingresados.');
      } else if (status === 502 || status === 503) {
        setError('El servicio institucional no está disponible.');
      } else {
        setError(
          error.response?.data?.message ||
          error.message ||
          'No fue posible conectar con el servidor.'
        );
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-logo">
          <img
            src="/logo-itc.png"
            alt="Instituto Tecnológico de Celaya"
          />
        </div>

        <h1>Portal Académico</h1>
        <p className="login-subtitulo">
          Accede con tu cuenta institucional del
          Tecnológico Nacional de México en Celaya.
        </p>

        <form onSubmit={manejarLogin}>
          <label htmlFor="email">Correo institucional</label>
          <input
            id="email"
            type="email"
            placeholder="l20000000@celaya.tecnm.mx"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" disabled={cargando}>
            <LogIn size={18} />
            {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="login-footer">
          Sistema académico estudiantil
        </p>
      </section>
    </main>
  );
}