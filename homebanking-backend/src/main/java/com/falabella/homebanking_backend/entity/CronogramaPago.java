package com.falabella.homebanking_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "cronograma_pagos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CronogramaPago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credito_id", nullable = false)
    private Credito credito;

    @Column(name = "numero_cuota", nullable = false)
    private Integer numeroCuota;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    @Column(name = "cuota", nullable = false, precision = 15, scale = 2)
    private BigDecimal cuota;

    @Column(name = "interes", nullable = false, precision = 15, scale = 2)
    private BigDecimal interes;

    @Column(name = "amortizacion", nullable = false, precision = 15, scale = 2)
    private BigDecimal amortizacion;

    @Column(name = "saldo_posterior", nullable = false, precision = 15, scale = 2)
    private BigDecimal saldoPosterior;

    @Pattern(regexp = "PENDIENTE|PAGADA|ATRASADA")
    @Column(nullable = false, length = 15)
    private String estado;

    @PrePersist
    protected void onCreate() {
        if (this.estado == null) this.estado = "PENDIENTE";
    }
}