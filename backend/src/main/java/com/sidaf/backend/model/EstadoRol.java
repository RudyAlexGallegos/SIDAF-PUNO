package com.sidaf.backend.model;

public enum EstadoRol {
    ACTIVO("Rol activo"),
    INACTIVO("Rol inactivo");
    
    private final String descripcion;
    
    EstadoRol(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
}
