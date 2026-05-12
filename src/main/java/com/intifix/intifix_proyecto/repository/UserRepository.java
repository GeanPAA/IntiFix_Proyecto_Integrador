package com.intifix.intifix_proyecto.repository;

import com.intifix.intifix_proyecto.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByDni(String dni);

    Optional<User> findByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByDni(String dni);

    boolean existsByPhone(String phone);

    List<User> findByRoleAndAccountStatus(String role, String accountStatus);
}