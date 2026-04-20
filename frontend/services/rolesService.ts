import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface RolesData {
  usuarioId: number;
  nombreRol: string;
  descripcion: string;
  jerarquia: number;
  aprobadoPor?: number;
  razon?: string;
}

export const rolesService = {
  private: null as AxiosInstance | null,

  getAxiosInstance(): AxiosInstance {
    if (!this.private) {
      this.private = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    return this.private;
  },

  // ==================== USUARIOS ====================

  async obtenerInfoUsuario(usuarioId: number) {
    try {
      const response = await this.getAxiosInstance().get(`/usuarios-roles/${usuarioId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo info de usuario:', error);
      throw error;
    }
  },

  async obtenerUsuariosPendientes() {
    try {
      const response = await this.getAxiosInstance().get('/usuarios-roles/pendientes');
      return response.data.datos || [];
    } catch (error) {
      console.error('Error obteniendo usuarios pendientes:', error);
      throw error;
    }
  },

  async obtenerUsuariosPorRol(nombreRol: string) {
    try {
      const response = await this.getAxiosInstance().get(`/usuarios-roles/rol/${nombreRol}`);
      return response.data.datos || [];
    } catch (error) {
      console.error('Error obteniendo usuarios por rol:', error);
      throw error;
    }
  },

  async aprobarUsuario(usuarioId: number, aprobadoPorId: number, razon: string) {
    try {
      const response = await this.getAxiosInstance().post(`/usuarios-roles/aprobar/${usuarioId}`, {
        aprobadoPorId,
        razon,
      });
      return response.data;
    } catch (error) {
      console.error('Error aprobando usuario:', error);
      throw error;
    }
  },

  async rechazarUsuario(usuarioId: number, rechazadoPorId: number, razonRechazo: string) {
    try {
      const response = await this.getAxiosInstance().post(`/usuarios-roles/rechazar/${usuarioId}`, {
        rechazadoPorId,
        razonRechazo,
      });
      return response.data;
    } catch (error) {
      console.error('Error rechazando usuario:', error);
      throw error;
    }
  },

  // ==================== PERMISOS ====================

  async obtenerTodosPermisos() {
    try {
      const response = await this.getAxiosInstance().get('/permisos');
      return response.data.datos || [];
    } catch (error) {
      console.error('Error obteniendo permisos:', error);
      throw error;
    }
  },

  async obtenerPermisosPorModulo(modulo: string) {
    try {
      const response = await this.getAxiosInstance().get(`/permisos/modulo/${modulo}`);
      return response.data.datos || [];
    } catch (error) {
      console.error('Error obteniendo permisos por módulo:', error);
      throw error;
    }
  },

  async obtenerPermisosUsuario(usuarioId: number) {
    try {
      const response = await this.getAxiosInstance().get(`/permisos/usuario/${usuarioId}`);
      return response.data.datos || [];
    } catch (error) {
      console.error('Error obteniendo permisos de usuario:', error);
      throw error;
    }
  },

  async asignarPermiso(usuarioId: number, permisoId: number, asignadoPorId: number, razon: string) {
    try {
      const response = await this.getAxiosInstance().post('/permisos/asignar', {
        usuarioId,
        permisoId,
        asignadoPorId,
        razon,
      });
      return response.data;
    } catch (error) {
      console.error('Error asignando permiso:', error);
      throw error;
    }
  },

  async revocarPermiso(usuarioId: number, permisoId: number, revocadoPorId: number, razon: string) {
    try {
      const response = await this.getAxiosInstance().post('/permisos/revocar', {
        usuarioId,
        permisoId,
        revocadoPorId,
        razon,
      });
      return response.data;
    } catch (error) {
      console.error('Error revocando permiso:', error);
      throw error;
    }
  },

  async verificarPermiso(usuarioId: number, codigoPermiso: string) {
    try {
      const response = await this.getAxiosInstance().get(
        `/permisos/usuario/${usuarioId}/tiene/${codigoPermiso}`
      );
      return response.data.tiene || false;
    } catch (error) {
      console.error('Error verificando permiso:', error);
      return false;
    }
  },

  // ==================== SOLICITUDES DE PERMISOS ====================

  async obtenerSolicitudesPendientes() {
    try {
      const response = await this.getAxiosInstance().get('/usuarios-roles/solicitudes/pendientes');
      return response.data.datos || [];
    } catch (error) {
      console.error('Error obteniendo solicitudes:', error);
      throw error;
    }
  },

  async crearSolicitudPermiso(usuarioId: number, permisoId: number, descripcion: string) {
    try {
      const response = await this.getAxiosInstance().post('/usuarios-roles/solicitud/crear', {
        usuarioId,
        permisoId,
        descripcion,
      });
      return response.data;
    } catch (error) {
      console.error('Error creando solicitud:', error);
      throw error;
    }
  },

  async aprobarSolicitudPermiso(solicitudId: number, aprobadoPorId: number, razon: string) {
    try {
      const response = await this.getAxiosInstance().post(
        `/usuarios-roles/solicitud/aprobar/${solicitudId}`,
        {
          aprobadoPorId,
          razon,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error aprobando solicitud:', error);
      throw error;
    }
  },

  async rechazarSolicitudPermiso(solicitudId: number, rechazadoPorId: number, razonRechazo: string) {
    try {
      const response = await this.getAxiosInstance().post(
        `/usuarios-roles/solicitud/rechazar/${solicitudId}`,
        {
          rechazadoPorId,
          razonRechazo,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error rechazando solicitud:', error);
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
