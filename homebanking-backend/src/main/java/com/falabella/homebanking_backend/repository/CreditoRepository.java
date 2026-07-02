package com.falabella.homebanking_backend.repository;

import com.falabella.homebanking_backend.entity.Credito;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CreditoRepository extends JpaRepository<Credito, Long> {

    List<Credito> findByClienteIdOrderByFechaDesembolsoDesc(Long clienteId);
}