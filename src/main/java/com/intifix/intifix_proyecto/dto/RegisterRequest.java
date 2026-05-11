package com.intifix.intifix_proyecto.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    @NotBlank(message = "El DNI es obligatorio")
    @Pattern(regexp = "^[0-9]{8}$", message = "El DNI debe tener 8 dígitos")
    private String dni;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no tiene un formato válido")
    private String email;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "^9[0-9]{8}$", message = "El teléfono debe tener 9 dígitos y empezar con 9")
    private String phone;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener mínimo 6 caracteres")
    private String password;

    @NotBlank(message = "El rol es obligatorio")
    @Pattern(regexp = "CLIENTE|TECNICO", message = "El rol debe ser CLIENTE o TECNICO")
    private String role;

    @NotBlank(message = "El método de verificación es obligatorio")
    @Pattern(regexp = "EMAIL|SMS", message = "El método debe ser EMAIL o SMS")
    private String verificationMethod;

    private String specialties;
    private String locationType;
    private String serviceZone;
    private String availability;

    public RegisterRequest() {
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
}