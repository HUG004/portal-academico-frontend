
import { useEffect, useMemo, useState } from 'react';
import {
  Library,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';

import { obtenerKardex } from '../api/academicoApi';
import '../styles/kardex.css';

function interpretarCalificacion(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return null;
  }

  const texto = String(valor).trim().toUpperCase();

  if (texto === 'AC') return 'AC';

  const numero = Number(texto);
  return Number.isFinite(numero) ? numero : texto;
}

function obtenerEstado(registro) {
  const descripcion = String(registro.descripcion || '')
    .trim()
    .toLowerCase();

  const calificacion = interpretarCalificacion(
    registro.calificacion
  );

  // Priorizar el resultado explícito del SII.
  if (/no acreditad|reprobad/.test(descripcion)) {
    return 'Reprobada';
  }

  if (/acreditad|aprobad/.test(descripcion)) {
    return 'Aprobada';
  }

  if (calificacion === 'AC') {
    return 'Aprobada';
  }

  if (typeof calificacion === 'number') {
    return calificacion >= 70 ? 'Aprobada' : 'Reprobada';
  }

  return 'Sin determinar';
}

function formatearCalificacion(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return '—';
  }

  return String(valor);
}

export default function Kardex() {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [semestre, setSemestre] = useState('todos');
  const [estado, setEstado] = useState('todos');

  async function cargarKardex() {
    setCargando(true);
    setError('');

    try {
      const respuesta = await obtenerKardex();

      if (!respuesta.ok || !Array.isArray(respuesta.data?.kardex)) {
        throw new Error(
          respuesta.message || 'Formato de Kardex no válido'
        );
      }

      setDatos(respuesta.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'No fue posible consultar el Kardex'
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarKardex();
  }, []);

  const materias = useMemo(() => {
    if (!datos?.kardex) return [];

    return datos.kardex.map((registro, indice) => ({
      ...registro,
      identificador: indice,
      estadoCalculado: obtenerEstado(registro),
    }));
  }, [datos]);

  const semestres = useMemo(() => {
    return [...new Set(
      materias
        .map((materia) => materia.semestre)
        .filter((valor) =>
          valor !== null &&
          valor !== undefined &&
          valor !== ''
        )
        .map(String)
    )].sort((a, b) =>
      Number(a) - Number(b)
    );
  }, [materias]);

  const materiasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es-MX');

    return materias.filter((materia) => {
      const coincideBusqueda =
        `${materia.nombre_materia || ''} ${materia.clave_materia || ''}`
          .toLocaleLowerCase('es-MX')
          .includes(texto);

      const coincideSemestre =
        semestre === 'todos' ||
        String(materia.semestre) === semestre;

      const coincideEstado =
        estado === 'todos' ||
        materia.estadoCalculado === estado;

      return coincideBusqueda && coincideSemestre && coincideEstado;
    });
  }, [materias, busqueda, semestre, estado]);

  const estadisticas = useMemo(() => ({
    aprobadas: materias.filter(
      (m) => m.estadoCalculado === 'Aprobada'
    ).length,
    reprobadas: materias.filter(
      (m) => m.estadoCalculado === 'Reprobada'
    ).length,
    sinDeterminar: materias.filter(
      (m) => m.estadoCalculado === 'Sin determinar'
    ).length,
  }), [materias]);

  const avance = Number(datos?.porcentaje_avance);
  const avanceValido = Number.isFinite(avance)
    ? Math.max(0, Math.min(100, avance))
    : 0;

  if (cargando) {
    return (
      <div className="kardex-estado-pagina">
        <div className="spinner"></div>
        <p>Consultando historial académico...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kardex-estado-pagina">
        <AlertCircle size={42} color="#dc2626" />
        <h2>No se pudo cargar el Kardex</h2>
        <p>{error}</p>
        <button onClick={cargarKardex}>
          <RefreshCw size={17} />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="kardex-page">
      <header className="kardex-encabezado">
        <div>
          <span className="kardex-etiqueta">
            HISTORIAL ACADÉMICO
          </span>
          <h1>Mi Kardex académico</h1>
          <p>
            Consulta tus materias, calificaciones y créditos.
          </p>
        </div>

        <button
          className="kardex-actualizar"
          onClick={cargarKardex}
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </header>

      <section className="kardex-resumen">
        <article className="kardex-indicador">
          <div className="kardex-icono">
            <CheckCircle2 size={23} />
          </div>
          <span>Registros aprobados</span>
          <strong>{estadisticas.aprobadas}</strong>
        </article>

        <article className="kardex-indicador">
          <div className="kardex-icono">
            <XCircle size={23} />
          </div>
          <span>Registros reprobados</span>
          <strong>{estadisticas.reprobadas}</strong>
        </article>

        <article className="kardex-indicador">
          <div className="kardex-icono">
            <TrendingUp size={23} />
          </div>
          <span>Avance académico</span>
          <strong>
            {Number.isFinite(avance)
              ? `${avance.toFixed(1)}%`
              : '—'}
          </strong>
        </article>
      </section>

      <section className="kardex-progreso">
        <div className="kardex-progreso-titulo">
          <h3>Progreso del plan de estudios</h3>
          <strong>
            {Number.isFinite(avance)
              ? `${avance.toFixed(1)}%`
              : '—'}
          </strong>
        </div>

        <div
          className="kardex-barra"
          role="progressbar"
          aria-valuenow={avanceValido}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div style={{ width: `${avanceValido}%` }} />
        </div>
      </section>

      <section className="kardex-panel">
        <div className="kardex-filtros">
          <div className="kardex-buscador">
            <Search size={19} />

            <input
              type="search"
              placeholder="Buscar materia o clave..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            value={semestre}
            onChange={(e) => setSemestre(e.target.value)}
            aria-label="Filtrar por semestre"
          >
            <option value="todos">Todos los semestres</option>

            {semestres.map((numero) => (
              <option key={numero} value={numero}>
                Semestre {numero}
              </option>
            ))}
          </select>

          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            aria-label="Filtrar por resultado"
          >
            <option value="todos">Todos los resultados</option>
            <option value="Aprobada">Aprobadas</option>
            <option value="Reprobada">Reprobadas</option>
          </select>
        </div>

        <div className="kardex-tabla-scroll">
          <table className="kardex-tabla">
            <thead>
              <tr>
                <th>Materia</th>
                <th>Periodo</th>
                <th>Semestre</th>
                <th>Créditos</th>
                <th>Calificación</th>
                <th>Resultado</th>
              </tr>
            </thead>

            <tbody>
              {materiasFiltradas.map((materia) => (
                <tr key={materia.identificador}>
                  <td>
                    <strong className="kardex-materia-nombre">
                      {materia.nombre_materia || '—'}
                    </strong>

                    <span className="kardex-materia-clave">
                      {materia.clave_materia || '—'}
                    </span>
                  </td>

                  <td>{materia.periodo || '—'}</td>
                  <td>{materia.semestre ?? '—'}</td>
                  <td>{materia.creditos ?? '—'}</td>

                  <td>
                    <strong>
                      {formatearCalificacion(
                        materia.calificacion
                      )}
                    </strong>
                  </td>

                  <td>
                    <span
                      className={`kardex-resultado ${
                        materia.estadoCalculado === 'Aprobada'
                          ? 'aprobada'
                          : materia.estadoCalculado === 'Reprobada'
                          ? 'reprobada'
                          : 'pendiente'
                      }`}
                    >
                      {materia.estadoCalculado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {materiasFiltradas.length === 0 && (
          <div className="kardex-vacio">
            <Library size={35} />
            <p>No se encontraron materias.</p>
          </div>
        )}

        <footer className="kardex-pie">
          <span>
            Mostrando {materiasFiltradas.length} de {materias.length} registros
          </span>

          {estadisticas.sinDeterminar > 0 && (
            <span>
              {estadisticas.sinDeterminar} sin resultado determinado
            </span>
          )}
        </footer>
      </section>

      <p className="kardex-aviso">
        El historial conserva los registros repetidos de una misma
        materia. Los resultados se interpretan a partir de la
        descripción y calificación recibidas del SII.
      </p>
    </div>
  );
}
