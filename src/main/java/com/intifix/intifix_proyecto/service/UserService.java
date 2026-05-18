package com.intifix.intifix_proyecto.service;

import org.springframework.stereotype.Service;

import com.intifix.intifix_proyecto.dto.ProfileResponse;
import com.intifix.intifix_proyecto.dto.UpdateProfileRequest;
import com.intifix.intifix_proyecto.model.User;
import com.intifix.intifix_proyecto.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean existsByDni(String dni) {
        return userRepository.existsByDni(dni);
    }

    public boolean existsByPhone(String phone) {
        return userRepository.existsByPhone(phone);
    }

    public ProfileResponse getProfile(String email) {

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        ProfileResponse res = new ProfileResponse();
        res.name = user.getName();
        res.email = user.getEmail();
        res.phone = user.getPhone();
        res.role = user.getRole();

        if (user.getRole().equals("TECNICO")) {
            res.specialties = user.getSpecialties();
            res.serviceZone = user.getServiceZone();
            res.availability = user.getAvailability();
        }

        return res;
    }

    public ProfileResponse updateProfile(String email, UpdateProfileRequest req) {

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setName(req.name);
        user.setPhone(req.phone);

        if (user.getRole().equals("TECNICO")) {
            user.setSpecialties(req.specialties);
            user.setServiceZone(req.serviceZone);
            user.setAvailability(req.availability);
        }

        userRepository.save(user);

        return getProfile(email);
    }

    public void deleteAccount(String email) {

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setAccountStatus("INACTIVO");

        userRepository.save(user);
    }

    public void reactivateAccount(String email) {

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setAccountStatus("APROBADO"); // o "ACTIVO"
        userRepository.save(user);
    }
}