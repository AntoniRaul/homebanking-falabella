import api from './api';

export const solicitarCredito = async (datos) => {
    const response = await api.post('/creditos/solicitudes', datos);
    return response.data;
};

export const listarCreditos = async (clienteId) => {
    const response = await api.get(`/creditos/cliente/${clienteId}`);
    return response.data;
};

export const obtenerCronograma = async (creditoId) => {
    const response = await api.get(`/creditos/${creditoId}/cronograma`);
    return response.data;
};