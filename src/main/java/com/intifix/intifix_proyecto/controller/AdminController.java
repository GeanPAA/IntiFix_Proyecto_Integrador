package com.intifix.intifix_proyecto.controller;

import com.intifix.intifix_proyecto.dto.response.PendingRegistrationResponse;
import com.intifix.intifix_proyecto.service.TechnicianService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/technicians")
public class AdminController {

    private final TechnicianService technicianService;

    public AdminController(TechnicianService technicianService) {
        this.technicianService = technicianService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<PendingRegistrationResponse>> getPendingTechnicians() {
        return ResponseEntity.ok(technicianService.obtenerTecnicosPendientes());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<String> approveTechnician(@PathVariable Long id) {
        return technicianService.aprobarTecnico(id);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<String> rejectTechnician(@PathVariable Long id) {
        return technicianService.rechazarTecnico(id);
    }
}