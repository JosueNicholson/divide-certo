# Versionamento, EAS, Metro e iOS/Pods

## Versionamento

- A versão exibida no aplicativo deve vir de `expo.version` em `app.json`.
- Ao preparar uma release, mantenha `package.json` e `app.json` alinhados quando ambos exibirem ou controlarem a versão.
- O projeto usa `appVersionSource: "remote"` no EAS. Confirme e atualize a versão remota antes de gerar builds de distribuição.

## Desenvolvimento e builds nativos

- Após alterar `app.json`, reinicie o Metro antes de testar no dispositivo, por exemplo com `npm run start:device`.
- Mudanças em telas, componentes, traduções e estilos não exigem reinstalar Pods.
- Após instalar, remover ou atualizar dependências com código iOS, execute `pod install` em `ios/` antes de compilar no Xcode.
- Para uma versão de distribuição instalada (APK/IPA/loja), gere e instale ou publique um novo build.
