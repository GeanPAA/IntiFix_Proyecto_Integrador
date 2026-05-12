package com.intifix.intifix_proyecto.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
public class CodeGeneratorService {

    private final SecureRandom secureRandom = new SecureRandom();

    public String generarCodigoSeisDigitos() {
        int codigo = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(codigo);
    }
}