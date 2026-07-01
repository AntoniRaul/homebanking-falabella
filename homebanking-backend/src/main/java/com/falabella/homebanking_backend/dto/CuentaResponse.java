package com.falabella.homebanking_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CuentaResponse {
    private Long id;
    private String numeroCuenta;
    private String tipoCuentaNombre;
    private String categoria;
    private String moneda;
    private BigDecimal saldo;
    private String estado;
}