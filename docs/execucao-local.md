# Execução local do Move Sync

## Pré-requisitos

- Java Development Kit 21.
- Maven 3.9 ou superior.
- Node.js 22 e npm.
- Android Studio com um emulador Android, ou um celular com Expo Go para desenvolvimento.

## 1. Iniciar a API

No terminal, na raiz do repositório:

```bash
cd backend
mvn spring-boot:run
```

A API ficará disponível em `http://localhost:8080/api`. O banco H2 será criado em arquivo dentro de `backend/data/`.

Teste a disponibilidade em outro terminal:

```bash
curl http://localhost:8080/api/status
```

A resposta esperada contém `"aplicacao":"Move Sync"` e `"estado":"operacional"`.

## 2. Configurar e iniciar o aplicativo

Em outro terminal:

```bash
cd mobile
```

Copie `.env.example` para `.env`. No emulador Android padrão, mantenha a URL `http://10.0.2.2:8080/api`. Se usar celular físico, substitua `10.0.2.2` pelo endereço IP local do computador na mesma rede Wi-Fi.

Instale e inicie:

```bash
npm install
npx expo start
```

- Pressione `a` no terminal para abrir no emulador Android.
- Para celular físico, abra o Expo Go e leia o QR Code.

A chave Google Maps é necessária para compilações nativas configuradas com Google Maps. Ela deve ser adicionada como `EXPO_PUBLIC_MAPS_API_KEY` no ambiente, nunca enviada ao repositório.

## 3. Validar o projeto

API:

```bash
cd backend
mvn verify
```

Aplicativo:

```bash
cd mobile
npm run typecheck
npm run lint
```

## 4. Alternativa: API e PostgreSQL com Docker

Na raiz do repositório, copie `.env.example` para `.env`, substitua as senhas e o segredo JWT de exemplo e execute:

```bash
docker compose up --build
```

Esse comando inicia PostgreSQL e API. Para encerrar, use `Ctrl+C` e depois `docker compose down`. Os dados do PostgreSQL permanecem no volume `dados-postgres`; não use `docker compose down -v` se quiser preservá-los.

## Problemas comuns

- **O aplicativo não conecta:** confira se a API está em execução e se a URL usa `10.0.2.2` no emulador ou o IP local do computador no celular físico.
- **O mapa aparece sem cartografia no APK:** confira se a chave Google Maps está configurada no ambiente de build e habilitada para Android Maps SDK.
- **Login não funciona:** confira se o backend iniciou sem erros e se o cadastro foi concluído; os dados locais ficam no banco H2 em arquivo.
- **A API publicada não é acessível no celular:** use um endereço HTTPS público, não `localhost` nem IP privado.
