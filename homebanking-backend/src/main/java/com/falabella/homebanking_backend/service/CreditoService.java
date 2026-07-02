package com.falabella.homebanking_backend.service;

import com.falabella.homebanking_backend.dto.*;
import com.falabella.homebanking_backend.entity.*;
import com.falabella.homebanking_backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class CreditoService {

    private static final BigDecimal TEA_SIN_SEGURO = new BigDecimal("0.4392");
    private static final BigDecimal TEA_CON_SEGURO = new BigDecimal("0.4092");
    private static final BigDecimal MONTO_MINIMO = new BigDecimal("500.00");
    private static final BigDecimal RATIO_MAXIMO_CUOTA_INGRESO = new BigDecimal("0.35");

    private final SolicitudCreditoRepository solicitudRepository;
    private final CreditoRepository creditoRepository;
    private final CronogramaPagoRepository cronogramaRepository;
    private final ClienteRepository clienteRepository;
    private final CuentaRepository cuentaRepository;

    public CreditoService(SolicitudCreditoRepository solicitudRepository,
                          CreditoRepository creditoRepository,
                          CronogramaPagoRepository cronogramaRepository,
                          ClienteRepository clienteRepository,
                          CuentaRepository cuentaRepository) {
        this.solicitudRepository = solicitudRepository;
        this.creditoRepository = creditoRepository;
        this.cronogramaRepository = cronogramaRepository;
        this.clienteRepository = clienteRepository;
        this.cuentaRepository = cuentaRepository;
    }

    @Transactional
    public SolicitudCreditoResponse evaluarSolicitud(SolicitudCreditoRequest request) {

        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        if ("BLOQUEADO".equals(cliente.getEstado())) {
            throw new RuntimeException("El cliente se encuentra bloqueado y no puede solicitar creditos");
        }

        Cuenta cuenta = cuentaRepository.findById(request.getCuentaId())
                .orElseThrow(() -> new RuntimeException("Cuenta de desembolso no encontrada"));

        if (!cuenta.getCliente().getId().equals(cliente.getId())) {
            throw new RuntimeException("La cuenta de desembolso no pertenece al cliente");
        }

        BigDecimal gastosFamiliares = request.getGastosFamiliares() != null
                ? request.getGastosFamiliares() : BigDecimal.ZERO;
        BigDecimal cuotasSistemaFinanciero = request.getCuotasSistemaFinanciero() != null
                ? request.getCuotasSistemaFinanciero() : BigDecimal.ZERO;

        SolicitudCredito solicitud = new SolicitudCredito();
        solicitud.setCliente(cliente);
        solicitud.setMontoSolicitado(request.getMontoSolicitado());
        solicitud.setPlazoMeses(request.getPlazoMeses());
        solicitud.setConSeguroDesgravamen(request.getConSeguroDesgravamen());
        solicitud.setIngresoNetoMensual(request.getIngresoNetoMensual());
        solicitud.setGastosFamiliares(gastosFamiliares);
        solicitud.setCuotasSistemaFinanciero(cuotasSistemaFinanciero);
        solicitud.setEstado("PENDIENTE");

        BigDecimal tea = Boolean.TRUE.equals(request.getConSeguroDesgravamen()) ? TEA_CON_SEGURO : TEA_SIN_SEGURO;
        BigDecimal tem = calcularTem(tea);

        BigDecimal capacidadPago = request.getIngresoNetoMensual()
                .subtract(gastosFamiliares)
                .subtract(cuotasSistemaFinanciero);
        BigDecimal cuotaMaximaPermitida = capacidadPago.max(BigDecimal.ZERO)
                .multiply(RATIO_MAXIMO_CUOTA_INGRESO)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal cuotaSolicitada = calcularCuotaFrancesa(request.getMontoSolicitado(), tem, request.getPlazoMeses());

        BigDecimal montoAprobado;
        String estado;
        String motivo;

        if (cuotaSolicitada.compareTo(cuotaMaximaPermitida) <= 0) {
            montoAprobado = request.getMontoSolicitado();
            estado = "APROBADA";
            motivo = "La cuota calculada esta dentro del limite de endeudamiento permitido";
        } else {
            BigDecimal montoMaximoAprobable = calcularMontoMaximo(cuotaMaximaPermitida, tem, request.getPlazoMeses());

            if (montoMaximoAprobable.compareTo(MONTO_MINIMO) >= 0) {
                montoAprobado = montoMaximoAprobable;
                estado = "APROBADA_MONTO_MENOR";
                motivo = "El monto solicitado excede tu capacidad de pago; se aprueba un monto menor";
            } else {
                montoAprobado = null;
                estado = "RECHAZADA";
                motivo = "La capacidad de pago disponible no alcanza ni siquiera el monto minimo del producto (S/ " + MONTO_MINIMO + ")";
            }
        }

        solicitud.setEstado(estado);
        solicitud.setMotivoResultado(motivo);
        SolicitudCredito solicitudGuardada = solicitudRepository.save(solicitud);

        List<CronogramaItemResponse> cronogramaResponse = null;
        Long creditoId = null;
        BigDecimal cuotaFinal = null;

        if (!"RECHAZADA".equals(estado)) {
            BigDecimal cuotaMensual = calcularCuotaFrancesa(montoAprobado, tem, request.getPlazoMeses());
            Credito credito = crearCreditoConCronograma(solicitudGuardada, cliente, cuenta,
                    montoAprobado, request.getPlazoMeses(), tea, tem, cuotaMensual);

            solicitudGuardada.setCredito(credito);
            creditoId = credito.getId();
            cuotaFinal = cuotaMensual;
            cronogramaResponse = credito.getCronograma().stream()
                    .map(this::toCronogramaItem)
                    .toList();
        }

        return new SolicitudCreditoResponse(
                solicitudGuardada.getId(),
                estado,
                motivo,
                request.getMontoSolicitado(),
                montoAprobado,
                tea,
                tem,
                cuotaFinal,
                request.getPlazoMeses(),
                solicitudGuardada.getFechaSolicitud(),
                creditoId,
                cronogramaResponse
        );
    }

    private Credito crearCreditoConCronograma(SolicitudCredito solicitud, Cliente cliente, Cuenta cuenta,
                                              BigDecimal montoAprobado, int plazoMeses,
                                              BigDecimal tea, BigDecimal tem, BigDecimal cuotaMensual) {

        Credito credito = new Credito();
        credito.setSolicitud(solicitud);
        credito.setCliente(cliente);
        credito.setCuenta(cuenta);
        credito.setMontoAprobado(montoAprobado);
        credito.setPlazoMeses(plazoMeses);
        credito.setTea(tea);
        credito.setTem(tem);
        credito.setCuotaMensual(cuotaMensual);
        credito.setSaldoPendiente(montoAprobado);
        credito.setCuotasPagadas(0);
        credito.setEstado("VIGENTE");

        List<CronogramaPago> cronograma = generarCronograma(montoAprobado, tem, plazoMeses, cuotaMensual);
        cronograma.forEach(c -> c.setCredito(credito));
        credito.setCronograma(cronograma);

        cuenta.setSaldo(cuenta.getSaldo().add(montoAprobado));
        cuentaRepository.save(cuenta);

        return creditoRepository.save(credito);
    }

    private List<CronogramaPago> generarCronograma(BigDecimal monto, BigDecimal tem, int plazoMeses, BigDecimal cuota) {
        List<CronogramaPago> filas = new ArrayList<>();
        BigDecimal saldo = monto;
        LocalDate fecha = LocalDate.now();

        for (int nro = 1; nro <= plazoMeses; nro++) {
            fecha = fecha.plusMonths(1);

            BigDecimal interes = saldo.multiply(tem).setScale(2, RoundingMode.HALF_UP);
            BigDecimal amortizacion;
            BigDecimal cuotaFila = cuota;

            if (nro == plazoMeses) {
                amortizacion = saldo;
                cuotaFila = amortizacion.add(interes);
            } else {
                amortizacion = cuota.subtract(interes);
            }

            saldo = saldo.subtract(amortizacion).setScale(2, RoundingMode.HALF_UP);
            if (saldo.compareTo(BigDecimal.ZERO) < 0) saldo = BigDecimal.ZERO;

            CronogramaPago fila = new CronogramaPago();
            fila.setNumeroCuota(nro);
            fila.setFechaVencimiento(fecha);
            fila.setCuota(cuotaFila.setScale(2, RoundingMode.HALF_UP));
            fila.setInteres(interes);
            fila.setAmortizacion(amortizacion.setScale(2, RoundingMode.HALF_UP));
            fila.setSaldoPosterior(saldo);
            fila.setEstado("PENDIENTE");

            filas.add(fila);
        }
        return filas;
    }

    private BigDecimal calcularTem(BigDecimal tea) {
        double tem = Math.pow(1 + tea.doubleValue(), 1.0 / 12.0) - 1;
        return BigDecimal.valueOf(tem).setScale(6, RoundingMode.HALF_UP);
    }

    private BigDecimal calcularCuotaFrancesa(BigDecimal monto, BigDecimal tem, int plazoMeses) {
        double i = tem.doubleValue();
        double p = monto.doubleValue();
        double factor = 1 - Math.pow(1 + i, -plazoMeses);
        double cuota = (p * i) / factor;
        return BigDecimal.valueOf(cuota).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calcularMontoMaximo(BigDecimal cuotaMaxima, BigDecimal tem, int plazoMeses) {
        double i = tem.doubleValue();
        double cuota = cuotaMaxima.doubleValue();
        double factor = 1 - Math.pow(1 + i, -plazoMeses);
        double monto = cuota * factor / i;
        return BigDecimal.valueOf(monto).setScale(2, RoundingMode.HALF_UP);
    }

    public List<CreditoResponse> listarPorCliente(Long clienteId) {
        return creditoRepository.findByClienteIdOrderByFechaDesembolsoDesc(clienteId).stream()
                .map(this::toCreditoResponse)
                .toList();
    }

    public List<CronogramaItemResponse> obtenerCronograma(Long creditoId) {
        return cronogramaRepository.findByCreditoIdOrderByNumeroCuotaAsc(creditoId).stream()
                .map(this::toCronogramaItem)
                .toList();
    }

    private CreditoResponse toCreditoResponse(Credito c) {
        CronogramaItemResponse proxima = cronogramaRepository
                .findFirstByCreditoIdAndEstadoOrderByNumeroCuotaAsc(c.getId(), "PENDIENTE")
                .map(this::toCronogramaItem)
                .orElse(null);

        return new CreditoResponse(c.getId(), c.getMontoAprobado(), c.getPlazoMeses(), c.getTea(),
                c.getCuotaMensual(), c.getSaldoPendiente(), c.getCuotasPagadas(), c.getEstado(),
                c.getFechaDesembolso(), proxima);
    }

    private CronogramaItemResponse toCronogramaItem(CronogramaPago c) {
        return new CronogramaItemResponse(c.getNumeroCuota(), c.getFechaVencimiento(), c.getCuota(),
                c.getInteres(), c.getAmortizacion(), c.getSaldoPosterior(), c.getEstado());
    }
}