package com.falabella.homebanking_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "tipos_cuenta")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoCuenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 50)
    private String nombre;

    @NotBlank
    @Pattern(regexp = "AHORRO|CORRIENTE", message = "La categoria debe ser AHORRO o CORRIENTE")
    @Column(nullable = false, length = 20)
    private String categoria;

    @Column(name = "tasa_interes", nullable = false, precision = 5, scale = 2)
    private BigDecimal tasaInteres;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal mantenimiento;
}