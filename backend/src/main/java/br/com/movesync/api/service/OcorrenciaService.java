package br.com.movesync.api.service;
import br.com.movesync.api.dto.*;
import br.com.movesync.api.model.*;
import br.com.movesync.api.repository.OcorrenciaRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
@Service
public class OcorrenciaService {
 private final OcorrenciaRepository repo;public OcorrenciaService(OcorrenciaRepository repo){this.repo=repo;}
 public List<OcorrenciaResponse> listar(Usuario usuario){return repo.findAllByUsuarioIdOrderByCriadaEmDesc(usuario.getId()).stream().map(this::mapear).toList();}
 public OcorrenciaResponse buscar(Long id,Usuario usuario){return mapear(obter(id,usuario));}
 public OcorrenciaResponse criar(OcorrenciaRequest req,Usuario usuario){validarStatus(req.status());return mapear(repo.save(new Ocorrencia(req.titulo().trim(),req.descricao().trim(),req.categoria().trim(),req.endereco(),req.latitude(),req.longitude(),usuario)));}
 public OcorrenciaResponse atualizar(Long id,OcorrenciaRequest req,Usuario usuario){validarStatus(req.status());Ocorrencia item=obter(id,usuario);item.atualizar(req.titulo().trim(),req.descricao().trim(),req.categoria().trim(),req.endereco(),req.latitude(),req.longitude(),req.status());return mapear(repo.save(item));}
 public void excluir(Long id,Usuario usuario){repo.delete(obter(id,usuario));}
 private Ocorrencia obter(Long id,Usuario usuario){return repo.findByIdAndUsuarioId(id,usuario.getId()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Ocorrência não encontrada."));}
 private void validarStatus(String status){if(!List.of("ABERTA","EM_ANALISE","RESOLVIDA").contains(status))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Status inválido.");}
 private OcorrenciaResponse mapear(Ocorrencia o){return new OcorrenciaResponse(o.getId(),o.getTitulo(),o.getDescricao(),o.getCategoria(),o.getEndereco(),o.getLatitude(),o.getLongitude(),o.getStatus(),o.getCriadaEm());}
}