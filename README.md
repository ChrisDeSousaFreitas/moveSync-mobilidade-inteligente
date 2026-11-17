# SYNTRA — Mobilidade Urbana Inteligente

Aplicativo móvel para visualização de condições de mobilidade urbana, acompanhamento de cruzamentos e registro colaborativo de ocorrências.

## Objetivo

O SYNTRA propõe uma experiência de central de inteligência urbana: reunir informações de trânsito em uma interface clara, apoiar a leitura de fluxos e permitir que cidadãos registrem ocorrências relevantes.

## Estrutura planejada

- `mobile/`: aplicativo React Native com Expo e TypeScript.
- `backend/`: API REST em Java com Spring Boot.
- `docs/`: arquitetura, decisões técnicas e instruções de execução.

## Funcionalidades previstas

- Autenticação e gerenciamento de sessão.
- Painel de mobilidade e mapa urbano.
- Visualização de cruzamentos e indicadores de fluxo.
- Cadastro, consulta, edição e remoção de ocorrências.
- Modo de demonstração com dados simulados, identificado como simulação.

## Tecnologias

React Native, Expo, TypeScript, React Navigation, Java, Spring Boot, Spring Security, Spring Data JPA e PostgreSQL. Os serviços externos de mapas e distribuição serão configurados conforme as credenciais disponíveis.

## Estado do projeto

Estrutura inicial em desenvolvimento. Integrações externas, dados de sensores e autenticação serão habilitados por etapas; informações simuladas não representam medições reais de trânsito.
