package com.intifix.intifix_proyecto.controller;
 
import com.intifix.intifix_proyecto.dto.request.UpdateProfileRequest;
import com.intifix.intifix_proyecto.service.UserService;
 
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
 
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
 
import java.util.Map;
 
@RestController
@RequestMapping("/api")
public class ProfileController {
 
    private final UserService userService;
 
    public ProfileController(UserService userService) {
        this.userService = userService;
    }
 
    // ------------------------------------------------------------------
    // HU-11 → Ver perfil propio (datos enmascarados según seguridad)
    // ------------------------------------------------------------------
 
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        return ResponseEntity.ok(userService.getProfile(auth.getName()));
    }
 
    // ------------------------------------------------------------------
    // Vista pública de un técnico (sin email, teléfono enmascarado)
    // Solo clientes pueden ver técnicos aprobados
    // ------------------------------------------------------------------
 
    @GetMapping("/profile/{id}/publico")
    public ResponseEntity<?> getPublicProfile(
            Authentication auth,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(userService.getPublicProfile(auth.getName(), id));
    }
 
    // ------------------------------------------------------------------
    // HU-10 → Editar perfil propio
    // ------------------------------------------------------------------
 
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            Authentication auth,
            @Valid @RequestBody UpdateProfileRequest req
    ) {
        return ResponseEntity.ok(userService.updateProfile(auth.getName(), req));
    }
 
    // ------------------------------------------------------------------
    // Subir foto de perfil real (multipart, máx 5 MB)
    // ------------------------------------------------------------------
 
    @PostMapping(value = "/profile/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> subirFotoPerfil(
            Authentication auth,
            @RequestParam("foto") MultipartFile foto
    ) {
        String url = userService.subirFotoPerfil(auth.getName(), foto);
        return ResponseEntity.ok(Map.of(
                "url", url,
                "mensaje", "Foto de perfil actualizada correctamente."
        ));
    }
 
    // ------------------------------------------------------------------
    // Cambiar contraseña desde el perfil (requiere contraseña actual)
    // Distinto al flujo de recuperación (que usa código por email)
    // ------------------------------------------------------------------
 
    @PutMapping("/profile/password")
    public ResponseEntity<?> cambiarPassword(
            Authentication auth,
            @RequestBody CambiarPasswordRequest req
    ) {
        if (req.passwordActual == null || req.passwordActual.isBlank()) {
            return ResponseEntity.badRequest().body("Debes ingresar tu contraseña actual.");
        }
        if (req.passwordNueva == null || req.passwordNueva.length() < 6) {
            return ResponseEntity.badRequest().body("La nueva contraseña debe tener mínimo 6 caracteres.");
        }
        String resultado = userService.cambiarPassword(
                auth.getName(),
                req.passwordActual,
                req.passwordNueva
        );
        return ResponseEntity.ok(resultado);
    }
 
    // ------------------------------------------------------------------
    // HU-12 → Desactivar cuenta (soft delete → INACTIVO)
    // ------------------------------------------------------------------
 
    @DeleteMapping("/profile")
    public ResponseEntity<?> deleteProfile(Authentication auth) {
        userService.deleteAccount(auth.getName());
        return ResponseEntity.ok("Cuenta desactivada correctamente.");
    }
 
    // ------------------------------------------------------------------
    // Reactivar cuenta previamente desactivada
    // ------------------------------------------------------------------
 
    @PutMapping("/profile/reactivate")
    public ResponseEntity<?> reactivateAccount(Authentication auth) {
        userService.reactivateAccount(auth.getName());
        return ResponseEntity.ok("Cuenta reactivada correctamente.");
    }
 
    // ------------------------------------------------------------------
    // DTO interno para cambio de contraseña desde perfil
    // ------------------------------------------------------------------
 
    static class CambiarPasswordRequest {
        @NotBlank(message = "La contraseña actual es obligatoria.")
        public String passwordActual;
 
        @NotBlank(message = "La nueva contraseña es obligatoria.")
        @Size(min = 6, message = "La nueva contraseña debe tener mínimo 6 caracteres.")
        public String passwordNueva;
    }
}