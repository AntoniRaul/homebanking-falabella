import axios from 'axios';

const api = axios.create({
    // En local usa localhost:8080. En producción (Vercel), define VITE_API_URL
    // con la URL de tu backend en Render, ej: https://tu-backend.onrender.com/api
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
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
