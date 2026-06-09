package com.intifix.intifix_proyecto.repository;

import com.intifix.intifix_proyecto.model.Cotizacion;
import com.intifix.intifix_proyecto.model.EstadoCotizacion;
import com.intifix.intifix_proyecto.model.SolicitudReparacion;
import com.intifix.intifix_proyecto.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CotizacionRepository extends JpaRepository<Cotizacion, Long> {

    List<Cotizacion> findBySolicitudOrderByPrecioAsc(SolicitudReparacion solicitud);

    List<Cotizacion> findBySolicitudAndEstadoInOrderByPrecioAsc(
            SolicitudReparacion solicitud,
            List<EstadoCotizacion> estados
    );

    Optional<Cotizacion> findBySolicitudAndTecnico(SolicitudReparacion solicitud, User tecnico);

    Optional<Cotizacion> findBySolicitudAndTecnicoAndEstado(
            SolicitudReparacion solicitud,
            User tecnico,
            EstadoCotizacion estado
    );

    List<Cotizacion> findBySolicitudAndTecnicoAndEstadoInOrderByPrecioAsc(
            SolicitudReparacion solicitud,
            User tecnico,
            List<EstadoCotizacion> estados
    );

    List<Cotizacion> findByTecnicoOrderByFechaCreacionDesc(User tecnico);

    @Query("SELECT c FROM Cotizacion c WHERE c.estado = 'ACTIVA' AND c.fechaExpiracion < CURRENT_TIMESTAMP")
    List<Cotizacion> findExpiredActive();

    Optional<Cotizacion> findBySolicitudAndEstado(SolicitudReparacion solicitud, EstadoCotizacion estado);
}
