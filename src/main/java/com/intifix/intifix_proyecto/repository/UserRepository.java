package com.intifix.intifix_proyecto.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.intifix.intifix_proyecto.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByDni(String dni);

    Optional<User> findByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByDni(String dni);

    boolean existsByPhone(String phone);

    List<User> findByRoleAndAccountStatus(String role, String accountStatus);
}