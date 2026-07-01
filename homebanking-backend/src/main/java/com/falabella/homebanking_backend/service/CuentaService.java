package com.falabella.homebanking_backend.service;

import com.falabella.homebanking_backend.dto.CuentaResponse;
import com.falabella.homebanking_backend.entity.Cuenta;
import com.falabella.homebanking_backend.repository.CuentaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CuentaService {

    private final CuentaRepository cuentaRepository;

    public CuentaService(CuentaRepository cuentaRepository) {
        this.cuentaRepository = cuentaRepository;
    }

    public List<CuentaResponse> listarPorCliente(Long clienteId) {
        return cuentaRepository.findByClienteId(clienteId).stream()
                .map(this::toResponse)
                .toList();
    }

    private CuentaResponse toResponse(Cuenta c) {
        return new CuentaResponse(
                c.getId(),
                c.getNumeroCuenta(),
                c.getTipoCuenta().getNombre(),
                c.getTipoCuenta().getCategoria(),
                c.getMoneda(),
                c.getSaldo(),
                c.getEstado()
        );
    }
}