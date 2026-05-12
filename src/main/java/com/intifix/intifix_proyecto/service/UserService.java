package com.intifix.intifix_proyecto.service;

import com.intifix.intifix_proyecto.repository.UserRepository;
import org.springframework.stereotype.Service;

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
}