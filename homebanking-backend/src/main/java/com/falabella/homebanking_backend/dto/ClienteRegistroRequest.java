package com.falabella.homebanking_backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ClienteRegistroRequest {

    @NotBlank
    @Pattern(regexp = "DNI|CE")
    private String tipoDocumento;

    @NotBlank
    @Size(max = 12)
    private String numeroDocumento;

    @NotBlank
    private String nombres;

    @NotBlank
    private String apellidos;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, message = "La clave debe tener al menos 6 caracteres")
    private String clave;
}