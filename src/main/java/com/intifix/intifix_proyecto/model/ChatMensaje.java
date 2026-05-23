package com.intifix.intifix_proyecto.model;
 
import jakarta.persistence.*;
import java.time.LocalDateTime;
 
/**
 * Mensaje de chat dentro de una solicitud de reparación.
 * Permite la comunicación directa entre cliente, técnico y admin.
 */
@Entity
@Table(name = "chat_mensajes", indexes = {
    @Index(name = "idx_chat_solicitud", columnList = "solicitud_id"),
    @Index(name = "idx_chat_fecha", columnList = "fecha_envio")
})
public class ChatMensaje {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    /** Solicitud a la que pertenece este mensaje. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitud_id", nullable = false)
    private SolicitudReparacion solicitud;
 
    /** Usuario que envió el mensaje. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "remitente_id", nullable = false)
    private User remitente;
 
    @Column(nullable = false, length = 1000)
    private String contenido;
 
    @Column(name = "fecha_envio", nullable = false)
    private LocalDateTime fechaEnvio;
 
    /** Si el mensaje fue leído por la otra parte. */
    @Column(name = "leido", nullable = false)
    private Boolean leido = false;
 
    @PrePersist
    public void prePersist() {
        fechaEnvio = LocalDateTime.now();
    }
 
    public Long getId() { return id; }
    public SolicitudReparacion getSolicitud() { return solicitud; }
    public User getRemitente() { return remitente; }
    public String getContenido() { return contenido; }
    public LocalDateTime getFechaEnvio() { return fechaEnvio; }
    public Boolean getLeido() { return leido; }
 
    public void setId(Long id) { this.id = id; }
    public void setSolicitud(SolicitudReparacion solicitud) { this.solicitud = solicitud; }
    public void setRemitente(User remitente) { this.remitente = remitente; }
    public void setContenido(String contenido) { this.contenido = contenido; }
    public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }
    public void setLeido(Boolean leido) { this.leido = leido; }
}