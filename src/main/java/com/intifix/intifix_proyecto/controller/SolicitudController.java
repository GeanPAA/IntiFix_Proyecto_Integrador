package com.intifix.intifix_proyecto.controller;

import com.intifix.intifix_proyecto.dto.request.ActualizarEstadoSolicitudRequest;
import com.intifix.intifix_proyecto.dto.request.SolicitudRequest;
import com.intifix.intifix_proyecto.service.SolicitudService;

import jakarta.validation.Valid;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {

    private final SolicitudService solicitudService;

    public SolicitudController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }

    @PostMapping
    public ResponseEntity<?> registrarSolicitud(
            Authentication auth,
            @Valid @RequestBody SolicitudRequest req
    ) {
        return ResponseEntity.ok(
                solicitudService.registrarSolicitud(auth.getName(), req)
        );
    }

    @GetMapping("/mis-solicitudes")
    public ResponseEntity<?> listarMisSolicitudes(
            Authentication auth,
            @RequestParam(required = false) String estado
    ) {
        return ResponseEntity.ok(
                solicitudService.listarMisSolicitudes(auth.getName(), estado)
        );
    }

    @GetMapping
    public ResponseEntity<?> listarSolicitudesAdmin(
            @RequestParam(required = false) String estado
    ) {
        return ResponseEntity.ok(
                solicitudService.listarSolicitudesAdmin(estado)
        );
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<?> consultarPorCodigo(@PathVariable String codigo) {
        return ResponseEntity.ok(
                solicitudService.consultarPorCodigo(codigo)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerDetalle(
            Authentication auth,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                solicitudService.obtenerDetalle(auth.getName(), id)
        );
    }

    @PostMapping(
            value = "/{id}/evidencias",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> subirEvidencia(
            Authentication auth,
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo
    ) {
        return ResponseEntity.ok(
                solicitudService.subirEvidencia(auth.getName(), id, archivo)
        );
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody ActualizarEstadoSolicitudRequest req
    ) {
        return ResponseEntity.ok(
                solicitudService.actualizarEstado(auth.getName(), id, req)
        );
    }
}