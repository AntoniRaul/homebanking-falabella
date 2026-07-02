package com.falabella.homebanking_backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransaccionRequest {

    // Se usa para DEPOSITO, RETIRO, TRANSFERENCIA, PAGO_CREDITO (cuenta de donde sale la plata)
    private Long cuentaId;

    // Se usa para CONSUMO_TARJETA, PAGO_TARJETA
    private Long tarjetaId;

    // Solo se usa si el tipo es TRANSFERENCIA
    private String numeroCuentaDestino;

    // Solo se usa si el tipo es PAGO_TARJETA (de que cuenta sale la plata)
    private Long cuentaOrigenPagoId;

    // Solo se usa si el tipo es PAGO_CREDITO
    private Long creditoId;

    @NotNull
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a 0")
    private BigDecimal monto;

    @NotBlank
    private String tipo; // DEPOSITO, RETIRO, TRANSFERENCIA, CONSUMO_TARJETA, PAGO_TARJETA, PAGO_CREDITO

    private String descripcion;
}