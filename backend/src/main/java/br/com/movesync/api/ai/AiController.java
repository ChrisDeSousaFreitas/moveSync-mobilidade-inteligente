package br.com.movesync.api.ai;

import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/ai")
@ConditionalOnProperty(name = "app.ai.enabled", havingValue = "true")
public class AiController {

    private static final Logger log = LoggerFactory.getLogger(AiController.class);

    private final ChatClient chat;
    private final VectorStore store;
    private final RestClient ml;

    public AiController(ChatClient.Builder builder, VectorStore store, Environment env) {
        this.ml = RestClient.builder()
                .baseUrl(env.getProperty("ML_SERVICE_URL", "http://localhost:8000"))
                .build();

        this.chat = builder.defaultSystem(
                "Você é o assistente MoveSync, responda em português. "
                + "Use somente o contexto recuperado. Nunca invente números, acidentes ou trânsito em tempo real. "
                + "Diferencie dados históricos de atuais. Se não houver evidência, diga que não há dados suficientes."
        ).build();
        this.store = store;
    }

    public record Pergunta(@NotBlank String message) {}
    public record Resposta(String answer, List<String> sources) {}
    public record Documento(@NotBlank String title, @NotBlank String source, @NotBlank String content) {}

    @PostMapping("/chat")
    public Resposta chat(@Valid @RequestBody Pergunta p) {
        try {
            List<Document> docs = store.similaritySearch(
                    SearchRequest.builder().query(p.message()).topK(5).build()
            );

            if (docs == null || docs.isEmpty()) {
                return new Resposta(
                        "Minha base de conhecimento ainda não contém documentos relevantes. Não vou inventar uma resposta.",
                        List.of()
                );
            }

            String context = docs.stream()
                    .map(d -> "Fonte: " + d.getMetadata().getOrDefault("source", "não informada")
                            + "\n" + d.getText())
                    .reduce((a, b) -> a + "\n---\n" + b)
                    .orElse("");

            String answer = chat.prompt()
                    .system(s -> s.text(
                            "Responda com base apenas no contexto. Declare incerteza quando necessário.\nCONTEXTO:\n{context}"
                    ).param("context", context))
                    .user(p.message())
                    .call()
                    .content();

            List<String> sources = docs.stream()
                    .map(d -> String.valueOf(d.getMetadata().getOrDefault("source", "Fonte não informada")))
                    .distinct()
                    .toList();

            return new Resposta(answer, sources);
        } catch (Exception e) {
            log.error("ERRO REAL AO CONSULTAR IA (RAG/GEMINI)", e);
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "IA indisponível. Consulte os logs do backend."
            );
        }
    }

    @PostMapping("/knowledge")
    public Map<String, String> index(@Valid @RequestBody Documento d) {
        if (d.content().length() > 20000) {
            throw new ResponseStatusException(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "Documento limitado a 20 mil caracteres."
            );
        }

        store.add(List.of(new Document(
                d.content(),
                Map.of("title", d.title(), "source", d.source())
        )));

        return Map.of("status", "indexed", "title", d.title(), "source", d.source());
    }

    @GetMapping("/analysis")
    public Map<String, Object> analysis() {
        try {
            return ml.get().uri("/analysis").retrieve().body(Map.class);
        } catch (Exception e) {
            log.warn("Serviço ML indisponível ou ainda não treinado.", e);
            return Map.of(
                    "status", "indisponivel",
                    "message", "Serviço ML indisponível ou ainda não treinado.",
                    "results", Map.of(),
                    "source", "Infosiga-SP / dados municipais"
            );
        }
    }
}
