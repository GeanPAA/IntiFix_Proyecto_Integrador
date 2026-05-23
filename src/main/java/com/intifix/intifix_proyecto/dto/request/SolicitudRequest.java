package com.intifix.intifix_proyecto.dto.request;
 
import com.intifix.intifix_proyecto.model.ModalidadServicio;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
 
public class SolicitudRequest {
 
    @NotBlank(message = "El equipo es obligatorio")
    @Size(max = 120, message = "El equipo no debe superar 120 caracteres")
    public String equipo;
 
    @NotBlank(message = "El título es obligatorio")
    @Size(max = 150, message = "El título no debe superar 150 caracteres")
    public String titulo;
 
    @NotBlank(message = "La descripción es obligatoria")
    @Size(min = 10, max = 1000, message = "La descripción debe tener entre 10 y 1000 caracteres")
    public String descripcion;
 
    @NotNull(message = "La modalidad es obligatoria")
    public ModalidadServicio modalidad;
 
    @Size(max = 250, message = "La dirección no debe superar 250 caracteres")
    public String direccion;
 
    /**
     * ID del técnico preferido por el cliente (opcional).
     * Si se indica, el sistema valida que el técnico tenga la especialidad
     * compatible con el equipo indicado antes de aceptar la solicitud.
     */
    public Long tecnicoId;
}