package com.falabella.homebanking_backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    // En un proyecto real esto va en application.properties / variable de entorno
    private final String SECRET = "homebanking_falabella_clave_secreta_super_larga_para_firmar_tokens_2026";
    private final SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes());
    private final long EXPIRATION_MS = 1000 * 60 * 60 * 8; // 8 horas

    public String generarToken(Long clienteId, String numeroDocumento) {
        return Jwts.builder()
                .subject(numeroDocumento)
                .claim("clienteId", clienteId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims extraerClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extraerNumeroDocumento(String token) {
        return extraerClaims(token).getSubject();
    }

    public Long extraerClienteId(String token) {
        return extraerClaims(token).get("clienteId", Long.class);
    }

    public boolean esTokenValido(String token) {
        try {
            Claims claims = extraerClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}