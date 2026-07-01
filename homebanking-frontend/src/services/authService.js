import api from './api';

export const login = async (tipoDocumento, numeroDocumento, clave) => {
    const response = await api.post('/auth/login', {
        tipoDocumento,
        numeroDocumento,
        clave,
    });
    return response.data;
};

export const registrar = async (datos) => {
    const response = await api.post('/auth/registro', datos);
    return response.data;
};