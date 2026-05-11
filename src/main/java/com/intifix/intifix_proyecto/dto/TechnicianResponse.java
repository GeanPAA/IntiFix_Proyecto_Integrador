package com.intifix.intifix_proyecto.dto;

public class TechnicianResponse {

    private Long id;
    private String name;
    private String dni;
    private String email;
    private String phone;
    private String specialties;
    private String locationType;
    private String serviceZone;
    private String availability;
    private String accountStatus;

    public TechnicianResponse() {
    }

    public TechnicianResponse(
            Long id,
            String name,
            String dni,
            String email,
            String phone,
            String specialties,
            String locationType,
            String serviceZone,
            String availability,
            String accountStatus
    ) {
        this.id = id;
        this.name = name;
        this.dni = dni;
        this.email = email;
        this.phone = phone;
        this.specialties = specialties;
        this.locationType = locationType;
        this.serviceZone = serviceZone;
        this.availability = availability;
        this.accountStatus = accountStatus;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDni() {
        return dni;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getSpecialties() {
        return specialties;
    }

    public String getLocationType() {
        return locationType;
    }

    public String getServiceZone() {
        return serviceZone;
    }

    public String getAvailability() {
        return availability;
    }

    public String getAccountStatus() {
        return accountStatus;
    }
}