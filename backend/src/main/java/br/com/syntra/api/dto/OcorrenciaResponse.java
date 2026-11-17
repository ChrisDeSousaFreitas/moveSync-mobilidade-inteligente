package br.com.movesync.api.dto;
import java.time.Instant;
public record OcorrenciaResponse(Long id,String titulo,String descricao,String categoria,String endereco,Double latitude,Double longitude,String status,Instant criadaEm){}