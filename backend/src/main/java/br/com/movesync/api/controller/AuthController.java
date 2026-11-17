package br.com.movesync.api.controller;
import br.com.movesync.api.dto.*;
import br.com.movesync.api.service.AuthService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth")
public class AuthController {
 private final AuthService service;public AuthController(AuthService service){this.service=service;}
 @PostMapping("/cadastro") @ResponseStatus(HttpStatus.CREATED) public AuthResponse cadastrar(@Valid @RequestBody CadastroRequest request){return service.cadastrar(request);}
 @PostMapping("/login") public AuthResponse login(@Valid @RequestBody LoginRequest request){return service.entrar(request);}
 @PostMapping("/logout") public Map<String,String> logout(){return Map.of("mensagem","Sessão encerrada. Remova o token armazenado no aplicativo.");}
}