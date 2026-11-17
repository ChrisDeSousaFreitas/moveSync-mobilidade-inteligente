package br.com.movesync.api.model;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="ocorrencias")
public class Ocorrencia {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=100) private String titulo;
 @Column(nullable=false,length=1200) private String descricao;
 @Column(nullable=false,length=40) private String categoria;
 @Column(length=180) private String endereco;
 private Double latitude;private Double longitude;
 @Column(nullable=false,length=20) private String status="ABERTA";
 @Column(nullable=false,updatable=false) private Instant criadaEm=Instant.now();
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="usuario_id") private Usuario usuario;
 protected Ocorrencia(){}
 public Ocorrencia(String titulo,String descricao,String categoria,String endereco,Double latitude,Double longitude,Usuario usuario){this.titulo=titulo;this.descricao=descricao;this.categoria=categoria;this.endereco=endereco;this.latitude=latitude;this.longitude=longitude;this.usuario=usuario;}
 public void atualizar(String titulo,String descricao,String categoria,String endereco,Double latitude,Double longitude,String status){this.titulo=titulo;this.descricao=descricao;this.categoria=categoria;this.endereco=endereco;this.latitude=latitude;this.longitude=longitude;this.status=status;}
 public Long getId(){return id;}public String getTitulo(){return titulo;}public String getDescricao(){return descricao;}public String getCategoria(){return categoria;}public String getEndereco(){return endereco;}public Double getLatitude(){return latitude;}public Double getLongitude(){return longitude;}public String getStatus(){return status;}public Instant getCriadaEm(){return criadaEm;}
}