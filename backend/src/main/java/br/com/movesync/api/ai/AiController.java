package br.com.movesync.api.ai;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.*;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController @RequestMapping("/api/ai")
@ConditionalOnProperty(name="app.ai.enabled",havingValue="true")
public class AiController {
 private final ChatClient chat; private final VectorStore store;
 public AiController(ChatClient.Builder builder, VectorStore store){
  this.chat=builder.defaultSystem("Você é o assistente MoveSync, responda em português. Use somente o contexto recuperado. Nunca invente números, acidentes ou trânsito em tempo real. Diferencie dados históricos de atuais. Se não houver evidência, diga que não há dados suficientes.").build();this.store=store;
 }
 public record Pergunta(@NotBlank String message){}
 public record Resposta(String answer,List<String> sources){}
 public record Documento(@NotBlank String title,@NotBlank String source,@NotBlank String content){}
 @PostMapping("/chat") public Resposta chat(@Valid @RequestBody Pergunta p){
  try{
   List<Document> docs=store.similaritySearch(SearchRequest.builder().query(p.message()).topK(5).build());
   if(docs==null||docs.isEmpty())return new Resposta("Minha base de conhecimento ainda não contém documentos relevantes. Não vou inventar uma resposta.",List.of());
   String context=docs.stream().map(d->"Fonte: "+d.getMetadata().getOrDefault("source","não informada")+"\n"+d.getText()).reduce((a,b)->a+"\n---\n"+b).orElse("");
   String answer=chat.prompt().system(s->s.text("Responda com base apenas no contexto. Declare incerteza quando necessário.\nCONTEXTO:\n{context}").param("context",context)).user(p.message()).call().content();
   return new Resposta(answer,docs.stream().map(d->String.valueOf(d.getMetadata().getOrDefault("source","Fonte não informada"))).distinct().toList());
  }catch(Exception e){throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"IA indisponível: confira OPENAI_API_KEY e PostgreSQL/PGVector.");}
 }
 @PostMapping("/knowledge") public Map<String,String> index(@Valid @RequestBody Documento d){
  if(d.content().length()>20000)throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,"Documento limitado a 20 mil caracteres.");
  store.add(List.of(new Document(d.content(),Map.of("title",d.title(),"source",d.source()))));
  return Map.of("status","indexed","title",d.title(),"source",d.source());
 }
 @GetMapping("/analysis") public Map<String,Object> analysis(){return Map.of("status","ml_service_separado","message","Consulte o serviço ML em http://localhost:8000/health. Importe somente CSV público validado.","source","Infosiga-SP / dados municipais");}
}