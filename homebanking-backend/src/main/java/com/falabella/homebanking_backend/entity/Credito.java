package com.falabella.homebanking_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "creditos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Credito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitud_id", nullable = false, unique = true)
    private SolicitudCredito solicitud;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuenta_id", nullable = false)
    private Cuenta cuenta;

    @Column(name = "monto_aprobado", nullable = false, precision = 15, scale = 2)
    private BigDecimal montoAprobado;

    @Column(name = "plazo_meses", nullable = false)
    private Integer plazoMeses;

    @Column(name = "tea", nullable = false, precision = 6, scale = 4)
    private BigDecimal tea;

    @Column(name = "tem", nullable = false, precision = 8, scale = 6)
    private BigDecimal tem;

    @Column(name = "cuota_mensual", nullable = false, precision = 15, scale = 2)
    private BigDecimal cuotaMensual;

    @Column(name = "saldo_pendiente", nullable = false, precision = 15, scale = 2)
    private BigDecimal saldoPendiente;

    @Column(name = "cuotas_pagadas", nullable = false)
    private Integer cuotasPagadas;

    @Pattern(regexp = "VIGENTE|PAGADO|ATRASADO")
    @Column(nullable = false, length = 20)
    private String estado;

    @Column(name = "fecha_desembolso", nullable = false, updatable = false)
    private LocalDateTime fechaDesembolso;

    @OneToMany(mappedBy = "credito", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CronogramaPago> cronograma;

    @PrePersist
    protected void onCreate() {
        this.fechaDesembolso = LocalDateTime.now();
        if (this.estado == null) this.estado = "VIGENTE";
        if (this.cuotasPagadas == null) this.cuotasPagadas = 0;
    }
}