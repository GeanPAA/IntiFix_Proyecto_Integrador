package com.intifix.intifix_proyecto.service;

import com.intifix.intifix_proyecto.dto.internal.PendingRegistrationData;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PendingRegistrationService {

    private final Map<String, PendingRegistrationData> pendingRegistrations = new ConcurrentHashMap<>();

    public void save(PendingRegistrationData pendingRegistration) {
        pendingRegistrations.put(pendingRegistration.getEmail(), pendingRegistration);
    }

    public PendingRegistrationData findByEmail(String email) {
        return pendingRegistrations.get(email);
    }

    public void remove(String email) {
        pendingRegistrations.remove(email);
    }

    public boolean isExpired(PendingRegistrationData pendingRegistration) {
        return LocalDateTime.now().isAfter(pendingRegistration.getExpiresAt());
    }
}