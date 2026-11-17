package br.com.movesync.api.dto;
import jakarta.validation.constraints.*;
public record OcorrenciaRequest(@NotBlank @Size(min=3,max=100) String titulo,@NotBlank @Size(min=5,max=1200) String descricao,@NotBlank @Size(max=40) String categoria,@Size(max=180) String endereco,Double latitude,Double longitude,@NotNull String status){}