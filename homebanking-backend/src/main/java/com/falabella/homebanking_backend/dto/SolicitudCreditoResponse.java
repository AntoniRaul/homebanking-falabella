package com.falabella.homebanking_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudCreditoResponse {

    private Long solicitudId;
    private String estado; // APROBADA | APROBADA_MONTO_MENOR | RECHAZADA
    private String motivoResultado;

    private BigDecimal montoSolicitado;
    private BigDecimal montoAprobado; // null si RECHAZADA

    private BigDecimal tea;
    private BigDecimal tem;
    private BigDecimal cuotaMensual;
    private Integer plazoMeses;

    private LocalDateTime fechaSolicitud;

    // null si RECHAZADA
    private Long creditoId;
    private List<CronogramaItemResponse> cronograma;
}