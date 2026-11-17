package br.com.movesync.api.model;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
@Entity @Table(name="usuarios")
public class Usuario implements UserDetails {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,unique=true,length=160) private String email;
 @Column(nullable=false,length=100) private String nome;
 @Column(nullable=false) private String senha;
 @Column(nullable=false,updatable=false) private Instant criadoEm=Instant.now();
 protected Usuario(){}
 public Usuario(String nome,String email,String senha){this.nome=nome;this.email=email.toLowerCase().trim();this.senha=senha;}
 public Long getId(){return id;} public String getNome(){return nome;} public String getEmail(){return email;} public Instant getCriadoEm(){return criadoEm;}
 @Override public String getPassword(){return senha;} @Override public String getUsername(){return email;}
 @Override public Collection<? extends GrantedAuthority> getAuthorities(){return List.of(new SimpleGrantedAuthority("ROLE_USUARIO"));}
 @Override public boolean isAccountNonExpired(){return true;} @Override public boolean isAccountNonLocked(){return true;} @Override public boolean isCredentialsNonExpired(){return true;} @Override public boolean isEnabled(){return true;}
}