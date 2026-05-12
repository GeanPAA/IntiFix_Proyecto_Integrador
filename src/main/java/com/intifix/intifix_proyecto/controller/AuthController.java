package com.intifix.intifix_proyecto.controller;

import com.intifix.intifix_proyecto.dto.request.ConfirmRegisterRequest;
import com.intifix.intifix_proyecto.dto.request.LoginRequest;
import com.intifix.intifix_proyecto.dto.request.RegisterRequest;
import com.intifix.intifix_proyecto.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register/request-code")
    public ResponseEntity<String> requestRegisterCode(@Valid @RequestBody RegisterRequest request) {
        return authService.solicitarCodigoRegistro(request);
    }

    @PostMapping("/register/confirm")
    public ResponseEntity<String> confirmRegister(@Valid @RequestBody ConfirmRegisterRequest request) {
        return authService.confirmarRegistro(request);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}