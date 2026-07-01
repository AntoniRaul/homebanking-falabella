package com.falabella.homebanking_backend.service;

import com.falabella.homebanking_backend.dto.*;
import com.falabella.homebanking_backend.entity.Cliente;
import com.falabella.homebanking_backend.repository.ClienteRepository;
import com.falabella.homebanking_backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(ClienteRepository clienteRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.clienteRepository = clienteRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest request) {
        Cliente cliente = clienteRepository
                .findByTipoDocumentoAndNumeroDocumento(request.getTipoDocumento(), request.getNumeroDocumento())
                .orElseThrow(() -> new RuntimeException("Documento o clave incorrectos"));

        if (!passwordEncoder.matches(request.getClave(), cliente.getClaveHash())) {
            throw new RuntimeException("Documento o clave incorrectos");
        }

        if ("BLOQUEADO".equals(cliente.getEstado())) {
            throw new RuntimeException("La cuenta se encuentra bloqueada");
        }

        String token = jwtUtil.generarToken(cliente.getId(), cliente.getNumeroDocumento());

        return new LoginResponse(token, cliente.getId(), cliente.getNombres(), cliente.getApellidos());
    }

    public ClienteResponse registrar(ClienteRegistroRequest request) {
        if (clienteRepository.existsByNumeroDocumento(request.getNumeroDocumento())) {
            throw new RuntimeException("Ya existe un cliente con ese documento");
        }
        if (clienteRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Ya existe un cliente con ese email");
        }

        Cliente cliente = new Cliente();
        cliente.setTipoDocumento(request.getTipoDocumento());
        cliente.setNumeroDocumento(request.getNumeroDocumento());
        cliente.setNombres(request.getNombres());
        cliente.setApellidos(request.getApellidos());
        cliente.setEmail(request.getEmail());
        cliente.setClaveHash(passwordEncoder.encode(request.getClave()));

        Cliente guardado = clienteRepository.save(cliente);

        return new ClienteResponse(guardado.getId(), guardado.getTipoDocumento(), guardado.getNumeroDocumento(),
                guardado.getNombres(), guardado.getApellidos(), guardado.getEmail(), guardado.getEstado());
    }
}