package com.intifix.intifix_proyecto.repository;
 
import com.intifix.intifix_proyecto.model.ChatMensaje;
import com.intifix.intifix_proyecto.model.SolicitudReparacion;
import com.intifix.intifix_proyecto.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
 
import java.util.List;
 
public interface ChatMensajeRepository extends JpaRepository<ChatMensaje, Long> {
 
    /** Todos los mensajes de una solicitud, ordenados cronológicamente. */
    List<ChatMensaje> findBySolicitudOrderByFechaEnvioAsc(SolicitudReparacion solicitud);
 
    /** Cantidad de mensajes no leídos para un usuario en una solicitud. */
    @Query("""
        SELECT COUNT(m) FROM ChatMensaje m
        WHERE m.solicitud = :solicitud
          AND m.remitente <> :usuario
          AND m.leido = false
    """)
    long contarNoLeidos(SolicitudReparacion solicitud, User usuario);
 
    /** Marca como leídos todos los mensajes de una solicitud que no envió el usuario. */
    @Modifying
    @Query("""
        UPDATE ChatMensaje m SET m.leido = true
        WHERE m.solicitud = :solicitud
          AND m.remitente <> :usuario
          AND m.leido = false
    """)
    void marcarComoLeidos(SolicitudReparacion solicitud, User usuario);
}