package com.intifix.intifix_proyecto.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cotizaciones")
public class Cotizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitud_id", nullable = false)
    private SolicitudReparacion solicitud;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tecnico_id", nullable = false)
    private User tecnico;

    @Column(nullable = false)
    private Integer precio; // 1 a 10000

    @Column(nullable = false)
    private Integer tiempoHoras; // 1 a 168

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoCotizacion estado; // ACTIVA, ACEPTADA, RECHAZADA, EXPIRADA

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;

    @Column
    private LocalDateTime fechaExpiracion; // 48 horas desde creación

    @Column(length = 500)
    private String motivoRechazo; // Usado cuando el técnico rechaza una solicitud

    @PrePersist
    public void prePersist() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
        estado = EstadoCotizacion.ACTIVA;
        // Vigencia: 48 horas desde ahora
        fechaExpiracion = LocalDateTime.now().plusHours(48);
    }

    @PreUpdate
    public void preUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SolicitudReparacion getSolicitud() {
        return solicitud;
    }

    public void setSolicitud(SolicitudReparacion solicitud) {
        this.solicitud = solicitud;
    }

    public User getTecnico() {
        return tecnico;
    }

    public void setTecnico(User tecnico) {
        this.tecnico = tecnico;
    }

    public Integer getPrecio() {
        return precio;
    }

    public void setPrecio(Integer precio) {
        this.precio = precio;
    }

    public Integer getTiempoHoras() {
        return tiempoHoras;
    }

    public void setTiempoHoras(Integer tiempoHoras) {
        this.tiempoHoras = tiempoHoras;
    }

    public EstadoCotizacion getEstado() {
        return estado;
    }

    public void setEstado(EstadoCotizacion estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    public LocalDateTime getFechaExpiracion() {
        return fechaExpiracion;
    }

    public void setFechaExpiracion(LocalDateTime fechaExpiracion) {
        this.fechaExpiracion = fechaExpiracion;
    }

    public String getMotivoRechazo() {
        return motivoRechazo;
    }

    public void setMotivoRechazo(String motivoRechazo) {
        this.motivoRechazo = motivoRechazo;
    }
}
