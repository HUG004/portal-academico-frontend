import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Search,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  ClipboardList,
  CheckCircle2,
} from 'lucide-react';

import { obtenerCalificaciones } from '../api/academicoApi';
import '../styles/calificaciones.css';

// Convertir valores del SII a números cuando sean válidos.
function convertirNota(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return null;
  }

  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : null;
}

// Calcular el promedio de las unidades capturadas.
// Este NO es el promedio final oficial.
function calcularPromedio(unidades) {
  const notas = unidades.filter((nota) => nota !== null);

  if (notas.length === 0) return null;

  const suma = notas.reduce((total, nota) => total + nota, 0);
  return suma / notas.length;
}

// Clasificación visual; 70 es la mínima aprobatoria.
function claseNota(nota) {
  if (nota === null) return 'sin-nota';
  if (nota >= 70) return 'nota-alta';
  if (nota >= 60) return 'nota-media';
  return 'nota-baja';
}

function formatearPromedio(numero) {
  return numero === null ? '—' : numero.toFixed(1);
}

export default function Calificaciones() {
  const [periodos, setPeriodos] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  async function cargarCalificaciones() {
    setCargando(true);
    setError('');

    try {
      const respuesta = await obtenerCalificaciones();

      if (!respuesta.ok || !Array.isArray(respuesta.data)) {
        throw new Error(
          respuesta.message || 'Respuesta de calificaciones inválida'
        );
      }

      setPeriodos(respuesta.data);

      setPeriodoSeleccionado((anterior) => {
        const existe = respuesta.data.some(
          (p) => p.periodo?.clave_periodo === anterior
        );

        return existe
          ? anterior
          : (respuesta.data[0]?.periodo?.clave_periodo || '');
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'No se pudieron consultar las calificaciones'
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCalificaciones();
  }, []);

  // Obtener materias del periodo seleccionado.
  const materias = useMemo(() => {
    const periodo = periodos.find(
      (p) => p.periodo?.clave_periodo === periodoSeleccionado
    );

    if (!periodo || !Array.isArray(periodo.materias)) return [];

    return periodo.materias.map((registro, indice) => {
      const informacion = registro.materia || {};

      const unidades = [1, 2, 3, 4].map((numero) => {
        const calificacion = (registro.calificaiones || []).find(
          (item) => Number(item.numero_calificacion) === numero
        );

        return convertirNota(calificacion?.calificacion);
      });

      return {
        id: `${informacion.id_grupo ?? indice}-${indice}`,
        nombre: informacion.nombre_materia || 'Materia sin nombre',
        clave: informacion.clave_materia || '',
        grupo: informacion.letra_grupo || '',
        unidades,
        promedio: calcularPromedio(unidades),
      };
    });
  }, [periodos, periodoSeleccionado]);

  // Búsqueda por nombre, clave o grupo.
  const materiasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es-MX');

    if (!texto) return materias;

    return materias.filter((materia) =>
      `${materia.nombre} ${materia.clave} ${materia.grupo}`
        .toLocaleLowerCase('es-MX')
        .includes(texto)
    );
  }, [materias, busqueda]);

  // Indicadores calculados sobre todas las materias del periodo.
  const estadisticas = useMemo(() => {
    const todasLasNotas = materias.flatMap((m) =>
      m.unidades.filter((nota) => nota !== null)
    );

    const promedio =
      todasLasNotas.length > 0
        ? todasLasNotas.reduce((a, b) => a + b, 0) /
          todasLasNotas.length
        : null;

    return {
      totalMaterias: materias.length,
      promedio,
      capturadas: todasLasNotas.length,
      posibles: materias.length * 4,
    };
  }, [materias]);

  if (cargando) {
    return (
      <div className="calificaciones-estado">
        <div className="spinner"></div>
        <p>Consultando calificaciones del SII...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calificaciones-estado">
        <AlertCircle size={42} color="#dc2626" />
        <h2>No se pudieron cargar las calificaciones</h2>
        <p>{error}</p>
        <button onClick={cargarCalificaciones}>
          <RefreshCw size={18} />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="calificaciones-page">
      <header className="calificaciones-encabezado">
        <div>
          <span className="calificaciones-etiqueta">
            INFORMACIÓN ACADÉMICA
          </span>
          <h1>Mis calificaciones</h1>
          <p>
            Consulta tus evaluaciones por unidad y periodo académico.
          </p>
        </div>

        <button
          className="calificaciones-actualizar"
          onClick={cargarCalificaciones}
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </header>

      <section className="calificaciones-resumen">
        <article className="calificaciones-indicador">
          <div className="indicador-icono indicador-azul">
            <BookOpen size={22} />
          </div>
          <span>Materias inscritas</span>
          <strong>{estadisticas.totalMaterias}</strong>
        </article>

        <article className="calificaciones-indicador">
          <div className="indicador-icono indicador-verde">
            <TrendingUp size={22} />
          </div>
          <span>Promedio parcial de unidades</span>
          <strong>
            {formatearPromedio(estadisticas.promedio)}
          </strong>
        </article>

        <article className="calificaciones-indicador">
          <div className="indicador-icono indicador-morado">
            <ClipboardList size={22} />
          </div>
          <span>Unidades capturadas</span>
          <strong>
            {estadisticas.capturadas}/{estadisticas.posibles}
          </strong>
        </article>
      </section>

      <section className="calificaciones-panel">
        <div className="calificaciones-filtros">
          <div className="calificaciones-buscador">
            <Search size={19} />

            <input
              type="search"
              placeholder="Buscar materia o clave..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar materia"
            />
          </div>

          <select
            value={periodoSeleccionado}
            onChange={(e) => setPeriodoSeleccionado(e.target.value)}
            aria-label="Seleccionar periodo"
          >
            {periodos.map((p, indice) => (
              <option
                key={`${p.periodo?.clave_periodo}-${indice}`}
                value={p.periodo?.clave_periodo || ''}
              >
                {p.periodo?.descripcion_periodo ||
                  p.periodo?.clave_periodo ||
                  'Periodo sin descripción'}
              </option>
            ))}
          </select>
        </div>

        <div className="calificaciones-tabla-scroll">
          <table className="calificaciones-tabla">
            <thead>
              <tr>
                <th>Materia</th>
                <th>Grupo</th>
                <th>U1</th>
                <th>U2</th>
                <th>U3</th>
                <th>U4</th>
                <th>Promedio parcial</th>
              </tr>
            </thead>

            <tbody>
              {materiasFiltradas.map((materia) => (
                <tr key={materia.id}>
                  <td>
                    <div className="materia-nombre">
                      {materia.nombre}
                    </div>

                    <div className="materia-clave">
                      {materia.clave}
                    </div>
                  </td>

                  <td>{materia.grupo || '—'}</td>

                  {materia.unidades.map((nota, indice) => (
                    <td key={indice}>
                      <span
                        className={`nota-etiqueta ${claseNota(nota)}`}
                      >
                        {nota === null ? '—' : nota}
                      </span>
                    </td>
                  ))}

                  <td>
                    <strong
                      className={`promedio-materia ${claseNota(
                        materia.promedio
                      )}`}
                    >
                      {formatearPromedio(materia.promedio)}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {materiasFiltradas.length === 0 && (
          <div className="calificaciones-vacio">
            <BookOpen size={35} />
            <p>No se encontraron materias para mostrar.</p>
          </div>
        )}

        <div className="calificaciones-pie">
          <span>
            <CheckCircle2 size={16} />
            Mostrando {materiasFiltradas.length} de {materias.length} materias
          </span>

          <div className="calificaciones-leyenda">
            <span><i className="leyenda-verde"></i> 70–100</span>
            <span><i className="leyenda-amarilla"></i> 60–69</span>
            <span><i className="leyenda-roja"></i> 0–59</span>
          </div>
        </div>
      </section>

      <p className="calificaciones-aviso">
        Los promedios mostrados son cálculos informativos de las
        unidades registradas, no calificaciones finales oficiales.
        Las unidades sin captura no se consideran en el cálculo.
      </p>
    </div>
  );
}
