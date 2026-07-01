package com.falabella.homebanking_backend.controller;

import com.falabella.homebanking_backend.dto.CuentaResponse;
import com.falabella.homebanking_backend.service.CuentaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cuentas")
public class CuentaController {

    private final CuentaService cuentaService;

    public CuentaController(CuentaService cuentaService) {
        this.cuentaService = cuentaService;
    }

    @GetMapping("/cliente/{clienteId}")
    public List<CuentaResponse> listarPorCliente(@PathVariable Long clienteId) {
        return cuentaService.listarPorCliente(clienteId);
    }
}