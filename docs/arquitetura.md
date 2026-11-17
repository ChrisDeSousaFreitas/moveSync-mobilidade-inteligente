# Arquitetura inicial

## Visão geral

O projeto é dividido em dois módulos independentes:

- **mobile:** interface React Native/Expo, navegação e comunicação HTTP.
- **backend:** API REST Java/Spring Boot, regras de negócio e persistência.

## Fluxo previsto

Aplicativo móvel → API REST → camada de serviços → repositórios JPA → banco de dados.

## Modo de demonstração

O modo simulado deverá ser identificado na interface e utilizar dados fictícios locais. Ele não deve ser apresentado como telemetria real nem como integração ativa com controladores semafóricos.

## Próximas etapas

1. Implementar autenticação e autorização.
2. Criar entidade e CRUD de ocorrências.
3. Integrar mapa real e marcadores de cruzamentos.
4. Implementar dados de demonstração separados dos dados da API.
5. Adicionar testes, validações e documentação de execução.
