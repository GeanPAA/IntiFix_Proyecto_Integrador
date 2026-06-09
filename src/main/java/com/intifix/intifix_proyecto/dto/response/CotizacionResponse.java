package com.intifix.intifix_proyecto.dto.response;

import com.intifix.intifix_proyecto.model.Cotizacion;
import java.time.LocalDateTime;

public class CotizacionResponse {

    public Long id;
    public Long solicitudId;
    public Long tecnicoId;
    public String tecnicoNombre;
    public Integer precio;
    public Integer tiempoHoras;
    public String estado;
    public LocalDateTime fechaCreacion;
    public LocalDateTime fechaActualizacion;
    public LocalDateTime fechaExpiracion;
    public Boolean expirada;

    public static CotizacionResponse fromEntity(Cotizacion cotizacion) {
        CotizacionResponse res = new CotizacionResponse();

        res.id = cotizacion.getId();
        res.solicitudId = cotizacion.getSolicitud().getId();
        res.tecnicoId = cotizacion.getTecnico().getId();
        res.tecnicoNombre = cotizacion.getTecnico().getName();
        res.precio = cotizacion.getPrecio();
        res.tiempoHoras = cotizacion.getTiempoHoras();
        res.estado = cotizacion.getEstado().name();
        res.fechaCreacion = cotizacion.getFechaCreacion();
        res.fechaActualizacion = cotizacion.getFechaActualizacion();
        res.fechaExpiracion = cotizacion.getFechaExpiracion();
        res.expirada = cotizacion.getFechaExpiracion() != null
                && LocalDateTime.now().isAfter(cotizacion.getFechaExpiracion());

        return res;
    }
}
