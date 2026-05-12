package com.intifix.intifix_proyecto.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RequestCodeRequest {

    @NotBlank(message = "El correo es obligatorio.")
    @Email(message = "Ingresa un correo válido.")
    private String email;

    public RequestCodeRequest() {
    }

    public String getEmail() {
        return email;
    }

	public void setEmail(String email) {
        this.email = email;
    }
}