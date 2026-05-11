package com.intifix.intifix_proyecto.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.intifix.intifix_proyecto.model.User;
import com.intifix.intifix_proyecto.repository.UserRepository;
import com.intifix.intifix_proyecto.service.EmailService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final EmailService emailService;

    public AdminController(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @GetMapping("/technicians/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingTechnicians() {

        List<User> technicians = userRepository.findByRoleAndAccountStatus("TECNICO", "PENDIENTE");

        List<Map<String, Object>> response = technicians.stream()
                .map(this::toTechnicianMap)
                .toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/technicians/{id}/approve")
    public ResponseEntity<String> approveTechnician(@PathVariable Long id) {

        User technician = userRepository.findById(id).orElse(null);

        if (technician == null) {
            return ResponseEntity.badRequest().body("Técnico no encontrado.");
        }

        if (!"TECNICO".equals(technician.getRole())) {
            return ResponseEntity.badRequest().body("El usuario no es técnico.");
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

    @PostMapping("/technicians/{id}/reject")
    public ResponseEntity<String> rejectTechnician(@PathVariable Long id) {

        User technician = userRepository.findById(id).orElse(null);

        if (technician == null) {
            return ResponseEntity.badRequest().body("Técnico no encontrado.");
        }

        if (!"TECNICO".equals(technician.getRole())) {
            return ResponseEntity.badRequest().body("El usuario no es técnico.");
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

    private Map<String, Object> toTechnicianMap(User user) {
        Map<String, Object> map = new HashMap<>();

        map.put("id", user.getId());
        map.put("name", user.getName());
        map.put("dni", user.getDni());
        map.put("email", user.getEmail());
        map.put("phone", user.getPhone());
        map.put("role", user.getRole());
        map.put("accountStatus", user.getAccountStatus());
        map.put("specialties", user.getSpecialties());
        map.put("locationType", user.getLocationType());
        map.put("serviceZone", user.getServiceZone());
        map.put("availability", user.getAvailability());

        return map;
    }
}