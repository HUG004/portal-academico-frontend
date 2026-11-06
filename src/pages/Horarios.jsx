
import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Clock3,
  MapPin,
  BookOpen,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

import { obtenerHorarios } from '../api/academicoApi';
import '../styles/horarios.css';

const DIAS = [
  { clave: 'lunes', nombre: 'Lunes' },
  { clave: 'martes', nombre: 'Martes' },
  { clave: 'miercoles', nombre: 'Miércoles' },
  { clave: 'jueves', nombre: 'Jueves' },
  { clave: 'viernes', nombre: 'Viernes' },
  { clave: 'sabado', nombre: 'Sábado' },
];

// Convierte una hora HH:MM a minutos desde medianoche.
function aMinutos(hora) {
  const partes = /^(\d{1,2}):(\d{2})$/.exec(hora || '');
  if (!partes) return null;

  const horas = Number(partes[1]);
  const minutos = Number(partes[2]);

  if (horas > 23 || minutos > 59) return null;

  return horas * 60 + minutos;
}

function formatearHora(minutos) {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;

  return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Interpreta los rangos "12:00-13:00" del SII.
function interpretarRango(valor) {
  if (!valor || typeof valor !== 'string') return null;

  const coincidencia = valor.match(
    /(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/
  );

  if (!coincidencia) return null;

  const inicio = aMinutos(coincidencia[1]);
  const fin = aMinutos(coincidencia[2]);

  if (inicio === null || fin === null || fin <= inicio) {
    return null;
  }

  return { inicio, fin };
}

function obtenerSesiones(materias) {
  const sesiones = [];

  materias.forEach((materia, indice) => {
    DIAS.forEach((dia) => {
      const rango = interpretarRango(materia[dia.clave]);

      if (!rango) return;

      sesiones.push({
        id: `${indice}-${dia.clave}`,
        materia: materia.nombre_materia || 'Materia sin nombre',
        clave: materia.clave_materia || '',
        dia: dia.clave,
        diaNombre: dia.nombre,
        salon: materia[`${dia.clave}_clave_salon`] || 'No asignado',
        inicio: rango.inicio,
        fin: rango.fin,
        horario: `${formatearHora(rango.inicio)} - ${formatearHora(rango.fin)}`,
      });
    });
  });

  return sesiones.sort((a, b) =>
    a.inicio - b.inicio || a.fin - b.fin
  );
}

export default function Horarios() {
  const [periodos, setPeriodos] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  async function cargarHorarios() {
    setCargando(true);
    setError('');

    try {
      const respuesta = await obtenerHorarios();

      if (!respuesta.ok || !Array.isArray(respuesta.data)) {
        throw new Error(
          respuesta.message || 'Respuesta de horarios inválida'
        );
      }

      setPeriodos(respuesta.data);
      setPeriodoSeleccionado((anterior) =>
        anterior < respuesta.data.length ? anterior : 0
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'No se pudo consultar el horario'
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarHorarios();
  }, []);

  const periodoActual = periodos[periodoSeleccionado];

  const materias = useMemo(() => {
    return Array.isArray(periodoActual?.horario)
      ? periodoActual.horario
      : [];
  }, [periodoActual]);

  const sesiones = useMemo(
    () => obtenerSesiones(materias),
    [materias]
  );

  const horas = useMemo(() => {
    if (sesiones.length === 0) return [];

    const inicio = Math.floor(
      Math.min(...sesiones.map((s) => s.inicio)) / 60
    ) * 60;

    const fin = Math.ceil(
      Math.max(...sesiones.map((s) => s.fin)) / 60
    ) * 60;

    const resultado = [];

    for (let minuto = inicio; minuto < fin; minuto += 60) {
      resultado.push(minuto);
    }

    return resultado;
  }, [sesiones]);

  const diasConClases = new Set(
    sesiones.map((sesion) => sesion.dia)
  ).size;

  if (cargando) {
    return (
      <div className="horarios-estado">
        <div className="spinner"></div>
        <p>Consultando horarios del SII...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="horarios-estado">
        <AlertCircle size={42} color="#dc2626" />
        <h2>No se pudo cargar el horario</h2>
        <p>{error}</p>
        <button onClick={cargarHorarios}>
          <RefreshCw size={17} />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="horarios-page">
      <header className="horarios-encabezado">
        <div>
          <span className="horarios-etiqueta">
            ORGANIZACIÓN ACADÉMICA
          </span>
          <h1>Mi horario de clases</h1>
          <p>Consulta tus materias, aulas y horarios semanales.</p>
        </div>

        <button
          className="horarios-actualizar"
          onClick={cargarHorarios}
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </header>

      <section className="horarios-resumen">
        <article className="horarios-indicador">
          <div className="horarios-icono">
            <BookOpen size={22} />
          </div>
          <span>Materias registradas</span>
          <strong>{materias.length}</strong>
        </article>

        <article className="horarios-indicador">
          <div className="horarios-icono">
            <CalendarDays size={22} />
          </div>
          <span>Días con clases</span>
          <strong>{diasConClases}</strong>
        </article>

        <article className="horarios-indicador">
          <div className="horarios-icono">
            <Clock3 size={22} />
          </div>
          <span>Sesiones semanales</span>
          <strong>{sesiones.length}</strong>
        </article>
      </section>

      <section className="horarios-panel">
        <div className="horarios-panel-header">
          <div>
            <h2>Horario semanal</h2>
            <p>Distribución de clases por día y hora</p>
          </div>

          <select
            value={periodoSeleccionado}
            onChange={(e) =>
              setPeriodoSeleccionado(Number(e.target.value))
            }
            aria-label="Seleccionar periodo académico"
          >
            {periodos.map((p, indice) => (
              <option key={indice} value={indice}>
                {typeof p.periodo === 'string'
                  ? p.periodo
                  : p.periodo?.descripcion_periodo ||
                    p.periodo?.clave_periodo ||
                    `Periodo ${indice + 1}`}
              </option>
            ))}
          </select>
        </div>

        {sesiones.length > 0 ? (
          <div className="horarios-calendario-scroll">
            <div
              className="horarios-calendario"
              style={{
                '--horas': horas.length,
              }}
            >
              <div className="horarios-celda-encabezado">
                Hora
              </div>

              {DIAS.map((dia) => (
                <div
                  key={dia.clave}
                  className="horarios-celda-encabezado"
                >
                  {dia.nombre}
                </div>
              ))}

              {horas.map((hora) => (
                <div
                  key={`fila-${hora}`}
                  className="horarios-fila"
                >
                  <div className="horarios-hora">
                    {formatearHora(hora)}
                  </div>

                  {DIAS.map((dia) => {
                    const enCelda = sesiones.filter(
                      (s) =>
                        s.dia === dia.clave &&
                        s.inicio < hora + 60 &&
                        s.fin > hora
                    );

                    return (
                      <div
                        key={`${dia.clave}-${hora}`}
                        className="horarios-celda"
                      >
                        {enCelda.map((sesion) => (
                          <div
                            key={sesion.id}
                            className="horarios-clase"
                          >
                            <strong>{sesion.materia}</strong>
                            <span>
                              <Clock3 size={12} />
                              {sesion.horario}
                            </span>
                            <span>
                              <MapPin size={12} />
                              {sesion.salon}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="horarios-vacio">
            <CalendarDays size={36} />
            <p>No hay clases registradas para este periodo.</p>
          </div>
        )}
      </section>

    </div>
  );
}
