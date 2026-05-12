package com.intifix.intifix_proyecto.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String correoEmisor;

    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public void enviarCodigoVerificacion(
            String correoDestino,
            String nombre,
            String rol,
            String codigo,
            int minutos
    ) {
        SimpleMailMessage mensaje = new SimpleMailMessage();

        mensaje.setFrom(correoEmisor);
        mensaje.setTo(correoDestino);
        mensaje.setSubject("Código de verificación - IntiFix");
        mensaje.setText(
                "Hola " + nombre + ",\n\n" +
                "Estás registrando una cuenta en IntiFix como " + rol + ".\n\n" +
                "Tu código de verificación es: " + codigo + "\n\n" +
                "Este código vence en " + minutos + " minutos.\n\n" +
                "Si tú no solicitaste este registro, ignora este mensaje.\n\n" +
                "Atentamente,\n" +
                "Equipo IntiFix"
        );

        javaMailSender.send(mensaje);
    }

    public void enviarNotificacionTecnicoAprobado(String correoDestino, String nombre) {
        SimpleMailMessage mensaje = new SimpleMailMessage();

        mensaje.setFrom(correoEmisor);
        mensaje.setTo(correoDestino);
        mensaje.setSubject("Solicitud aprobada - IntiFix");
        mensaje.setText(
                "Hola " + nombre + ",\n\n" +
                "Tu solicitud como técnico en IntiFix fue aprobada.\n\n" +
                "Ya puedes iniciar sesión y acceder a tu panel técnico.\n\n" +
                "Atentamente,\n" +
                "Equipo IntiFix"
        );

        javaMailSender.send(mensaje);
    }

    public void enviarNotificacionTecnicoRechazado(String correoDestino, String nombre) {
        SimpleMailMessage mensaje = new SimpleMailMessage();

        mensaje.setFrom(correoEmisor);
        mensaje.setTo(correoDestino);
        mensaje.setSubject("Solicitud rechazada - IntiFix");
        mensaje.setText(
                "Hola " + nombre + ",\n\n" +
                "Tu solicitud como técnico en IntiFix fue rechazada.\n\n" +
                "Puedes comunicarte con soporte si deseas más información.\n\n" +
                "Atentamente,\n" +
                "Equipo IntiFix"
        );

        javaMailSender.send(mensaje);
    }

    public void enviarCodigoRecuperacion(
            String correoDestino,
            String nombre,
            String codigo,
            int minutos
    ) {
        SimpleMailMessage mensaje = new SimpleMailMessage();

        mensaje.setFrom(correoEmisor);
        mensaje.setTo(correoDestino);
        mensaje.setSubject("Recuperación de contraseña - IntiFix");
        mensaje.setText(
                "Hola " + nombre + ",\n\n" +
                "Solicitaste recuperar tu contraseña en IntiFix.\n\n" +
                "Tu código de recuperación es: " + codigo + "\n\n" +
                "Este código vence en " + minutos + " minutos.\n\n" +
                "Si tú no solicitaste este cambio, ignora este mensaje.\n\n" +
                "Atentamente,\n" +
                "Equipo IntiFix"
        );

        javaMailSender.send(mensaje);
    }
}