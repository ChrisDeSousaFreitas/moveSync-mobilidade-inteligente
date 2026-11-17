# Preparação para distribuição de testes

Esta etapa depende de ações na conta do responsável pelo projeto. O repositório já contém um perfil EAS de prévia em `mobile/eas.json`; não há credenciais Firebase no código.

## 1. Preparar o projeto Expo

No computador do projeto:

```bash
cd mobile
npm install
npx eas-cli login
npx eas-cli init
```

O comando `eas init` vincula o aplicativo à conta Expo e adiciona um identificador de projeto ao app config. Não invente nem copie o identificador de outro aplicativo.

## 2. Configurar Firebase

1. Abra o Firebase Console e crie ou selecione um projeto.
2. Adicione um aplicativo Android com o identificador `br.com.movesync.mobilidade`.
3. Ative o Firebase App Distribution no projeto.
4. Copie o App ID do aplicativo Android. Ele tem formato semelhante a `1:123456789:android:abcdef`; use o valor real do seu console.
5. Em App Distribution, cadastre o e-mail do professor como tester ou inclua-o em um grupo de testers.
6. Não coloque arquivos de chave de serviço, tokens ou credenciais no GitHub.

## 3. Gerar o APK

Antes de compilar, configure `EXPO_PUBLIC_API_URL` apontando para uma API acessível pelo celular do professor. Um endereço `localhost` no celular aponta para o próprio celular, não para o computador ou servidor.

Para compilar:

```bash
cd mobile
npx eas-cli build --platform android --profile preview
```

Ao final, baixe o APK pelo link fornecido pelo EAS.

## 4. Enviar ao Firebase App Distribution

Instale e autentique o Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
```

Depois, substitua os valores pelos dados reais do Firebase:

```bash
firebase appdistribution:distribute caminho/para/app.apk \
  --app "SEU_FIREBASE_APP_ID" \
  --groups "testers" \
  --release-notes "Versão de avaliação do Move Sync"
```

Se não criar o grupo `testers`, use o e-mail do professor no parâmetro `--testers`.

## 5. Validar o recebimento

Confirme no Firebase App Distribution que a versão aparece como distribuída e que o professor recebeu o convite. Registre o link de instalação e a versão enviada para usar na demonstração.

## O que precisa ser feito pelo responsável

- Login Expo e vinculação do projeto via `eas init`.
- Criar/configurar projeto Firebase e aplicativo Android.
- Cadastrar professor como tester.
- Configurar URL pública da API e chave de mapas para o build final.
- Gerar o APK e publicar no App Distribution.
