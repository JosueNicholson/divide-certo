# Interface, NativeWind e localização

## Interface

- Preserve o estilo visual existente: fundo claro, tons de verde escuro e destaques em verde-limão.
- Priorize uma experiência mobile e controles acessíveis, com `accessibilityLabel` em ações importantes.
- Evite adicionar bibliotecas de interface ou navegação sem necessidade explícita.

## Localização

- A interface está disponível em português do Brasil (`pt-BR`), inglês, espanhol e francês.
- Todo novo texto voltado ao usuário deve ser incluído nos quatro idiomas.

## Estilos com NativeWind

- O projeto usa Tailwind CSS através do NativeWind. Prefira `className` com utilitários Tailwind nos componentes React Native em vez de criar novos objetos com `StyleSheet`.
- Mantenha os caminhos de conteúdo e o preset `nativewind/preset` em `tailwind.config.js`; ao adicionar arquivos que contenham classes, inclua-os no `content` para que sejam compilados.
- Preserve a integração atual: `global.css` é importado por `App.js`, o Babel usa `nativewind/babel` e o Metro é envolvido por `withNativeWind`.
- Para cores, espaçamentos e estilos recorrentes, prefira tokens definidos no tema Tailwind; use valores arbitrários somente quando forem específicos ao layout.
- Classes condicionais devem continuar legíveis; quando a lógica crescer, componha a string em uma variável antes do JSX.
