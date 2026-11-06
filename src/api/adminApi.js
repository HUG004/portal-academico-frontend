import axios from 'axios';

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
  },
});

// El administrador utiliza su propio token.
// No utilizamos el token institucional del estudiante.
adminApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('admin_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function iniciarSesionAdmin(email, password) {
  const response = await adminApi.post('/admin/login', {
    email,
    password,
  });

  return response.data;
}

export async function obtenerAdminActual() {
  const response = await adminApi.get('/admin/me');
  return response.data;
}

export async function obtenerProfesoresAdmin() {
  const response = await adminApi.get('/admin/profesores');
  return response.data;
}

// Registrar un profesor
export async function crearProfesorAdmin(datos) {
  const response = await adminApi.post('/admin/profesores', datos);
  return response.data;
}

// Actualizar los datos de un profesor
export async function actualizarProfesorAdmin(id, datos) {
  const response = await adminApi.put(
    `/admin/profesores/${id}`,
    datos
  );
  return response.data;
}

// Eliminar un profesor
export async function eliminarProfesorAdmin(id) {
  const response = await adminApi.delete(
    `/admin/profesores/${id}`
  );
  return response.data;
}


/* =========================================
   ADMINISTRACIÓN DE MATERIAS
========================================= */

// Asignar una materia a un profesor
export async function crearMateriaAdmin(profesorId, datos) {
  const response = await adminApi.post(
    `/admin/profesores/${profesorId}/materias`,
    datos
  );
  return response.data;
}

// Actualizar una materia asignada
export async function actualizarMateriaAdmin(materiaId, datos) {
  const response = await adminApi.put(
    `/admin/materias/${materiaId}`,
    datos
  );
  return response.data;
}

// Eliminar una materia asignada
export async function eliminarMateriaAdmin(materiaId) {
  const response = await adminApi.delete(
    `/admin/materias/${materiaId}`
  );
  return response.data;
}

/* =========================================
   ADMINISTRACIÓN DE HORARIOS
========================================= */

// Agregar un horario de atención
export async function crearHorarioAdmin(profesorId, datos) {
  const response = await adminApi.post(
    `/admin/profesores/${profesorId}/horarios`,
    datos
  );
  return response.data;
}

// Actualizar un horario de atención
export async function actualizarHorarioAdmin(horarioId, datos) {
  const response = await adminApi.put(
    `/admin/horarios/${horarioId}`,
    datos
  );
  return response.data;
}

// Eliminar un horario de atención
export async function eliminarHorarioAdmin(horarioId) {
  const response = await adminApi.delete(
    `/admin/horarios/${horarioId}`
  );
  return response.data;
}


export default adminApi;