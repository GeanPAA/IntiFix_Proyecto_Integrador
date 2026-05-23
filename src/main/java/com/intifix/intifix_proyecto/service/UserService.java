package com.intifix.intifix_proyecto.service;
 
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
 
import com.intifix.intifix_proyecto.dto.request.UpdateProfileRequest;
import com.intifix.intifix_proyecto.dto.response.ProfileResponse;
import com.intifix.intifix_proyecto.model.User;
import com.intifix.intifix_proyecto.repository.UserRepository;
 
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
 
@Service
public class UserService {
 
    private static final long MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final Path AVATARS_DIR = Path.of("uploads", "avatars");
 
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
 
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
 
    // ------------------------------------------------------------------ checks
 
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
 
    public boolean existsByDni(String dni) {
        return userRepository.existsByDni(dni);
    }
 
    public boolean existsByPhone(String phone) {
        return userRepository.existsByPhone(phone);
    }
 
    // ------------------------------------------------------------------ perfil
 
    /**
     * El usuario ve su propio perfil.
     * DNI enmascarado (****5678), teléfono y email completos.
     */
    public ProfileResponse getProfile(String email) {
        User user = buscarPorEmail(email);
        return ProfileResponse.fromOwner(user);
    }
 
    /**
     * Vista pública de un técnico: sin email, teléfono enmascarado, sin DNI.
     * Solo clientes pueden ver técnicos aprobados; admins pueden ver cualquier perfil.
     */
    public ProfileResponse getPublicProfile(String emailSolicitante, Long idObjetivo) {
        User solicitante = buscarPorEmail(emailSolicitante);
        User objetivo = userRepository.findById(idObjetivo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));
 
        if ("ADMIN".equals(solicitante.getRole())) {
            return ProfileResponse.fromAdmin(objetivo);
        }
 
        // Clientes solo pueden ver técnicos aprobados
        if ("CLIENTE".equals(solicitante.getRole())) {
            if (!"TECNICO".equals(objetivo.getRole()) ||
                    !"APROBADO".equals(objetivo.getAccountStatus())) {
                throw new RuntimeException("No tienes permiso para ver este perfil.");
            }
        }
 
        return ProfileResponse.fromPublic(objetivo);
    }
 
    /**
     * Actualiza los datos editables del perfil.
     * No se puede cambiar: rol, DNI, estado de cuenta ni contraseña (hay endpoint separado).
     */
    public ProfileResponse updateProfile(String email, UpdateProfileRequest req) {
        User user = buscarPorEmail(email);
 
        user.setName(req.name.trim());
        user.setPhone(req.phone.trim());
 
        if (req.address != null) {
            user.setAddress(req.address.trim());
        }
 
        // profileImageUrl por URL externa sigue siendo válido como fallback
        if (req.profileImageUrl != null && !req.profileImageUrl.isBlank()) {
            user.setProfileImageUrl(req.profileImageUrl.trim());
        }
 
        if ("TECNICO".equals(user.getRole())) {
            if (req.specialties != null) user.setSpecialties(req.specialties.trim());
            if (req.serviceZone  != null) user.setServiceZone(req.serviceZone.trim());
            if (req.availability != null) user.setAvailability(req.availability.trim());
        }
 
        userRepository.save(user);
        return ProfileResponse.fromOwner(user);
    }
 
    /**
     * Sube una foto de perfil real (multipart) y actualiza la URL en el usuario.
     * El nombre del archivo es determinista (avatar_{id}.ext), así al resubir
     * reemplaza el anterior sin acumular archivos huérfanos.
     *
     * @return URL pública de la imagen guardada
     */
    public String subirFotoPerfil(String email, MultipartFile foto) {
        User user = buscarPorEmail(email);
 
        if (foto == null || foto.isEmpty()) {
            throw new RuntimeException("Debes seleccionar una imagen.");
        }
 
        String tipo = foto.getContentType();
        if (tipo == null || !tipo.startsWith("image/")) {
            throw new RuntimeException("Solo se permiten imágenes (jpg, png, webp).");
        }
 
        if (foto.getSize() > MAX_AVATAR_SIZE) {
            throw new RuntimeException("La imagen no debe superar 5 MB.");
        }
 
        try {
            Files.createDirectories(AVATARS_DIR);
 
            String extension = obtenerExtension(foto.getOriginalFilename());
            String nombreArchivo = "avatar_" + user.getId() + extension;
            Path destino = AVATARS_DIR.resolve(nombreArchivo);
 
            Files.copy(foto.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
 
            String urlPublica = "/uploads/avatars/" + nombreArchivo;
            user.setProfileImageUrl(urlPublica);
            userRepository.save(user);
 
            return urlPublica;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("No se pudo subir la foto de perfil: " + e.getMessage());
        }
    }
 
    /**
     * Cambia la contraseña del usuario autenticado (flujo desde el perfil,
     * no desde recuperación). Requiere la contraseña actual para confirmar identidad.
     *
     * @param email           usuario autenticado
     * @param passwordActual  contraseña que tiene actualmente
     * @param passwordNueva   nueva contraseña (mínimo 6 caracteres)
     */
    public String cambiarPassword(String email, String passwordActual, String passwordNueva) {
        if (passwordNueva == null || passwordNueva.length() < 6) {
            throw new RuntimeException("La nueva contraseña debe tener mínimo 6 caracteres.");
        }
 
        User user = buscarPorEmail(email);
 
        if (!passwordEncoder.matches(passwordActual, user.getPassword())) {
            throw new RuntimeException("La contraseña actual no es correcta.");
        }
 
        user.setPassword(passwordEncoder.encode(passwordNueva));
        userRepository.save(user);
 
        return "Contraseña actualizada correctamente.";
    }
 
    // ------------------------------------------------------------------ cuenta
 
    /**
     * Desactiva la cuenta del usuario (soft delete: pasa a INACTIVO).
     * El usuario puede reactivarla más adelante con su contraseña.
     */
    public void deleteAccount(String email) {
        User user = buscarPorEmail(email);
        user.setAccountStatus("INACTIVO");
        userRepository.save(user);
    }
 
    /**
     * Reactiva una cuenta previamente desactivada por el propio usuario.
     */
    public void reactivateAccount(String email) {
        User user = buscarPorEmail(email);
        user.setAccountStatus("APROBADO");
        userRepository.save(user);
    }
 
    // ------------------------------------------------------------------ helpers
 
    private User buscarPorEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));
    }
 
    private String obtenerExtension(String nombre) {
        if (nombre == null || !nombre.contains(".")) return ".jpg";
        return nombre.substring(nombre.lastIndexOf(".")).toLowerCase();
    }
}