package com.intifix.intifix_proyecto.service;

import com.intifix.intifix_proyecto.dto.request.ChangePasswordRequest;
import com.intifix.intifix_proyecto.dto.request.RequestCodeRequest;
import com.intifix.intifix_proyecto.dto.request.ValidateCodeRequest;
import com.intifix.intifix_proyecto.model.User;
import com.intifix.intifix_proyecto.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PasswordRecoveryService {

    private static final int RECOVERY_CODE_EXPIRATION_MINUTES = 10;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final CodeGeneratorService codeGeneratorService;

    public PasswordRecoveryService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            CodeGeneratorService codeGeneratorService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.codeGeneratorService = codeGeneratorService;
    }

    public ResponseEntity<String> solicitarCodigoRecuperacion(RequestCodeRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body("El correo ingresado no se encuentra registrado.");
        }

        String codigo = codeGeneratorService.generarCodigoSeisDigitos();

        user.setRecoveryCode(codigo);
        user.setRecoveryCodeExpiresAt(LocalDateTime.now().plusMinutes(RECOVERY_CODE_EXPIRATION_MINUTES));
        userRepository.save(user);

        try {
            emailService.enviarCodigoRecuperacion(
                    user.getEmail(),
                    user.getName(),
                    codigo,
                    RECOVERY_CODE_EXPIRATION_MINUTES
            );
        } catch (Exception e) {
            user.setRecoveryCode(null);
            user.setRecoveryCodeExpiresAt(null);
            userRepository.save(user);

            return ResponseEntity.internalServerError()
                    .body("No se pudo enviar el código de recuperación. Revisa tu configuración de correo.");
        }

        return ResponseEntity.ok("Se envió un código de recuperación a tu correo electrónico.");
    }

    public ResponseEntity<String> validarCodigoRecuperacion(ValidateCodeRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body("El correo ingresado no se encuentra registrado.");
        }

        ResponseEntity<String> respuestaCodigo = validarCodigoActivo(user, request.getCode());

        if (respuestaCodigo != null) {
            return respuestaCodigo;
        }

        return ResponseEntity.ok("Código validado correctamente. Ahora puedes registrar una nueva contraseña.");
    }

    public ResponseEntity<String> cambiarPassword(ChangePasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body("El correo ingresado no se encuentra registrado.");
        }

        ResponseEntity<String> respuestaCodigo = validarCodigoActivo(user, request.getCode());

        if (respuestaCodigo != null) {
            return respuestaCodigo;
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setRecoveryCode(null);
        user.setRecoveryCodeExpiresAt(null);
        user.setFailedAttempts(0);
        user.setLockedUntil(null);

        userRepository.save(user);

        return ResponseEntity.ok("Tu contraseña fue actualizada correctamente. Ya puedes iniciar sesión.");
    }

    private ResponseEntity<String> validarCodigoActivo(User user, String codigo) {
        if (user.getRecoveryCode() == null || user.getRecoveryCodeExpiresAt() == null) {
            return ResponseEntity.badRequest().body("No existe un código de recuperación activo.");
        }

        if (user.getRecoveryCodeExpiresAt().isBefore(LocalDateTime.now())) {
            user.setRecoveryCode(null);
            user.setRecoveryCodeExpiresAt(null);
            userRepository.save(user);

            return ResponseEntity.badRequest().body("El código venció. Solicita uno nuevo.");
        }

        if (!user.getRecoveryCode().equals(codigo)) {
            return ResponseEntity.badRequest().body("Código incorrecto.");
        }

        return null;
    }
}