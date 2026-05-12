package com.intifix.intifix_proyecto.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidationErrors(MethodArgumentNotValidException exception) {
        String mensaje = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("Datos inválidos.");

        return ResponseEntity.badRequest().body(mensaje);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneralError(Exception exception) {
        return ResponseEntity.internalServerError()
                .body("Ocurrió un error interno en el servidor.");
    }
}