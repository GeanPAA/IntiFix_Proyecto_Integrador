package com.intifix.intifix_proyecto.dto.response;

public class LoginResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String accountStatus;
    private String message;

    public LoginResponse() {
    }

    public LoginResponse(Long id, String name, String email, String phone, String role, String accountStatus, String message) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.accountStatus = accountStatus;
        this.message = message;
    }

    public Long getId() {
        return id;
    }

	public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

	public void setName(String name) {
        this.name = name;
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

    public String getRole() {
        return role;
    }

	public void setRole(String role) {
        this.role = role;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

	public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }

    public String getMessage() {
        return message;
    }

	public void setMessage(String message) {
        this.message = message;
    }
}