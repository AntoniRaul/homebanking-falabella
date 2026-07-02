package com.falabella.homebanking_backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SolicitudCreditoRequest {

    @NotNull(message = "El cliente es obligatorio")
    private Long clienteId;

    @NotNull(message = "La cuenta de desembolso es obligatoria")
    private Long cuentaId;

    @NotNull
    @DecimalMin(value = "500.00", message = "El monto minimo de solicitud es S/ 500")
    private BigDecimal montoSolicitado;

    @NotNull
    @Min(value = 3, message = "El plazo minimo es 3 meses")
    @Max(value = 36, message = "El plazo maximo es 36 meses")
    private Integer plazoMeses;

    @NotNull(message = "Debes indicar si contratas el seguro de desgravamen")
    private Boolean conSeguroDesgravamen;

    @NotNull
    @DecimalMin(value = "0.01", message = "El ingreso neto debe ser mayor a 0")
    private BigDecimal ingresoNetoMensual;

    @DecimalMin(value = "0.00")
    private BigDecimal gastosFamiliares;

    @DecimalMin(value = "0.00")
    private BigDecimal cuotasSistemaFinanciero;
}