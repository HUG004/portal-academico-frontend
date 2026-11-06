import api from './clienteApi';
export async function iniciarSesion(email, password){
    const response = await api.post('/auth/login', {
        email,
        password,
    });
    return response.data;
}

export async function verificarSesion(){
    const response = await api.get('/auth/me');
    return response.data;
}

export async function cerrarSesion(){
    const response = await api.post('/auth/logout');
    return response.data;
}
