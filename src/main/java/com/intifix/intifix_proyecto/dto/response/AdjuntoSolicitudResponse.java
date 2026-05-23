package com.intifix.intifix_proyecto.dto.response;

import com.intifix.intifix_proyecto.model.AdjuntoSolicitud;

import java.time.LocalDateTime;

public class AdjuntoSolicitudResponse {

    public Long id;
    public String nombreArchivo;
    public String tipoArchivo;
    public String urlArchivo;
    public Long tamanoBytes;
    public LocalDateTime fechaSubida;

    public static AdjuntoSolicitudResponse fromEntity(AdjuntoSolicitud adjunto) {
        AdjuntoSolicitudResponse res = new AdjuntoSolicitudResponse();

        res.id = adjunto.getId();
        res.nombreArchivo = adjunto.getNombreArchivo();
        res.tipoArchivo = adjunto.getTipoArchivo();
        res.urlArchivo = adjunto.getUrlArchivo();
        res.tamanoBytes = adjunto.getTamanoBytes();
        res.fechaSubida = adjunto.getFechaSubida();

        return res;
    }
}