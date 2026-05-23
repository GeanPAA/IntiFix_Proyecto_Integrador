package com.intifix.intifix_proyecto.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "historial_estado_solicitud")
public class HistorialEstadoSolicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private EstadoSolicitud estadoAnterior;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private EstadoSolicitud estadoNuevo;

    @Column(nullable = false, length = 500)
    private String comentario;

    @Column(nullable = false)
    private LocalDateTime fechaCambio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitud_id", nullable = false)
    private SolicitudReparacion solicitud;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsable_id", nullable = false)
    private User responsable;

    @PrePersist
    public void prePersist() {
        fechaCambio = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public EstadoSolicitud getEstadoAnterior() {
        return estadoAnterior;
    }

    public EstadoSolicitud getEstadoNuevo() {
        return estadoNuevo;
    }

    public String getComentario() {
        return comentario;
    }

    public LocalDateTime getFechaCambio() {
        return fechaCambio;
    }

    public SolicitudReparacion getSolicitud() {
        return solicitud;
    }

    public User getResponsable() {
        return responsable;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setEstadoAnterior(EstadoSolicitud estadoAnterior) {
        this.estadoAnterior = estadoAnterior;
    }

    public void setEstadoNuevo(EstadoSolicitud estadoNuevo) {
        this.estadoNuevo = estadoNuevo;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public void setSolicitud(SolicitudReparacion solicitud) {
        this.solicitud = solicitud;
    }

    public void setResponsable(User responsable) {
        this.responsable = responsable;
    }
}