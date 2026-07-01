import api from './api';

export const procesarTransaccion = async (datos) => {
    const response = await api.post('/transacciones', datos);
    return response.data;
};

export const historialPorCuenta = async (cuentaId) => {
    const response = await api.get(`/transacciones/cuenta/${cuentaId}`);
    return response.data;
};

export const historialPorTarjeta = async (tarjetaId) => {
    const response = await api.get(`/transacciones/tarjeta/${tarjetaId}`);
    return response.data;
};
