package com.falabella.homebanking_backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransaccionRequest {

    // Se usa para DEPOSITO, RETIRO, TRANSFERENCIA
    private Long cuentaId;

    // Se usa para CONSUMO_TARJETA, PAGO_TARJETA
    private Long tarjetaId;

    // Solo se usa si el tipo es TRANSFERENCIA
    private String numeroCuentaDestino;

    // Solo se usa si el tipo es PAGO_TARJETA (de que cuenta sale la plata)
    private Long cuentaOrigenPagoId;

    @NotNull
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal monto;

    @NotBlank
    private String tipo; // DEPOSITO, RETIRO, TRANSFERENCIA, CONSUMO_TARJETA, PAGO_TARJETA

    private String descripcion;
}