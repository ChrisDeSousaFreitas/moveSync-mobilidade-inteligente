package br.com.movesync.api.security;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import br.com.movesync.api.model.Usuario;
@Service
public class JwtService {
 private final SecretKey key; private final long expiracaoMs;
 public JwtService(@Value("${app.jwt.secret}") String segredo,@Value("${app.jwt.expiracao-ms:86400000}") long expiracaoMs){this.key=Keys.hmacShaKeyFor(segredo.getBytes(StandardCharsets.UTF_8));this.expiracaoMs=expiracaoMs;}
 public String gerarToken(Usuario usuario){Date agora=new Date();return Jwts.builder().subject(usuario.getEmail()).issuedAt(agora).expiration(new Date(agora.getTime()+expiracaoMs)).signWith(key).compact();}
 public String extrairEmail(String token){return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();}
 public boolean validar(String token,String email){try{return email.equals(extrairEmail(token))&&Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getExpiration().after(new Date());}catch(RuntimeException ex){return false;}}
}