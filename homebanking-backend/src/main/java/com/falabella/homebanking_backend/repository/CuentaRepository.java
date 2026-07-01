package com.falabella.homebanking_backend.repository;

import com.falabella.homebanking_backend.entity.Cuenta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CuentaRepository extends JpaRepository<Cuenta, Long> {

    List<Cuenta> findByClienteId(Long clienteId);

    Optional<Cuenta> findByNumeroCuenta(String numeroCuenta);

    boolean existsByNumeroCuenta(String numeroCuenta);
}