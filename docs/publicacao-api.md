# Publicação da API Move Sync

O aplicativo distribuído ao professor precisa acessar uma API por um endereço público. O endereço `localhost` e o IP privado do computador não funcionam fora da rede local.

## Recursos necessários

- Um serviço de hospedagem que execute o `backend/Dockerfile`.
- Um banco PostgreSQL persistente.
- HTTPS habilitado.
- Variáveis de ambiente configuradas no provedor.

## Variáveis da API

| Variável | Valor |
|---|---|
| `PORT` | Porta informada pelo provedor (ou 8080) |
| `DATABASE_URL` | `jdbc:postgresql://HOST:5432/BASE` |
| `DATABASE_DRIVER` | `org.postgresql.Driver` |
| `DATABASE_USERNAME` | Usuário do banco |
| `DATABASE_PASSWORD` | Senha do banco |
| `JWT_SECRET` | Segredo aleatório forte, com pelo menos 32 bytes |
| `APP_CORS_ORIGENS` | Origens web permitidas, separadas por vírgula (quando aplicável) |

Não use a senha de exemplo do Docker Compose nem o segredo JWT padrão em ambiente publicado. Nunca envie credenciais ao GitHub.

## Verificação

Depois da publicação, abra:

```
https://SEU-DOMINIO/api/status
```

A API deve responder com um JSON contendo o nome Move Sync e o estado operacional.

Configure então `EXPO_PUBLIC_API_URL` no ambiente de build mobile com:

```
https://SEU-DOMINIO/api
```

Faça um cadastro e registre uma ocorrência usando o APK distribuído para confirmar que o aplicativo e o banco publicado estão conectados.
