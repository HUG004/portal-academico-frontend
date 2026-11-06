
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Clock3,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

import { useAdminAuth } from '../../context/AdminAuthContext';
import '../../styles/adminPanel.css';

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const enlaces = [
    {
      ruta: '/admin/dashboard',
      nombre: 'Dashboard',
      icono: LayoutDashboard,
    },
    {
      ruta: '/admin/profesores',
      nombre: 'Profesores',
      icono: Users,
    },
  ];

  function cerrarSesion() {
    logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="admin-panel-layout">
      <aside className="admin-panel-sidebar">
        <div className="admin-panel-marca">
          <ShieldCheck size={30} />
          <div>
            <strong>Portal SII</strong>
            <span>Administración</span>
          </div>
        </div>

        <nav className="admin-panel-nav">
          {enlaces.map((enlace) => {
            const Icono = enlace.icono;

            return (
              <NavLink
                key={enlace.ruta}
                to={enlace.ruta}
                className={({ isActive }) =>
                  `admin-panel-enlace ${isActive ? 'activo' : ''}`
                }
              >
                <Icono size={19} />
                {enlace.nombre}
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-panel-sidebar-footer">
          <div className="admin-panel-usuario">
            <div className="admin-panel-avatar">
              <ShieldCheck size={20} />
            </div>
            <div>
              <strong>{admin?.name || 'Administrador'}</strong>
              <span>{admin?.email || ''}</span>
            </div>
          </div>

          <button onClick={cerrarSesion}>
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="admin-panel-main">
        <div className="admin-panel-topbar">
          <span>Portal Académico SII</span>
          <span>Panel administrativo</span>
        </div>

        <div className="admin-panel-contenido">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
