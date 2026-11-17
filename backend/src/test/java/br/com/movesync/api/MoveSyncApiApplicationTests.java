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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MoveSyncApiApplicationTests {
 @Autowired MockMvc mvc;
 @Autowired ObjectMapper mapper;

 @Test
 void cadastroECrudDeOcorrenciasFuncionamComToken() throws Exception {
  String email="teste-"+UUID.randomUUID()+"@movesync.dev";
  String cadastro="""
   {"nome":"Pessoa Teste","email":"%s","senha":"SenhaForte123"}
   """.formatted(email);
  mvc.perform(post("/api/auth/cadastro").contentType(MediaType.APPLICATION_JSON).content(cadastro))
   .andExpect(status().isCreated());
  String credenciais="""
   {"email":"%s","senha":"SenhaForte123"}
   """.formatted(email);
  String login=mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(credenciais))
   .andExpect(status().isOk()).andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
  JsonNode sessao=mapper.readTree(login);
  String token=sessao.get("token").asText();

  mvc.perform(get("/api/ocorrencias").header("Authorization","Bearer "+token))
   .andExpect(status().isOk()).andExpect(content().json("[]"));

  String nova="""
   {"titulo":"Colisão na avenida","descricao":"Veículos envolvidos na faixa da direita.","categoria":"ACIDENTE","status":"ABERTA"}
   """;
  mvc.perform(post("/api/ocorrencias").header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).content(nova))
   .andExpect(status().isCreated()).andExpect(jsonPath("$.titulo").value("Colisão na avenida"));

  String lista=mvc.perform(get("/api/ocorrencias").header("Authorization","Bearer "+token))
   .andExpect(status().isOk()).andExpect(jsonPath("$[0].categoria").value("ACIDENTE"))
   .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
  long id=mapper.readTree(lista).get(0).get("id").asLong();

  String atualizacao="""
   {"titulo":"Colisão atualizada","descricao":"Faixa da direita liberada.","categoria":"ACIDENTE","status":"EM_ANALISE"}
   """;
  mvc.perform(put("/api/ocorrencias/"+id).header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).content(atualizacao))
   .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("EM_ANALISE"));
  mvc.perform(delete("/api/ocorrencias/"+id).header("Authorization","Bearer "+token))
   .andExpect(status().isNoContent());
  mvc.perform(get("/api/ocorrencias").header("Authorization","Bearer "+token))
   .andExpect(status().isOk()).andExpect(content().json("[]"));
 }

 @Test
 void usuarioNaoAcessaOcorrenciaDeOutraConta() throws Exception {
  String tokenDono=criarToken("dono-"+UUID.randomUUID()+"@movesync.dev");
  String tokenOutro=criarToken("outro-"+UUID.randomUUID()+"@movesync.dev");
  String nova="""
   {"titulo":"Semáforo apagado","descricao":"Sinalização desligada no cruzamento.","categoria":"SINALIZACAO","status":"ABERTA"}
   """;
  String criada=mvc.perform(post("/api/ocorrencias").header("Authorization","Bearer "+tokenDono)
    .contentType(MediaType.APPLICATION_JSON).content(nova))
    .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
  long id=mapper.readTree(criada).get("id").asLong();
  mvc.perform(get("/api/ocorrencias/"+id).header("Authorization","Bearer "+tokenOutro))
    .andExpect(status().isNotFound());
 }

 @Test
 void endpointsPrivadosExigemAutenticacao() throws Exception {
  mvc.perform(get("/api/ocorrencias")).andExpect(status().isUnauthorized());
 }

 private String criarToken(String email) throws Exception {
  String cadastro="""
   {"nome":"Pessoa Teste","email":"%s","senha":"SenhaForte123"}
   """.formatted(email);
  mvc.perform(post("/api/auth/cadastro").contentType(MediaType.APPLICATION_JSON).content(cadastro))
    .andExpect(status().isCreated());
  String login="""
   {"email":"%s","senha":"SenhaForte123"}
   """.formatted(email);
  String resposta=mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(login))
    .andExpect(status().isOk()).andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);
  return mapper.readTree(resposta).get("token").asText();
 }

 @Test
 void rejeitaStatusDeOcorrenciaForaDosValoresPermitidos() throws Exception {
  String token=criarToken("status-"+UUID.randomUUID()+"@movesync.dev");
  String invalida="""
   {"titulo":"Sinal quebrado","descricao":"Semáforo não está funcionando.","categoria":"SINALIZACAO","status":"FINALIZADA"}
   """;
  mvc.perform(post("/api/ocorrencias").header("Authorization","Bearer "+token)
    .contentType(MediaType.APPLICATION_JSON).content(invalida))
    .andExpect(status().isBadRequest());
 }

 @Test
 void statusDaApiEstaDisponivelSemAutenticacao() throws Exception {
  mvc.perform(get("/api/status"))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.aplicacao").value("Move Sync"))
    .andExpect(jsonPath("$.estado").value("operacional"));
 }
}
