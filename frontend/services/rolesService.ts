import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sidaf-backend.onrender.com/api';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const rolesService = {
  private: null as AxiosInstance | null,

  getAxiosInstance(): AxiosInstance {
    if (!this.private) {
      this.private = axios.create({
        baseURL: API_BASE_URL,
        headers: getAuthHeaders(),
      });
    }
    return this.private;
  },

  // ==================== USUARIOS ====================

  async obtenerInfoUsuario(usuarioId: number) {
    try {
      const response = await this.getAxiosInstance().get(`/auth/usuarios/${usuarioId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo info de usuario:', error);
      throw error;
    }
  },

  async obtenerUsuariosPendientes() {
    try {
      const response = await this.getAxiosInstance().get('/auth/usuarios/pendientes');
      return response.data || [];
    } catch (error) {
      console.error('Error obteniendo usuarios pendientes:', error);
      throw error;
    }
  },

  async obtenerTodosUsuarios() {
    try {
      const response = await this.getAxiosInstance().get('/auth/usuarios');
      return response.data || [];
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  },

  async aprobarUsuario(usuarioId: number, rol: string, permisos: string) {
    try {
      const response = await this.getAxiosInstance().post(`/auth/usuarios/${usuarioId}/aprobar`, {
        rol,
        permisos,
      });
      return response.data;
    } catch (error) {
      console.error('Error aprobando usuario:', error);
      throw error;
    }
  },

  async cambiarEstadoUsuario(usuarioId: number, estado: string) {
    try {
      const response = await this.getAxiosInstance().post(`/auth/usuarios/${usuarioId}/estado`, {
        estado,
      });
      return response.data;
    } catch (error) {
      console.error('Error cambiando estado de usuario:', error);
      throw error;
    }
  },

  async eliminarUsuario(usuarioId: number) {
    try {
      const response = await this.getAxiosInstance().delete(`/auth/usuarios/${usuarioId}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  },

  async asignarPermisos(usuarioId: number, permisos: string[]) {
    try {
      const response = await this.getAxiosInstance().post(`/auth/usuarios/${usuarioId}/permisos`, {
        permisos: JSON.stringify(permisos),
      });
      return response.data;
    } catch (error) {
      console.error('Error asignando permisos:', error);
      throw error;
    }
  },

  // ==================== SOLICITUDES DE PERMISOS ====================

  async obtenerSolicitudesPendientes() {
    try {
      const response = await this.getAxiosInstance().get('/auth/solicitudes/pendientes');
      return response.data || [];
    } catch (error) {
      console.error('Error obteniendo solicitudes:', error);
      throw error;
    }
  },

  async crearSolicitudPermiso(permiso: string) {
    try {
      const response = await this.getAxiosInstance().post('/auth/solicitudes', {
        permiso,
      });
      return response.data;
    } catch (error) {
      console.error('Error creando solicitud:', error);
      throw error;
    }
  },

  async responderSolicitud(solicitudId: number, accion: 'APROBAR' | 'RECHAZAR', notas?: string) {
    try {
      const response = await this.getAxiosInstance().post(`/auth/solicitudes/${solicitudId}/responder`, {
        accion,
        notas,
      });
      return response.data;
    } catch (error) {
      console.error('Error respondiendo solicitud:', error);
      throw error;
    }
  },

  async obtenerMisSolicitudes() {
    try {
      const response = await this.getAxiosInstance().get('/auth/solicitudes/mis-solicitudes');
      return response.data || [];
    } catch (error) {
      console.error('Error obteniendo mis solicitudes:', error);
      throw error;
    }
  },

  // ==================== AUDITORIA ====================

  async obtenerAuditoria(page: number = 0, size: number = 20) {
    try {
      const response = await this.getAxiosInstance().get('/auditoria', {
        params: { page, size },
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo auditoría:', error);
      throw error;
    }
  },

  async obtenerAuditoriaUsuario(usuarioId: number) {
    try {
      const response = await this.getAxiosInstance().get(`/auditoria/usuario/${usuarioId}`);
      return response.data.datos || [];
    } catch (error) {
      console.error('Error obteniendo auditoría de usuario:', error);
      throw error;
    }
  },

  async obtenerAuditoriaRealizadaPor(usuarioId: number) {
    try {
      const response = await this.getAxiosInstance().get(`/auditoria/realizadosPor/${usuarioId}`);
      return response.data.datos || [];
    } catch (error) {
      console.error('Error obteniendo auditoría realizada por:', error);
      throw error;
    }
  },

  // ==================== ROLES ====================

  async obtenerTodosRoles() {
    try {
      const response = await this.getAxiosInstance().get('/roles');
      return response.data.datos || [];
    } catch (error) {
      console.error('Error obteniendo roles:', error);
      throw error;
    }
  },

  async obtenerRolPorNombre(nombre: string) {
    try {
      const response = await this.getAxiosInstance().get(`/roles/${nombre}`);
      return response.data.datos;
    } catch (error) {
      console.error('Error obteniendo rol:', error);
      throw error;
    }
  },
};
