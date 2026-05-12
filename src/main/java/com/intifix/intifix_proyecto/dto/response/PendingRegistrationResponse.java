package com.intifix.intifix_proyecto.dto.response;

public class PendingRegistrationResponse extends TechnicianResponse {

    public PendingRegistrationResponse() {
    }

    public PendingRegistrationResponse(
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
        super(id, name, dni, email, phone, specialties, locationType, serviceZone, availability, accountStatus);
    }
}