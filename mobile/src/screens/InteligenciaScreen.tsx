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

const KNOWLEDGE_DOCUMENT = {
  title: "Base de conhecimento MoveSync - Mobilidade urbana de Santos",
  source: "Infosiga-SP / consolidação municipal de Santos / MoveSync",
  content: `
BASE DE CONHECIMENTO DO MOVESYNC

1. OBJETIVO DO PROJETO
O MoveSync é um projeto de mobilidade urbana inteligente que utiliza dados históricos e análise computacional para apoiar a compreensão de problemas de mobilidade. O sistema não possui acesso a sensores de trânsito em tempo real e não deve apresentar dados históricos como se fossem informações atuais.

2. BASE HISTÓRICA DE ACIDENTES
A base utilizada nesta versão foi consolidada a partir de arquivos públicos do Infosiga-SP para o município de Santos, abrangendo janeiro de 2019 a outubro de 2026. O conjunto mensal contém 94 observações.
Na consolidação foram contabilizados 12.081 sinistros e 313 vítimas fatais.
A variável acidentes representa a quantidade de identificadores únicos de sinistro associados aos registros classificados como SINISTRO FATAL ou SINISTRO NAO FATAL, excluindo registros de notificação.
A variável vitimas_fatais representa a quantidade de pessoas cuja gravidade da lesão foi classificada como FATAL.
Os totais são referentes ao recorte e aos critérios de tratamento desta base, não devem ser apresentados como estatísticas oficiais em tempo real.

3. COMO INTERPRETAR OS DADOS
Os dados permitem observar a evolução mensal dos sinistros e das vítimas fatais no período analisado, comparar períodos e identificar variações incomuns. Uma anomalia estatística não comprova, por si só, a causa de um aumento ou redução. Não atribua causas a obras, clima, comportamento de motoristas ou políticas públicas sem evidência adicional.
A base termina em outubro de 2026. Não há garantia de cobertura de meses posteriores.

4. MODELO DE MACHINE LEARNING
O serviço de ML utiliza Isolation Forest, com pré-processamento por StandardScaler, para identificar observações mensais que se afastam do padrão dos dados históricos. O modelo foi treinado com 94 registros mensais e a análise retornou 35 observações classificadas como anomalias na execução registrada.
Isolation Forest é um método de detecção de anomalias, não um modelo de previsão de acidentes. Uma anomalia indica um comportamento estatisticamente incomum em relação ao conjunto usado pelo modelo; não significa necessariamente acidente grave, risco futuro ou erro nos dados.
Não invente probabilidades, previsões, causas ou alertas em tempo real.

5. LIMITAÇÕES E ORIENTAÇÃO DE RESPOSTA
Responda em português. Diferencie claramente dados históricos, resultados do modelo e informações atuais. Informe o período, município e critérios quando mencionar números. Se a pergunta exigir dados não presentes neste documento, diga que a base não contém informação suficiente. Não invente estatísticas, locais específicos, causas de acidentes ou condições atuais do trânsito.
`.trim(),
};

export default function InteligenciaScreen() {
  const [token, setToken] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [indexing, setIndexing] = useState(false);
  const [knowledgeStatus, setKnowledgeStatus] = useState("");

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

  async function indexKnowledge() {
    if (!token) {
      setKnowledgeStatus("Sessão não encontrada. Faça login novamente.");
      return;
    }

    setIndexing(true);
    setKnowledgeStatus("");

    try {
      const r = await fetch(API + "/ai/knowledge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(KNOWLEDGE_DOCUMENT),
      });

      const raw = await r.text();
      let data: any = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(`Resposta inválida da API (HTTP ${r.status}): ${raw.slice(0, 250) || "corpo vazio"}`);
      }

      if (!r.ok) {
        throw new Error(data.message || `Erro HTTP ${r.status}: ${raw.slice(0, 250)}`);
      }

      setKnowledgeStatus("Base de conhecimento indexada com sucesso! Agora faça uma pergunta sobre os dados históricos de Santos.");
    } catch (e) {
      setKnowledgeStatus(e instanceof Error ? e.message : "Não foi possível indexar a base.");
    } finally {
      setIndexing(false);
    }
  }

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
          `Resposta inválida da API (HTTP ${r.status}): ${raw.slice(0, 300) || "corpo vazio"}`
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
        <Text style={s.label}>BASE DE CONHECIMENTO</Text>
        <Text style={s.text}>
          Cadastre a base histórica do Infosiga de Santos no mecanismo RAG.
          Faça esta operação uma única vez para evitar documentos duplicados.
        </Text>
        {!!knowledgeStatus && <Text style={s.status}>{knowledgeStatus}</Text>}
        <Pressable
          disabled={indexing || !token}
          onPress={() => void indexKnowledge()}
          style={s.button}
        >
          {indexing ? (
            <ActivityIndicator color="#06131D" />
          ) : (
            <Text style={s.buttonText}>CARREGAR BASE DE CONHECIMENTO</Text>
          )}
        </Pressable>
      </View>

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
    marginBottom: 14,
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
    marginTop: 8,
  },
  source: {
    color: theme.colors.muted,
    fontSize: 10,
    marginTop: 8,
  },
  status: {
    color: theme.colors.primary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
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
    marginTop: 2,
  },
});
