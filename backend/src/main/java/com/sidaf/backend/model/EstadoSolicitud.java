package com.sidaf.backend.model;

public enum EstadoSolicitud {
    PENDIENTE("Pendiente de aprobación"),
    APROBADA("Solicitud aprobada"),
    RECHAZADA("Solicitud rechazada");
    
    private final String descripcion;
    
    EstadoSolicitud(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
}
