# Checklist final da Global Solution — Move Sync

## Antes da entrega

- [ ] Executar os testes da API: `cd backend && mvn verify`.
- [ ] Instalar dependências e validar o mobile: `cd mobile && npm install && npm run typecheck && npm run lint`.
- [ ] Configurar a URL pública da API no build mobile.
- [ ] Configurar a chave do Google Maps no ambiente de build.
- [ ] Gerar APK de prévia com EAS.
- [ ] Distribuir o APK pelo Firebase App Distribution.
- [ ] Adicionar o professor como tester no Firebase.
- [ ] Adicionar o professor ao repositório GitHub com permissão de leitura.
- [ ] Gravar vídeo de demonstração com até 5 minutos e publicar no YouTube como público ou não listado.
- [ ] Preencher o arquivo `entrega.txt` com nome do grupo, integrantes, link do vídeo e repositório.
- [ ] Atualizar a tela Sobre com o hash de referência do commit final.
- [ ] Confirmar que o README descreve como executar o projeto.

## Roteiro sugerido para o vídeo

1. Apresentar o problema de mobilidade urbana e a proposta do Move Sync.
2. Fazer cadastro e login.
3. Mostrar a central e identificar os indicadores como demonstrativos.
4. Abrir o mapa de Santos e explicar a diferença entre cartografia real e pontos simulados.
5. Criar, consultar, editar e excluir uma ocorrência.
6. Mostrar a API e a estrutura do projeto.
7. Encerrar explicando o que está simulado e quais integrações físicas não fazem parte desta versão.

## Atenção

Não apresentar dados demonstrativos como telemetria real. A versão atual não controla semáforos físicos e não recebe dados de sensores ou câmeras.
