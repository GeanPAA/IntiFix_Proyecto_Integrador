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

        String adminEmail = System.getenv("ADMIN_EMAIL");
        String adminPassword = System.getenv("ADMIN_PASSWORD");

        if (adminEmail == null || adminEmail.isBlank()) {
            System.out.println("ADMIN_EMAIL no configurado. No se creó admin inicial.");
            return;
        }

        if (adminPassword == null || adminPassword.isBlank()) {
            System.out.println("ADMIN_PASSWORD no configurado. No se creó admin inicial.");
            return;
        }

        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();

            admin.setName(System.getenv().getOrDefault("ADMIN_NAME", "Administrador"));
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setDni(System.getenv().getOrDefault("ADMIN_DNI", "00000000"));
            admin.setPhone(System.getenv().getOrDefault("ADMIN_PHONE", "999999999"));
            admin.setRole("ADMIN");
            admin.setAccountStatus("ACTIVO");
            admin.setVerified(true);

            admin.setLocationType("ADMIN");
            admin.setServiceZone("Sistema");
            admin.setAvailability("Disponible");
            admin.setSpecialties("Administración");
            admin.setVerificationMethod("Sistema");

            userRepository.save(admin);

            System.out.println("Admin creado correctamente: " + adminEmail);
        } else {
            System.out.println("El admin ya existe: " + adminEmail);
        }
    }
}