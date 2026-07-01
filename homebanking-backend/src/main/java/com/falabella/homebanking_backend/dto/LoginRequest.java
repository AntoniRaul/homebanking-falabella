package com.falabella.homebanking_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "El tipo de documento es obligatorio")
    private String tipoDocumento;

    @NotBlank(message = "El numero de documento es obligatorio")
    private String numeroDocumento;

    @NotBlank(message = "La clave es obligatoria")
    private String clave;
}