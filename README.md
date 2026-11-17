# Move Sync — Mobilidade Urbana Inteligente

O **Move Sync** é um aplicativo móvel para visualização de condições de mobilidade urbana, acompanhamento de cruzamentos e registro colaborativo de ocorrências.

## Objetivo
Reunir informações de trânsito em uma interface clara, apoiar a leitura de fluxos e permitir que cidadãos registrem ocorrências relevantes.

## Estrutura
- `mobile/`: aplicativo React Native com Expo e TypeScript.
- `backend/`: API REST em Java com Spring Boot.
- `docs/`: arquitetura, decisões técnicas e instruções de execução.

## Funcionalidades
- Cadastro e login com token JWT.
- Painel de mobilidade e mapa urbano.
- Visualização de cruzamentos e indicadores de fluxo.
- CRUD de ocorrências associado ao usuário autenticado.
- Modo de demonstração com dados simulados, identificado como simulação.

## Tecnologias
React Native, Expo, TypeScript, React Navigation, Java 21, Spring Boot, Spring Security, Spring Data JPA, JWT, H2 e PostgreSQL.

## API
A API inicia na porta `8080`. No perfil padrão, utiliza H2 em arquivo em `backend/data/`, preservando os registros entre reinicializações locais. Para persistência fora do ciclo de execução, configure PostgreSQL com `DATABASE_URL`, `DATABASE_DRIVER`, `DATABASE_USERNAME` e `DATABASE_PASSWORD`.

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

Envie `Authorization: Bearer <token>`. Cada usuário acessa somente as próprias ocorrências. O logout orienta o cliente a descartar o token; como JWT é stateless, ele permanece válido até expirar caso uma cópia seja mantida.

### Executar a API
Requisitos: Java 21 e Maven.
```bash
cd backend
mvn spring-boot:run
```
Em ambiente publicado, defina uma variável `JWT_SECRET` forte e privada.

### Executar o aplicativo
```bash
cd mobile
npm install
npx expo start
```

## Demonstração e integridade dos dados
O mapa utiliza cartografia real, mas os marcadores e indicadores de fluxo atualmente exibidos são ilustrativos. Não há conexão com sensores, câmeras ou controladores semafóricos reais nesta versão.

## Estado do projeto
Em desenvolvimento. A integração das rotas à interface mobile, testes de execução e distribuição de instalação serão concluídos nas próximas etapas.
