package com.falabella.homebanking_backend.repository;

import com.falabella.homebanking_backend.entity.TarjetaCredito;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TarjetaCreditoRepository extends JpaRepository<TarjetaCredito, Long> {

    List<TarjetaCredito> findByClienteId(Long clienteId);

    boolean existsByNumeroTarjeta(String numeroTarjeta);
}