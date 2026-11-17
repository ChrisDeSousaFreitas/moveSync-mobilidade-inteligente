package br.com.movesync.api.controller;
import br.com.movesync.api.dto.*;
import br.com.movesync.api.model.Usuario;
import br.com.movesync.api.service.OcorrenciaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/ocorrencias")
public class OcorrenciaController {
 private final OcorrenciaService service;public OcorrenciaController(OcorrenciaService service){this.service=service;}
 @GetMapping public List<OcorrenciaResponse> listar(@AuthenticationPrincipal Usuario usuario){return service.listar(usuario);}
 @GetMapping("/{id}") public OcorrenciaResponse buscar(@PathVariable Long id,@AuthenticationPrincipal Usuario usuario){return service.buscar(id,usuario);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public OcorrenciaResponse criar(@Valid @RequestBody OcorrenciaRequest req,@AuthenticationPrincipal Usuario usuario){return service.criar(req,usuario);}
 @PutMapping("/{id}") public OcorrenciaResponse atualizar(@PathVariable Long id,@Valid @RequestBody OcorrenciaRequest req,@AuthenticationPrincipal Usuario usuario){return service.atualizar(id,req,usuario);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void excluir(@PathVariable Long id,@AuthenticationPrincipal Usuario usuario){service.excluir(id,usuario);}
}