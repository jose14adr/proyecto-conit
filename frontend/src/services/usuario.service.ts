import api from './api';

export const obtenerUsuario = async () => {
    const response = await api.get('/usuario');
    return response.data;
}

export const crearUsuario = async (usuarioData: any) => {
    const response = await api.post('/usuario', usuarioData);
    return response.data;
}

export const actualizarUsuario = async (id: number, usuarioData: any) => {
    const response = await api.patch(`/usuario/${id}`, usuarioData);
    return response.data;
}

export const inhabilitarUsuario = async (id: number) => {
    const response = await api.delete(`/usuario/${id}`);
    return response.data;
}

export const habilitarUsuario = async (id: number) => {
    const response = await api.patch(`/usuario/${id}/habilitar`);
    return response.data;
}