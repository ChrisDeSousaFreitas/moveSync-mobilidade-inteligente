# MoveSync — Mobilidade Urbana Inteligente

O **MoveSync** é um aplicativo móvel voltado à mobilidade urbana de Santos (SP). A proposta é reunir informações de mobilidade, permitir o registro colaborativo de ocorrências e oferecer recursos de inteligência artificial para apoiar a compreensão de padrões históricos de acidentes.

> **Importante:** o mapa e alguns indicadores da interface são demonstrativos. O projeto não recebe telemetria de semáforos, sensores ou câmeras e não apresenta trânsito em tempo real. As análises de acidentes descritas abaixo usam dados históricos agregados, não previsões.

## Objetivo

Apoiar a leitura de informações sobre mobilidade urbana por meio de uma interface móvel, registros de ocorrências e ferramentas de IA que consultam uma base de conhecimento e identificam comportamentos atípicos em séries históricas.

## Estrutura do projeto

- `mobile/`: aplicativo React Native com Expo e TypeScript.
- `backend/`: API REST em Java 21 e Spring Boot.
- `ml-service/`: serviço Python com FastAPI e Scikit-learn.
- `docker/`: arquivos auxiliares de inicialização do banco.
- `docs/`: arquitetura, decisões técnicas e instruções complementares.

## Integrantes — Grupo MoveSync

- Pedro Fonseca — RM 562521
- Matheus Enrico — RM 562532
- Bruno Zanateli — RM 563736
- Rodrigo Tiezzi — RM 562975
- Christian de Sousa Freitas — RM 566098

## Funcionalidades

- Cadastro e login com autenticação JWT.
- Painel de mobilidade e mapa urbano demonstrativo.
- Visualização de cruzamentos e indicadores de fluxo ilustrativos.
- CRUD de ocorrências associado ao usuário autenticado.
- Assistente MoveSync AI com Gemini e recuperação de contexto (RAG).
- Busca semântica de documentos armazenados no PostgreSQL com PGVector.
- Análise exploratória de séries históricas de acidentes com Isolation Forest.
- Modo de demonstração com dados simulados, identificado como simulação.
- Persistência local de ocorrências para consulta quando a API estiver indisponível.

## Inteligência artificial

A solução combina IA generativa e Machine Learning em dois fluxos complementares:

### IA generativa e RAG

- **Modelo de chat:** Google Gemini 3.8 Flash, integrado ao backend por Spring AI.
- **Embeddings:** `gemini-embedding-001`, com vetores de 768 dimensões.
- **Armazenamento vetorial:** PostgreSQL com extensão PGVector, na tabela `vector_store_gemini`.
- **Recuperação:** a API consulta os trechos mais relevantes da base antes de montar o contexto enviado ao modelo.
- **Base de conhecimento:** inclui informações do projeto e metodologia/dados agregados do Infosiga para Santos.
- **Comportamento esperado:** quando não encontra documentos relevantes, a API informa que não há conteúdo suficiente, em vez de inventar uma resposta.

O conteúdo é enviado ao endpoint protegido `POST /api/ai/knowledge`. O chat utiliza `POST /api/ai/chat`, recebendo `{"message":"sua pergunta"}`. A tela Inteligência do aplicativo disponibiliza a ação **Carregar base de conhecimento** para indexar o documento de referência do projeto.

### Machine Learning — detecção exploratória de anomalias

O serviço Python utiliza **Isolation Forest**, com padronização por **StandardScaler**, para identificar observações mensais que se destacam do comportamento histórico. O modelo é treinado com dados agregados do Infosiga para o município de Santos.

- Período do conjunto preparado: janeiro de 2019 a outubro de 2026.
- Granularidade: 94 observações mensais.
- Total agregado: 12.081 sinistros e 313 vítimas fatais.
- Resultado do treinamento atual: 35 observações sinalizadas como anomalias entre as 94 analisadas.

Esses resultados são exploratórios. Uma anomalia não significa necessariamente um acidente grave, não representa uma taxa de acerto e **não é uma previsão de acidentes ou de risco individual**. Os resultados dependem dos dados e do treinamento utilizado.

### Dados e metodologia

Os dados foram obtidos de arquivos públicos do Infosiga e agregados por ano e mês para Santos. A contagem de acidentes considera IDs únicos de sinistros classificados como fatais ou não fatais, excluindo registros de notificação. As vítimas fatais são contadas a partir dos registros de pessoas cuja gravidade da lesão está classificada como fatal.

