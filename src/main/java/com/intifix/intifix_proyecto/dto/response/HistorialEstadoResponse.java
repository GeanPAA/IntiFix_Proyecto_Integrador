package com.intifix.intifix_proyecto.dto.response;

import com.intifix.intifix_proyecto.model.HistorialEstadoSolicitud;

import java.time.LocalDateTime;

public class HistorialEstadoResponse {

    public Long id;
    public String estadoAnterior;
    public String estadoNuevo;
    public String comentario;
    public LocalDateTime fechaCambio;
    public String responsable;

    public static HistorialEstadoResponse fromEntity(HistorialEstadoSolicitud historial) {
        HistorialEstadoResponse res = new HistorialEstadoResponse();

        res.id = historial.getId();
        res.estadoAnterior = historial.getEstadoAnterior() == null
                ? null
                : historial.getEstadoAnterior().name();
        res.estadoNuevo = historial.getEstadoNuevo().name();
        res.comentario = historial.getComentario();
        res.fechaCambio = historial.getFechaCambio();
        res.responsable = historial.getResponsable().getName();

        return res;
    }
}