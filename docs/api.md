# API do Move Sync

Base local: `http://localhost:8080/api`.

## Cadastro

```http
POST /auth/cadastro
Content-Type: application/json

{
  "nome": "Maria da Silva",
  "email": "maria@example.com",
  "senha": "SenhaForte123"
}
```

A resposta contém `token`, `tipo`, `id`, `nome` e `email`. O mesmo formato é retornado pelo login.

## Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "maria@example.com",
  "senha": "SenhaForte123"
}
```

## Criar ocorrência

Envie o token no cabeçalho `Authorization: Bearer <token>`.

```http
POST /ocorrencias
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Congestionamento na avenida",
  "descricao": "Trânsito lento próximo ao cruzamento.",
  "categoria": "CONGESTIONAMENTO",
  "endereco": "Avenida Ana Costa, Santos",
  "latitude": -23.9634,
  "longitude": -46.3336,
  "status": "ABERTA"
}
```

## Regras

- Senhas são armazenadas com BCrypt, nunca em texto puro.
- Tokens JWT expiram em 24 horas por padrão; ajuste com `app.jwt.expiracao-ms`.
- Em produção, configure `JWT_SECRET` com segredo forte e privado.
- Cada usuário só pode consultar, alterar ou excluir as próprias ocorrências.
- Status aceitos: `ABERTA`, `EM_ANALISE` e `RESOLVIDA`.
- O logout é stateless: o aplicativo descarta o token localmente. Um token copiado continua válido até expirar.
- O banco H2 padrão é armazenado em arquivo em `backend/data/`, preservando dados entre reinicializações locais. Configure PostgreSQL para ambientes compartilhados ou publicados.


## Consultar ocorrências

```http
GET /ocorrencias
Authorization: Bearer <token>
```

A listagem retorna somente registros do usuário autenticado, ordenados dos mais recentes para os mais antigos. Para consultar um registro específico, use `GET /ocorrencias/{id}`.

## Atualizar uma ocorrência

```http
PUT /ocorrencias/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Congestionamento atualizado",
  "descricao": "Fluxo lento no sentido Centro.",
  "categoria": "CONGESTIONAMENTO",
  "endereco": "Avenida Ana Costa, Santos",
  "latitude": -23.9634,
  "longitude": -46.3336,
  "status": "EM_ANALISE"
}
```

## Excluir uma ocorrência

```http
DELETE /ocorrencias/1
Authorization: Bearer <token>
```

A exclusão retorna HTTP 204. IDs pertencentes a outra conta não podem ser consultados, alterados ou excluídos.

## Respostas de erro

Erros de validação retornam HTTP 400; credenciais inválidas ou ausência de autenticação retornam HTTP 401; recursos inexistentes ou pertencentes a outro usuário retornam HTTP 404; e e-mail já cadastrado retorna HTTP 409.
