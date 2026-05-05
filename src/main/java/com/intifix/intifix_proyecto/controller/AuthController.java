package com.intifix.intifix_proyecto.controller;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.intifix.intifix_proyecto.model.User;
import com.intifix.intifix_proyecto.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public User register(@Valid @RequestBody User user) {
        return userService.register(user);
    }
}
