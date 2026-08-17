# Testes, lint e formatação

- Após editar `App.js`, execute `node --check App.js` e `git diff --check`.
- Antes de concluir alterações de código, execute `npm run lint` e corrija os problemas introduzidos pela alteração.
- Antes de concluir alterações de código, execute `npm run format:check`.
- Use Prettier como fonte única de formatação. Para aplicá-la no repositório, execute `npm run format`.
- Não desative regras de ESLint ou formatação pontualmente sem uma justificativa técnica clara; prefira corrigir a causa e mantenha as configurações em arquivos próprios na raiz do projeto.
- O hook de `pre-push` executa `npm test`. Mantenha os testes passando antes de enviar alterações.
- O workflow `.github/workflows/test.yml` executa `npm test` em pushes e pull requests; essa validação na CI é obrigatória, pois hooks locais podem ser ignorados com `--no-verify`.
