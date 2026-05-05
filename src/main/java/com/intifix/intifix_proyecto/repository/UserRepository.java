package com.intifix.intifix_proyecto.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.intifix.intifix_proyecto.model.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}