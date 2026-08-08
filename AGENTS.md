# Divide Certo — instruções para agentes

## Projeto

- Aplicativo mobile em React Native com Expo.
- A interface está disponível em português do Brasil (`pt-BR`), inglês, espanhol e francês. Todo novo texto voltado ao usuário deve ser incluído nos quatro idiomas.

## Arquitetura

- `App.js` é o ponto de entrada e concentra apenas o estado compartilhado da divisão, o idioma selecionado e a troca simples entre telas.
- `src/screens/` contém as telas: `HomeScreen`, `CustomizeScreen` e `SettingsScreen`.
- `src/components/` contém componentes reutilizáveis, como `SplitTypeModal`.
- `src/i18n/` centraliza a localização: um arquivo por idioma (`pt.js`, `en.js`, `es.js` e `fr.js`), além da configuração comum em `index.js` e `languages.js`.
- `src/utils/` contém regras de formatação reutilizáveis, como moeda e máscara de centavos.
- Preserve essa separação: não mova traduções, componentes de tela ou utilitários de volta para `App.js`. Ao adicionar uma tela, componente ou idioma, crie o módulo correspondente.
- A navegação continua controlada por estado enquanto houver poucas telas; só adicione uma biblioteca de navegação quando o fluxo justificar.

## Interface

- Preserve o estilo visual existente: fundo claro, tons de verde escuro e destaques em verde-limão.
- Priorize uma experiência mobile e controles acessíveis, com `accessibilityLabel` em ações importantes.
- Evite adicionar bibliotecas de interface ou navegação sem necessidade explícita.

## Estilos com NativeWind

- O projeto usa Tailwind CSS através do NativeWind. Prefira `className` com utilitários Tailwind nos componentes React Native em vez de criar novos objetos com `StyleSheet`.
- Mantenha os caminhos de conteúdo e o preset `nativewind/preset` em `tailwind.config.js`; ao adicionar arquivos que contenham classes, inclua-os no `content` para que sejam compilados.
- Preserve a integração atual: `global.css` é importado por `App.js`, o Babel usa `nativewind/babel` e o Metro é envolvido por `withNativeWind`.
- Para cores, espaçamentos e estilos recorrentes, prefira tokens definidos no tema Tailwind; use valores arbitrários somente quando forem específicos ao layout.
- Classes condicionais devem continuar legíveis; quando a lógica crescer, componha a string em uma variável antes do JSX.

## Regras de negócio da divisão

- O valor total aceita apenas números, usa máscara de centavos e não pode ultrapassar `9.999.999,99`.
- Valores específicos por pessoa usam máscara de centavos e aceitam apenas números.
- A divisão percentual não pode ultrapassar 100% no total.
- A soma dos valores específicos não pode ultrapassar o valor total da conta.
- Ao trocar o tipo de divisão, limpe os valores individuais informados; mantenha os nomes dos participantes.

## Qualidade

- Após editar `App.js`, execute `node --check App.js` e `git diff --check`.
- Use ESLint para identificar erros e padrões incorretos no JavaScript/React Native. Antes de concluir alterações de código, execute `npm run lint` e corrija os problemas introduzidos pela alteração.
- Use Prettier como fonte única de formatação. Antes de concluir alterações de código, execute `npm run format:check`; para aplicar formatação no repositório, use `npm run format`.
- Não desative regras de ESLint ou formatação pontualmente sem uma justificativa técnica clara; prefira corrigir a causa e mantenha as configurações em arquivos próprios na raiz do projeto.
- Não sobrescreva nem reverta alterações do usuário que não façam parte da solicitação atual.
