import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Library,
    CalendarDays,
    Users,
    LogOut,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const opciones = [
    {ruta: '/dashboard', nombre: 'Inicio', icono: LayoutDashboard},
      { ruta: '/calificaciones', nombre: 'Calificaciones', icono: BookOpen },
    { ruta: '/kardex', nombre: 'Kardex', icono: Library },
    { ruta: '/horario', nombre: 'Mi horario', icono: CalendarDays },
    { ruta: '/profesores', nombre: 'Profesores', icono: Users },
    ];

    export default function Sidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    async function salir() {
        await logout();
        navigate('/login', { replace: true });
    }

    return (
        <aside className="sidebar">
        <div className="sidebar-logo">
            <img
                src="/logo-itc.png"
                alt="Logotipo del Instituto Tecnológico de Celaya"
                className="sidebar-logo-img"
            />
            <div>
            <strong>Sistema integral</strong>
            <span>Instituto Tecnologico de Celaya</span>
            </div>
        </div>

        <div className="sidebar-etiqueta">MENÚ PRINCIPAL</div>

        <nav className="sidebar-nav">
            {opciones.map(({ ruta, nombre, icono: Icono }) => (
            <NavLink
                key={ruta}
                to={ruta}
                className={({ isActive }) =>
                `sidebar-enlace ${isActive ? 'activo' : ''}`
                }
            >
                <Icono size={19} />
                <span>{nombre}</span>
            </NavLink>
            ))}
        </nav>

        <button className="sidebar-salir" onClick={salir}>
            <LogOut size={19} />
            Cerrar sesión
        </button>
        </aside>
    );
}