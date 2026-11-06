
import { useEffect, useState } from 'react';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  Save,
  BookOpen,
  Clock3,
} from 'lucide-react';

import {
  obtenerProfesoresAdmin,
  crearMateriaAdmin,
  actualizarMateriaAdmin,
  eliminarMateriaAdmin,
  crearHorarioAdmin,
  actualizarHorarioAdmin,
  eliminarHorarioAdmin,
} from '../../api/adminApi';

import '../../styles/gestionProfesor.css';

const MATERIA_VACIA = {
  clave_materia: '',
  nombre_materia: '',
  clave_periodo: '',
  letra_grupo: '',
};

const HORARIO_VACIO = {
  dia: 'lunes',
  hora_inicio: '',
  hora_fin: '',
};

const DIAS = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
];

function obtenerError(err) {
  const errores = err.response?.data?.errors;

  if (errores) {
    return Object.values(errores).flat().join(' ');
  }

  return (
    err.response?.data?.message ||
    err.message ||
    'Ocurrió un error inesperado'
  );
}

function horaCorta(hora) {
  return hora ? String(hora).slice(0, 5) : '';
}

export default function GestionProfesor({
  profesor,
  onClose,
  onActualizado,
}) {
  const [datos, setDatos] = useState(profesor);
  const [pestana, setPestana] = useState('materias');

  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [registroEditando, setRegistroEditando] = useState(null);

  const [formMateria, setFormMateria] = useState(MATERIA_VACIA);
  const [formHorario, setFormHorario] = useState(HORARIO_VACIO);

  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    setDatos(profesor);
    setPestana('materias');
    setFormularioAbierto(false);
    setRegistroEditando(null);
    setError('');
    setMensaje('');
  }, [profesor]);

  async function actualizarDatos() {
    setCargando(true);

    try {
      const respuesta = await obtenerProfesoresAdmin();

      if (!respuesta.ok || !Array.isArray(respuesta.data)) {
        throw new Error('No se pudo actualizar el profesor');
      }

      const actualizado = respuesta.data.find(
        (item) => item.id === profesor.id
      );

      if (!actualizado) {
        throw new Error('Profesor no encontrado');
      }

      setDatos(actualizado);

      if (onActualizado) {
        await onActualizado();
      }
    } catch (err) {
      setError(obtenerError(err));
    } finally {
      setCargando(false);
    }
  }

  function cambiarPestana(nueva) {
    setPestana(nueva);
    setFormularioAbierto(false);
    setRegistroEditando(null);
    setError('');
    setMensaje('');
  }

  function abrirNuevo() {
    setRegistroEditando(null);
    setError('');

    if (pestana === 'materias') {
      setFormMateria({ ...MATERIA_VACIA });
    } else {
      setFormHorario({ ...HORARIO_VACIO });
    }

    setFormularioAbierto(true);
  }

  function abrirEditar(registro) {
    setRegistroEditando(registro);
    setError('');

    if (pestana === 'materias') {
      setFormMateria({
        clave_materia: registro.clave_materia || '',
        nombre_materia: registro.nombre_materia || '',
        clave_periodo: registro.clave_periodo || '',
        letra_grupo: registro.letra_grupo || '',
      });
    } else {
      setFormHorario({
        dia: registro.dia || 'lunes',
        hora_inicio: horaCorta(registro.hora_inicio),
        hora_fin: horaCorta(registro.hora_fin),
      });
    }

    setFormularioAbierto(true);
  }

  function cambiarMateria(e) {
    const { name, value } = e.target;

    setFormMateria((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function cambiarHorario(e) {
    const { name, value } = e.target;

    setFormHorario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setError('');
    setMensaje('');

    try {
      let respuesta;

      if (pestana === 'materias') {
        const payload = {
          clave_materia: formMateria.clave_materia.trim(),
          nombre_materia:
            formMateria.nombre_materia.trim() || null,
          clave_periodo:
            formMateria.clave_periodo.trim() || null,
          letra_grupo:
            formMateria.letra_grupo.trim() || null,
        };

        if (registroEditando) {
          respuesta = await actualizarMateriaAdmin(
            registroEditando.id,
            payload
          );
        } else {
          respuesta = await crearMateriaAdmin(datos.id, payload);
        }
      } else {
        const payload = {
          dia: formHorario.dia,
          hora_inicio: formHorario.hora_inicio,
          hora_fin: formHorario.hora_fin,
        };

        if (payload.hora_fin <= payload.hora_inicio) {
          throw new Error(
            'La hora de fin debe ser posterior a la hora de inicio'
          );
        }

        if (registroEditando) {
          respuesta = await actualizarHorarioAdmin(
            registroEditando.id,
            payload
          );
        } else {
          respuesta = await crearHorarioAdmin(datos.id, payload);
        }
      }

      if (!respuesta.ok) {
        throw new Error(
          respuesta.message || 'No se pudo guardar el registro'
        );
      }

      setMensaje(respuesta.message || 'Registro guardado');
      setFormularioAbierto(false);
      setRegistroEditando(null);

      await actualizarDatos();
    } catch (err) {
      setError(obtenerError(err));
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(registro) {
    const tipo = pestana === 'materias'
      ? 'esta materia'
      : 'este horario';

    if (!window.confirm(`¿Eliminar ${tipo}?`)) {
      return;
    }

    setGuardando(true);
    setError('');
    setMensaje('');

    try {
      const respuesta = pestana === 'materias'
        ? await eliminarMateriaAdmin(registro.id)
        : await eliminarHorarioAdmin(registro.id);

      if (!respuesta.ok) {
        throw new Error(
          respuesta.message || 'No se pudo eliminar'
        );
      }

      setMensaje(respuesta.message || 'Registro eliminado');
      await actualizarDatos();
    } catch (err) {
      setError(obtenerError(err));
    } finally {
      setGuardando(false);
    }
  }

  const registros = pestana === 'materias'
    ? datos.materias || []
    : datos.horarios || [];

  return (
    <div className="gestion-fondo" onClick={onClose}>
      <div
        className="gestion-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Gestión del profesor"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="gestion-header">
          <div>
            <span>GESTIÓN ACADÉMICA</span>
            <h2>{datos.nombre}</h2>
            <p>Administra sus materias y horarios de atención.</p>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar gestión"
            disabled={guardando}
          >
            <X size={21} />
          </button>
        </header>

        <div className="gestion-pestanas">
          <button
            className={pestana === 'materias' ? 'activa' : ''}
            onClick={() => cambiarPestana('materias')}
          >
            <BookOpen size={18} />
            Materias ({(datos.materias || []).length})
          </button>

          <button
            className={pestana === 'horarios' ? 'activa' : ''}
            onClick={() => cambiarPestana('horarios')}
          >
            <Clock3 size={18} />
            Horarios ({(datos.horarios || []).length})
          </button>
        </div>

        {error && (
          <div className="gestion-error">{error}</div>
        )}

        {mensaje && (
          <div className="gestion-exito">{mensaje}</div>
        )}

        <div className="gestion-barra">
          <h3>
            {pestana === 'materias'
              ? 'Materias asignadas'
              : 'Horarios de atención'}
          </h3>

          <button
            onClick={abrirNuevo}
            disabled={guardando || cargando}
          >
            <Plus size={17} />
            {pestana === 'materias'
              ? 'Agregar materia'
              : 'Agregar horario'}
          </button>
        </div>

        {formularioAbierto && (
          <form className="gestion-formulario" onSubmit={guardar}>
            <h3>
              {registroEditando ? 'Editar' : 'Registrar'}{' '}
              {pestana === 'materias' ? 'materia' : 'horario'}
            </h3>

            {pestana === 'materias' ? (
              <div className="gestion-campos">
                <label>
                  Clave de materia *
                  <input
                    name="clave_materia"
                    value={formMateria.clave_materia}
                    onChange={cambiarMateria}
                    maxLength={50}
                    required
                  />
                </label>

                <label>
                  Nombre de materia
                  <input
                    name="nombre_materia"
                    value={formMateria.nombre_materia}
                    onChange={cambiarMateria}
                    maxLength={255}
                  />
                </label>

                <label>
                  Clave de periodo
                  <input
                    name="clave_periodo"
                    value={formMateria.clave_periodo}
                    onChange={cambiarMateria}
                    maxLength={20}
                  />
                </label>

                <label>
                  Grupo
                  <input
                    name="letra_grupo"
                    value={formMateria.letra_grupo}
                    onChange={cambiarMateria}
                    maxLength={5}
                  />
                </label>
              </div>
            ) : (
              <div className="gestion-campos">
                <label>
                  Día de atención *
                  <select
                    name="dia"
                    value={formHorario.dia}
                    onChange={cambiarHorario}
                    required
                  >
                    {DIAS.map((dia) => (
                      <option key={dia} value={dia}>
                        {dia.charAt(0).toUpperCase() + dia.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Hora de inicio *
                  <input
                    type="time"
                    name="hora_inicio"
                    value={formHorario.hora_inicio}
                    onChange={cambiarHorario}
                    required
                  />
                </label>

                <label>
                  Hora de fin *
                  <input
                    type="time"
                    name="hora_fin"
                    value={formHorario.hora_fin}
                    onChange={cambiarHorario}
                    required
                  />
                </label>
              </div>
            )}

            <div className="gestion-form-acciones">
              <button
                type="button"
                className="gestion-cancelar"
                onClick={() => setFormularioAbierto(false)}
                disabled={guardando}
              >
                Cancelar
              </button>

              <button type="submit" disabled={guardando}>
                <Save size={16} />
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        )}

        {cargando ? (
          <p className="gestion-vacio">Actualizando información...</p>
        ) : registros.length === 0 ? (
          <p className="gestion-vacio">
            No hay {pestana === 'materias' ? 'materias' : 'horarios'}
            {' '}registrados.
          </p>
        ) : (
          <div className="gestion-tabla-scroll">
            <table className="gestion-tabla">
              <thead>
                {pestana === 'materias' ? (
                  <tr>
                    <th>Materia</th>
                    <th>Periodo</th>
                    <th>Grupo</th>
                    <th>Acciones</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Día</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th>Acciones</th>
                  </tr>
                )}
              </thead>

              <tbody>
                {registros.map((registro) => (
                  <tr key={registro.id}>
                    {pestana === 'materias' ? (
                      <>
                        <td>
                          <strong>
                            {registro.nombre_materia ||
                              registro.clave_materia}
                          </strong>
                          <small>{registro.clave_materia}</small>
                        </td>
                        <td>{registro.clave_periodo || '—'}</td>
                        <td>{registro.letra_grupo || '—'}</td>
                      </>
                    ) : (
                      <>
                        <td>{registro.dia}</td>
                        <td>{horaCorta(registro.hora_inicio)}</td>
                        <td>{horaCorta(registro.hora_fin)}</td>
                      </>
                    )}

                    <td>
                      <div className="gestion-acciones">
                        <button
                          onClick={() => abrirEditar(registro)}
                          disabled={guardando || cargando}
                          title="Editar"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="eliminar"
                          onClick={() => eliminar(registro)}
                          disabled={guardando || cargando}
                          title="Eliminar"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
