package br.com.movesync.api.dto;
import jakarta.validation.constraints.*;
public record CadastroRequest(@NotBlank @Size(min=2,max=100) String nome,@NotBlank @Email @Size(max=160) String email,@NotBlank @Size(min=8,max=72) String senha){}