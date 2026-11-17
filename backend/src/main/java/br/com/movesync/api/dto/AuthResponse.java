package br.com.movesync.api.dto;
public record AuthResponse(String token,String tipo,Long id,String nome,String email){}