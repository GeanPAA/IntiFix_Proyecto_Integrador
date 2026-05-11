package com.intifix.intifix_proyecto.dto;

public class VerifyRequest {

    private String email;
    private String code;

    public VerifyRequest() {
    }

    public String getEmail() {
        return email;
    }

    public String getCode() {
        return code;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setCode(String code) {
        this.code = code;
    }
}