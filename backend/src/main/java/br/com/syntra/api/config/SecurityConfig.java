package br.com.movesync.api.config;
import br.com.movesync.api.repository.UsuarioRepository;
import br.com.movesync.api.security.JwtAuthFilter;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
@Configuration
public class SecurityConfig {
 @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
 @Bean UserDetailsService userDetailsService(UsuarioRepository repo){return email->repo.findByEmail(email.toLowerCase()).orElseThrow(()->new org.springframework.security.core.userdetails.UsernameNotFoundException("Usuário não encontrado."));}
 @Bean DaoAuthenticationProvider authenticationProvider(UserDetailsService users,PasswordEncoder encoder){var provider=new DaoAuthenticationProvider();provider.setUserDetailsService(users);provider.setPasswordEncoder(encoder);return provider;}
 @Bean AuthenticationManager authenticationManager(AuthenticationConfiguration config)throws Exception{return config.getAuthenticationManager();}
 @Bean SecurityFilterChain filterChain(HttpSecurity http,JwtAuthFilter jwt,DaoAuthenticationProvider provider)throws Exception{
  return http.csrf(csrf->csrf.disable()).cors(cors->{}).sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS)).authenticationProvider(provider)
   .authorizeHttpRequests(auth->auth.requestMatchers("/api/auth/**","/api/status","/h2-console/**").permitAll().requestMatchers(HttpMethod.OPTIONS,"/**").permitAll().anyRequest().authenticated())
   .headers(headers->headers.frameOptions(frame->frame.sameOrigin())).addFilterBefore(jwt,UsernamePasswordAuthenticationFilter.class).build();
 }
}