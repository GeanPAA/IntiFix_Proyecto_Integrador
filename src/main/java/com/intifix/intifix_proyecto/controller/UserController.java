package com.intifix.intifix_proyecto.controller;

import com.intifix.intifix_proyecto.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/check-email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String email) {
        return ResponseEntity.ok(Map.of("exists", userService.existsByEmail(email)));
    }

    @GetMapping("/check-dni")
    public ResponseEntity<Map<String, Boolean>> checkDni(@RequestParam String dni) {
        return ResponseEntity.ok(Map.of("exists", userService.existsByDni(dni)));
    }

    @GetMapping("/check-phone")
    public ResponseEntity<Map<String, Boolean>> checkPhone(@RequestParam String phone) {
        return ResponseEntity.ok(Map.of("exists", userService.existsByPhone(phone)));
    }
}