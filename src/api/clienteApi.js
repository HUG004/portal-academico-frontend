import axios from "axios";
 
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        Accept: 'application/json',
        'Content-Type' : 'application/json',
    },
    timeout: 15000,
});

//se agrega automaticamente el token a las peticiones
api.interceptors.request.use((config) =>{
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

//manejo sesiones expiradas
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        const esLogin = url.includes('/auth/login');

        if(error.response?.status === 401 && !esLogin){
            sessionStorage.removeItem('token');
            window.dispatchEvent(new Event('sesion-expirada'));
        }
        return Promise.reject(error);
    }
);
export default api;