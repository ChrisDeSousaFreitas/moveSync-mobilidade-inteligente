package br.com.movesync.api.exception;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
@RestControllerAdvice
public class ApiExceptionHandler {
 @ExceptionHandler(MethodArgumentNotValidException.class)
 public ResponseEntity<Map<String,String>> validacao(MethodArgumentNotValidException ex){
  String mensagem=ex.getBindingResult().getFieldErrors().stream().map(e->e.getField()+": "+e.getDefaultMessage()).collect(Collectors.joining("; "));
  return ResponseEntity.badRequest().body(Map.of("erro","Dados inválidos","detalhes",mensagem));
 }
 @ExceptionHandler(BadCredentialsException.class)
 public ResponseEntity<Map<String,String>> credenciais(){return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("erro","E-mail ou senha incorretos."));}
 @ExceptionHandler(ResponseStatusException.class)
 public ResponseEntity<Map<String,String>> status(ResponseStatusException ex){return ResponseEntity.status(ex.getStatusCode()).body(Map.of("erro",ex.getReason()==null?"Não foi possível concluir a operação.":ex.getReason()));}
}