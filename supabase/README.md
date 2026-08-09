# Supabase

Este diretório versiona a infraestrutura do Divide Certo. As migrações criam o
modelo de dados e as políticas de segurança; elas devem ser aplicadas no projeto
Supabase hospedado que será usado pelo aplicativo.

## Aplicar a infraestrutura

1. Crie um projeto no painel do Supabase.
2. Instale a CLI do Supabase e autentique-se.
3. Vincule este repositório ao projeto criado com `supabase link`.
4. Execute `supabase db push` para aplicar as migrações em
   `supabase/migrations/`.
5. Copie a URL do projeto e a chave publicável para um arquivo `.env`, tomando
   `.env.example` como base.
6. No painel do Supabase, habilite o provedor Google em Authentication >
   Providers e informe as credenciais OAuth do projeto no Google Cloud.
7. Em Authentication > URL Configuration, adicione
   `dividecerto://auth/callback` às Redirect URLs permitidas.

O login Google em iOS e Android exige um build de desenvolvimento ou de
produção, pois ele precisa registrar o esquema `dividecerto` no sistema. O
Expo Go não registra esse esquema.

As variáveis `EXPO_PUBLIC_*` são públicas por definição e não devem conter
segredos. A proteção dos dados é feita pelas políticas RLS da migração. Nunca
adicione uma chave `service_role` ao aplicativo mobile.
