package com.intifix.intifix_proyecto.model;
 
/**
 * Mapeo visual de EstadoSolicitud a 3 fases comprensibles para el cliente.
 *
 *  REGISTRADA              → SIN_REVISAR
 *  EN_REVISION / ASIGNADA  → REVISADO
 *  EN_PROCESO              → EN_ATENCION
 *  FINALIZADA              → EN_ATENCION  (con isTerminada=true)
 *  CANCELADA               → SIN_REVISAR  (con isCancelada=true)
 */
public enum FaseSeguimiento {
 
    SIN_REVISAR("Sin revisar", "Tu solicitud fue registrada y está en espera de ser atendida.", "⏳"),
    REVISADO("Revisado", "Un técnico revisó tu solicitud y será asignada pronto.", "🔍"),
    EN_ATENCION("En atención", "Tu equipo está siendo reparado por el técnico asignado.", "🛠️");
 
    public final String etiqueta;
    public final String descripcion;
    public final String icono;
 
    FaseSeguimiento(String etiqueta, String descripcion, String icono) {
        this.etiqueta = etiqueta;
        this.descripcion = descripcion;
        this.icono = icono;
    }
 
    /** Convierte el estado interno al estado visual de 3 fases para el cliente. */
    public static FaseSeguimiento desdEstado(EstadoSolicitud estado) {
        return switch (estado) {
            case REGISTRADA, CANCELADA -> SIN_REVISAR;
            case EN_REVISION, ASIGNADA -> REVISADO;
            case EN_PROCESO, FINALIZADA -> EN_ATENCION;
        };
    }
}