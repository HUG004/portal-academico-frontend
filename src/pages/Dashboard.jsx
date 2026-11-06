import { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  GraduationCap,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

import { obtenerPerfil } from '../api/academicoApi';

import '../styles/dashboard.css';

function formatearNumero(valor, decimales = 0) {
  if (valor === null || valor === undefined || valor === '') {
    return '—';
  }

  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero.toLocaleString('es-MX', {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales,
      })
    : '—';
}

function obtenerFoto(foto) {
  if (!foto || typeof foto !== 'string') return null;

  if (foto.startsWith('data:image/')) return foto;

  return `data:image/jpeg;base64,${foto}`;
}

export default function Dashboard() {
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  async function cargarPerfil() {
    setCargando(true);
    setError('');

    try {
      const respuesta = await obtenerPerfil();

      if (!respuesta.ok || !respuesta.data) {
        throw new Error(
          respuesta.message || 'No se pudo obtener el perfil'
        );
      }

      setPerfil(respuesta.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Error al consultar el perfil'
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPerfil();
  }, []);

  if (cargando) {
    return (
      <div className="dashboard-estado">
        <div className="spinner"></div>
        <p>Consultando información académica...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-estado">
        <AlertCircle size={40} color="#dc2626" />
        <h2>No pudimos cargar tu información</h2>
        <p>{error}</p>
        <button onClick={cargarPerfil}>
          <RefreshCw size={17} />
          Reintentar
        </button>
      </div>
    );
  }

  if (!perfil) return null;

  const avance = Math.max(
    0,
    Math.min(100, Number(perfil.porcentaje_avance) || 0)
  );

  const tarjetas = [
    {
      titulo: 'Promedio ponderado',
      valor: formatearNumero(perfil.promedio_ponderado, 2),
      icono: Award,
      color: 'azul',
    },
    {
      titulo: 'Créditos acumulados',
      valor: formatearNumero(perfil.creditos_acumulados),
      icono: BookOpen,
      color: 'verde',
    },
    {
      titulo: 'Avance académico',
      valor: `${formatearNumero(perfil.porcentaje_avance)}%`,
      icono: TrendingUp,
      color: 'morado',
    },
    {
      titulo: 'Semestre actual',
      valor: formatearNumero(perfil.semestre),
      icono: GraduationCap,
      color: 'naranja',
    },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-encabezado">
        <div>
          <span className="dashboard-etiqueta">PANEL DEL ESTUDIANTE</span>
          <h1>Mi panel académico</h1>
          <p>Consulta tu información académica institucional.</p>
        </div>
      </header>

      <section className="perfil-card">
        <div className="perfil-foto">
          {obtenerFoto(perfil.foto) ? (
            <img
              src={obtenerFoto(perfil.foto)}
              alt="Fotografía del estudiante"
            />
          ) : (
            <GraduationCap size={38} />
          )}
        </div>

        <div className="perfil-datos">
          <h2>{perfil.persona || 'Estudiante'}</h2>
          <p>{perfil.email || 'Correo no disponible'}</p>
          <span>
            Número de control: {perfil.numero_control || '—'}
          </span>
        </div>

        <span className="perfil-insignia">
          Estudiante activo
        </span>
      </section>

      <section className="dashboard-tarjetas">
        {tarjetas.map(({ titulo, valor, icono: Icono, color }) => (
          <article className="estadistica-card" key={titulo}>
            <div className={`estadistica-icono ${color}`}>
              <Icono size={23} />
            </div>
            <p>{titulo}</p>
            <strong>{valor}</strong>
          </article>
        ))}
      </section>

      <section className="dashboard-detalles">
        <article className="detalle-card">
          <h3>Progreso académico</h3>

          <div className="progreso-texto">
            <span>Avance del plan de estudios</span>
            <strong>{formatearNumero(perfil.porcentaje_avance, 1)}%</strong>
          </div>

          <div
            className="progreso-barra"
            role="progressbar"
            aria-valuenow={avance}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div style={{ width: `${avance}%` }} />
          </div>

          <div className="progreso-resumen">
            <span>
              {formatearNumero(perfil.materias_aprobadas)} aprobadas
            </span>
            <span>
              {formatearNumero(perfil.materias_cursadas)} cursadas
            </span>
          </div>
        </article>

        <article className="detalle-card">
          <h3>Resumen de materias</h3>

          <div className="detalle-fila">
            <span>Materias aprobadas</span>
            <strong>{formatearNumero(perfil.materias_aprobadas)}</strong>
          </div>

          <div className="detalle-fila">
            <span>Materias reprobadas</span>
            <strong>{formatearNumero(perfil.materias_reprobadas)}</strong>
          </div>

          <div className="detalle-fila">
            <span>Promedio aritmético</span>
            <strong>
              {formatearNumero(perfil.promedio_aritmetico, 2)}
            </strong>
          </div>

          <div className="detalle-fila">
            <span>Créditos complementarios</span>
            <strong>
              {formatearNumero(perfil.creditos_complementarios)}
            </strong>
          </div>
        </article>
      </section>
    </div>
  );
}