package com.falabella.homebanking_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transacciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuenta_id")
    private Cuenta cuenta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tarjeta_id")
    private TarjetaCredito tarjeta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuenta_destino_id")
    private Cuenta cuentaDestino;

    // Se usa solo para PAGO_CREDITO
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credito_id")
    private Credito credito;

    @NotBlank
    @Pattern(regexp = "DEPOSITO|RETIRO|TRANSFERENCIA|CONSUMO_TARJETA|PAGO_TARJETA|PAGO_CREDITO")
    @Column(nullable = false, length = 30)
    private String tipo;

    @NotNull
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal monto;

    @Column(name = "saldo_posterior", nullable = false, precision = 15, scale = 2)
    private BigDecimal saldoPosterior;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(length = 255)
    private String descripcion;

    @PrePersist
    protected void onCreate() {
        this.fecha = LocalDateTime.now();
    }
}