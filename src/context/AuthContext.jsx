import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  iniciarSesion,
  verificarSesion,
  cerrarSesion,
} from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [autenticado, setAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    async function comprobarSesion() {
      const token = sessionStorage.getItem('token');

      if (!token) {
        if (activo) setCargando(false);
        return;
      }

      try {
        await verificarSesion();

        if (activo) setAutenticado(true);
      } catch {
        sessionStorage.removeItem('token');

        if (activo) setAutenticado(false);
      } finally {
        if (activo) setCargando(false);
      }
    }

    comprobarSesion();

    const expirarSesion = () => {
      setAutenticado(false);
    };

    window.addEventListener(
      'sesion-expirada',
      expirarSesion
    );

    return () => {
      activo = false;

      window.removeEventListener(
        'sesion-expirada',
        expirarSesion
      );
    };
  }, []);

  async function login(email, password) {
    const resultado = await iniciarSesion(email, password);

    if (!resultado.ok || !resultado.data?.token) {
      throw new Error(
        resultado.message || 'No se pudo iniciar sesión'
      );
    }

    sessionStorage.setItem(
      'token',
      resultado.data.token
    );

    setAutenticado(true);
  }

  async function logout() {
    try {
      await cerrarSesion();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      sessionStorage.removeItem('token');
      setAutenticado(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        autenticado,
        cargando,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider'
    );
  }

  return contexto;
}