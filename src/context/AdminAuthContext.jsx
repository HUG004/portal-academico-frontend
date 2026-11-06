import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  iniciarSesionAdmin,
  obtenerAdminActual,
} from '../api/adminApi';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function verificarSesion() {
      const token = sessionStorage.getItem('admin_token');

      if (!token) {
        setCargando(false);
        return;
      }

      try {
        const respuesta = await obtenerAdminActual();

        if (!respuesta.ok) {
          throw new Error('Sesión administrativa inválida');
        }

        setAdmin(respuesta.data);
      } catch {
        sessionStorage.removeItem('admin_token');
        setAdmin(null);
      } finally {
        setCargando(false);
      }
    }

    verificarSesion();
  }, []);

  async function login(email, password) {
    const respuesta = await iniciarSesionAdmin(email, password);

    if (!respuesta.ok || !respuesta.data?.token) {
      throw new Error(
        respuesta.message || 'No se pudo iniciar sesión'
      );
    }

    sessionStorage.setItem(
      'admin_token',
      respuesta.data.token
    );

    try {
      const perfil = await obtenerAdminActual();

      if (!perfil.ok) {
        throw new Error('No se pudo verificar el administrador');
      }

      setAdmin(perfil.data);
      return perfil.data;
    } catch (error) {
      sessionStorage.removeItem('admin_token');
      setAdmin(null);
      throw error;
    }
  }

  function logout() {
    sessionStorage.removeItem('admin_token');
    setAdmin(null);
  }

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        cargando,
        login,
        logout,
        autenticado: Boolean(admin),
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const contexto = useContext(AdminAuthContext);

  if (!contexto) {
    throw new Error(
      'useAdminAuth debe utilizarse dentro de AdminAuthProvider'
    );
  }

  return contexto;
}