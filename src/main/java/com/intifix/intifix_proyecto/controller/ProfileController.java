package com.intifix.intifix_proyecto.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.intifix.intifix_proyecto.dto.UpdateProfileRequest;
import com.intifix.intifix_proyecto.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    // 🔵 HU-11 → Ver perfil
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        return ResponseEntity.ok(userService.getProfile(auth.getName()));
    }

    // 🟡 HU-10 → Editar perfil
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            Authentication auth,
            @Valid @RequestBody UpdateProfileRequest req) {

        return ResponseEntity.ok(
                userService.updateProfile(auth.getName(), req)
        );
    }

    // 🔴 HU-12 → Eliminar cuenta
    @DeleteMapping("/profile")
    public ResponseEntity<?> deleteProfile(Authentication auth) {

        userService.deleteAccount(auth.getName());

        return ResponseEntity.ok("Cuenta desactivada correctamente");
    }
}

