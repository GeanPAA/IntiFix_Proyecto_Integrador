package com.intifix.intifix_proyecto.service;

import com.intifix.intifix_proyecto.dto.internal.PendingRegistrationData;
import com.intifix.intifix_proyecto.dto.request.ConfirmRegisterRequest;
import com.intifix.intifix_proyecto.dto.request.LoginRequest;
import com.intifix.intifix_proyecto.dto.request.RegisterRequest;
import com.intifix.intifix_proyecto.dto.response.LoginResponse;
import com.intifix.intifix_proyecto.model.User;
import com.intifix.intifix_proyecto.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private static final int CODE_EXPIRATION_MINUTES = 5;
    private static final int MAX_LOGIN_ATTEMPTS = 3;
    private static final int LOCK_MINUTES = 5;

    private final Map<String, Integer> unknownEmailAttempts = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> unknownEmailLocks = new ConcurrentHashMap<>();

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SmsService smsService;
    private final PendingRegistrationService pendingRegistrationService;
    private final CodeGeneratorService codeGeneratorService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            SmsService smsService,
            PendingRegistrationService pendingRegistrationService,
            CodeGeneratorService codeGeneratorService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.smsService = smsService;
        this.pendingRegistrationService = pendingRegistrationService;
        this.codeGeneratorService = codeGeneratorService;
    }

    public ResponseEntity<String> solicitarCodigoRegistro(RegisterRequest request) {
        ResponseEntity<String> respuestaDuplicados = validarDuplicados(
                request.getEmail(),
                request.getDni(),
                request.getPhone()
        );

        if (respuestaDuplicados != null) {
            return respuestaDuplicados;
        }

        ResponseEntity<String> respuestaTecnico = validarCamposTecnico(request);

        if (respuestaTecnico != null) {
            return respuestaTecnico;
        }

        String codigoNuevo = codeGeneratorService.generarCodigoSeisDigitos();

        PendingRegistrationData pendingRegistration = new PendingRegistrationData(
                request.getName(),
                request.getDni(),
                request.getEmail(),
                request.getPhone(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole(),
                request.getVerificationMethod(),
                request.getSpecialties(),
                request.getLocationType(),
                request.getServiceZone(),
                request.getAvailability(),
                codigoNuevo,
                LocalDateTime.now().plusMinutes(CODE_EXPIRATION_MINUTES)
        );

        pendingRegistrationService.save(pendingRegistration);

        System.out.println("==========================================");
        System.out.println("VERIFICANDO CONFIGURACIÓN DE CORREO");
        System.out.println("MAIL_USERNAME usado: " + System.getenv("MAIL_USERNAME"));
        System.out.println("MAIL_PASSWORD cargado: " + (System.getenv("MAIL_PASSWORD") != null));
        System.out.println("Método de verificación: " + request.getVerificationMethod());
        System.out.println("Código generado: " + codigoNuevo);
        System.out.println("==========================================");

        try {
            if ("EMAIL".equals(request.getVerificationMethod())) {
                emailService.enviarCodigoVerificacion(
                        request.getEmail(),
                        request.getName(),
                        request.getRole(),
                        codigoNuevo,
                        CODE_EXPIRATION_MINUTES
                );
            } else {
                smsService.enviarCodigoVerificacion(
                        request.getPhone(),
                        request.getName(),
                        codigoNuevo,
                        CODE_EXPIRATION_MINUTES
                );
            }
        } catch (Exception e) {
            pendingRegistrationService.remove(request.getEmail());

            System.out.println("==========================================");
            System.out.println("ERROR AL ENVIAR CÓDIGO");
            e.printStackTrace();
            System.out.println("==========================================");

            return ResponseEntity.internalServerError()
                    .body("No se pudo enviar el código. Error real: " + e.getMessage());
        }

        return ResponseEntity.ok(
                "Se envió un nuevo código de verificación. El código vence en "
                        + CODE_EXPIRATION_MINUTES + " minutos."
        );
    }

    public ResponseEntity<String> confirmarRegistro(ConfirmRegisterRequest request) {
        PendingRegistrationData pendingRegistration = pendingRegistrationService.findByEmail(request.getEmail());

        if (pendingRegistration == null) {
            return ResponseEntity.badRequest()
                    .body("No hay un registro pendiente para este correo. Solicita un nuevo código.");
        }

        if (pendingRegistrationService.isExpired(pendingRegistration)) {
            pendingRegistrationService.remove(request.getEmail());
            return ResponseEntity.badRequest().body("El código venció. Solicita un nuevo código.");
        }

        if (!pendingRegistration.getCode().equals(request.getCode())) {
            return ResponseEntity.badRequest().body("Código incorrecto.");
        }

        ResponseEntity<String> respuestaDuplicados = validarDuplicados(
                pendingRegistration.getEmail(),
                pendingRegistration.getDni(),
                pendingRegistration.getPhone()
        );

        if (respuestaDuplicados != null) {
            pendingRegistrationService.remove(request.getEmail());
            return ResponseEntity.badRequest().body("Los datos del registro ya fueron usados.");
        }

        User user = convertirPendienteAUsuario(pendingRegistration);

        userRepository.save(user);
        pendingRegistrationService.remove(request.getEmail());

        if ("TECNICO".equals(user.getRole())) {
            return ResponseEntity.ok("Registro técnico completado. Tu solicitud está pendiente de aprobación.");
        }

        return ResponseEntity.ok("Registro completado correctamente. Ya puedes iniciar sesión.");
    }

    public ResponseEntity<?> login(LoginRequest request) {
        String email = normalizarEmail(request.getEmail());

        if (estaBloqueadoCorreoNoRegistrado(email)) {
            return ResponseEntity.badRequest()
                    .body("Demasiados intentos fallidos. Intenta nuevamente después de unos minutos.");
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return manejarIntentoCorreoNoRegistrado(email);
        }

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            return ResponseEntity.badRequest()
                    .body("Tu cuenta está bloqueada temporalmente. Intenta nuevamente después de unos minutos.");
        }

        boolean passwordCorrecta = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!passwordCorrecta) {
            return manejarPasswordIncorrecta(user);
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

        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        unknownEmailAttempts.remove(email);
        unknownEmailLocks.remove(email);

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

    private String normalizarEmail(String email) {
        if (email == null) {
            return "";
        }

        return email.trim().toLowerCase();
    }

    private boolean estaBloqueadoCorreoNoRegistrado(String email) {
        LocalDateTime lockedUntil = unknownEmailLocks.get(email);

        if (lockedUntil == null) {
            return false;
        }

        if (lockedUntil.isAfter(LocalDateTime.now())) {
            return true;
        }

        unknownEmailLocks.remove(email);
        unknownEmailAttempts.remove(email);

        return false;
    }

    private ResponseEntity<String> manejarIntentoCorreoNoRegistrado(String email) {
        int intentosActuales = unknownEmailAttempts.getOrDefault(email, 0) + 1;

        if (intentosActuales >= MAX_LOGIN_ATTEMPTS) {
            unknownEmailAttempts.remove(email);
            unknownEmailLocks.put(email, LocalDateTime.now().plusMinutes(LOCK_MINUTES));

            return ResponseEntity.badRequest().body(
                    "Demasiados intentos fallidos. Intenta nuevamente en "
                            + LOCK_MINUTES + " minutos."
            );
        }

        unknownEmailAttempts.put(email, intentosActuales);

        int intentosRestantes = MAX_LOGIN_ATTEMPTS - intentosActuales;

        return ResponseEntity.badRequest().body(
                "Credenciales incorrectas. Intentos restantes: " + intentosRestantes
        );
    }

    private ResponseEntity<String> validarDuplicados(String email, String dni, String phone) {
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("El correo ya está registrado.");
        }

        if (userRepository.existsByDni(dni)) {
            return ResponseEntity.badRequest().body("El DNI ya está registrado.");
        }

        if (userRepository.existsByPhone(phone)) {
            return ResponseEntity.badRequest().body("El teléfono ya está registrado.");
        }

        return null;
    }

    private ResponseEntity<String> validarCamposTecnico(RegisterRequest request) {
        if (!"TECNICO".equals(request.getRole())) {
            return null;
        }

        if (request.getSpecialties() == null || request.getSpecialties().isBlank()) {
            return ResponseEntity.badRequest().body("Selecciona al menos una especialidad.");
        }

        if (request.getLocationType() == null || request.getLocationType().isBlank()) {
            return ResponseEntity.badRequest().body("Selecciona el tipo de ubicación.");
        }

        if (request.getServiceZone() == null || request.getServiceZone().isBlank()) {
            return ResponseEntity.badRequest().body("Ingresa la zona de atención.");
        }

        if (request.getAvailability() == null || request.getAvailability().isBlank()) {
            return ResponseEntity.badRequest().body("Selecciona al menos una disponibilidad.");
        }

        return null;
    }

    private User convertirPendienteAUsuario(PendingRegistrationData pendingRegistration) {
        User user = new User();

        user.setName(pendingRegistration.getName());
        user.setDni(pendingRegistration.getDni());
        user.setEmail(normalizarEmail(pendingRegistration.getEmail()));
        user.setPhone(pendingRegistration.getPhone());
        user.setPassword(pendingRegistration.getEncodedPassword());
        user.setRole(pendingRegistration.getRole());
        user.setVerificationMethod(pendingRegistration.getVerificationMethod());
        user.setSpecialties(pendingRegistration.getSpecialties());
        user.setLocationType(pendingRegistration.getLocationType());
        user.setServiceZone(pendingRegistration.getServiceZone());
        user.setAvailability(pendingRegistration.getAvailability());
        user.setVerified(true);
        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        user.setRecoveryCode(null);
        user.setRecoveryCodeExpiresAt(null);

        if ("TECNICO".equals(pendingRegistration.getRole())) {
            user.setAccountStatus("PENDIENTE");
        } else {
            user.setAccountStatus("APROBADO");
        }

        return user;
    }

    private ResponseEntity<String> manejarPasswordIncorrecta(User user) {
        int intentosActuales = user.getFailedAttempts() == null ? 0 : user.getFailedAttempts();

        user.setFailedAttempts(intentosActuales + 1);

        if (user.getFailedAttempts() >= MAX_LOGIN_ATTEMPTS) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_MINUTES));
            user.setFailedAttempts(0);
            userRepository.save(user);

            return ResponseEntity.badRequest().body(
                    "Tu cuenta ha sido bloqueada temporalmente por demasiados intentos fallidos. Intenta nuevamente en "
                            + LOCK_MINUTES + " minutos."
            );
        }

        userRepository.save(user);

        int intentosRestantes = MAX_LOGIN_ATTEMPTS - user.getFailedAttempts();

        return ResponseEntity.badRequest().body(
                "Contraseña incorrecta. Intentos restantes: " + intentosRestantes
        );
    }
}