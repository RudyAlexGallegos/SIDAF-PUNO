package com.sidaf.backend.model;

public enum TipoCambio {
    ASIGNACIÓN("Asignación de permiso"),
    REVOCACIÓN("Revocación de permiso"),
    CAMBIO_ESTADO("Cambio de estado de usuario"),
    CAMBIO_ROL("Cambio de rol"),
    SOLICITUD_APROBADA("Solicitud de permiso aprobada"),
    SOLICITUD_RECHAZADA("Solicitud de permiso rechazada"),
    USUARIO_APROBADO("Usuario aprobado"),
    USUARIO_RECHAZADO("Usuario rechazado");
    
    private final String descripcion;
    
    TipoCambio(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
}
