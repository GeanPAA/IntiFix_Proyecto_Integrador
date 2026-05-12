package com.intifix.intifix_proyecto.service;

import org.springframework.stereotype.Service;

@Service
public class SmsService {

    public void enviarCodigoVerificacion(String telefonoDestino, String nombre, String codigo, int minutos) {
        System.out.println("==========================================");
        System.out.println("SMS SIMULADO - INTIFIX");
        System.out.println("Para: " + telefonoDestino);
        System.out.println("Hola " + nombre + ", tu código de verificación es: " + codigo);
        System.out.println("Este código vence en " + minutos + " minutos.");
        System.out.println("==========================================");
    }
}