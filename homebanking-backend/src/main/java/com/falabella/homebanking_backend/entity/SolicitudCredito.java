package com.falabella.homebanking_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes_credito")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudCredito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @NotNull
    @DecimalMin(value = "500.00", message = "El monto minimo de solicitud es S/ 500")
    @Column(name = "monto_solicitado", nullable = false, precision = 15, scale = 2)
    private BigDecimal montoSolicitado;

    @NotNull
    @Min(value = 3, message = "El plazo minimo es 3 meses")
    @Max(value = 36, message = "El plazo maximo es 36 meses")
    @Column(name = "plazo_meses", nullable = false)
    private Integer plazoMeses;

    @Column(name = "con_seguro_desgravamen", nullable = false)
    private Boolean conSeguroDesgravamen;

    @NotNull
    @DecimalMin(value = "0.00")
    @Column(name = "ingreso_neto_mensual", nullable = false, precision = 15, scale = 2)
    private BigDecimal ingresoNetoMensual;

    @DecimalMin(value = "0.00")
    @Column(name = "gastos_familiares", nullable = false, precision = 15, scale = 2)
    private BigDecimal gastosFamiliares;

    @DecimalMin(value = "0.00")
    @Column(name = "cuotas_sistema_financiero", nullable = false, precision = 15, scale = 2)
    private BigDecimal cuotasSistemaFinanciero;

    @Pattern(regexp = "PENDIENTE|APROBADA|APROBADA_MONTO_MENOR|RECHAZADA")
    @Column(nullable = false, length = 25)
    private String estado;

    @Column(name = "motivo_resultado", length = 255)
    private String motivoResultado;

    @Column(name = "fecha_solicitud", nullable = false, updatable = false)
    private LocalDateTime fechaSolicitud;

    @OneToOne(mappedBy = "solicitud", cascade = CascadeType.ALL)
    private Credito credito;

    @PrePersist
    protected void onCreate() {
        this.fechaSolicitud = LocalDateTime.now();
        if (this.estado == null) this.estado = "PENDIENTE";
        if (this.gastosFamiliares == null) this.gastosFamiliares = BigDecimal.ZERO;
        if (this.cuotasSistemaFinanciero == null) this.cuotasSistemaFinanciero = BigDecimal.ZERO;
    }
}