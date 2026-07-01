package com.falabella.homebanking_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cuentas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cuenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_cuenta_id", nullable = false)
    private TipoCuenta tipoCuenta;

    @NotBlank
    @Column(name = "numero_cuenta", nullable = false, unique = true, length = 20)
    private String numeroCuenta;

    @Pattern(regexp = "PEN|USD", message = "La moneda debe ser PEN o USD")
    @Column(nullable = false, length = 3)
    private String moneda;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal saldo;

    @Column(name = "fecha_apertura", nullable = false, updatable = false)
    private LocalDateTime fechaApertura;

    @Pattern(regexp = "ACTIVA|CERRADA", message = "El estado debe ser ACTIVA o CERRADA")
    @Column(nullable = false, length = 20)
    private String estado;

    @PrePersist
    protected void onCreate() {
        this.fechaApertura = LocalDateTime.now();
        if (this.estado == null) this.estado = "ACTIVA";
        if (this.saldo == null) this.saldo = BigDecimal.ZERO;
        if (this.moneda == null) this.moneda = "PEN";
    }
}