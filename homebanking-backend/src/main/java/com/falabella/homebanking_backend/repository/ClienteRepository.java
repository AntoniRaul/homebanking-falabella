package com.falabella.homebanking_backend.repository;

import com.falabella.homebanking_backend.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    // Para el login: buscar por tipo + numero de documento
    Optional<Cliente> findByTipoDocumentoAndNumeroDocumento(String tipoDocumento, String numeroDocumento);

    boolean existsByNumeroDocumento(String numeroDocumento);

    boolean existsByEmail(String email);
}