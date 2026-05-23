package com.intifix.intifix_proyecto.dto.response;


import com.intifix.intifix_proyecto.model.SolicitudReparacion;

import java.time.LocalDateTime;
import java.util.List;

public class SolicitudResponse {

    public Long id;
    public String codigo;
    public String equipo;
    public String titulo;
    public String descripcion;
    public String modalidad;
    public String direccion;
    public String estado;
    public LocalDateTime fechaRegistro;
    public LocalDateTime fechaActualizacion;
    public String clienteNombre;
    public String clienteCorreo;
    public String tecnicoNombre;
    public List<AdjuntoSolicitudResponse> adjuntos;
    public List<HistorialEstadoResponse> historial;

    public static SolicitudResponse fromEntity(SolicitudReparacion solicitud) {
        SolicitudResponse res = new SolicitudResponse();

        res.id = solicitud.getId();
        res.codigo = solicitud.getCodigo();
        res.equipo = solicitud.getEquipo();
        res.titulo = solicitud.getTitulo();
        res.descripcion = solicitud.getDescripcion();
        res.modalidad = solicitud.getModalidad().name();
        res.direccion = solicitud.getDireccion();
        res.estado = solicitud.getEstado().name();
        res.fechaRegistro = solicitud.getFechaRegistro();
        res.fechaActualizacion = solicitud.getFechaActualizacion();
        res.clienteNombre = solicitud.getCliente().getName();
        res.clienteCorreo = solicitud.getCliente().getEmail();
        res.tecnicoNombre = solicitud.getTecnicoAsignado() == null
                ? null
                : solicitud.getTecnicoAsignado().getName();

        res.adjuntos = solicitud.getAdjuntos()
                .stream()
                .map(AdjuntoSolicitudResponse::fromEntity)
                .toList();

        res.historial = solicitud.getHistorialEstados()
                .stream()
                .map(HistorialEstadoResponse::fromEntity)
                .toList();

        return res;
    }
}