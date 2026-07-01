package com.falabella.homebanking_backend.repository;

import com.falabella.homebanking_backend.entity.Transaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransaccionRepository extends JpaRepository<Transaccion, Long> {

    List<Transaccion> findByCuentaIdOrderByFechaDesc(Long cuentaId);

    List<Transaccion> findByTarjetaIdOrderByFechaDesc(Long tarjetaId);
}