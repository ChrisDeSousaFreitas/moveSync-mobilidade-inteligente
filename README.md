# Move Sync — Mobilidade Urbana Inteligente

O **Move Sync** é um aplicativo móvel para visualização de condições de mobilidade urbana, acompanhamento de cruzamentos e registro colaborativo de ocorrências.

## Objetivo
Reunir informações de trânsito em uma interface clara, apoiar a leitura de fluxos e permitir que cidadãos registrem ocorrências relevantes.

## Estrutura
- `mobile/`: aplicativo React Native com Expo e TypeScript.
- `backend/`: API REST em Java com Spring Boot.
- `docs/`: arquitetura, decisões técnicas e instruções de execução.

## Integrantes — Grupo MoveSync
- Pedro Fonseca — RM 562521
- Matheus Enrico — RM 562532
- Bruno Zanateli — RM 563736
- Rodrigo Tiezzi — RM 562975
- Christian de Sousa Freitas — RM 566098

## Funcionalidades
- Cadastro e login com token JWT.
- Painel de mobilidade e mapa urbano.
- Visualização de cruzamentos e indicadores de fluxo.
- CRUD de ocorrências associado ao usuário autenticado.
- Modo de demonstração com dados simulados, identificado como simulação.

## Acesso para avaliação (conta de teste)
Na primeira execução, selecione **Criar uma conta** e cadastre a conta de demonstração abaixo. Depois, use os mesmos dados na tela de login:

- **E-mail:** `teste@movesync.app`
- **Senha:** `MoveSync@2026`

A conta é criada na API no primeiro cadastro; ela não é pré-semeada no banco. Se a base local for apagada, basta cadastrá-la novamente.

## Persistência local
O aplicativo mantém uma cópia local das ocorrências com AsyncStorage, identificada por usuário. Quando a API está disponível, ela continua sendo a fonte principal dos dados e atualiza o cache local. Se a conexão falhar, a lista e os detalhes já armazenados podem ser consultados no aparelho.

## Vídeo de demonstração
**Pendente:** inserir aqui o link público ou não listado do YouTube (até 3 minutos), após gravar o fluxo de login, lista, cadastro e consulta.

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

Para executar a suíte automatizada:

```bash
mvn test
```

Para subir a API com PostgreSQL local via Docker, copie `.env.example` para `.env` na raiz e execute `docker compose up --build`. Troque os valores de exemplo antes de publicar o serviço. Em ambiente publicado, defina uma variável `JWT_SECRET` forte e privada.

### Executar o aplicativo
```bash
cd mobile
npm install
npx expo start
```

Verificações locais do aplicativo:

```bash
npm run typecheck
npm run lint
```

Copie `mobile/.env.example` para `mobile/.env` e ajuste `EXPO_PUBLIC_API_URL`. Em emulador Android, `10.0.2.2` aponta para o computador; no Expo Go em celular físico, use o IP local do computador. Para builds nativos com Google Maps, configure `EXPO_PUBLIC_MAPS_API_KEY` no ambiente antes de gerar o aplicativo.


## Documentação adicional
- `docs/arquitetura.md`: organização dos módulos e segurança.
- `docs/api.md`: contratos e exemplos de requisição.
- `docs/publicacao-api.md`: publicação do backend.
- `docs/distribuicao.md`: EAS Build e Firebase App Distribution.
- `docs/entrega.md`: checklist da Global Solution.

Consulte `docs/execucao-local.md` para instruções detalhadas de execução, testes e solução de problemas.

## Demonstração e integridade dos dados
O mapa utiliza cartografia real, mas os marcadores e indicadores de fluxo atualmente exibidos são ilustrativos. Não há conexão com sensores, câmeras ou controladores semafóricos reais nesta versão.

## Estado do projeto
Em desenvolvimento. A interface já possui autenticação integrada, armazenamento seguro da sessão e CRUD de ocorrências conectado à API. O workflow do GitHub Actions executou com sucesso a compilação e os testes da API, além das verificações de TypeScript e ESLint do aplicativo. A validação em dispositivo físico/emulador, a distribuição de instalação e a configuração de serviços externos permanecem pendentes.
