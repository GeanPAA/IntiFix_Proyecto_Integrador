package com.intifix.intifix_proyecto.model;

public enum EstadoCotizacion {
    ACTIVA, // Cotización disponible para aceptar o rechazar
    ACEPTADA, // El cliente aceptó esta cotización
    RECHAZADA, // El cliente rechazó, o el técnico rechazó la solicitud
    EXPIRADA // Pasaron 48 horas sin ser aceptada
}
