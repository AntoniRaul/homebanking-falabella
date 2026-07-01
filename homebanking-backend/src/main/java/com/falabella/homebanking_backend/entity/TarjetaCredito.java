package com.falabella.homebanking_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "tarjetas_credito")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TarjetaCredito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @NotBlank
    @Column(name = "numero_tarjeta", nullable = false, unique = true, length = 16)
    private String numeroTarjeta;

    @Column(name = "linea_credito", nullable = false, precision = 15, scale = 2)
    private BigDecimal lineaCredito;

    @Column(name = "deuda_actual", nullable = false, precision = 15, scale = 2)
    private BigDecimal deudaActual;

    @Min(1) @Max(28)
    @Column(name = "fecha_corte", nullable = false)
    private Integer fechaCorte;

    @Min(1) @Max(28)
    @Column(name = "fecha_pago", nullable = false)
    private Integer fechaPago;

    @Column(name = "tasa_interes", nullable = false, precision = 5, scale = 2)
    private BigDecimal tasaInteres;

    @Pattern(regexp = "ACTIVA|BLOQUEADA", message = "El estado debe ser ACTIVA o BLOQUEADA")
    @Column(nullable = false, length = 20)
    private String estado;

    @PrePersist
    protected void onCreate() {
        if (this.estado == null) this.estado = "ACTIVA";
        if (this.deudaActual == null) this.deudaActual = BigDecimal.ZERO;
    }

    // Util para el frontend: linea disponible = linea - deuda
    @Transient
    public BigDecimal getLineaDisponible() {
        return lineaCredito.subtract(deudaActual);
    }
}