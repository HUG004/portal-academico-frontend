
import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  RefreshCw,
  AlertCircle,
  BookOpen,
  Clock3,
  Settings2,
} from 'lucide-react';

import {
  obtenerProfesoresAdmin,
  crearProfesorAdmin,
  actualizarProfesorAdmin,
  eliminarProfesorAdmin,
  crearMateriaAdmin,
  actualizarMateriaAdmin,
  eliminarMateriaAdmin,
  crearHorarioAdmin,
  actualizarHorarioAdmin,
  eliminarHorarioAdmin,
} from '../../api/adminApi';

import '../../styles/adminProfesores.css';
import '../../styles/adminGestionProfesor.css';

const FORMULARIO_PROFESOR = {
  nombre: '',
  correo: '',
  cubiculo: '',
  departamento: '',
};

const FORMULARIO_MATERIA = {
  clave_materia: '',
  nombre_materia: '',
  clave_periodo: '',
  letra_grupo: '',
};

const FORMULARIO_HORARIO = {
  dia: 'lunes',
  hora_inicio: '09:00',
  hora_fin: '10:00',
};

const DIAS = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
];

// Horario escolar: 07:00 a 19:00
// Intervalos de 30 minutos
const HORAS_DISPONIBLES = [];

for (let hora = 7; hora <= 19; hora++) {
  for (let minuto of [0, 30]) {
    if (hora === 19 && minuto === 30) continue;

    const valor =
      String(hora).padStart(2, '0') +
      ':' +
      String(minuto).padStart(2, '0');

    HORAS_DISPONIBLES.push(valor);
  }
}

function mostrarError(err) {
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

function validarRespuesta(respuesta) {
  if (respuesta?.ok === false) {
    throw new Error(
      respuesta.message || 'La operación no pudo completarse'
    );
  }
}

function nombreDia(dia) {
  const nombres = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
  };

  return nombres[dia] || dia;
}

function normalizarHora(hora) {
  return String(hora || '').slice(0, 5);
}

/* ============================================
   GESTIÓN DE MATERIAS Y HORARIOS
============================================ */

