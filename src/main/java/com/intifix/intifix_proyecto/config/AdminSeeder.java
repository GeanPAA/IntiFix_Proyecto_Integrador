package com.intifix.intifix_proyecto.config;

import com.intifix.intifix_proyecto.model.User;
import com.intifix.intifix_proyecto.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String adminEmail = "admin@intifix.com";

        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }

        User admin = new User();
        admin.setName("Administrador IntiFix");
        admin.setDni("00000000");
        admin.setEmail(adminEmail);
        admin.setPhone("999999999");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole("ADMIN");
        admin.setVerified(true);
        admin.setAccountStatus("APROBADO");
        admin.setFailedAttempts(0);
        admin.setLockedUntil(null);
        admin.setRecoveryCode(null);
        admin.setRecoveryCodeExpiresAt(null);
        admin.setVerificationMethod("EMAIL");

        userRepository.save(admin);
    }
}