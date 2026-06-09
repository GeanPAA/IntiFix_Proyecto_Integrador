package com.intifix.intifix_proyecto.controller;

import com.intifix.intifix_proyecto.dto.request.CotizacionRequest;
import com.intifix.intifix_proyecto.dto.response.CotizacionResponse;
import com.intifix.intifix_proyecto.service.CotizacionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cotizaciones")
public class CotizacionController {

    private final CotizacionService cotizacionService;

    public CotizacionController(CotizacionService cotizacionService) {
        this.cotizacionService = cotizacionService;
    }

    /**
     * POST /api/cotizaciones/solicitud/{solicitudId}
     * Técnico envía cotización para una solicitud.
     */
    @PostMapping("/solicitud/{solicitudId}")
    public ResponseEntity < ? > enviarCotizacion(
        Authentication auth,
        @PathVariable Long solicitudId,
        @Valid @RequestBody CotizacionRequest req
    ) {
        try {
            CotizacionResponse respuesta = cotizacionService.enviarCotizacion(auth.getName(), solicitudId, req);
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * PUT /api/cotizaciones/{cotizacionId}
     * Técnico actualiza su cotización.
     */
    @PutMapping("/{cotizacionId}")
    public ResponseEntity < ? > actualizarCotizacion(
        Authentication auth,
        @PathVariable Long cotizacionId,
        @Valid @RequestBody CotizacionRequest req
    ) {
        try {
            CotizacionResponse respuesta = cotizacionService.actualizarCotizacion(auth.getName(), cotizacionId, req);
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * GET /api/cotizaciones/solicitud/{solicitudId}/listar
     * Cliente lista cotizaciones para una solicitud (ordenadas por precio).
     */
    @GetMapping("/solicitud/{solicitudId}/listar")
    public ResponseEntity < ? > listarCotizaciones(
        Authentication auth,
        @PathVariable Long solicitudId
    ) {
        try {
            List < CotizacionResponse > cotizaciones = cotizacionService.listarCotizacionesPorSolicitud(auth.getName(), solicitudId);
            return ResponseEntity.ok(cotizaciones);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * POST /api/cotizaciones/{cotizacionId}/aceptar
     * Cliente acepta una cotización (cambia estado a ACEPTADA, rechaza otras, asigna técnico).
     */
    @PostMapping("/{cotizacionId}/aceptar")
    public ResponseEntity < ? > aceptarCotizacion(
        Authentication auth,
        @PathVariable Long cotizacionId
    ) {
        try {
            cotizacionService.seleccionarCotizacion(auth.getName(), cotizacionId);
            return ResponseEntity.ok("Cotización aceptada correctamente. Técnico asignado.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
