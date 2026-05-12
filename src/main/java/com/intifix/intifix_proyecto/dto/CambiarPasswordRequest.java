package com.intifix.intifix_proyecto.dto;

public class CambiarPasswordRequest {

    private String email;
    private String codigo;
    private String nuevaPassword;

    public CambiarPasswordRequest() {
    }

    public String getEmail() {
        return email;
    }

    public String getCodigo() {
        return codigo;
    }

    public String getNuevaPassword() {
        return nuevaPassword;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public void setNuevaPassword(String nuevaPassword) {
        this.nuevaPassword = nuevaPassword;
    }
}