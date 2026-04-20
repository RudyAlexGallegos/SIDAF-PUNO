package com.sidaf.backend.model;

public enum EstadoUsuario {
    PENDIENTE("Pendiente de aprobación"),
    ACTIVO("Usuario activo"),
    INACTIVO("Usuario inactivo"),
    SUSPENDIDO("Usuario suspendido");
    
    private final String descripcion;
    
    EstadoUsuario(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
}
