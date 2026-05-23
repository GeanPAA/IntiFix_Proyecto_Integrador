package com.intifix.intifix_proyecto.dto.request;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UpdateProfileRequest {

    @NotBlank(message = "El nombre es obligatorio")
    public String name;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no tiene un formato válido")
    public String email;

    @NotBlank(message = "El teléfono es obligatorio")
    public String phone;

    public String address;
    public String profileImageUrl;

    // Técnico
    public String specialties;
    public String serviceZone;
    public String availability;
}
