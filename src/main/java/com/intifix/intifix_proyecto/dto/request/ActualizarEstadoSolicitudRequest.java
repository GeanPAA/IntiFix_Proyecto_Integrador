package com.intifix.intifix_proyecto.dto.request;
 
import com.intifix.intifix_proyecto.model.EstadoSolicitud;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
 
public class ActualizarEstadoSolicitudRequest {
 
    @NotNull(message = "El nuevo estado es obligatorio.")
    public EstadoSolicitud estadoNuevo;
 
    @Size(max = 500, message = "El comentario no debe superar 500 caracteres.")
    public String comentario;
 
    /**
     * ID del técnico a asignar. Solo aplica cuando estadoNuevo = ASIGNADA.
     * El admin lo usa para asignar explícitamente un técnico a la solicitud.
     */
    public Long tecnicoId;
}
 