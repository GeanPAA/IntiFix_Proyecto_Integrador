package com.intifix.intifix_proyecto.dto;

public class ValidarCodigoRequest {

    private String email;
    private String codigo;

    public ValidarCodigoRequest() {
    }

    public String getEmail() {
        return email;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }
}