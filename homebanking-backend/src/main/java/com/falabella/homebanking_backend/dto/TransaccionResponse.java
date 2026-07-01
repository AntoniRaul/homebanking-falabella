package com.falabella.homebanking_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransaccionResponse {
    private Long id;
    private String tipo;
    private BigDecimal monto;
    private BigDecimal saldoPosterior;
    private LocalDateTime fecha;
    private String descripcion;
}