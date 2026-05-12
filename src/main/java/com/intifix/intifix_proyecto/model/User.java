package com.intifix.intifix_proyecto.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "El DNI es obligatorio")
    @Pattern(regexp = "^[0-9]{8}$", message = "El DNI debe tener 8 dígitos")
    @Column(unique = true, nullable = false, length = 8)
    private String dni;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no tiene un formato válido")
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^9[0-9]{8}$", message = "El teléfono debe tener 9 dígitos y empezar con 9")
    @Column(unique = true, nullable = false, length = 9)
    private String phone;

    @NotBlank(message = "La contraseña es obligatoria")
    @Column(nullable = false)
    private String password;

    @NotBlank(message = "El rol es obligatorio")
    @Pattern(regexp = "CLIENTE|TECNICO|ADMIN", message = "El rol debe ser CLIENTE, TECNICO o ADMIN")
    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private Boolean verified;

    @Column(nullable = false)
    private String accountStatus;

    private String verificationMethod;

    @Column(length = 600)
    private String specialties;

    private String locationType;

    @Column(length = 300)
    private String serviceZone;

    @Column(length = 300)
    private String availability;

    @Column(name = "failed_attempts", nullable = false)
    private Integer failedAttempts = 0;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @Column(name = "recovery_code")
    private String recoveryCode;

    @Column(name = "recovery_code_expires_at")
    private LocalDateTime recoveryCodeExpiresAt;

    public User() {
    }

    public Long getId() {
        return id;
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

    public String getPassword() {
        return password;
    }

    public String getRole() {
        return role;
    }

    public Boolean getVerified() {
        return verified;
    }

    public String getAccountStatus() {
        return accountStatus;
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

    public Integer getFailedAttempts() {
        return failedAttempts;
    }

    public LocalDateTime getLockedUntil() {
        return lockedUntil;
    }

    public String getRecoveryCode() {
        return recoveryCode;
    }

    public LocalDateTime getRecoveryCodeExpiresAt() {
        return recoveryCodeExpiresAt;
    }

    public void setId(Long id) {
        this.id = id;
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

    public void setPassword(String password) {
        this.password = password;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
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

    public void setFailedAttempts(Integer failedAttempts) {
        this.failedAttempts = failedAttempts;
    }

    public void setLockedUntil(LocalDateTime lockedUntil) {
        this.lockedUntil = lockedUntil;
    }

    public void setRecoveryCode(String recoveryCode) {
        this.recoveryCode = recoveryCode;
    }

    public void setRecoveryCodeExpiresAt(LocalDateTime recoveryCodeExpiresAt) {
        this.recoveryCodeExpiresAt = recoveryCodeExpiresAt;
    }
}