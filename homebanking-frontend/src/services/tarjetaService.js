import api from './api';

// Lista las tarjetas de credito de un cliente
export const listarTarjetas = async (clienteId) => {
    const response = await api.get(`/tarjetas/cliente/${clienteId}`);
    return response.data;
};
