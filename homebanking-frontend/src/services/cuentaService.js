import api from './api';

export const listarCuentas = async (clienteId) => {
    const response = await api.get(`/cuentas/cliente/${clienteId}`);
    return response.data;
};