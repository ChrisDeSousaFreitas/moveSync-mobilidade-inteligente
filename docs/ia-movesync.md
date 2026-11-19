# MoveSync AI
## Configuração
A IA fica desativada por padrão. Crie .env na raiz (não versionar):
OPENAI_API_KEY=sua-chave
APP_AI_ENABLED=true
APP_AI_RAG_ENABLED=true
OPENAI_CHAT_MODEL=gpt-4.1-mini
POSTGRES_PASSWORD=senha-local
JWT_SECRET=segredo-local-forte
Suba com `docker compose up --build`. O banco usa pgvector/pg16; API 8080; ML 8000. A API local em H2 continua disponível com IA desligada.

## RAG
`POST /api/ai/knowledge` recebe {"title":"...","source":"URL oficial","content":"texto do documento"} e indexa o conteúdo no PGVector. O endpoint exige JWT. Indexe apenas conteúdo público autorizado, mantendo fonte e data. `POST /api/ai/chat` recebe {"message":"..."} e recupera até cinco trechos. Sem documentos relevantes, responde que a base está vazia em vez de inventar fatos.

## Machine Learning
O serviço Python oferece `GET /health`, `GET /analysis` e `POST /train` (multipart CSV, campo file). O CSV deve conter colunas `ano,mes,acidentes,vitimas_fatais`, com pelo menos 30 linhas válidas. Baixe e valide os dados oficiais do Infosiga-SP, agregue por ano/mês e normalize as colunas. Não fabrique registros. Isolation Forest identifica padrões atípicos históricos; não prevê acidentes nem risco individual. Modelo e CSV não são versionados.

Fontes públicas para pesquisa: https://www.infosiga.sp.gov.br/ ; https://www.santos.sp.gov.br/ ; https://www.santos.sp.gov.br/?q=hotsite/sigsantos

## Avaliação
Teste perguntas cobertas e não cobertas pela base, documentos antigos, CSV com colunas ausentes e CSV insuficiente. Registre origem, período, cobertura de recuperação, fundamentação das respostas e limitações. Não apresente dados agregados sem coordenadas como marcadores no mapa. O app não recebe telemetria e não mostra trânsito em tempo real.
