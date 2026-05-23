package com.intifix.intifix_proyecto.dto.response;
 
import com.intifix.intifix_proyecto.model.ChatMensaje;
import java.time.LocalDateTime;
 
public class ChatMensajeResponse {
 
    public Long id;
    public Long remitenteId;
    public String remitenteNombre;
    public String remitenteRol;
    public String contenido;
    public LocalDateTime fechaEnvio;
    public Boolean leido;
 
    public static ChatMensajeResponse fromEntity(ChatMensaje m) {
        ChatMensajeResponse r = new ChatMensajeResponse();
        r.id            = m.getId();
        r.remitenteId   = m.getRemitente().getId();
        r.remitenteNombre = m.getRemitente().getName();
        r.remitenteRol  = m.getRemitente().getRole();
        r.contenido     = m.getContenido();
        r.fechaEnvio    = m.getFechaEnvio();
        r.leido         = m.getLeido();
        return r;
    }
}
 