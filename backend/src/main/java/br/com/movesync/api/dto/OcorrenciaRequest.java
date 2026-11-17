package br.com.movesync.api.dto;
import jakarta.validation.constraints.*;
public record OcorrenciaRequest(
 @NotBlank @Size(min=3,max=100) String titulo,
 @NotBlank @Size(min=5,max=1200) String descricao,
 @NotBlank @Size(max=40) String categoria,
 @Size(max=180) String endereco,
 @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
 @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
 @NotBlank @Pattern(regexp="ABERTA|EM_ANALISE|RESOLVIDA",message="Status deve ser ABERTA, EM_ANALISE ou RESOLVIDA.") String status
){}
