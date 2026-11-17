package br.com.movesync.api.service;
import br.com.movesync.api.dto.*;
import br.com.movesync.api.model.Usuario;
import br.com.movesync.api.repository.UsuarioRepository;
import br.com.movesync.api.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
@Service
public class AuthService {
 private final UsuarioRepository usuarios;private final PasswordEncoder encoder;private final AuthenticationManager authManager;private final JwtService jwt;
 public AuthService(UsuarioRepository usuarios,PasswordEncoder encoder,AuthenticationManager authManager,JwtService jwt){this.usuarios=usuarios;this.encoder=encoder;this.authManager=authManager;this.jwt=jwt;}
 public AuthResponse cadastrar(CadastroRequest req){String email=req.email().trim().toLowerCase();if(usuarios.existsByEmail(email))throw new ResponseStatusException(HttpStatus.CONFLICT,"Este e-mail já está cadastrado.");Usuario usuario=usuarios.save(new Usuario(req.nome().trim(),email,encoder.encode(req.senha())));return resposta(usuario);}
 public AuthResponse entrar(LoginRequest req){String email=req.email().trim().toLowerCase();authManager.authenticate(new UsernamePasswordAuthenticationToken(email,req.senha()));return resposta(usuarios.findByEmail(email).orElseThrow());}
 private AuthResponse resposta(Usuario usuario){return new AuthResponse(jwt.gerarToken(usuario),"Bearer",usuario.getId(),usuario.getNome(),usuario.getEmail());}
}