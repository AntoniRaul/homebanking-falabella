package com.falabella.homebanking_backend.controller;

import com.falabella.homebanking_backend.dto.TarjetaResponse;
import com.falabella.homebanking_backend.service.TarjetaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tarjetas")
public class TarjetaController {

    private final TarjetaService tarjetaService;

    public TarjetaController(TarjetaService tarjetaService) {
        this.tarjetaService = tarjetaService;
    }

    @GetMapping("/cliente/{clienteId}")
    public List<TarjetaResponse> listarPorCliente(@PathVariable Long clienteId) {
        return tarjetaService.listarPorCliente(clienteId);
    }
}