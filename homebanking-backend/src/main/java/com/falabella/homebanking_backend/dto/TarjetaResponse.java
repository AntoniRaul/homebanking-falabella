package com.falabella.homebanking_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TarjetaResponse {
    private Long id;
    private String numeroTarjetaEnmascarado; // ej: **** **** **** 1234
    private BigDecimal lineaCredito;
    private BigDecimal deudaActual;
    private BigDecimal lineaDisponible;
    private Integer fechaCorte;
    private Integer fechaPago;
    private String estado;
}