import api from './clienteApi';

// Obtener todos los profesores.
// También permite buscar por nombre, correo o clave de materia.
export async function obtenerProfesores(filtros = {}) {
  const response = await api.get('/profesores', {
    params: filtros,
  });

  return response.data;
}

// Obtener información detallada de un profesor.
export async function obtenerProfesorPorId(id) {
  const response = await api.get(`/profesores/${id}`);

  return response.data;
}