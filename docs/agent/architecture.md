# Arquitetura e regras de negócio

## Organização do código

- `App.js` é o ponto de entrada e concentra somente estado compartilhado da divisão, idioma selecionado e troca simples entre telas.
- `src/screens/` contém as telas.
- `src/components/` contém componentes reutilizáveis.
- `src/i18n/` centraliza a localização: um arquivo por idioma (`pt.js`, `en.js`, `es.js` e `fr.js`), a configuração comum em `index.js` e `languages.js`.
- `src/utils/` contém regras reutilizáveis, como formatação de moeda e máscara de centavos.
- Preserve essa separação: não mova traduções, componentes de tela ou utilitários para `App.js`. Ao adicionar uma tela, componente ou idioma, crie o módulo correspondente.
- A navegação continua controlada por estado enquanto houver poucas telas; só adicione uma biblioteca de navegação quando o fluxo justificar.

## Regras de negócio da divisão

- O valor total aceita apenas números, usa máscara de centavos e não pode ultrapassar `9.999.999,99`.
- Valores específicos por pessoa usam máscara de centavos e aceitam apenas números.
- A divisão percentual não pode ultrapassar 100% no total.
- A soma dos valores específicos não pode ultrapassar o valor total da conta.
- Ao trocar o tipo de divisão, limpe os valores individuais informados; mantenha os nomes dos participantes.
