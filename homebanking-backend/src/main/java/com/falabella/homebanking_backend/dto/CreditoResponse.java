package com.falabella.homebanking_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditoResponse {

    private Long id;
    private BigDecimal montoAprobado;
    private Integer plazoMeses;
    private BigDecimal tea;
    private BigDecimal cuotaMensual;
    private BigDecimal saldoPendiente;
    private Integer cuotasPagadas;
    private String estado;
    private LocalDateTime fechaDesembolso;

    // Cuota que corresponde pagar ahora mismo (la primera PENDIENTE), null si ya esta PAGADO
    private CronogramaItemResponse proximaCuota;
}