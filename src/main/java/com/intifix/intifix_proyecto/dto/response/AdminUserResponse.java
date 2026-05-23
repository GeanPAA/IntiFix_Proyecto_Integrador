package com.intifix.intifix_proyecto.dto.response;

import com.intifix.intifix_proyecto.model.User;

public class AdminUserResponse {

    public Long id;
    public String name;
    public String dni;
    public String email;
    public String phone;
    public String role;
    public String accountStatus;

    public String address;
    public String profileImageUrl;

    public String specialties;
    public String locationType;
    public String serviceZone;
    public String availability;

    public static AdminUserResponse fromEntity(User user) {
        AdminUserResponse res = new AdminUserResponse();

        res.id = user.getId();
        res.name = user.getName();
        res.dni = user.getDni();
        res.email = user.getEmail();
        res.phone = user.getPhone();
        res.role = user.getRole();
        res.accountStatus = user.getAccountStatus();

        res.address = user.getAddress();
        res.profileImageUrl = user.getProfileImageUrl();

        res.specialties = user.getSpecialties();
        res.locationType = user.getLocationType();
        res.serviceZone = user.getServiceZone();
        res.availability = user.getAvailability();

        return res;
    }
}