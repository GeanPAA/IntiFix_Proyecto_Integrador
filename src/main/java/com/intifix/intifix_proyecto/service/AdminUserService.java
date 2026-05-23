package com.intifix.intifix_proyecto.service;

import com.intifix.intifix_proyecto.dto.response.AdminUserResponse;
import com.intifix.intifix_proyecto.model.User;
import com.intifix.intifix_proyecto.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminUserService {

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<AdminUserResponse> listarUsuarios(String role, String estado, String buscar) {
        return userRepository.findAllByOrderByIdDesc()
                .stream()
                .filter(user -> role == null || role.isBlank() || "TODOS".equalsIgnoreCase(role)
                        || user.getRole().equalsIgnoreCase(role))
                .filter(user -> filtrarEstado(user, estado))
                .filter(user -> filtrarBusqueda(user, buscar))
                .map(AdminUserResponse::fromEntity)
                .toList();
    }

    public AdminUserResponse obtenerUsuario(Long id) {
        return AdminUserResponse.fromEntity(buscarUsuario(id));
    }

    @Transactional
    public AdminUserResponse activarUsuario(Long id) {
        User user = buscarUsuario(id);

        user.setAccountStatus("ACTIVE");

        return AdminUserResponse.fromEntity(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse desactivarUsuario(Long id) {
        User user = buscarUsuario(id);

        user.setAccountStatus("INACTIVE");

        return AdminUserResponse.fromEntity(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse banearUsuario(Long id) {
        User user = buscarUsuario(id);

        user.setAccountStatus("BANNED");

        return AdminUserResponse.fromEntity(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse eliminarUsuario(Long id) {
        User user = buscarUsuario(id);

        user.setAccountStatus("DELETED");

        return AdminUserResponse.fromEntity(userRepository.save(user));
    }

    private User buscarUsuario(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));
    }

    private boolean filtrarEstado(User user, String estado) {
        if (estado == null || estado.isBlank() || "TODOS".equalsIgnoreCase(estado)) {
            return true;
        }

        if (user.getAccountStatus() == null) {
            return false;
        }

        return user.getAccountStatus().equalsIgnoreCase(estado);
    }

    private boolean filtrarBusqueda(User user, String buscar) {
        if (buscar == null || buscar.isBlank()) {
            return true;
        }

        String texto = buscar.toLowerCase();

        return contiene(user.getName(), texto)
                || contiene(user.getEmail(), texto)
                || contiene(user.getDni(), texto)
                || contiene(user.getPhone(), texto)
                || contiene(user.getRole(), texto)
                || contiene(user.getAccountStatus(), texto);
    }

    private boolean contiene(String valor, String texto) {
        return valor != null && valor.toLowerCase().contains(texto);
    }
}