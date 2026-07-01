package com.falabella.homebanking_backend.repository;

import com.falabella.homebanking_backend.entity.TipoCuenta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoCuentaRepository extends JpaRepository<TipoCuenta, Long> {
}