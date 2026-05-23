package com.intifix.intifix_proyecto.dto.response;
 
import com.intifix.intifix_proyecto.model.EstadoSolicitud;
import com.intifix.intifix_proyecto.model.FaseSeguimiento;
import com.intifix.intifix_proyecto.model.SolicitudReparacion;
 
import java.time.LocalDateTime;
 
/**
 * DTO de seguimiento público para el cliente.
 * Expone la fase visual (3 estados) sin revelar estados internos sensibles.
 * No incluye datos personales del técnico ni del cliente más allá del nombre.
 */
public class SeguimientoResponse {
 
    public String codigo;
    public String titulo;
    public String equipo;
    public String modalidad;
 
    /** Estado interno completo (para admin/técnico en sus vistas) */
    public String estadoInterno;
 
    /** Fase visual simplificada para el cliente: SIN_REVISAR / REVISADO / EN_ATENCION */
    public String fase;
    public String faseEtiqueta;
    public String faseDescripcion;
    public String faseIcono;
 
    /** Si la solicitud ya finalizó */
    public Boolean finalizada;
 
    /** Si la solicitud fue cancelada */
    public Boolean cancelada;
 
    /** Paso activo (1, 2 o 3) para mostrar barra de progreso en el frontend */
    public int pasoActual;
 
    public LocalDateTime fechaRegistro;
    public LocalDateTime fechaActualizacion;
 
    /** Nombre del técnico asignado (si existe) — sin datos sensibles */
    public String tecnicoNombre;
 
    public static SeguimientoResponse fromEntity(SolicitudReparacion s) {
        SeguimientoResponse r = new SeguimientoResponse();
 
        r.codigo             = s.getCodigo();
        r.titulo             = s.getTitulo();
        r.equipo             = s.getEquipo();
        r.modalidad          = s.getModalidad().name();
        r.estadoInterno      = s.getEstado().name();
        r.fechaRegistro      = s.getFechaRegistro();
        r.fechaActualizacion = s.getFechaActualizacion();
        r.finalizada         = s.getEstado() == EstadoSolicitud.FINALIZADA;
        r.cancelada          = s.getEstado() == EstadoSolicitud.CANCELADA;
 
        if (s.getTecnicoAsignado() != null) {
            r.tecnicoNombre = s.getTecnicoAsignado().getName();
        }
 
        FaseSeguimiento fase = FaseSeguimiento.desdEstado(s.getEstado());
        r.fase          = fase.name();
        r.faseEtiqueta  = fase.etiqueta;
        r.faseDescripcion = fase.descripcion;
        r.faseIcono     = fase.icono;
 
        r.pasoActual = switch (fase) {
            case SIN_REVISAR -> 1;
            case REVISADO    -> 2;
            case EN_ATENCION -> 3;
        };
 
        return r;
    }
}