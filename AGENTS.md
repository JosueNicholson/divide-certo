# Divide Certo — instruções para agentes

## Projeto

- Aplicativo mobile em React Native com Expo.
- A interface e todo texto voltado ao usuário devem estar em português do Brasil (`pt-BR`).
- O projeto usa um único ponto de entrada em `App.js`; mantenha a estrutura simples até que a complexidade justifique navegação ou novos módulos.

## Interface

- Preserve o estilo visual existente: fundo claro, tons de verde escuro e destaques em verde-limão.
- Priorize uma experiência mobile e controles acessíveis, com `accessibilityLabel` em ações importantes.
- Evite adicionar bibliotecas de interface ou navegação sem necessidade explícita.

## Regras de negócio da divisão

- O valor total aceita apenas números, usa máscara de centavos e não pode ultrapassar `9.999.999,99`.
- Valores específicos por pessoa usam máscara de centavos e aceitam apenas números.
- A divisão percentual não pode ultrapassar 100% no total.
- A soma dos valores específicos não pode ultrapassar o valor total da conta.
- Ao trocar o tipo de divisão, limpe os valores individuais informados; mantenha os nomes dos participantes.

## Qualidade

- Após editar `App.js`, execute `node --check App.js` e `git diff --check`.
- Não sobrescreva nem reverta alterações do usuário que não façam parte da solicitação atual.
