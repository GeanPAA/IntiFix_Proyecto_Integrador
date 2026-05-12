package com.intifix.intifix_proyecto.dto.response;

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

	public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

	public void setName(String name) {
        this.name = name;
    }

    public String getDni() {
        return dni;
    }

	public void setDni(String dni) {
        this.dni = dni;
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

    public String getSpecialties() {
        return specialties;
    }

	public void setSpecialties(String specialties) {
        this.specialties = specialties;
    }

    public String getLocationType() {
        return locationType;
    }

	public void setLocationType(String locationType) {
        this.locationType = locationType;
    }

    public String getServiceZone() {
        return serviceZone;
    }

	public void setServiceZone(String serviceZone) {
        this.serviceZone = serviceZone;
    }

    public String getAvailability() {
        return availability;
    }

	public void setAvailability(String availability) {
        this.availability = availability;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

	public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }
}