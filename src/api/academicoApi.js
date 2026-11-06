import api from './clienteApi';

export async function obtenerPerfil(){
    const response = await api.get('/academico/perfil');
    return response.data;
}

export async function obtenerCalificaciones(){
    const response = await api.get('/academico/calificaciones');
    return response.data;
}

export async function obtenerKardex(){
    const response = await api.get('/academico/kardex');
    return response.data;
}

export async function obtenerHorarios(){
    const response = await api.get('/academico/horarios');
    return response.data;
}