package com.intifix.intifix_proyecto.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ChangePasswordRequest {

    @NotBlank(message = "El correo es obligatorio.")
    @Email(message = "Ingresa un correo válido.")
    private String email;

    @NotBlank(message = "El código es obligatorio.")
    @Pattern(regexp = "\\d{6}", message = "El código debe tener 6 dígitos.")
    private String code;

    @NotBlank(message = "La nueva contraseña es obligatoria.")
    @Size(min = 6, message = "La contraseña debe tener como mínimo 6 caracteres.")
    private String newPassword;

    public ChangePasswordRequest() {
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

    public String getNewPassword() {
        return newPassword;
    }

	public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}