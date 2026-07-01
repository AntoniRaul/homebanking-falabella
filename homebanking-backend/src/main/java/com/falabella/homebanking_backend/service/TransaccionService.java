package com.falabella.homebanking_backend.service;

import com.falabella.homebanking_backend.dto.TransaccionRequest;
import com.falabella.homebanking_backend.dto.TransaccionResponse;
import com.falabella.homebanking_backend.entity.Cuenta;
import com.falabella.homebanking_backend.entity.TarjetaCredito;
import com.falabella.homebanking_backend.entity.Transaccion;
import com.falabella.homebanking_backend.repository.CuentaRepository;
import com.falabella.homebanking_backend.repository.TarjetaCreditoRepository;
import com.falabella.homebanking_backend.repository.TransaccionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TransaccionService {

    private final CuentaRepository cuentaRepository;
    private final TarjetaCreditoRepository tarjetaRepository;
    private final TransaccionRepository transaccionRepository;

    public TransaccionService(CuentaRepository cuentaRepository,
                              TarjetaCreditoRepository tarjetaRepository,
                              TransaccionRepository transaccionRepository) {
        this.cuentaRepository = cuentaRepository;
        this.tarjetaRepository = tarjetaRepository;
        this.transaccionRepository = transaccionRepository;
    }

    @Transactional
    public TransaccionResponse procesar(TransaccionRequest request) {
        return switch (request.getTipo()) {
            case "DEPOSITO" -> procesarDeposito(request);
            case "RETIRO" -> procesarRetiro(request);
            case "TRANSFERENCIA" -> procesarTransferencia(request);
            case "CONSUMO_TARJETA" -> procesarConsumoTarjeta(request);
            case "PAGO_TARJETA" -> procesarPagoTarjeta(request);
            default -> throw new RuntimeException("Tipo de transaccion invalido");
        };
    }

    private TransaccionResponse procesarDeposito(TransaccionRequest request) {
        Cuenta cuenta = obtenerCuentaActiva(request.getCuentaId());
        cuenta.setSaldo(cuenta.getSaldo().add(request.getMonto()));
        cuentaRepository.save(cuenta);

        Transaccion t = nuevaTransaccion(request, cuenta.getSaldo());
        t.setCuenta(cuenta);
        return toResponse(transaccionRepository.save(t));
    }

    private TransaccionResponse procesarRetiro(TransaccionRequest request) {
        Cuenta cuenta = obtenerCuentaActiva(request.getCuentaId());
        validarSaldoSuficiente(cuenta.getSaldo(), request.getMonto());
        cuenta.setSaldo(cuenta.getSaldo().subtract(request.getMonto()));
        cuentaRepository.save(cuenta);

        Transaccion t = nuevaTransaccion(request, cuenta.getSaldo());
        t.setCuenta(cuenta);
        return toResponse(transaccionRepository.save(t));
    }

    private TransaccionResponse procesarTransferencia(TransaccionRequest request) {
        Cuenta origen = obtenerCuentaActiva(request.getCuentaId());
        validarSaldoSuficiente(origen.getSaldo(), request.getMonto());

        Cuenta destino = cuentaRepository.findByNumeroCuenta(request.getNumeroCuentaDestino())
                .orElseThrow(() -> new RuntimeException("Cuenta destino no encontrada"));

        origen.setSaldo(origen.getSaldo().subtract(request.getMonto()));
        destino.setSaldo(destino.getSaldo().add(request.getMonto()));
        cuentaRepository.save(origen);
        cuentaRepository.save(destino);

        Transaccion t = nuevaTransaccion(request, origen.getSaldo());
        t.setCuenta(origen);
        t.setCuentaDestino(destino);
        return toResponse(transaccionRepository.save(t));
    }

    private TransaccionResponse procesarConsumoTarjeta(TransaccionRequest request) {
        TarjetaCredito tarjeta = obtenerTarjetaActiva(request.getTarjetaId());

        BigDecimal disponible = tarjeta.getLineaCredito().subtract(tarjeta.getDeudaActual());
        if (disponible.compareTo(request.getMonto()) < 0) {
            throw new RuntimeException("Linea de credito insuficiente");
        }

        tarjeta.setDeudaActual(tarjeta.getDeudaActual().add(request.getMonto()));
        tarjetaRepository.save(tarjeta);

        Transaccion t = nuevaTransaccion(request, tarjeta.getDeudaActual());
        t.setTarjeta(tarjeta);
        return toResponse(transaccionRepository.save(t));
    }

    private TransaccionResponse procesarPagoTarjeta(TransaccionRequest request) {
        TarjetaCredito tarjeta = obtenerTarjetaActiva(request.getTarjetaId());
        Cuenta cuentaOrigen = obtenerCuentaActiva(request.getCuentaOrigenPagoId());

        validarSaldoSuficiente(cuentaOrigen.getSaldo(), request.getMonto());

        BigDecimal montoAPagar = request.getMonto().min(tarjeta.getDeudaActual());

        cuentaOrigen.setSaldo(cuentaOrigen.getSaldo().subtract(montoAPagar));
        tarjeta.setDeudaActual(tarjeta.getDeudaActual().subtract(montoAPagar));

        cuentaRepository.save(cuentaOrigen);
        tarjetaRepository.save(tarjeta);

        Transaccion t = nuevaTransaccion(request, tarjeta.getDeudaActual());
        t.setTarjeta(tarjeta);
        t.setCuenta(cuentaOrigen);
        t.setMonto(montoAPagar);
        return toResponse(transaccionRepository.save(t));
    }

    public List<TransaccionResponse> historialPorCuenta(Long cuentaId) {
        return transaccionRepository.findByCuentaIdOrderByFechaDesc(cuentaId).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<TransaccionResponse> historialPorTarjeta(Long tarjetaId) {
        return transaccionRepository.findByTarjetaIdOrderByFechaDesc(tarjetaId).stream()
                .map(this::toResponse)
                .toList();
    }

    // --- Helpers privados ---

    private Cuenta obtenerCuentaActiva(Long cuentaId) {
        if (cuentaId == null) throw new RuntimeException("La cuenta es obligatoria para esta operacion");
        Cuenta cuenta = cuentaRepository.findById(cuentaId)
                .orElseThrow(() -> new RuntimeException("Cuenta no encontrada"));
        if (!"ACTIVA".equals(cuenta.getEstado())) throw new RuntimeException("La cuenta no esta activa");
        return cuenta;
    }

    private TarjetaCredito obtenerTarjetaActiva(Long tarjetaId) {
        if (tarjetaId == null) throw new RuntimeException("La tarjeta es obligatoria para esta operacion");
        TarjetaCredito tarjeta = tarjetaRepository.findById(tarjetaId)
                .orElseThrow(() -> new RuntimeException("Tarjeta no encontrada"));
        if (!"ACTIVA".equals(tarjeta.getEstado())) throw new RuntimeException("La tarjeta no esta activa");
        return tarjeta;
    }

    private void validarSaldoSuficiente(BigDecimal saldo, BigDecimal monto) {
        if (saldo.compareTo(monto) < 0) {
            throw new RuntimeException("Saldo insuficiente");
        }
    }

    private Transaccion nuevaTransaccion(TransaccionRequest request, BigDecimal saldoPosterior) {
        Transaccion t = new Transaccion();
        t.setTipo(request.getTipo());
        t.setMonto(request.getMonto());
        t.setSaldoPosterior(saldoPosterior);
        t.setDescripcion(request.getDescripcion());
        return t;
    }

    private TransaccionResponse toResponse(Transaccion t) {
        return new TransaccionResponse(t.getId(), t.getTipo(), t.getMonto(),
                t.getSaldoPosterior(), t.getFecha(), t.getDescripcion());
    }
}