Fontes públicas:
- [Infosiga — Governo do Estado de São Paulo](https://www.infosiga.sp.gov.br/)
- [Prefeitura de Santos](https://www.santos.sp.gov.br/)

O conjunto normalizado utilizado pelo serviço ML deve conter as colunas `ano,mes,acidentes,vitimas_fatais` e pelo menos 30 linhas válidas.

### Limitações e cuidados

- A análise é histórica e exploratória; não prevê ocorrências futuras.
- Dados agregados por mês não possuem coordenadas para representar pontos de acidente no mapa.
- A qualidade das respostas RAG depende da relevância, atualidade e cobertura dos documentos indexados.
- Não envie dados pessoais ou sensíveis aos prompts.
- A disponibilidade e os limites de uso do Gemini dependem das políticas, região e cotas vigentes do Google.

## Acesso para avaliação (conta de teste)

Na primeira execução, selecione **Criar uma conta** e cadastre a conta de demonstração abaixo. Depois, use os mesmos dados na tela de login:

- **E-mail:** `teste@movesync.app`
- **Senha:** `MoveSync@2026`

A conta é criada na API no primeiro cadastro; ela não é pré-semeada no banco. Se a base local for apagada, basta cadastrá-la novamente.

## Persistência local

O aplicativo mantém uma cópia local das ocorrências com AsyncStorage, identificada por usuário. Quando a API está disponível, ela continua sendo a fonte principal dos dados e atualiza o cache local. Se a conexão falhar, a lista e os detalhes já armazenados podem ser consultados no aparelho.

O Docker Compose mantém os dados do PostgreSQL e os arquivos do modelo ML em volumes nomeados (`dados-postgres` e `dados-ml`).

## Vídeo de demonstração

[Assistir ao vídeo de demonstração do MoveSync no YouTube](https://youtube.com/shorts/K-mP8g3LGI0)

## Tecnologias

- **Mobile:** React Native, Expo, TypeScript e React Navigation.
- **Backend:** Java 21, Spring Boot, Spring Security, Spring Data JPA e JWT.
- **IA generativa:** Spring AI e Google Gemini.
- **RAG / banco vetorial:** PostgreSQL e PGVector.
- **Machine Learning:** Python, FastAPI, Scikit-learn, Isolation Forest e StandardScaler.
- **Infraestrutura local:** Docker Compose.

## Configuração e execução

### Pré-requisitos

- Git.
- Node.js e npm.
- Java 21 e Maven (para execução do backend fora do Docker).
- Docker Desktop com Docker Compose.
- Chave de API do Google AI Studio para habilitar o Gemini.

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto, ao lado do `docker-compose.yml`. Não versione esse arquivo e nunca coloque chaves reais no README, no código ou em arquivos de exemplo.

Exemplo de configuração:

```dotenv
GEMINI_API_KEY=sua-chave-do-google-ai-studio
APP_AI_ENABLED=true
APP_AI_RAG_ENABLED=true
POSTGRES_PASSWORD=defina-uma-senha-local
JWT_SECRET=defina-um-segredo-aleatorio-com-mais-de-32-caracteres
```

A chave pode ser criada no [Google AI Studio](https://aistudio.google.com/apikey). Mantenha os valores secretos apenas no arquivo local `.env`.

### Subir os serviços com Docker

Na raiz do repositório:

```bash
docker compose up -d --build
```

Serviços e portas:
- API Spring Boot: `http://localhost:8080`.
- PostgreSQL/PGVector: porta interna do Compose, utilizada pela API.
- Serviço ML: `http://localhost:8000`, publicado somente em `127.0.0.1` na máquina host.

Para acompanhar a inicialização:

```bash
docker compose ps
docker compose logs -f api
```

Para reconstruir somente a API após alterações no backend:

```bash
docker compose up -d --build --force-recreate api
```

Não utilize `docker compose down -v` para uma reinicialização comum: a opção `-v` remove os volumes nomeados e apaga os dados persistidos do PostgreSQL e do serviço ML.

### Executar o aplicativo mobile

```bash
cd mobile
npm install
npx expo start
```

Copie `mobile/.env.example` para `mobile/.env` e ajuste `EXPO_PUBLIC_API_URL` para o endereço da API acessível pelo dispositivo. Em emulador Android, `10.0.2.2` aponta para o computador; no Expo Go em celular físico, use o IP local do computador na mesma rede.

Verificações locais do aplicativo:

```bash
npm run typecheck
npm run lint
```

### Executar backend e ML separadamente

Backend (Java 21 e Maven):

```bash
cd backend
mvn spring-boot:run
mvn test
```

Serviço ML: consulte o diretório `ml-service/` para dependências e inicialização. A documentação interativa do FastAPI fica disponível em `http://localhost:8000/docs` quando o serviço está em execução.

## API

A API inicia na porta `8080`. Envie `Authorization: Bearer <token>` nas rotas protegidas.

| Método | Rota | Acesso |
|---|---|---|
| GET | `/api/status` | Público |
| POST | `/api/auth/cadastro` | Público |
| POST | `/api/auth/login` | Público |
| POST | `/api/auth/logout` | Token |
| GET | `/api/ocorrencias` | Token |
| GET | `/api/ocorrencias/{id}` | Token |
| POST | `/api/ocorrencias` | Token |
| PUT | `/api/ocorrencias/{id}` | Token |
| DELETE | `/api/ocorrencias/{id}` | Token |
| POST | `/api/ai/chat` | Token |
| POST | `/api/ai/knowledge` | Token |
| GET | `/api/ai/analysis` | Token |

O serviço ML oferece:
- `GET /health`: estado do serviço.
- `POST /train`: treinamento com CSV multipart no campo `file`.
- `GET /analysis`: análise do conjunto carregado e anomalias identificadas.

Cada usuário acessa somente as próprias ocorrências. O logout orienta o cliente a descartar o token; como JWT é stateless, ele permanece válido até expirar caso uma cópia seja mantida.

## Documentação adicional

- `docs/arquitetura.md`: organização dos módulos e segurança.
- `docs/ia-movesync.md`: configuração, arquitetura, dados, RAG, ML e avaliação.
- `docs/api.md`: contratos e exemplos de requisição.
- `docs/publicacao-api.md`: publicação do backend.
- `docs/distribuicao.md`: EAS Build e Firebase App Distribution.
- `docs/entrega.md`: checklist da Global Solution.
- `docs/execucao-local.md`: execução, testes e solução de problemas.

## Estado do projeto

A aplicação possui autenticação integrada, armazenamento seguro da sessão, CRUD de ocorrências conectado à API e uma tela de Inteligência integrada ao backend. O fluxo de IA generativa utiliza Gemini com RAG/PGVector, e o serviço ML executa análise exploratória de dados históricos com Isolation Forest. O ambiente local é orquestrado por Docker Compose.

Consulte os documentos em `docs/` para detalhes de arquitetura, contratos, avaliação, limitações e publicação.
