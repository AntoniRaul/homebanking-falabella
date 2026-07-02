package com.falabella.homebanking_backend.repository;

import com.falabella.homebanking_backend.entity.SolicitudCredito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolicitudCreditoRepository extends JpaRepository<SolicitudCredito, Long> {

    List<SolicitudCredito> findByClienteIdOrderByFechaSolicitudDesc(Long clienteId);
}