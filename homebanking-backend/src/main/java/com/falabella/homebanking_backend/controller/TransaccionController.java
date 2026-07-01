package com.falabella.homebanking_backend.controller;

import com.falabella.homebanking_backend.dto.*;
import com.falabella.homebanking_backend.service.TransaccionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transacciones")
public class TransaccionController {

    private final TransaccionService transaccionService;

    public TransaccionController(TransaccionService transaccionService) {
        this.transaccionService = transaccionService;
    }

    @PostMapping
    public ResponseEntity<?> procesar(@Valid @RequestBody TransaccionRequest request) {
        try {
            TransaccionResponse response = transaccionService.procesar(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/cuenta/{cuentaId}")
    public List<TransaccionResponse> historialPorCuenta(@PathVariable Long cuentaId) {
        return transaccionService.historialPorCuenta(cuentaId);
    }

    @GetMapping("/tarjeta/{tarjetaId}")
    public List<TransaccionResponse> historialPorTarjeta(@PathVariable Long tarjetaId) {
        return transaccionService.historialPorTarjeta(tarjetaId);
    }
}