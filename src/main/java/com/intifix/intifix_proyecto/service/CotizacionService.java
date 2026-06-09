package com.intifix.intifix_proyecto.service;

import com.intifix.intifix_proyecto.dto.request.CotizacionRequest;
import com.intifix.intifix_proyecto.dto.response.CotizacionResponse;
import com.intifix.intifix_proyecto.model.Cotizacion;
import com.intifix.intifix_proyecto.model.EstadoCotizacion;
import com.intifix.intifix_proyecto.model.EstadoSolicitud;
import com.intifix.intifix_proyecto.model.SolicitudReparacion;
import com.intifix.intifix_proyecto.model.User;
import com.intifix.intifix_proyecto.repository.CotizacionRepository;
import com.intifix.intifix_proyecto.repository.SolicitudReparacionRepository;
import com.intifix.intifix_proyecto.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CotizacionService {

    private final CotizacionRepository cotizacionRepository;
    private final SolicitudReparacionRepository solicitudRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public CotizacionService(
            CotizacionRepository cotizacionRepository,
            SolicitudReparacionRepository solicitudRepository,
            UserRepository userRepository,
            EmailService emailService
    ) {
        this.cotizacionRepository = cotizacionRepository;
        this.solicitudRepository = solicitudRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Transactional
    public CotizacionResponse enviarCotizacion(String emailTecnico, Long solicitudId, CotizacionRequest req) {
        User tecnico = buscarUsuario(emailTecnico, "Tecnico no encontrado.");

        if (!"TECNICO".equals(tecnico.getRole())) {
            throw new RuntimeException("Solo los tecnicos pueden enviar cotizaciones.");
        }

        if (!"APROBADO".equals(tecnico.getAccountStatus())) {
            throw new RuntimeException("Tu cuenta tecnica no esta aprobada para enviar cotizaciones.");
        }

        SolicitudReparacion solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada."));

        validarSolicitudCotizable(solicitud);
        validarRangos(req);

        cotizacionRepository.findBySolicitudAndTecnicoAndEstado(solicitud, tecnico, EstadoCotizacion.ACTIVA)
                .ifPresent(existente -> {
                    throw new RuntimeException("Ya tienes una cotizacion activa para esta solicitud.");
                });

        Cotizacion cotizacion = new Cotizacion();
        cotizacion.setSolicitud(solicitud);
        cotizacion.setTecnico(tecnico);
        cotizacion.setPrecio(req.precio);
        cotizacion.setTiempoHoras(req.tiempoHoras);
        cotizacion.setEstado(EstadoCotizacion.ACTIVA);

        return CotizacionResponse.fromEntity(cotizacionRepository.save(cotizacion));
    }

    @Transactional
    public CotizacionResponse actualizarCotizacion(String emailTecnico, Long cotizacionId, CotizacionRequest req) {
        Cotizacion cotizacion = cotizacionRepository.findById(cotizacionId)
                .orElseThrow(() -> new RuntimeException("Cotizacion no encontrada."));

        User tecnico = buscarUsuario(emailTecnico, "Tecnico no encontrado.");

        if (!cotizacion.getTecnico().getId().equals(tecnico.getId())) {
            throw new RuntimeException("No tienes permiso para actualizar esta cotizacion.");
        }

        if (cotizacion.getEstado() != EstadoCotizacion.ACTIVA) {
            throw new RuntimeException("Solo se pueden actualizar cotizaciones activas.");
        }

        if (cotizacion.getFechaExpiracion() != null && cotizacion.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            cotizacion.setEstado(EstadoCotizacion.EXPIRADA);
            throw new RuntimeException("La cotizacion ya expiro.");
        }

        validarRangos(req);

        cotizacion.setPrecio(req.precio);
        cotizacion.setTiempoHoras(req.tiempoHoras);

        return CotizacionResponse.fromEntity(cotizacionRepository.save(cotizacion));
    }

    @Transactional(readOnly = true)
    public List<CotizacionResponse> listarCotizacionesPorSolicitud(String emailCliente, Long solicitudId) {
        User cliente = buscarUsuario(emailCliente, "Usuario no encontrado.");

        SolicitudReparacion solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada."));

        List<EstadoCotizacion> visibles = List.of(EstadoCotizacion.ACTIVA, EstadoCotizacion.ACEPTADA);
        List<Cotizacion> cotizaciones;

        if (solicitud.getCliente().getId().equals(cliente.getId()) || "ADMIN".equals(cliente.getRole())) {
            cotizaciones = cotizacionRepository.findBySolicitudAndEstadoInOrderByPrecioAsc(solicitud, visibles);
        } else if ("TECNICO".equals(cliente.getRole())) {
            cotizaciones = cotizacionRepository.findBySolicitudAndTecnicoAndEstadoInOrderByPrecioAsc(
                    solicitud,
                    cliente,
                    visibles
            );
        } else {
            throw new RuntimeException("No tienes permiso para ver estas cotizaciones.");
        }

        return cotizaciones
                .stream()
                .filter(cotizacion -> cotizacion.getEstado() == EstadoCotizacion.ACEPTADA || !estaExpirada(cotizacion))
                .map(CotizacionResponse::fromEntity)
                .toList();
    }

    @Transactional
    public void seleccionarCotizacion(String emailCliente, Long cotizacionId) {
        Cotizacion cotizacion = cotizacionRepository.findById(cotizacionId)
                .orElseThrow(() -> new RuntimeException("Cotizacion no encontrada."));

        User cliente = buscarUsuario(emailCliente, "Usuario no encontrado.");
        SolicitudReparacion solicitud = cotizacion.getSolicitud();

        if (!solicitud.getCliente().getId().equals(cliente.getId())) {
            throw new RuntimeException("No tienes permiso para aceptar esta cotizacion.");
        }

        if (solicitud.getEstado() == EstadoSolicitud.ASIGNADA ||
                solicitud.getEstado() == EstadoSolicitud.EN_PROCESO ||
                solicitud.getEstado() == EstadoSolicitud.FINALIZADA ||
                solicitud.getEstado() == EstadoSolicitud.CANCELADA) {
            throw new RuntimeException("Esta solicitud ya no permite aceptar cotizaciones.");
        }

        if (cotizacion.getEstado() != EstadoCotizacion.ACTIVA) {
            throw new RuntimeException("Solo se pueden aceptar cotizaciones activas.");
        }

        if (estaExpirada(cotizacion)) {
            cotizacion.setEstado(EstadoCotizacion.EXPIRADA);
            throw new RuntimeException("La cotizacion ya expiro.");
        }

        cotizacion.setEstado(EstadoCotizacion.ACEPTADA);
        cotizacionRepository.save(cotizacion);

        List<Cotizacion> otras = cotizacionRepository.findBySolicitudOrderByPrecioAsc(solicitud);
        for (Cotizacion otra : otras) {
            if (!otra.getId().equals(cotizacion.getId()) && otra.getEstado() == EstadoCotizacion.ACTIVA) {
                otra.setEstado(EstadoCotizacion.RECHAZADA);
                cotizacionRepository.save(otra);
                notificarCotizacionRechazada(otra, solicitud);
            }
        }

        solicitud.setTecnicoAsignado(cotizacion.getTecnico());
        solicitud.setEstado(EstadoSolicitud.ASIGNADA);
        solicitudRepository.save(solicitud);

        notificarCotizacionAceptada(cotizacion, solicitud);
    }

    @Scheduled(fixedDelay = 600000)
    @Transactional
    public void expirarCotizacionesVencidas() {
        List<Cotizacion> vencidas = cotizacionRepository.findExpiredActive();

        for (Cotizacion cotizacion : vencidas) {
            cotizacion.setEstado(EstadoCotizacion.EXPIRADA);
        }

        cotizacionRepository.saveAll(vencidas);

        if (!vencidas.isEmpty()) {
            System.out.println(vencidas.size() + " cotizaciones marcadas como expiradas.");
        }
    }

    private User buscarUsuario(String email, String mensaje) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException(mensaje));
    }

    private void validarSolicitudCotizable(SolicitudReparacion solicitud) {
        if (solicitud.getEstado() != EstadoSolicitud.REGISTRADA &&
                solicitud.getEstado() != EstadoSolicitud.EN_REVISION) {
            throw new RuntimeException("No puedes enviar cotizaciones para esta solicitud. Estado: " + solicitud.getEstado());
        }
    }

    private void validarRangos(CotizacionRequest req) {
        if (req.precio == null || req.precio < 1 || req.precio > 10000) {
            throw new RuntimeException("El precio debe estar entre 1 y 10000.");
        }

        if (req.tiempoHoras == null || req.tiempoHoras < 1 || req.tiempoHoras > 168) {
            throw new RuntimeException("El tiempo debe estar entre 1 y 168 horas.");
        }
    }

    private boolean estaExpirada(Cotizacion cotizacion) {
        return cotizacion.getFechaExpiracion() != null &&
                cotizacion.getFechaExpiracion().isBefore(LocalDateTime.now());
    }

    private void notificarCotizacionAceptada(Cotizacion cotizacion, SolicitudReparacion solicitud) {
        try {
            emailService.enviarNotificacionCotizacionAceptada(
                    cotizacion.getTecnico().getEmail(),
                    cotizacion.getTecnico().getName(),
                    solicitud.getTitulo()
            );
        } catch (Exception e) {
            System.out.println("Error notificando aceptacion de cotizacion: " + e.getMessage());
        }
    }

    private void notificarCotizacionRechazada(Cotizacion cotizacion, SolicitudReparacion solicitud) {
        try {
            emailService.enviarNotificacionCotizacionRechazada(
                    cotizacion.getTecnico().getEmail(),
                    cotizacion.getTecnico().getName(),
                    solicitud.getTitulo()
            );
        } catch (Exception e) {
            System.out.println("Error notificando rechazo de cotizacion: " + e.getMessage());
        }
    }
}
