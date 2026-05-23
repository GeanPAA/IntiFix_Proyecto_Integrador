package com.intifix.intifix_proyecto.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "adjuntos_solicitud")
public class AdjuntoSolicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 180)
    private String nombreArchivo;

    @Column(nullable = false, length = 120)
    private String tipoArchivo;

    @Column(nullable = false, length = 500)
    private String urlArchivo;

    @Column(nullable = false)
    private Long tamanoBytes;

    @Column(nullable = false)
    private LocalDateTime fechaSubida;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitud_id", nullable = false)
    private SolicitudReparacion solicitud;

    @PrePersist
    public void prePersist() {
        fechaSubida = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getNombreArchivo() {
        return nombreArchivo;
    }

    public String getTipoArchivo() {
        return tipoArchivo;
    }

    public String getUrlArchivo() {
        return urlArchivo;
    }

    public Long getTamanoBytes() {
        return tamanoBytes;
    }

    public LocalDateTime getFechaSubida() {
        return fechaSubida;
    }

    public SolicitudReparacion getSolicitud() {
        return solicitud;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNombreArchivo(String nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
    }

    public void setTipoArchivo(String tipoArchivo) {
        this.tipoArchivo = tipoArchivo;
    }

    public void setUrlArchivo(String urlArchivo) {
        this.urlArchivo = urlArchivo;
    }

    public void setTamanoBytes(Long tamanoBytes) {
        this.tamanoBytes = tamanoBytes;
    }

    public void setSolicitud(SolicitudReparacion solicitud) {
        this.solicitud = solicitud;
    }
}