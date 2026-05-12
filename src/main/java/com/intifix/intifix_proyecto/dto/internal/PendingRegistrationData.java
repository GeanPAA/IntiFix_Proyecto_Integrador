package com.intifix.intifix_proyecto.dto.internal;

import java.time.LocalDateTime;

public class PendingRegistrationData {

    private String name;
    private String dni;
    private String email;
    private String phone;
    private String encodedPassword;
    private String role;
    private String verificationMethod;
    private String specialties;
    private String locationType;
    private String serviceZone;
    private String availability;
    private String code;
    private LocalDateTime expiresAt;

    public PendingRegistrationData(
            String name,
            String dni,
            String email,
            String phone,
            String encodedPassword,
            String role,
            String verificationMethod,
            String specialties,
            String locationType,
            String serviceZone,
            String availability,
            String code,
            LocalDateTime expiresAt
    ) {
        this.name = name;
        this.dni = dni;
        this.email = email;
        this.phone = phone;
        this.encodedPassword = encodedPassword;
        this.role = role;
        this.verificationMethod = verificationMethod;
        this.specialties = specialties;
        this.locationType = locationType;
        this.serviceZone = serviceZone;
        this.availability = availability;
        this.code = code;
        this.expiresAt = expiresAt;
    }

    public String getName() { return name; }
    public String getDni() { return dni; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getEncodedPassword() { return encodedPassword; }
    public String getRole() { return role; }
    public String getVerificationMethod() { return verificationMethod; }
    public String getSpecialties() { return specialties; }
    public String getLocationType() { return locationType; }
    public String getServiceZone() { return serviceZone; }
    public String getAvailability() { return availability; }
    public String getCode() { return code; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
}