package com.intifix.intifix_proyecto.controller;

import com.intifix.intifix_proyecto.dto.response.TechnicianResponse;
import com.intifix.intifix_proyecto.service.TechnicianService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
public class TechnicianController {

    private final TechnicianService technicianService;

    public TechnicianController(TechnicianService technicianService) {
        this.technicianService = technicianService;
    }

    @GetMapping("/approved")
    public ResponseEntity<List<TechnicianResponse>> getApprovedTechnicians() {
        return ResponseEntity.ok(technicianService.obtenerTecnicosAprobados());
    }
}