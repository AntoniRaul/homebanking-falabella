package com.falabella.homebanking_backend.controller;

import com.falabella.homebanking_backend.dto.*;
import com.falabella.homebanking_backend.service.CreditoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/creditos")
public class CreditoController {

    private final CreditoService creditoService;

    public CreditoController(CreditoService creditoService) {
        this.creditoService = creditoService;
    }

    // Registra y evalua la solicitud en un solo paso
    @PostMapping("/solicitudes")
    public ResponseEntity<?> solicitar(@Valid @RequestBody SolicitudCreditoRequest request) {
        try {
            SolicitudCreditoResponse response = creditoService.evaluarSolicitud(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/cliente/{clienteId}")
    public List<CreditoResponse> listarPorCliente(@PathVariable Long clienteId) {
        return creditoService.listarPorCliente(clienteId);
    }

    @GetMapping("/{creditoId}/cronograma")
    public List<CronogramaItemResponse> verCronograma(@PathVariable Long creditoId) {
        return creditoService.obtenerCronograma(creditoId);
    }
}