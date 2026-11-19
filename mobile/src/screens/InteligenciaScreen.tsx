
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { theme } from "../theme";

const API = "http://192.168.15.2:8080/api";

export default function InteligenciaScreen() {
  const [token, setToken] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    SecureStore.getItemAsync("movesync.jwt").then(async (v) => {
      setToken(v || "");

      console.log("JWT encontrado:", !!v);
console.log("Tamanho do JWT:", v?.length || 0);

      if (v) {
        try {
          const r = await fetch(API + "/ai/analysis", {
            headers: { Authorization: "Bearer " + v },
          });

          if (r.ok) {
            const raw = await r.text();
            if (raw) setAnalysis(JSON.parse(raw));
          }
        } catch (e) {
          console.warn("Erro ao carregar análise:", e);
        }
      }
    });
  }, []);

  async function ask() {
    if (!question.trim() || !token) {
      if (!token) setError("Sessão não encontrada. Faça login novamente.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const r = await fetch(API + "/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ message: question.trim() }),
      });

      const raw = await r.text();
      let data: any = {};

      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(
          `Resposta inválida da API (HTTP ${r.status}): ${
            raw.slice(0, 300) || "corpo vazio"
          }`
        );
      }

      if (!r.ok) {
        throw new Error(
          data.message || `Erro HTTP ${r.status}: ${raw.slice(0, 300)}`
        );
      }

      if (typeof data.answer !== "string") {
        throw new Error(
          `A API não retornou uma resposta válida. HTTP ${r.status}`
        );
      }

      setAnswer(data.answer);
      setSources(data.sources || []);
      setQuestion("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Falha ao consultar IA."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
    >
      <Text style={s.eyebrow}>MOVE SYNC / INTELIGÊNCIA</Text>
      <Text style={s.title}>MoveSync AI</Text>
      <Text style={s.sub}>
        Assistente de mobilidade urbana com respostas fundamentadas
        em documentos indexados.
      </Text>

      <View style={s.card}>
        <Text style={s.label}>CONVERSE COM A IA</Text>

        {!!answer && (
          <View style={s.answer}>
            <Text style={s.text}>{answer}</Text>

            {sources.map((x, i) => (
              <Text key={i} style={s.source}>
                Fonte: {x}
              </Text>
            ))}
          </View>
        )}

        {!!error && <Text style={s.error}>{error}</Text>}

        <TextInput
          value={question}
          onChangeText={setQuestion}
          multiline
          placeholder="Pergunte sobre mobilidade urbana..."
          placeholderTextColor={theme.colors.muted}
          style={s.input}
        />

        <Pressable
          disabled={busy || !question.trim()}
          onPress={() => void ask()}
          style={s.button}
        >
          {busy ? (
            <ActivityIndicator color="#06131D" />
          ) : (
            <Text style={s.buttonText}>PERGUNTAR</Text>
          )}
        </Pressable>
      </View>

      <View style={s.card}>
        <Text style={s.label}>ANÁLISE E ALERTAS</Text>

        <Text style={s.text}>
          {analysis?.message ||
            "Aguardando dados públicos e treinamento do modelo."}
        </Text>

        {analysis?.results &&
          Object.entries(analysis.results).map(([k, v]) => (
            <Text key={k} style={s.source}>
              {k.replaceAll("_", " ")}: {String(v)}
            </Text>
          ))}

        <Text style={s.source}>
          Origem: {analysis?.source || "Nenhuma base importada"}
        </Text>
      </View>

      <Text style={s.note}>
        A IA só responde sobre informações que tenham sido
        indexadas. O serviço ML requer importação de uma base
        pública CSV; não há dados de trânsito em tempo real.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "800",
    marginTop: 10,
  },
  sub: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginVertical: 16,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  label: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  answer: {
    marginTop: 14,
    padding: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 10,
  },
  text: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
  source: {
    color: theme.colors.muted,
    fontSize: 10,
    marginTop: 8,
  },
  input: {
    marginTop: 14,
    minHeight: 80,
    textAlignVertical: "top",
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    color: theme.colors.text,
  },
  button: {
    marginTop: 10,
    padding: 14,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#06131D",
    fontSize: 11,
    fontWeight: "900",
  },
  error: {
    color: theme.colors.danger,
    marginTop: 10,
  },
  note: {
    color: theme.colors.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 16,
  },
});
