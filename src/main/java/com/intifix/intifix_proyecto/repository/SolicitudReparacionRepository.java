package com.intifix.intifix_proyecto.repository;

import com.intifix.intifix_proyecto.model.EstadoSolicitud;
import com.intifix.intifix_proyecto.model.SolicitudReparacion;
import com.intifix.intifix_proyecto.model.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SolicitudReparacionRepository extends JpaRepository<SolicitudReparacion, Long> {

    Optional<SolicitudReparacion> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    List<SolicitudReparacion> findByClienteOrderByFechaRegistroDesc(User cliente);

    List<SolicitudReparacion> findByClienteAndEstadoOrderByFechaRegistroDesc(
            User cliente,
            EstadoSolicitud estado
    );

    List<SolicitudReparacion> findByEstadoOrderByFechaRegistroDesc(EstadoSolicitud estado);

    List<SolicitudReparacion> findAllByOrderByFechaRegistroDesc();
}