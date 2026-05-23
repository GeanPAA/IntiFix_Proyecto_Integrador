package com.intifix.intifix_proyecto.repository;

import com.intifix.intifix_proyecto.model.HistorialEstadoSolicitud;
import com.intifix.intifix_proyecto.model.SolicitudReparacion;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistorialEstadoSolicitudRepository extends JpaRepository<HistorialEstadoSolicitud, Long> {

    List<HistorialEstadoSolicitud> findBySolicitudOrderByFechaCambioDesc(SolicitudReparacion solicitud);
}