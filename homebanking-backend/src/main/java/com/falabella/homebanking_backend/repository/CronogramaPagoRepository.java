package com.falabella.homebanking_backend.repository;

import com.falabella.homebanking_backend.entity.CronogramaPago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CronogramaPagoRepository extends JpaRepository<CronogramaPago, Long> {

    List<CronogramaPago> findByCreditoIdOrderByNumeroCuotaAsc(Long creditoId);

    Optional<CronogramaPago> findFirstByCreditoIdAndEstadoOrderByNumeroCuotaAsc(Long creditoId, String estado);
}