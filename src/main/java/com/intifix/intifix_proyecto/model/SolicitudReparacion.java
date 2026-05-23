package com.intifix.intifix_proyecto.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "solicitudes_reparacion")
public class SolicitudReparacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 30)
    private String codigo;

    @NotBlank(message = "El equipo es obligatorio")
    @Column(nullable = false, length = 120)
    private String equipo;

    @NotBlank(message = "El título de la falla es obligatorio")
    @Column(nullable = false, length = 150)
    private String titulo;

    @NotBlank(message = "La descripción es obligatoria")
    @Column(nullable = false, length = 1000)
    private String descripcion;

    @NotNull(message = "La modalidad es obligatoria")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ModalidadServicio modalidad;

    @Column(length = 250)
    private String direccion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private EstadoSolicitud estado = EstadoSolicitud.REGISTRADA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private User cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tecnico_id")
    private User tecnicoAsignado;

    @Column(nullable = false)
    private LocalDateTime fechaRegistro;

    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;

    @OneToMany(mappedBy = "solicitud", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AdjuntoSolicitud> adjuntos = new ArrayList<>();

    @OneToMany(mappedBy = "solicitud", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HistorialEstadoSolicitud> historialEstados = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        fechaRegistro = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getEquipo() {
        return equipo;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public ModalidadServicio getModalidad() {
        return modalidad;
    }

    public String getDireccion() {
        return direccion;
    }

    public EstadoSolicitud getEstado() {
        return estado;
    }

    public User getCliente() {
        return cliente;
    }

    public User getTecnicoAsignado() {
        return tecnicoAsignado;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public List<AdjuntoSolicitud> getAdjuntos() {
        return adjuntos;
    }

    public List<HistorialEstadoSolicitud> getHistorialEstados() {
        return historialEstados;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public void setEquipo(String equipo) {
        this.equipo = equipo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public void setModalidad(ModalidadServicio modalidad) {
        this.modalidad = modalidad;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public void setEstado(EstadoSolicitud estado) {
        this.estado = estado;
    }

    public void setCliente(User cliente) {
        this.cliente = cliente;
    }

    public void setTecnicoAsignado(User tecnicoAsignado) {
        this.tecnicoAsignado = tecnicoAsignado;
    }

    public void setAdjuntos(List<AdjuntoSolicitud> adjuntos) {
        this.adjuntos = adjuntos;
    }

    public void setHistorialEstados(List<HistorialEstadoSolicitud> historialEstados) {
        this.historialEstados = historialEstados;
    }
}