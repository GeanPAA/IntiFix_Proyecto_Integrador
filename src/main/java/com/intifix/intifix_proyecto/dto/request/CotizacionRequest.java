package com.intifix.intifix_proyecto.dto.request;

import jakarta.validation.constraints.*;

public class CotizacionRequest {

    @NotNull(message = "El precio es obligatorio")
    @Min(value = 1, message = "El precio mínimo es 1")
    @Max(value = 10000, message = "El precio máximo es 10000")
    public Integer precio;

    @NotNull(message = "El tiempo estimado es obligatorio")
    @Min(value = 1, message = "El tiempo mínimo es 1 hora")
    @Max(value = 168, message = "El tiempo máximo es 168 horas (7 días)")
    public Integer tiempoHoras;
}
