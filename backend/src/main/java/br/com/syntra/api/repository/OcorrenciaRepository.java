package br.com.movesync.api.repository;
import br.com.movesync.api.model.Ocorrencia;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface OcorrenciaRepository extends JpaRepository<Ocorrencia,Long>{List<Ocorrencia> findAllByUsuarioIdOrderByCriadaEmDesc(Long usuarioId);Optional<Ocorrencia> findByIdAndUsuarioId(Long id,Long usuarioId);}