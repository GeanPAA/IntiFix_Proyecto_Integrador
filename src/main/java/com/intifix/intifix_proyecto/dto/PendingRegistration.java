package com.intifix.intifix_proyecto.dto;

import java.time.LocalDateTime;

public class PendingRegistration {

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

    public PendingRegistration() {
    }

    public PendingRegistration(
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

    public String getName() {
        return name;
    }

    public String getDni() {
        return dni;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getEncodedPassword() {
        return encodedPassword;
    }

    public String getRole() {
        return role;
    }

    public String getVerificationMethod() {
        return verificationMethod;
    }

    public String getSpecialties() {
        return specialties;
    }

    public String getLocationType() {
        return locationType;
    }

    public String getServiceZone() {
        return serviceZone;
    }

    public String getAvailability() {
        return availability;
    }

    public String getCode() {
        return code;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setEncodedPassword(String encodedPassword) {
        this.encodedPassword = encodedPassword;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setVerificationMethod(String verificationMethod) {
        this.verificationMethod = verificationMethod;
    }

    public void setSpecialties(String specialties) {
        this.specialties = specialties;
    }

    public void setLocationType(String locationType) {
        this.locationType = locationType;
    }

    public void setServiceZone(String serviceZone) {
        this.serviceZone = serviceZone;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
}