package com.intifix.intifix_proyecto.controller;

import com.intifix.intifix_proyecto.dto.request.ChangePasswordRequest;
import com.intifix.intifix_proyecto.dto.request.RequestCodeRequest;
import com.intifix.intifix_proyecto.dto.request.ValidateCodeRequest;
import com.intifix.intifix_proyecto.service.PasswordRecoveryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/password")
public class PasswordRecoveryController {

    private final PasswordRecoveryService passwordRecoveryService;

    public PasswordRecoveryController(PasswordRecoveryService passwordRecoveryService) {
        this.passwordRecoveryService = passwordRecoveryService;
    }

    @PostMapping("/request-code")
    public ResponseEntity<String> requestCode(@Valid @RequestBody RequestCodeRequest request) {
        return passwordRecoveryService.solicitarCodigoRecuperacion(request);
    }

    @PostMapping("/verify-code")
    public ResponseEntity<String> verifyCode(@Valid @RequestBody ValidateCodeRequest request) {
        return passwordRecoveryService.validarCodigoRecuperacion(request);
    }

    @PostMapping("/change")
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        return passwordRecoveryService.cambiarPassword(request);
    }
}