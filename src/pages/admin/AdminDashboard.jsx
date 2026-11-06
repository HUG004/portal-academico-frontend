
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  Clock3,
  ShieldCheck,
  ArrowRight,
  UserPlus,
} from 'lucide-react';

import { obtenerProfesoresAdmin } from '../../api/adminApi';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminDashboard() {
  const { admin } = useAdminAuth();

  const [estadisticas, setEstadisticas] = useState({
    profesores: 0,
    materias: 0,
    horarios: 0,
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarDatos() {
      try {
        const respuesta = await obtenerProfesoresAdmin();

        if (!respuesta.ok || !Array.isArray(respuesta.data)) {
          throw new Error('No se pudieron consultar los profesores');
        }

        const profesores = respuesta.data;

        setEstadisticas({
          profesores: profesores.length,
          materias: profesores.reduce(
            (total, profesor) =>
              total + (profesor.materias || []).length,
            0
          ),
          horarios: profesores.reduce(
            (total, profesor) =>
              total + (profesor.horarios || []).length,
            0
          ),
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.message ||
          'No se pudieron cargar las estadísticas'
        );
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, []);

  const tarjetas = [
    {
      titulo: 'Profesores registrados',
      valor: estadisticas.profesores,
      icono: Users,
    },
    {
      titulo: 'Materias asignadas',
      valor: estadisticas.materias,
      icono: BookOpen,
    },
    {
      titulo: 'Horarios de atención',
      valor: estadisticas.horarios,
      icono: Clock3,
    },
    {
      titulo: 'Sesión administrativa',
      valor: 'Activa',
      icono: ShieldCheck,
    },
  ];

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-header">
        <span className="admin-dashboard-etiqueta">
          ADMINISTRACIÓN
        </span>

        <h1>Panel de Administración</h1>

        <p>
          Bienvenido, {admin?.name || 'Administrador'}.
          Gestiona la información del directorio académico.
        </p>
      </header>

      {error && (
        <div className="admin-dashboard-error">
          {error}
        </div>
      )}

      <section className="admin-dashboard-tarjetas">
        {tarjetas.map((tarjeta) => {
          const Icono = tarjeta.icono;

          return (
            <article
              key={tarjeta.titulo}
              className="admin-dashboard-tarjeta"
            >
              <div className="admin-dashboard-icono">
                <Icono size={23} />
              </div>

              <span>{tarjeta.titulo}</span>

              <strong>
                {cargando ? '...' : tarjeta.valor}
              </strong>
            </article>
          );
        })}
      </section>

      <section className="admin-dashboard-acciones">
        <div>
          <h2>Gestión de profesores</h2>
          <p>
            Registra, edita y administra profesores,
            materias impartidas y horarios de atención.
          </p>

          <Link
            to="/admin/profesores"
            className="admin-dashboard-boton"
          >
            <Users size={18} />
            Administrar profesores
            <ArrowRight size={17} />
          </Link>
        </div>

        <div className="admin-dashboard-acciones-icono">
          <UserPlus size={48} />
        </div>
      </section>
    </div>
  );
}
