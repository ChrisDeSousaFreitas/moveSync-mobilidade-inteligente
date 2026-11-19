# MoveSync AI

## Configuração

A IA generativa utiliza Google Gemini via Spring AI. Crie um arquivo `.env` na raiz do projeto (não versionar):

```dotenv
GEMINI_API_KEY=sua-chave-do-google-ai-studio
APP_AI_ENABLED=true
APP_AI_RAG_ENABLED=true
POSTGRES_PASSWORD=sua-senha-local
JWT_SECRET=seu-segredo-local-com-mais-de-32-caracteres
```

Crie a chave gratuita no Google AI Studio: https://aistudio.google.com/apikey

Suba os serviços com `docker compose up --build -d`. O PostgreSQL usa pgvector; API na porta 8080 e serviço ML na porta 8000 (acessível apenas localmente). O chat usa `gemini-2.5-flash`; embeddings usam `text-embedding-004` com 768 dimensões. O RAG utiliza a tabela `vector_store_gemini`, separada de tabelas vetoriais anteriores.

A disponibilidade e os limites gratuitos dependem da região, modelo e políticas vigentes do Google. Não inclua dados pessoais ou sensíveis nos prompts.

## RAG

`POST /api/ai/knowledge` recebe `{"title":"...","source":"URL oficial","content":"texto do documento"}` e indexa o conteúdo no PGVector. O endpoint exige JWT. Indexe apenas conteúdo público autorizado, mantendo fonte e data. `POST /api/ai/chat` recebe `{"message":"..."}` e recupera até cinco trechos. Sem documentos relevantes, responde que a base está vazia em vez de inventar fatos.

## Machine Learning

O serviço Python oferece `GET /health`, `GET /analysis` e `POST /train` (multipart CSV, campo file). O CSV deve conter colunas `ano,mes,acidentes,vitimas_fatais`, com pelo menos 30 linhas válidas. O conjunto Infosiga de Santos foi agregado mensalmente para o período de 2019 a 2026. Isolation Forest identifica padrões atípicos históricos; não prevê acidentes nem risco individual. Modelo e CSV não são versionados.

Fontes públicas: https://www.infosiga.sp.gov.br/ ; https://www.santos.sp.gov.br/ ; https://www.santos.sp.gov.br/?q=hotsite/sigsantos

## Avaliação e limitações

Teste perguntas cobertas e não cobertas pela base, documentos antigos, CSV com colunas ausentes e CSV insuficiente. Registre origem, período, fundamentação das respostas e limitações. O modelo ML sinalizou 35 de 94 observações no treinamento atual; isso é detecção exploratória, não uma taxa de acerto ou previsão. Não apresente dados agregados sem coordenadas como marcadores no mapa. O app não recebe telemetria e não mostra trânsito em tempo real.
