package com.falabella.homebanking_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CronogramaItemResponse {

    private Integer numeroCuota;
    private LocalDate fechaVencimiento;
    private BigDecimal cuota;
    private BigDecimal interes;
    private BigDecimal amortizacion;
    private BigDecimal saldoPosterior;
    private String estado;
}