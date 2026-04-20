package com.sidaf.backend.model;

public enum EstadoPermiso {
    ACTIVO("Permiso activo"),
    INACTIVO("Permiso inactivo"),
    REVOCADO("Permiso revocado");
    
    private final String descripcion;
    
    EstadoPermiso(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
}
