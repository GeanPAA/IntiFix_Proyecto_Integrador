package com.intifix.intifix_proyecto.service;

import com.intifix.intifix_proyecto.dto.response.PendingRegistrationResponse;
import com.intifix.intifix_proyecto.dto.response.TechnicianResponse;
import com.intifix.intifix_proyecto.model.User;
import com.intifix.intifix_proyecto.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TechnicianService {

    private final UserRepository userRepository;
    private final EmailService emailService;

    public TechnicianService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public List<PendingRegistrationResponse> obtenerTecnicosPendientes() {
        return userRepository.findByRoleAndAccountStatus("TECNICO", "PENDIENTE")
                .stream()
                .map(this::toPendingRegistrationResponse)
                .toList();
    }

    public List<TechnicianResponse> obtenerTecnicosAprobados() {
        return userRepository.findByRoleAndAccountStatus("TECNICO", "APROBADO")
                .stream()
                .map(this::toTechnicianResponse)
                .toList();
    }

    public ResponseEntity<String> aprobarTecnico(Long id) {
        User technician = userRepository.findById(id).orElse(null);

        ResponseEntity<String> validation = validarTecnico(technician);

        if (validation != null) {
            return validation;
        }

        technician.setAccountStatus("APROBADO");
        userRepository.save(technician);

        try {
            emailService.enviarNotificacionTecnicoAprobado(
                    technician.getEmail(),
                    technician.getName()
            );
        } catch (Exception e) {
            return ResponseEntity.ok("Técnico aprobado, pero no se pudo enviar el correo de notificación.");
        }

        return ResponseEntity.ok("Técnico aprobado correctamente.");
    }

    public ResponseEntity<String> rechazarTecnico(Long id) {
        User technician = userRepository.findById(id).orElse(null);

        ResponseEntity<String> validation = validarTecnico(technician);

        if (validation != null) {
            return validation;
        }

        technician.setAccountStatus("RECHAZADO");
        userRepository.save(technician);

        try {
            emailService.enviarNotificacionTecnicoRechazado(
                    technician.getEmail(),
                    technician.getName()
            );
        } catch (Exception e) {
            return ResponseEntity.ok("Técnico rechazado, pero no se pudo enviar el correo de notificación.");
        }

        return ResponseEntity.ok("Técnico rechazado correctamente.");
    }

    private ResponseEntity<String> validarTecnico(User technician) {
        if (technician == null) {
            return ResponseEntity.badRequest().body("Técnico no encontrado.");
        }

        if (!"TECNICO".equals(technician.getRole())) {
            return ResponseEntity.badRequest().body("El usuario no es técnico.");
        }

        return null;
    }

    private PendingRegistrationResponse toPendingRegistrationResponse(User user) {
        return new PendingRegistrationResponse(
                user.getId(),
                user.getName(),
                user.getDni(),
                user.getEmail(),
                user.getPhone(),
                user.getSpecialties(),
                user.getLocationType(),
                user.getServiceZone(),
                user.getAvailability(),
                user.getAccountStatus()
        );
    }

    private TechnicianResponse toTechnicianResponse(User user) {
        return new TechnicianResponse(
                user.getId(),
                user.getName(),
                user.getDni(),
                user.getEmail(),
                user.getPhone(),
                user.getSpecialties(),
                user.getLocationType(),
                user.getServiceZone(),
                user.getAvailability(),
                user.getAccountStatus()
        );
    }
}