function GestionProfesor({
  profesor,
  onClose,
  onActualizado,
}) {
  const [pestana, setPestana] = useState('materias');
  const [materias, setMaterias] = useState(
    profesor.materias || []
  );
  const [horarios, setHorarios] = useState(
    profesor.horarios || []
  );

  const [editandoId, setEditandoId] = useState(null);
  const [formMateria, setFormMateria] = useState({
    ...FORMULARIO_MATERIA,
  });
  const [formHorario, setFormHorario] = useState({
    ...FORMULARIO_HORARIO,
  });

  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  function cambiarPestana(nueva) {
    setPestana(nueva);
    setEditandoId(null);
    setError('');
    setMensaje('');
    setFormMateria({ ...FORMULARIO_MATERIA });
    setFormHorario({ ...FORMULARIO_HORARIO });
  }

  function limpiarFormulario() {
    setEditandoId(null);
    setError('');
    setFormMateria({ ...FORMULARIO_MATERIA });
    setFormHorario({ ...FORMULARIO_HORARIO });
  }

  async function actualizarListado() {
    const respuesta = await obtenerProfesoresAdmin();

    if (
      respuesta?.ok === false ||
      !Array.isArray(respuesta?.data)
    ) {
      throw new Error('No se pudo actualizar la información');
    }

    const actualizado = respuesta.data.find(
      (item) => String(item.id) === String(profesor.id)
    );

    if (!actualizado) {
      throw new Error('No se encontró el profesor actualizado');
    }

    setMaterias(actualizado.materias || []);
    setHorarios(actualizado.horarios || []);

    await onActualizado();
  }

  function editarMateria(materia) {
    setPestana('materias');
    setEditandoId(materia.id);
    setError('');
    setMensaje('');

    setFormMateria({
      clave_materia: materia.clave_materia || '',
      nombre_materia: materia.nombre_materia || '',
      clave_periodo: materia.clave_periodo || '',
      letra_grupo: materia.letra_grupo || '',
    });
  }

  function editarHorario(horario) {
    setPestana('horarios');
    setEditandoId(horario.id);
    setError('');
    setMensaje('');

    setFormHorario({
      dia: horario.dia || 'lunes',
      hora_inicio:
        normalizarHora(horario.hora_inicio) || '09:00',
      hora_fin:
        normalizarHora(horario.hora_fin) || '10:00',
    });
  }

  async function guardarMateria(e) {
    e.preventDefault();

    setGuardando(true);
    setError('');
    setMensaje('');

    try {
      const datos = {
        clave_materia: formMateria.clave_materia.trim(),
        nombre_materia:
          formMateria.nombre_materia.trim() || null,
        clave_periodo:
          formMateria.clave_periodo.trim() || null,
        letra_grupo:
          formMateria.letra_grupo.trim() || null,
      };

      if (!datos.clave_materia) {
        throw new Error('La clave de materia es obligatoria');
      }

      const respuesta =
        editandoId !== null
          ? await actualizarMateriaAdmin(editandoId, datos)
          : await crearMateriaAdmin(profesor.id, datos);

      validarRespuesta(respuesta);

      await actualizarListado();
      limpiarFormulario();

      setMensaje(
        editandoId !== null
          ? 'Materia actualizada correctamente'
          : 'Materia registrada correctamente'
      );
    } catch (err) {
      setError(mostrarError(err));
    } finally {
      setGuardando(false);
    }
  }

  async function guardarHorario(e) {
    e.preventDefault();

    setGuardando(true);
    setError('');
    setMensaje('');

    try {
      const datos = {
        dia: formHorario.dia,
        hora_inicio: formHorario.hora_inicio,
        hora_fin: formHorario.hora_fin,
      };

      if (datos.hora_fin <= datos.hora_inicio) {
        throw new Error(
          'La hora de fin debe ser posterior a la hora de inicio'
        );
      }
      if (
        datos.hora_inicio < '07:00' ||
        datos.hora_fin > '19:00'
        ) {
        throw new Error(
            'El horario debe estar entre las 07:00 y las 19:00'
        );
        }

        if (
        !HORAS_DISPONIBLES.includes(datos.hora_inicio) ||
        !HORAS_DISPONIBLES.includes(datos.hora_fin)
        ) {
        throw new Error(
            'Selecciona un horario válido en intervalos de 30 minutos'
        );
        }

      const respuesta =
        editandoId !== null
          ? await actualizarHorarioAdmin(editandoId, datos)
          : await crearHorarioAdmin(profesor.id, datos);

      validarRespuesta(respuesta);

      await actualizarListado();
      limpiarFormulario();

      setMensaje(
        editandoId !== null
          ? 'Horario actualizado correctamente'
          : 'Horario registrado correctamente'
      );
    } catch (err) {
      setError(mostrarError(err));
    } finally {
      setGuardando(false);
    }
  }

  async function borrarMateria(materia) {
    const confirmar = window.confirm(
      `¿Eliminar la materia "${materia.nombre_materia || materia.clave_materia}"?`
    );

    if (!confirmar) return;

    setEliminandoId(materia.id);
    setError('');
    setMensaje('');

    try {
      const respuesta = await eliminarMateriaAdmin(materia.id);
      validarRespuesta(respuesta);

      await actualizarListado();
      limpiarFormulario();
      setMensaje('Materia eliminada correctamente');
    } catch (err) {
      setError(mostrarError(err));
    } finally {
      setEliminandoId(null);
    }
  }

  async function borrarHorario(horario) {
    const confirmar = window.confirm(
      `¿Eliminar el horario del ${nombreDia(horario.dia)} ` +
      `de ${normalizarHora(horario.hora_inicio)} a ` +
      `${normalizarHora(horario.hora_fin)}?`
    );

    if (!confirmar) return;

    setEliminandoId(horario.id);
    setError('');
    setMensaje('');

    try {
      const respuesta = await eliminarHorarioAdmin(horario.id);
      validarRespuesta(respuesta);

      await actualizarListado();
      limpiarFormulario();
      setMensaje('Horario eliminado correctamente');
    } catch (err) {
      setError(mostrarError(err));
    } finally {
      setEliminandoId(null);
    }
  }

  const ocupada =
    guardando || eliminandoId !== null;

  return (
    <div
      className="admin-gestion-fondo"
      onClick={() => {
        if (!ocupada) onClose();
      }}
    >
      <div
        className="admin-gestion-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Gestionar profesor ${profesor.nombre}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="admin-gestion-header">
          <div>
            <span>GESTIÓN ACADÉMICA</span>
            <h2>{profesor.nombre}</h2>
            <p>
              Administra las materias y los horarios de atención.
            </p>
          </div>

          <button
            className="admin-gestion-cerrar"
            onClick={onClose}
            disabled={ocupada}
            aria-label="Cerrar gestión"
          >
            <X size={21} />
          </button>
        </header>

        <div className="admin-gestion-pestanas">
          <button
            className={
              pestana === 'materias' ? 'activa' : ''
            }
            onClick={() => cambiarPestana('materias')}
            disabled={ocupada}
          >
            <BookOpen size={18} />
            Materias ({materias.length})
          </button>

          <button
            className={
              pestana === 'horarios' ? 'activa' : ''
            }
            onClick={() => cambiarPestana('horarios')}
            disabled={ocupada}
          >
            <Clock3 size={18} />
            Horarios ({horarios.length})
          </button>
        </div>

        <div className="admin-gestion-contenido">
          {error && (
            <div className="admin-profesores-error">
              <AlertCircle size={17} />
              {error}
            </div>
          )}

          {mensaje && (
            <div className="admin-profesores-exito">
              {mensaje}
            </div>
          )}

          {pestana === 'materias' ? (
            <>
              <h3>
                {editandoId !== null
                  ? 'Editar materia'
                  : 'Asignar nueva materia'}
              </h3>

              <form
                className="admin-gestion-formulario"
                onSubmit={guardarMateria}
              >
                <div className="admin-gestion-campos">
                  <div>
                    <label htmlFor="materia-clave">
                      Clave de materia *
                    </label>
                    <input
                      id="materia-clave"
                      value={formMateria.clave_materia}
                      onChange={(e) =>
                        setFormMateria((prev) => ({
                          ...prev,
                          clave_materia: e.target.value,
                        }))
                      }
                      placeholder="Ej. SCD-1027"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="materia-nombre">
                      Nombre de materia
                    </label>
                    <input
                      id="materia-nombre"
                      value={formMateria.nombre_materia}
                      onChange={(e) =>
                        setFormMateria((prev) => ({
                          ...prev,
                          nombre_materia: e.target.value,
                        }))
                      }
                      placeholder="Ej. Tópicos Avanzados de Programación"
                    />
                  </div>

                  <div>
                    <label htmlFor="materia-periodo">
                      Clave de periodo
                    </label>
                    <input
                      id="materia-periodo"
                      value={formMateria.clave_periodo}
                      onChange={(e) =>
                        setFormMateria((prev) => ({
                          ...prev,
                          clave_periodo: e.target.value,
                        }))
                      }
                      placeholder="Ej. AGO-DIC-2026"
                    />
                  </div>

                  <div>
                    <label htmlFor="materia-grupo">
                      Grupo
                    </label>
                    <input
                      id="materia-grupo"
                      value={formMateria.letra_grupo}
                      onChange={(e) =>
                        setFormMateria((prev) => ({
                          ...prev,
                          letra_grupo: e.target.value,
                        }))
                      }
                      placeholder="Ej. A"
                    />
                  </div>
                </div>

                <div className="admin-gestion-form-acciones">
                  {editandoId !== null && (
                    <button
                      type="button"
                      className="secundario"
                      onClick={limpiarFormulario}
                      disabled={guardando}
                    >
                      Cancelar edición
                    </button>
                  )}

                  <button
                    type="submit"
                    className="primario"
                    disabled={guardando}
                  >
                    <Save size={16} />
                    {guardando
                      ? 'Guardando...'
                      : editandoId !== null
                        ? 'Actualizar materia'
                        : 'Agregar materia'}
                  </button>
                </div>
              </form>

              <h3>Materias asignadas</h3>

              {materias.length === 0 ? (
                <p className="admin-gestion-vacio">
                  Este profesor todavía no tiene materias asignadas.
                </p>
              ) : (
                <div className="admin-gestion-lista">
                  {materias.map((materia) => (
                    <div
                      className="admin-gestion-item"
                      key={materia.id}
                    >
                      <div className="admin-gestion-item-info">
                        <strong>
                          {materia.nombre_materia ||
                            'Materia sin nombre'}
                        </strong>

                        <small>
                          Clave: {materia.clave_materia}
                        </small>

                        <small>
                          Periodo: {materia.clave_periodo || '—'}
                          {' · '}
                          Grupo: {materia.letra_grupo || '—'}
                        </small>
                      </div>

                      <div className="admin-gestion-item-acciones">
                        <button
                          className="editar"
                          title="Editar materia"
                          onClick={() => editarMateria(materia)}
                          disabled={ocupada}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="eliminar"
                          title="Eliminar materia"
                          onClick={() => borrarMateria(materia)}
                          disabled={ocupada}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h3>
                {editandoId !== null
                  ? 'Editar horario'
                  : 'Registrar horario de atención'}
              </h3>

              <form
                className="admin-gestion-formulario"
                onSubmit={guardarHorario}
              >
                <div className="admin-gestion-campos">
                  <div>
                    <label htmlFor="horario-dia">
                      Día de atención *
                    </label>
                    <select
                      id="horario-dia"
                      value={formHorario.dia}
                      onChange={(e) =>
                        setFormHorario((prev) => ({
                          ...prev,
                          dia: e.target.value,
                        }))
                      }
                      required
                    >
                      {DIAS.map((dia) => (
                        <option key={dia} value={dia}>
                          {nombreDia(dia)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="horario-inicio">
                        Hora de inicio *
                    </label>

                    <select
                        id="horario-inicio"
                        value={formHorario.hora_inicio}
                        onChange={(e) => {
                        const nuevaHora = e.target.value;

                        setFormHorario((prev) => ({
                            ...prev,
                            hora_inicio: nuevaHora,
                            hora_fin:
                            prev.hora_fin <= nuevaHora
                                ? HORAS_DISPONIBLES.find(
                                    (hora) => hora > nuevaHora
                                ) || '19:00'
                                : prev.hora_fin,
                        }));
                        }}
                        required
                    >
                        {HORAS_DISPONIBLES
                        .filter((hora) => hora < '19:00')
                        .map((hora) => (
                            <option key={hora} value={hora}>
                            {hora}
                            </option>
                        ))}
                    </select>
                    </div>

                    <div>
                    <label htmlFor="horario-fin">
                        Hora de fin *
                    </label>

                    <select
                        id="horario-fin"
                        value={formHorario.hora_fin}
                        onChange={(e) =>
                        setFormHorario((prev) => ({
                            ...prev,
                            hora_fin: e.target.value,
                        }))
                        }
                        required
                    >
                        {HORAS_DISPONIBLES
                        .filter(
                            (hora) => hora > formHorario.hora_inicio
                        )
                        .map((hora) => (
                            <option key={hora} value={hora}>
                            {hora}
                            </option>
                        ))}
                    </select>
                    </div>
                </div>

                <div className="admin-gestion-form-acciones">
                  {editandoId !== null && (
                    <button
                      type="button"
                      className="secundario"
                      onClick={limpiarFormulario}
                      disabled={guardando}
                    >
                      Cancelar edición
                    </button>
                  )}

                  <button
                    type="submit"
                    className="primario"
                    disabled={guardando}
                  >
                    <Save size={16} />
                    {guardando
                      ? 'Guardando...'
                      : editandoId !== null
                        ? 'Actualizar horario'
                        : 'Agregar horario'}
                  </button>
                </div>
              </form>

              <h3>Horarios registrados</h3>

              {horarios.length === 0 ? (
                <p className="admin-gestion-vacio">
                  Este profesor todavía no tiene horarios registrados.
                </p>
              ) : (
                <div className="admin-gestion-lista">
                  {horarios.map((horario) => (
                    <div
                      className="admin-gestion-item"
                      key={horario.id}
                    >
                      <div className="admin-gestion-item-info">
                        <strong>
                          {nombreDia(horario.dia)}
                        </strong>

                        <small>
                          {normalizarHora(horario.hora_inicio)}
                          {' — '}
                          {normalizarHora(horario.hora_fin)}
                        </small>
                      </div>

                      <div className="admin-gestion-item-acciones">
                        <button
                          className="editar"
                          title="Editar horario"
                          onClick={() => editarHorario(horario)}
                          disabled={ocupada}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="eliminar"
                          title="Eliminar horario"
                          onClick={() => borrarHorario(horario)}
                          disabled={ocupada}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================
   ADMINISTRACIÓN DE PROFESORES
============================================ */

export default function AdminProfesores() {
  const [profesores, setProfesores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [profesorEditando, setProfesorEditando] = useState(null);
  const [profesorGestionando, setProfesorGestionando] =
    useState(null);

  const [formulario, setFormulario] = useState({
    ...FORMULARIO_PROFESOR,
  });

  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState('');
  const [eliminandoId, setEliminandoId] = useState(null);

  async function cargarProfesores() {
    setCargando(true);
    setError('');

    try {
      const respuesta = await obtenerProfesoresAdmin();

      if (
        respuesta?.ok === false ||
        !Array.isArray(respuesta?.data)
      ) {
        throw new Error('No se pudo consultar el directorio');
      }

      setProfesores(respuesta.data);
    } catch (err) {
      setError(mostrarError(err));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarProfesores();
  }, []);

  const profesoresFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es-MX');

    return profesores.filter((profesor) =>
      `${profesor.nombre || ''} ${profesor.correo || ''}`
        .toLocaleLowerCase('es-MX')
        .includes(texto)
    );
  }, [profesores, busqueda]);

  function abrirCrear() {
    setProfesorEditando(null);
    setFormulario({ ...FORMULARIO_PROFESOR });
    setErrorFormulario('');
    setModalAbierto(true);
  }

  function abrirEditar(profesor) {
    setProfesorEditando(profesor);

    setFormulario({
      nombre: profesor.nombre || '',
      correo: profesor.correo || '',
      cubiculo: profesor.cubiculo || '',
      departamento: profesor.departamento || '',
    });

    setErrorFormulario('');
    setModalAbierto(true);
  }

  function cerrarModal() {
    if (guardando) return;

    setModalAbierto(false);
    setProfesorEditando(null);
  }

  function cambiarCampo(e) {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  async function guardarProfesor(e) {
    e.preventDefault();

    setGuardando(true);
    setErrorFormulario('');
    setMensaje('');

    try {
      const datos = {
        nombre: formulario.nombre.trim(),
        correo: formulario.correo.trim() || null,
        cubiculo: formulario.cubiculo.trim() || null,
        departamento: formulario.departamento.trim() || null,
      };

      if (!datos.nombre) {
        throw new Error('El nombre es obligatorio');
      }

      const respuesta = profesorEditando
        ? await actualizarProfesorAdmin(
            profesorEditando.id,
            datos
          )
        : await crearProfesorAdmin(datos);

      validarRespuesta(respuesta);

      setModalAbierto(false);
      setProfesorEditando(null);

      setMensaje(
        profesorEditando
          ? 'Profesor actualizado correctamente'
          : 'Profesor registrado correctamente'
      );

      await cargarProfesores();
    } catch (err) {
      setErrorFormulario(mostrarError(err));
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarProfesor(profesor) {
    const confirmar = window.confirm(
      `¿Eliminar al profesor "${profesor.nombre}"?\n\n` +
      'También se eliminarán sus materias y horarios registrados.'
    );

    if (!confirmar) return;

    setEliminandoId(profesor.id);
    setError('');
    setMensaje('');

    try {
      const respuesta = await eliminarProfesorAdmin(
        profesor.id
      );

      validarRespuesta(respuesta);

      setMensaje('Profesor eliminado correctamente');
      await cargarProfesores();
    } catch (err) {
      setError(mostrarError(err));
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <div className="admin-profesores-page">
      <header className="admin-profesores-header">
        <div>
          <span className="admin-dashboard-etiqueta">
            GESTIÓN ACADÉMICA
          </span>

          <h1>Administración de profesores</h1>

          <p>
            Registra profesores y administra sus materias
            y horarios de atención.
          </p>
        </div>

        <button
          className="admin-profesores-crear"
          onClick={abrirCrear}
        >
          <Plus size={18} />
          Nuevo profesor
        </button>
      </header>

      {mensaje && (
        <div className="admin-profesores-exito">
          {mensaje}
        </div>
      )}

      {error && (
        <div className="admin-profesores-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <section className="admin-profesores-panel">
        <div className="admin-profesores-barra">
          <div className="admin-profesores-busqueda">
            <Search size={18} />

            <input
              type="search"
              placeholder="Buscar por nombre o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <button
            className="admin-profesores-refrescar"
            onClick={cargarProfesores}
            disabled={cargando}
          >
            <RefreshCw size={17} />
            Actualizar
          </button>
        </div>

        {cargando ? (
          <div className="admin-profesores-estado">
            Cargando profesores...
          </div>
        ) : profesoresFiltrados.length === 0 ? (
          <div className="admin-profesores-estado">
            <Users size={38} />
            <p>No se encontraron profesores.</p>
          </div>
        ) : (
          <div className="admin-profesores-tabla-scroll">
            <table className="admin-profesores-tabla">
              <thead>
                <tr>
                  <th>Profesor</th>
                  <th>Departamento</th>
                  <th>Cubículo</th>
                  <th>Materias</th>
                  <th>Horarios</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {profesoresFiltrados.map((profesor) => (
                  <tr key={profesor.id}>
                    <td>
                      <strong>{profesor.nombre}</strong>
                      <small>
                        {profesor.correo || 'Sin correo'}
                      </small>
                    </td>

                    <td>
                      {profesor.departamento || '—'}
                    </td>

                    <td>
                      {profesor.cubiculo || '—'}
                    </td>

                    <td>
                      <span className="admin-profesores-contador">
                        <BookOpen size={14} />
                        {(profesor.materias || []).length}
                      </span>
                    </td>

                    <td>
                      <span className="admin-profesores-contador">
                        <Clock3 size={14} />
                        {(profesor.horarios || []).length}
                      </span>
                    </td>

                    <td>
                      <div className="admin-profesores-acciones">
                        <button
                          className="gestionar"
                          onClick={() =>
                            setProfesorGestionando(profesor)
                          }
                          title="Gestionar materias y horarios"
                        >
                          <Settings2 size={16} />
                          Gestionar
                        </button>

                        <button
                          className="editar"
                          onClick={() => abrirEditar(profesor)}
                          title="Editar profesor"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          className="eliminar"
                          onClick={() => eliminarProfesor(profesor)}
                          disabled={eliminandoId === profesor.id}
                          title="Eliminar profesor"
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

        <footer className="admin-profesores-footer">
          Mostrando {profesoresFiltrados.length} de{' '}
          {profesores.length} profesores
        </footer>
      </section>

      {/* MODAL CREAR / EDITAR PROFESOR */}

      {modalAbierto && (
        <div
          className="admin-profesores-modal-fondo"
          onClick={cerrarModal}
        >
          <div
            className="admin-profesores-modal"
            role="dialog"
            aria-modal="true"
            aria-label={
              profesorEditando
                ? 'Editar profesor'
                : 'Nuevo profesor'
            }
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-profesores-modal-header">
              <div>
                <h2>
                  {profesorEditando
                    ? 'Editar profesor'
                    : 'Registrar profesor'}
                </h2>

                <p>
                  Completa la información del profesor.
                </p>
              </div>

              <button
                onClick={cerrarModal}
                disabled={guardando}
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={guardarProfesor}>
              <label htmlFor="profesor-nombre">
                Nombre completo *
              </label>

              <input
                id="profesor-nombre"
                name="nombre"
                value={formulario.nombre}
                onChange={cambiarCampo}
                maxLength={255}
                required
              />

              <label htmlFor="profesor-correo">
                Correo electrónico
              </label>

              <input
                id="profesor-correo"
                type="email"
                name="correo"
                value={formulario.correo}
                onChange={cambiarCampo}
                maxLength={255}
              />

              <label htmlFor="profesor-departamento">
                Departamento
              </label>

              <input
                id="profesor-departamento"
                name="departamento"
                value={formulario.departamento}
                onChange={cambiarCampo}
                maxLength={255}
              />

              <label htmlFor="profesor-cubiculo">
                Cubículo
              </label>

              <input
                id="profesor-cubiculo"
                name="cubiculo"
                value={formulario.cubiculo}
                onChange={cambiarCampo}
                maxLength={255}
              />

              {errorFormulario && (
                <div className="admin-profesores-error">
                  {errorFormulario}
                </div>
              )}

              <div className="admin-profesores-modal-acciones">
                <button
                  type="button"
                  className="cancelar"
                  onClick={cerrarModal}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="guardar"
                  disabled={guardando}
                >
                  <Save size={17} />
                  {guardando
                    ? 'Guardando...'
                    : 'Guardar profesor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE MATERIAS Y HORARIOS */}

      {profesorGestionando && (
        <GestionProfesor
          profesor={profesorGestionando}
          onClose={() => setProfesorGestionando(null)}
          onActualizado={cargarProfesores}
        />
      )}
    </div>
  );
}
