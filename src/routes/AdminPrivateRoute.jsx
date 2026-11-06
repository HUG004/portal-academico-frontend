import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminPrivateRoute() {
  const { autenticado, cargando } = useAdminAuth();

  if (cargando) {
    return <div>Verificando sesión administrativa...</div>;
  }

  return autenticado
    ? <Outlet />
    : <Navigate to="/admin/login" replace />;
}