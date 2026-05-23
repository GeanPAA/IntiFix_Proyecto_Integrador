package com.intifix.intifix_proyecto.dto.response;
 
import com.intifix.intifix_proyecto.model.User;
 
/**
 * DTO de perfil con control de exposición de datos sensibles.
 *
 * REGLAS DE SEGURIDAD:
 * - El DNI completo NUNCA se envía al cliente (solo los últimos 4 dígitos enmascarados).
 * - El teléfono se enmascara para terceros (solo el dueño ve el número completo).
 * - El correo completo solo lo ve el dueño de la cuenta y los admins.
 * - La contraseña NUNCA se expone (campo omitido siempre).
 * - Los códigos de recuperación NUNCA se exponen.
 *
 * Usa fromOwner() cuando el usuario consulta su propio perfil.
 * Usa fromPublic() cuando otro usuario (ej. cliente viendo técnico) consulta el perfil.
 * Usa fromAdmin() cuando un admin consulta cualquier perfil.
 */
public class ProfileResponse {
 
    public Long id;
    public String name;
    public String role;
    public String accountStatus;
    public String profileImageUrl;
    public String address;
 
    // Técnicos — siempre públicos
    public String specialties;
    public String serviceZone;
    public String availability;
 
    // Datos sensibles — ver métodos para control de exposición
    public String email;        // null en vista pública
    public String phone;        // enmascarado en vista pública
    public String dniMascarado; // solo últimos 4 dígitos, siempre
 
    // -------------------------------------------------------------------------
    /** Vista completa: el usuario viendo su propio perfil. */
    public static ProfileResponse fromOwner(User u) {
        ProfileResponse r = base(u);
        r.email        = u.getEmail();
        r.phone        = u.getPhone();                         // número completo
        r.dniMascarado = mascararDni(u.getDni());             // ****5678
        return r;
    }
 
    /** Vista pública: otro usuario viendo el perfil (ej. cliente → técnico). */
    public static ProfileResponse fromPublic(User u) {
        ProfileResponse r = base(u);
        r.email        = null;                                 // oculto
        r.phone        = mascararTelefono(u.getPhone());      // 9*****21
        r.dniMascarado = null;                                 // totalmente oculto
        return r;
    }
 
    /** Vista admin: acceso completo pero aún sin exponer contraseña ni códigos. */
    public static ProfileResponse fromAdmin(User u) {
        ProfileResponse r = base(u);
        r.email        = u.getEmail();
        r.phone        = u.getPhone();
        r.dniMascarado = mascararDni(u.getDni());
        return r;
    }
 
    // -------------------------------------------------------------------------
    private static ProfileResponse base(User u) {
        ProfileResponse r = new ProfileResponse();
        r.id              = u.getId();
        r.name            = u.getName();
        r.role            = u.getRole();
        r.accountStatus   = u.getAccountStatus();
        r.profileImageUrl = u.getProfileImageUrl();
        r.address         = u.getAddress();
        r.specialties     = u.getSpecialties();
        r.serviceZone     = u.getServiceZone();
        r.availability    = u.getAvailability();
        return r;
    }
 
    /** ****5678 */
    private static String mascararDni(String dni) {
        if (dni == null || dni.length() < 4) return "****";
        return "****" + dni.substring(dni.length() - 4);
    }
 
    /** 9*****21 */
    private static String mascararTelefono(String phone) {
        if (phone == null || phone.length() < 4) return "***";
        return phone.charAt(0) + "*****" + phone.substring(phone.length() - 2);
    }
}
 