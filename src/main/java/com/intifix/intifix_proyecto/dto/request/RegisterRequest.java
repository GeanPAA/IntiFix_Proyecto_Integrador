package com.intifix.intifix_proyecto.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "El nombre es obligatorio.")
    private String name;

    @NotBlank(message = "El DNI es obligatorio.")
    @Pattern(regexp = "\\d{8}", message = "El DNI debe tener 8 dígitos.")
    private String dni;

    @NotBlank(message = "El correo es obligatorio.")
    @Email(message = "Ingresa un correo válido.")
    private String email;

    @NotBlank(message = "El teléfono es obligatorio.")
    @Pattern(regexp = "\\d{9}", message = "El teléfono debe tener 9 dígitos.")
    private String phone;

    @NotBlank(message = "La contraseña es obligatoria.")
    @Size(min = 6, message = "La contraseña debe tener como mínimo 6 caracteres.")
    private String password;

    @NotBlank(message = "El rol es obligatorio.")
    private String role;

    @NotBlank(message = "El método de verificación es obligatorio.")
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

    public void setName(String name) {
        this.name = name;
    }

	public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public String getEmail() {
        return email;
    }

	public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

	public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

	public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

	public void setRole(String role) {
        this.role = role;
    }

    public String getVerificationMethod() {
        return verificationMethod;
    }

	public void setVerificationMethod(String verificationMethod) {
        this.verificationMethod = verificationMethod;
    }

    public String getSpecialties() {
        return specialties;
    }

	public void setSpecialties(String specialties) {
        this.specialties = specialties;
    }

    public String getLocationType() {
        return locationType;
    }

	public void setLocationType(String locationType) {
        this.locationType = locationType;
    }

    public String getServiceZone() {
        return serviceZone;
    }

	public void setServiceZone(String serviceZone) {
        this.serviceZone = serviceZone;
    }

    public String getAvailability() {
        return availability;
    }

	public void setAvailability(String availability) {
        this.availability = availability;
    }
}