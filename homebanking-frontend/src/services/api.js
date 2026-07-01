import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // cambia a 8081 si ese es tu puerto
});

// Interceptor: agrega el token JWT automaticamente a cada request (excepto login/registro)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;