package com.intifix.intifix_proyecto.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateProfileRequest {

    @NotBlank(message = "El nombre es obligatorio")
    public String name;

    @NotBlank(message = "El teléfono es obligatorio")
    public String phone;

    // Técnico
    public String specialties;
    public String serviceZone;
    public String availability;
}
