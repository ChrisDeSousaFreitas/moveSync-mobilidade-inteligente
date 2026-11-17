# Roteiro de demonstração — Move Sync

Duração planejada: aproximadamente 4 minutos e 30 segundos. O vídeo final deve respeitar o limite de 5 minutos.

## 0:00–0:30 — Problema e proposta

"Congestionamentos urbanos afetam o deslocamento diário, aumentam o tempo de viagem e dificultam a circulação de serviços essenciais. O Move Sync é uma proposta de plataforma móvel para centralizar informações de mobilidade, visualizar pontos de interesse e permitir o registro colaborativo de ocorrências."

## 0:30–1:00 — Identidade e acesso

- Mostrar a tela inicial do Move Sync.
- Fazer cadastro com uma conta de demonstração ou entrar com uma conta já criada.
- Explicar que o cadastro e o login são processados pela API Java, com senha protegida por BCrypt e sessão JWT.

## 1:00–1:40 — Central e conexão com a API

- Mostrar a Central.
- Apontar o indicador de disponibilidade da API.
- Explicar que o painel e os indicadores numéricos são demonstrativos e não vêm de sensores reais.

## 1:40–2:20 — Mapa e cruzamentos

- Abrir o mapa de Santos.
- Mostrar a cartografia e os marcadores de demonstração.
- Explicar que a cartografia é real, mas os marcadores e níveis de fluxo são ilustrativos.
- Mostrar a tela de cruzamentos e as análises.

## 2:20–3:35 — CRUD de ocorrências

- Criar uma ocorrência com título, descrição, categoria e status.
- Mostrar a ocorrência na listagem.
- Editar o status ou a descrição.
- Excluir o registro.
- Explicar que os dados são persistidos no backend e associados à conta autenticada.

## 3:35–4:10 — Arquitetura e tecnologias

- Mostrar rapidamente as pastas mobile/, backend/ e docs/.
- Explicar: React Native/Expo/TypeScript no mobile; Java/Spring Boot, Spring Security, JWT e JPA na API; H2 local e PostgreSQL no ambiente Docker.
- Mostrar o fluxo API REST → serviços → repositórios → banco.

## 4:10–4:30 — Limites e próximos passos

"Esta versão acadêmica demonstra a estrutura do aplicativo, autenticação, persistência de ocorrências e visualização cartográfica. A integração com sensores, câmeras e controladores semafóricos físicos ainda não está implementada. Ela representa uma etapa futura da proposta."

## Cuidados para a gravação

- Grave a tela com texto legível e sem notificações pessoais.
- Use uma conta de demonstração e dados fictícios.
- Não exiba senhas, tokens, chaves de API ou credenciais.
- Mostre o aplicativo já instalado e funcionando antes de iniciar a gravação.
- Publique no YouTube como público ou não listado e copie o link para entrega.txt.
