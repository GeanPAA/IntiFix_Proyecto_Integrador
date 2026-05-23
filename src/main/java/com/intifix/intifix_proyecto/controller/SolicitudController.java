package com.intifix.intifix_proyecto.controller;
 
import com.intifix.intifix_proyecto.dto.request.ActualizarEstadoSolicitudRequest;
import com.intifix.intifix_proyecto.dto.request.ChatMensajeRequest;
import com.intifix.intifix_proyecto.dto.request.SolicitudRequest;
import com.intifix.intifix_proyecto.service.SolicitudService;
 
import jakarta.validation.Valid;
 
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
 
import java.util.Map;
 
@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {
 
    private final SolicitudService solicitudService;
 
    public SolicitudController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }
 
    // =====================================================================
    // SOLICITUDES
    // =====================================================================
 
    @PostMapping
    public ResponseEntity<?> registrarSolicitud(
            Authentication auth,
            @Valid @RequestBody SolicitudRequest req
    ) {
        return ResponseEntity.ok(solicitudService.registrarSolicitud(auth.getName(), req));
    }
 
    @GetMapping("/mis-solicitudes")
    public ResponseEntity<?> listarMisSolicitudes(
            Authentication auth,
            @RequestParam(required = false) String estado
    ) {
        return ResponseEntity.ok(solicitudService.listarMisSolicitudes(auth.getName(), estado));
    }
 
    @GetMapping
    public ResponseEntity<?> listarSolicitudesAdmin(
            @RequestParam(required = false) String estado
    ) {
        return ResponseEntity.ok(solicitudService.listarSolicitudesAdmin(estado));
    }
 
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerDetalle(
            Authentication auth,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(solicitudService.obtenerDetalle(auth.getName(), id));
    }
 
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody ActualizarEstadoSolicitudRequest req
    ) {
        return ResponseEntity.ok(solicitudService.actualizarEstado(auth.getName(), id, req));
    }
 
    @PostMapping(value = "/{id}/evidencias", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> subirEvidencia(
            Authentication auth,
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo
    ) {
        return ResponseEntity.ok(solicitudService.subirEvidencia(auth.getName(), id, archivo));
    }
 
    // =====================================================================
    // SEGUIMIENTO PÚBLICO — 3 fases visuales (SIN_REVISAR / REVISADO / EN_ATENCION)
    // No requiere autenticación: cualquiera con el código puede consultar
    // =====================================================================
 
    /**
     * GET /api/solicitudes/seguimiento/{codigo}
     *
     * Responde con SeguimientoResponse que incluye:
     *   - fase: "SIN_REVISAR" | "REVISADO" | "EN_ATENCION"
     *   - faseEtiqueta, faseDescripcion, faseIcono
     *   - pasoActual: 1, 2 o 3 (para barra de progreso en el frontend)
     *   - finalizada, cancelada (booleans)
     *   - tecnicoNombre (si ya fue asignado)
     *
     * No expone email, teléfono ni DNI del cliente.
     */
    @GetMapping("/seguimiento/{codigo}")
    public ResponseEntity<?> consultarSeguimiento(@PathVariable String codigo) {
        return ResponseEntity.ok(solicitudService.consultarSeguimientoPorCodigo(codigo));
    }
 
    // =====================================================================
    // CHAT INTERNO — comunicación cliente ↔ técnico/admin dentro de la solicitud
    // =====================================================================
 
    /**
     * GET /api/solicitudes/{id}/chat
     * Lista todos los mensajes del chat de la solicitud.
     * Marca automáticamente como leídos los mensajes del interlocutor.
     */
    @GetMapping("/{id}/chat")
    public ResponseEntity<?> listarMensajes(
            Authentication auth,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(solicitudService.listarMensajes(auth.getName(), id));
    }
 
    /**
     * POST /api/solicitudes/{id}/chat
     * Envía un nuevo mensaje en el chat de la solicitud.
     * Body: { "contenido": "Tu mensaje aquí" }
     */
    @PostMapping("/{id}/chat")
    public ResponseEntity<?> enviarMensaje(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody ChatMensajeRequest req
    ) {
        return ResponseEntity.ok(solicitudService.enviarMensaje(auth.getName(), id, req));
    }
 
    /**
     * GET /api/solicitudes/{id}/chat/no-leidos
     * Retorna la cantidad de mensajes no leídos en la solicitud para el usuario actual.
     * Útil para mostrar badges/notificaciones en el frontend.
     */
    @GetMapping("/{id}/chat/no-leidos")
    public ResponseEntity<?> contarNoLeidos(
            Authentication auth,
            @PathVariable Long id
    ) {
        long cantidad = solicitudService.contarNoLeidos(auth.getName(), id);
        return ResponseEntity.ok(Map.of("noLeidos", cantidad));
    }
 
    // =====================================================================
    // FOTO DE PERFIL — upload real desde el cliente (no URL externa)
    // =====================================================================
 
    /**
     * POST /api/solicitudes/perfil/foto
     * Sube la foto de perfil del usuario autenticado.
     * Content-Type: multipart/form-data
     * Campo: "foto" (imagen jpg/png/webp, máx 5 MB)
     * Retorna: { "url": "/uploads/avatars/avatar_X.jpg" }
     */
    @PostMapping(value = "/perfil/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> subirFotoPerfil(
            Authentication auth,
            @RequestParam("foto") MultipartFile foto
    ) {
        String url = solicitudService.subirFotoPerfil(auth.getName(), foto);
        return ResponseEntity.ok(Map.of("url", url));
    }
}