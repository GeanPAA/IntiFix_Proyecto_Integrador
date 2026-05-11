package com.intifix.intifix_proyecto.service;

import org.springframework.stereotype.Service;

import com.intifix.intifix_proyecto.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean emailExiste(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean dniExiste(String dni) {
        return userRepository.existsByDni(dni);
    }
}