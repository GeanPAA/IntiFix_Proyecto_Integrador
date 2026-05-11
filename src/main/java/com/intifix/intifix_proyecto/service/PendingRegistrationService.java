package com.intifix.intifix_proyecto.service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.intifix.intifix_proyecto.dto.PendingRegistration;

@Service
public class PendingRegistrationService {

    private final Map<String, PendingRegistration> pendingRegistrations = new ConcurrentHashMap<>();

    public void save(PendingRegistration pendingRegistration) {
        pendingRegistrations.put(pendingRegistration.getEmail(), pendingRegistration);
    }

    public PendingRegistration findByEmail(String email) {
        return pendingRegistrations.get(email);
    }

    public void remove(String email) {
        pendingRegistrations.remove(email);
    }

    public boolean isExpired(PendingRegistration pendingRegistration) {
        return LocalDateTime.now().isAfter(pendingRegistration.getExpiresAt());
    }
}