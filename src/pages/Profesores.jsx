
import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Search,
  Mail,
  MapPin,
  BookOpen,
  Clock3,
  RefreshCw,
  AlertCircle,
  X,
  Building2,
} from 'lucide-react';

import {
  obtenerProfesores,
  obtenerProfesorPorId,
} from '../api/profesoresApi';

import '../styles/profesores.css';

const DIAS = {
  lunes: 1,
  martes: 2,
  miercoles: 3,
  miércoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  sábado: 6,
  domingo: 7,
};

function ordenarHorarios(horarios = []) {
  return [...horarios].sort((a, b) => {
    const diaA = DIAS[String(a.dia).toLowerCase()] || 8;
    const diaB = DIAS[String(b.dia).toLowerCase()] || 8;

    return diaA - diaB ||
      String(a.hora_inicio).localeCompare(String(b.hora_inicio));
  });
}

function formatearHora(hora) {
  if (!hora) return '—';
  return String(hora).slice(0, 5);
}

export default function Profesores() {
  const [profesores, setProfesores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [materiaSeleccionada, setMateriaSeleccionada] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [profesorDetalle, setProfesorDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState('');

  async function cargarProfesores() {
    setCargando(true);
    setError('');

    try {
      const respuesta = await obtenerProfesores();

      if (!respuesta.ok || !Array.isArray(respuesta.data)) {
        throw new Error(
          respuesta.message || 'Respuesta inválida del directorio'
        );
      }

      setProfesores(respuesta.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'No fue posible consultar los profesores'
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarProfesores();
  }, []);

  // Materias disponibles en el directorio.
  const materiasDisponibles = useMemo(() => {
    const mapa = new Map();

    profesores.forEach((profesor) => {
      (profesor.materias || []).forEach((materia) => {
        if (materia.clave_materia) {
          mapa.set(
            materia.clave_materia,
            materia.nombre_materia || materia.clave_materia
          );
        }
      });
    });

    return [...mapa.entries()].sort((a, b) =>
      a[1].localeCompare(b[1], 'es')
    );
  }, [profesores]);

  // Filtros aplicados sobre los datos obtenidos de Laravel.
  const profesoresFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es-MX');

    return profesores.filter((profesor) => {
      const coincideBusqueda =
        `${profesor.nombre || ''} ${profesor.correo || ''}`
          .toLocaleLowerCase('es-MX')
          .includes(texto);

      const coincideMateria =
        !materiaSeleccionada ||
        (profesor.materias || []).some(
          (materia) =>
            materia.clave_materia === materiaSeleccionada
        );

      return coincideBusqueda && coincideMateria;
    });
  }, [profesores, busqueda, materiaSeleccionada]);

  async function verDetalle(id) {
    setProfesorDetalle(null);
    setErrorDetalle('');
    setCargandoDetalle(true);

    try {
      const respuesta = await obtenerProfesorPorId(id);

      if (!respuesta.ok || !respuesta.data) {
        throw new Error(
          respuesta.message || 'No se pudo consultar el profesor'
        );
      }

      setProfesorDetalle(respuesta.data);
    } catch (err) {
      setErrorDetalle(
        err.response?.data?.message ||
        err.message ||
        'Error al consultar el profesor'
      );
    } finally {
      setCargandoDetalle(false);
    }
  }

  function cerrarDetalle() {
    setProfesorDetalle(null);
    setErrorDetalle('');
    setCargandoDetalle(false);
  }

  const mostrarModal =
    profesorDetalle !== null || cargandoDetalle || errorDetalle;

  return (
    <div className="profesores-page">
      <header className="profesores-encabezado">
        <div>
          <span className="profesores-etiqueta">
            COMUNIDAD ACADÉMICA
          </span>
          <h1>Directorio de profesores</h1>
          <p>
            Consulta información de contacto, materias y horarios.
          </p>
        </div>

        <button
          className="profesores-actualizar"
          onClick={cargarProfesores}
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </header>

      <section className="profesores-resumen">
        <div className="profesores-resumen-icono">
          <Users size={25} />
        </div>

        <div>
          <strong>{profesores.length}</strong>
          <span>Profesores registrados en el directorio</span>
        </div>
      </section>

      <section className="profesores-panel">
        <div className="profesores-filtros">
          <div className="profesores-buscador">
            <Search size={19} />

            <input
              type="search"
              placeholder="Buscar por nombre o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            value={materiaSeleccionada}
            onChange={(e) => setMateriaSeleccionada(e.target.value)}
            aria-label="Filtrar por materia"
          >
            <option value="">Todas las materias</option>

            {materiasDisponibles.map(([clave, nombre]) => (
              <option key={clave} value={clave}>
                {nombre} ({clave})
              </option>
            ))}
          </select>
        </div>

        {cargando ? (
          <div className="profesores-estado">
            <div className="spinner"></div>
            <p>Cargando directorio...</p>
          </div>
        ) : error ? (
          <div className="profesores-estado">
            <AlertCircle size={40} color="#dc2626" />
            <h2>No se pudo cargar el directorio</h2>
            <p>{error}</p>
            <button onClick={cargarProfesores}>
              Reintentar
            </button>
          </div>
        ) : profesoresFiltrados.length === 0 ? (
          <div className="profesores-estado">
            <Users size={38} />
            <p>No se encontraron profesores.</p>
          </div>
        ) : (
          <div className="profesores-grid">
            {profesoresFiltrados.map((profesor) => (
              <article
                key={profesor.id}
                className="profesor-card"
              >
                <div className="profesor-card-cabecera">
                  <div className="profesor-avatar">
                    <Users size={24} />
                  </div>

                  <div>
                    <h3>{profesor.nombre}</h3>
                    <p>
                      {profesor.departamento ||
                        'Departamento no disponible'}
                    </p>
                  </div>
                </div>

                <div className="profesor-card-datos">
                  <div>
                    <Mail size={16} />
                    <span>
                      {profesor.correo || 'Correo no disponible'}
                    </span>
                  </div>

                  <div>
                    <MapPin size={16} />
                    <span>
                      Cubículo: {profesor.cubiculo || 'No asignado'}
                    </span>
                  </div>

                  <div>
                    <BookOpen size={16} />
                    <span>
                      {(profesor.materias || []).length} materias
                      registradas
                    </span>
                  </div>

                  <div>
                    <Clock3 size={16} />
                    <span>
                      {(profesor.horarios || []).length} horarios
                      de atención
                    </span>
                  </div>
                </div>

                <button
                  className="profesor-ver"
                  onClick={() => verDetalle(profesor.id)}
                >
                  Ver información completa
                </button>
              </article>
            ))}
          </div>
        )}

        <footer className="profesores-pie">
          Mostrando {profesoresFiltrados.length} de {profesores.length}
          {' '}profesores
        </footer>
      </section>

      {mostrarModal && (
        <div
          className="profesor-modal-fondo"
          onClick={cerrarDetalle}
        >
          <div
            className="profesor-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Información del profesor"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="profesor-modal-cerrar"
              onClick={cerrarDetalle}
              aria-label="Cerrar"
            >
              <X size={21} />
            </button>

            {cargandoDetalle ? (
              <div className="profesores-estado">
                <div className="spinner"></div>
                <p>Consultando información...</p>
              </div>
            ) : errorDetalle ? (
              <div className="profesores-estado">
                <AlertCircle size={35} color="#dc2626" />
                <p>{errorDetalle}</p>
              </div>
            ) : profesorDetalle && (
              <>
                <div className="profesor-modal-header">
                  <div className="profesor-avatar">
                    <Users size={28} />
                  </div>

                  <div>
                    <h2>{profesorDetalle.nombre}</h2>
                    <p>
                      {profesorDetalle.departamento ||
                        'Departamento no disponible'}
                    </p>
                  </div>
                </div>

                <div className="profesor-modal-info">
                  <p>
                    <Mail size={17} />
                    {profesorDetalle.correo || 'Sin correo'}
                  </p>

                  <p>
                    <Building2 size={17} />
                    Cubículo: {profesorDetalle.cubiculo || 'No asignado'}
                  </p>
                </div>

                <h3>Materias que imparte</h3>

                {(profesorDetalle.materias || []).length > 0 ? (
                  <div className="profesor-materias">
                    {profesorDetalle.materias.map((materia, indice) => (
                      <div key={materia.id || indice}>
                        <strong>{materia.nombre_materia}</strong>
                        <span>
                          {materia.clave_materia} · Grupo{' '}
                          {materia.letra_grupo || '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="profesor-sin-datos">
                    No hay materias registradas.
                  </p>
                )}

                <h3>Horarios de atención</h3>

                {(profesorDetalle.horarios || []).length > 0 ? (
                  <div className="profesor-horarios">
                    {ordenarHorarios(profesorDetalle.horarios).map(
                      (horario, indice) => (
                        <div key={horario.id || indice}>
                          <span>{horario.dia}</span>
                          <strong>
                            {formatearHora(horario.hora_inicio)}
                            {' - '}
                            {formatearHora(horario.hora_fin)}
                          </strong>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="profesor-sin-datos">
                    No hay horarios de atención registrados.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
