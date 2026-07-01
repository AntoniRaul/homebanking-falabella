package com.falabella.homebanking_backend.controller;

import com.falabella.homebanking_backend.dto.*;
import com.falabella.homebanking_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@Valid @RequestBody ClienteRegistroRequest request) {
        try {
            ClienteResponse response = authService.registrar(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(new ErrorResponse(e.getMessage()));
        }
    }
}