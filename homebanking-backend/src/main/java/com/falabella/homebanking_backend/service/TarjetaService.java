package com.falabella.homebanking_backend.service;

import com.falabella.homebanking_backend.dto.TarjetaResponse;
import com.falabella.homebanking_backend.entity.TarjetaCredito;
import com.falabella.homebanking_backend.repository.TarjetaCreditoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TarjetaService {

    private final TarjetaCreditoRepository tarjetaRepository;

    public TarjetaService(TarjetaCreditoRepository tarjetaRepository) {
        this.tarjetaRepository = tarjetaRepository;
    }

    public List<TarjetaResponse> listarPorCliente(Long clienteId) {
        return tarjetaRepository.findByClienteId(clienteId).stream()
                .map(this::toResponse)
                .toList();
    }

    private TarjetaResponse toResponse(TarjetaCredito t) {
        String numeroEnmascarado = "**** **** **** " +
                t.getNumeroTarjeta().substring(t.getNumeroTarjeta().length() - 4);

        return new TarjetaResponse(
                t.getId(),
                numeroEnmascarado,
                t.getLineaCredito(),
                t.getDeudaActual(),
                t.getLineaDisponible(),
                t.getFechaCorte(),
                t.getFechaPago(),
                t.getEstado()
        );
    }
}