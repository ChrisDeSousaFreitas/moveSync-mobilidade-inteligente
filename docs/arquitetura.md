# Arquitetura do Move Sync

## Visão geral
- **mobile:** interface React Native/Expo, navegação e comunicação HTTP.
- **backend:** API REST Java/Spring Boot, autenticação JWT, regras de negócio e persistência.

## Fluxo
Aplicativo móvel → API REST → camada de serviços → repositórios JPA → banco de dados.

## Segurança
O cadastro armazena senhas com BCrypt. O login valida as credenciais e emite JWT com expiração. As rotas de ocorrências exigem autenticação e filtram os registros pelo usuário autenticado. O cliente encerra a sessão descartando o token; a API utiliza sessões stateless.

## Persistência
O perfil local utiliza H2 em memória. PostgreSQL pode ser configurado por variáveis de ambiente para execução persistente.

## Modo de demonstração
O modo simulado é identificado na interface e utiliza dados fictícios. Ele não representa telemetria real nem integração ativa com controladores semafóricos.
