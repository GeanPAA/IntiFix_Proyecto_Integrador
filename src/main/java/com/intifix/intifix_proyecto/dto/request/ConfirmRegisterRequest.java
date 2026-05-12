package com.intifix.intifix_proyecto.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ConfirmRegisterRequest {

    @NotBlank(message = "El correo es obligatorio.")
    @Email(message = "Ingresa un correo válido.")
    private String email;

    @NotBlank(message = "El código es obligatorio.")
    @Pattern(regexp = "\\d{6}", message = "El código debe tener 6 dígitos.")
    private String code;

    public ConfirmRegisterRequest() {
    }

    public String getEmail() {
        return email;
    }

	public void setEmail(String email) {
        this.email = email;
    }

    public String getCode() {
        return code;
    }

	public void setCode(String code) {
        this.code = code;
    }
}