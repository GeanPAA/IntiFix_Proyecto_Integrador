package com.intifix.intifix_proyecto.dto.request;
 
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
 
public class ChatMensajeRequest {
 
    @NotBlank(message = "El mensaje no puede estar vacío.")
    @Size(max = 1000, message = "El mensaje no debe superar 1000 caracteres.")
    public String contenido;
}
 