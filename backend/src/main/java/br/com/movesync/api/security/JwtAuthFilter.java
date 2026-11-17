package br.com.movesync.api.security;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
 private final JwtService jwtService;private final UserDetailsService users;
 public JwtAuthFilter(JwtService jwtService,UserDetailsService users){this.jwtService=jwtService;this.users=users;}
 @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)throws ServletException,IOException{
  String header=request.getHeader("Authorization");
  if(header!=null&&header.startsWith("Bearer ")){String token=header.substring(7);try{String email=jwtService.extrairEmail(token);if(SecurityContextHolder.getContext().getAuthentication()==null&&jwtService.validar(token,email)){var user=users.loadUserByUsername(email);var auth=new UsernamePasswordAuthenticationToken(user,null,user.getAuthorities());auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));SecurityContextHolder.getContext().setAuthentication(auth);}}catch(RuntimeException ignored){SecurityContextHolder.clearContext();}}
  chain.doFilter(request,response);
 }
}