package com.intifix.intifix_proyecto.controller;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.intifix.intifix_proyecto.dto.ConfirmRegisterRequest;
import com.intifix.intifix_proyecto.dto.LoginRequest;
import com.intifix.intifix_proyecto.dto.LoginResponse;
import com.intifix.intifix_proyecto.dto.PendingRegistration;
import com.intifix.intifix_proyecto.dto.RegisterRequest;
import com.intifix.intifix_proyecto.model.User;
import com.intifix.intifix_proyecto.repository.UserRepository;
import com.intifix.intifix_proyecto.service.EmailService;
import com.intifix.intifix_proyecto.service.PendingRegistrationService;
import com.intifix.intifix_proyecto.service.SmsService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final int CODE_EXPIRATION_MINUTES = 5;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SmsService smsService;
    private final PendingRegistrationService pendingRegistrationService;

    private final SecureRandom secureRandom = new SecureRandom();

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            SmsService smsService,
            PendingRegistrationService pendingRegistrationService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.smsService = smsService;
        this.pendingRegistrationService = pendingRegistrationService;
    }

    @GetMapping("/check-email")
    public ResponseEntity<String> checkEmail(@RequestParam String email) {

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Debes ingresar un correo");
        }

        if (!email.contains("@")) {
            return ResponseEntity.badRequest().body("El correo no tiene un formato válido");
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("Correo ya registrado");
        }

        return ResponseEntity.ok("Correo disponible");
    }

    @GetMapping("/check-dni")
    public ResponseEntity<String> checkDni(@RequestParam String dni) {

        if (dni == null || dni.isBlank()) {
            return ResponseEntity.badRequest().body("Debes ingresar un DNI");
        }

        if (!dni.matches("^[0-9]{8}$")) {
            return ResponseEntity.badRequest().body("El DNI debe tener 8 números");
        }

        if (userRepository.existsByDni(dni)) {
            return ResponseEntity.badRequest().body("DNI ya registrado");
        }

        return ResponseEntity.ok("DNI disponible");
    }

    @GetMapping("/check-phone")
    public ResponseEntity<String> checkPhone(@RequestParam String phone) {

        if (phone == null || phone.isBlank()) {
            return ResponseEntity.badRequest().body("Debes ingresar un teléfono");
        }

        if (!phone.matches("^9[0-9]{8}$")) {
            return ResponseEntity.badRequest().body("El teléfono debe tener 9 dígitos y empezar con 9");
        }

        if (userRepository.existsByPhone(phone)) {
            return ResponseEntity.badRequest().body("Teléfono ya registrado");
        }

        return ResponseEntity.ok("Teléfono disponible");
    }

    @PostMapping("/register/request-code")
    public ResponseEntity<String> requestRegisterCode(@Valid @RequestBody RegisterRequest registerRequest) {

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body("El correo ya está registrado");
        }

        if (userRepository.existsByDni(registerRequest.getDni())) {
            return ResponseEntity.badRequest().body("El DNI ya está registrado");
        }

        if (userRepository.existsByPhone(registerRequest.getPhone())) {
            return ResponseEntity.badRequest().body("El teléfono ya está registrado");
        }

        if ("TECNICO".equals(registerRequest.getRole())) {
            if (registerRequest.getSpecialties() == null || registerRequest.getSpecialties().isBlank()) {
                return ResponseEntity.badRequest().body("Selecciona al menos una especialidad.");
            }

            if (registerRequest.getLocationType() == null || registerRequest.getLocationType().isBlank()) {
                return ResponseEntity.badRequest().body("Selecciona el tipo de ubicación.");
            }

            if (registerRequest.getServiceZone() == null || registerRequest.getServiceZone().isBlank()) {
                return ResponseEntity.badRequest().body("Ingresa la zona de atención.");
            }

            if (registerRequest.getAvailability() == null || registerRequest.getAvailability().isBlank()) {
                return ResponseEntity.badRequest().body("Selecciona al menos una disponibilidad.");
            }
        }

        String codigoNuevo = generarCodigoVerificacion();

        PendingRegistration pendingRegistration = new PendingRegistration(
                registerRequest.getName(),
                registerRequest.getDni(),
                registerRequest.getEmail(),
                registerRequest.getPhone(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getRole(),
                registerRequest.getVerificationMethod(),
                registerRequest.getSpecialties(),
                registerRequest.getLocationType(),
                registerRequest.getServiceZone(),
                registerRequest.getAvailability(),
                codigoNuevo,
                LocalDateTime.now().plusMinutes(CODE_EXPIRATION_MINUTES)
        );

        pendingRegistrationService.save(pendingRegistration);

        try {
            if ("EMAIL".equals(registerRequest.getVerificationMethod())) {
                emailService.enviarCodigoVerificacion(
                        registerRequest.getEmail(),
                        registerRequest.getName(),
                        registerRequest.getRole(),
                        codigoNuevo,
                        CODE_EXPIRATION_MINUTES
                );
            } else {
                smsService.enviarCodigoVerificacion(
                        registerRequest.getPhone(),
                        registerRequest.getName(),
                        codigoNuevo,
                        CODE_EXPIRATION_MINUTES
                );
            }
        } catch (Exception e) {
            pendingRegistrationService.remove(registerRequest.getEmail());
            return ResponseEntity.internalServerError()
                    .body("No se pudo enviar el código. Revisa el método de verificación.");
        }

        return ResponseEntity.ok(
                "Se envió un nuevo código de verificación. El código vence en "
                        + CODE_EXPIRATION_MINUTES + " minutos."
        );
    }

    @PostMapping("/register/confirm")
    public ResponseEntity<String> confirmRegister(@RequestBody ConfirmRegisterRequest confirmRegisterRequest) {

        if (confirmRegisterRequest.getEmail() == null || confirmRegisterRequest.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body("El correo es obligatorio.");
        }

        if (confirmRegisterRequest.getCode() == null || !confirmRegisterRequest.getCode().matches("^[0-9]{6}$")) {
            return ResponseEntity.badRequest().body("Debes ingresar un código válido de 6 números.");
        }

        PendingRegistration pendingRegistration =
                pendingRegistrationService.findByEmail(confirmRegisterRequest.getEmail());

        if (pendingRegistration == null) {
            return ResponseEntity.badRequest()
                    .body("No hay un registro pendiente para este correo. Solicita un nuevo código.");
        }

        if (pendingRegistrationService.isExpired(pendingRegistration)) {
            pendingRegistrationService.remove(confirmRegisterRequest.getEmail());
            return ResponseEntity.badRequest().body("El código venció. Solicita un nuevo código.");
        }

        if (!pendingRegistration.getCode().equals(confirmRegisterRequest.getCode())) {
            return ResponseEntity.badRequest().body("Código incorrecto.");
        }

        if (userRepository.existsByEmail(pendingRegistration.getEmail())) {
            pendingRegistrationService.remove(confirmRegisterRequest.getEmail());
            return ResponseEntity.badRequest().body("El correo ya fue registrado.");
        }

        if (userRepository.existsByDni(pendingRegistration.getDni())) {
            pendingRegistrationService.remove(confirmRegisterRequest.getEmail());
            return ResponseEntity.badRequest().body("El DNI ya fue registrado.");
        }

        if (userRepository.existsByPhone(pendingRegistration.getPhone())) {
            pendingRegistrationService.remove(confirmRegisterRequest.getEmail());
            return ResponseEntity.badRequest().body("El teléfono ya fue registrado.");
        }

        User user = new User();
        user.setName(pendingRegistration.getName());
        user.setDni(pendingRegistration.getDni());
        user.setEmail(pendingRegistration.getEmail());
        user.setPhone(pendingRegistration.getPhone());
        user.setPassword(pendingRegistration.getEncodedPassword());
        user.setRole(pendingRegistration.getRole());
        user.setVerificationMethod(pendingRegistration.getVerificationMethod());
        user.setSpecialties(pendingRegistration.getSpecialties());
        user.setLocationType(pendingRegistration.getLocationType());
        user.setServiceZone(pendingRegistration.getServiceZone());
        user.setAvailability(pendingRegistration.getAvailability());
        user.setVerified(true);

        if ("TECNICO".equals(pendingRegistration.getRole())) {
            user.setAccountStatus("PENDIENTE");
        } else {
            user.setAccountStatus("APROBADO");
        }

        userRepository.save(user);
        pendingRegistrationService.remove(confirmRegisterRequest.getEmail());

        if ("TECNICO".equals(user.getRole())) {
            return ResponseEntity.ok("Registro técnico completado. Tu solicitud está pendiente de aprobación.");
        }

        return ResponseEntity.ok("Registro completado correctamente. Ya puedes iniciar sesión.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        User user = userRepository.findByEmail(loginRequest.getEmail()).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().body("El correo no existe");
        }

        boolean passwordCorrecta = passwordEncoder.matches(
                loginRequest.getPassword(),
                user.getPassword()
        );

        if (!passwordCorrecta) {
            return ResponseEntity.badRequest().body("Contraseña incorrecta");
        }

        if (!Boolean.TRUE.equals(user.getVerified())) {
            return ResponseEntity.badRequest().body("Debes verificar tu cuenta antes de iniciar sesión.");
        }

        if ("TECNICO".equals(user.getRole())) {
            if ("PENDIENTE".equals(user.getAccountStatus())) {
                return ResponseEntity.badRequest().body("Tu solicitud como técnico aún está pendiente de aprobación.");
            }

            if ("RECHAZADO".equals(user.getAccountStatus())) {
                return ResponseEntity.badRequest().body("Tu solicitud como técnico fue rechazada.");
            }
        }

        LoginResponse response = new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getAccountStatus(),
                "Inicio de sesión correcto."
        );

        return ResponseEntity.ok(response);
    }

    private String generarCodigoVerificacion() {
        int codigo = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(codigo);
    }
}