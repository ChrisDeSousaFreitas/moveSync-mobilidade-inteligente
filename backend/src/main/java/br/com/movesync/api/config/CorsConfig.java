package br.com.movesync.api.config;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
@Configuration
public class CorsConfig {
 @Bean CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.origens:http://localhost:8081,http://localhost:19006}") String origens){
  CorsConfiguration config=new CorsConfiguration();
  List<String> permitidas=Arrays.stream(origens.split(",")).map(String::trim).filter(s->!s.isBlank()).toList();
  config.setAllowedOrigins(permitidas);
  config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
  config.setAllowedHeaders(List.of("Authorization","Content-Type"));
  config.setAllowCredentials(false);
  UrlBasedCorsConfigurationSource source=new UrlBasedCorsConfigurationSource();source.registerCorsConfiguration("/**",config);return source;
 }
}
