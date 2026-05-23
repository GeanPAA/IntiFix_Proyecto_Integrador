package com.intifix.intifix_proyecto.controller;

import com.intifix.intifix_proyecto.service.AdminUserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ResponseEntity<?> listarUsuarios(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String buscar
    ) {
        return ResponseEntity.ok(
                adminUserService.listarUsuarios(role, estado, buscar)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(
                adminUserService.obtenerUsuario(id)
        );
    }

    @PutMapping("/{id}/activar")
    public ResponseEntity<?> activarUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(
                adminUserService.activarUsuario(id)
        );
    }

    @PutMapping("/{id}/desactivar")
    public ResponseEntity<?> desactivarUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(
                adminUserService.desactivarUsuario(id)
        );
    }

    @PutMapping("/{id}/banear")
    public ResponseEntity<?> banearUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(
                adminUserService.banearUsuario(id)
        );
    }

    @PutMapping("/{id}/eliminar")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(
                adminUserService.eliminarUsuario(id)
        );
    }
}