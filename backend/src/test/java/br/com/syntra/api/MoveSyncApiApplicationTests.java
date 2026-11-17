package br.com.movesync.api;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class MoveSyncApiApplicationTests {
 @Autowired MockMvc mvc;
 @Autowired ObjectMapper mapper;

 @Test
 void cadastroAutenticaEPermiteGerenciarOcorrenciasDoUsuario() throws Exception {
  String email="teste-"+UUID.randomUUID()+"@movesync.dev";
  String cadastro=mvc.perform(post("/api/auth/cadastro").contentType(MediaType.APPLICATION_JSON)
    .content("{\"nome\":\"Pessoa Teste\",\"email\":\""+email+"\",\"senha\":\"SenhaForte123\"}"))
    .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
  JsonNode sessao=mapper.readTree(cadastro);String token=sessao.get("token").asText();
  mvc.perform(get("/api/ocorrencias").header("Authorization","Bearer "+token))
    .andExpect(status().isOk()).andExpect(content().json("[]"));
  mvc.perform(post("/api/ocorrencias").header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON)
    .content("{\"titulo\":\"Colisão na avenida\",\"descricao\":\"Veículos envolvidos na faixa da direita.\",\"categoria\":\"ACIDENTE\",\"status\":\"ABERTA\"}"))
    .andExpect(status().isCreated()).andExpect(jsonPath("$.titulo").value("Colisão na avenida"));
  mvc.perform(get("/api/ocorrencias").header("Authorization","Bearer "+token))
    .andExpect(status().isOk()).andExpect(jsonPath("$[0].categoria").value("ACIDENTE"));
 }
}
