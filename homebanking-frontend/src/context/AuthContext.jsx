import { useState } from 'react';
import { login as loginRequest } from '../services/authService';
import { AuthContext } from './authContextInstance';

const CLIENTE_KEY = 'cliente';

// Lee la sesion guardada en localStorage (si el token sigue vigente)
const leerSesionGuardada = () => {
    const token = localStorage.getItem('token');
    const clienteGuardado = localStorage.getItem(CLIENTE_KEY);
    if (token && clienteGuardado) {
        return JSON.parse(clienteGuardado);
    }
    return null;
};

export function AuthProvider({ children }) {
    const [cliente, setCliente] = useState(() => leerSesionGuardada());
    const cargando = false;

    const login = async (tipoDocumento, numeroDocumento, clave) => {
        const data = await loginRequest(tipoDocumento, numeroDocumento, clave);
        const clienteData = {
            clienteId: data.clienteId,
            nombres: data.nombres,
            apellidos: data.apellidos,
        };
        localStorage.setItem('token', data.token);
        localStorage.setItem(CLIENTE_KEY, JSON.stringify(clienteData));
        setCliente(clienteData);
        return clienteData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem(CLIENTE_KEY);
        setCliente(null);
    };

    const value = {
        cliente,
        estaAutenticado: !!cliente,
        cargando,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
