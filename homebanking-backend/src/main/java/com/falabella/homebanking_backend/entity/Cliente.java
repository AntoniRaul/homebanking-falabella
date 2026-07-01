package com.falabella.homebanking_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "clientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El tipo de documento es obligatorio")
    @Pattern(regexp = "DNI|CE", message = "El tipo de documento debe ser DNI o CE")
    @Column(name = "tipo_documento", nullable = false, length = 2)
    private String tipoDocumento;

    @NotBlank(message = "El numero de documento es obligatorio")
    @Size(max = 12, message = "El numero de documento no puede exceder 12 caracteres")
    @Column(name = "numero_documento", nullable = false, unique = true, length = 12)
    private String numeroDocumento;

    @NotBlank(message = "Los nombres son obligatorios")
    @Column(nullable = false, length = 100)
    private String nombres;

    @NotBlank(message = "Los apellidos son obligatorios")
    @Column(nullable = false, length = 100)
    private String apellidos;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email debe tener un formato valido")
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    // Se guarda encriptada con BCrypt, nunca en texto plano
    @NotBlank
    @Column(name = "clave_hash", nullable = false)
    private String claveHash;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    @Pattern(regexp = "ACTIVO|BLOQUEADO", message = "El estado debe ser ACTIVO o BLOQUEADO")
    @Column(nullable = false, length = 20)
    private String estado;

    // Relaciones: un cliente puede tener varias cuentas y tarjetas
    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Cuenta> cuentas;

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TarjetaCredito> tarjetasCredito;

    @PrePersist
    protected void onCreate() {
        this.fechaRegistro = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = "ACTIVO";
        }
    }
}