# 1.0 - Infraestrutura de dados financeiros (Migrations + Storage)

## Objetivo
Criar o schema do banco, RLS, índices e bucket de storage para o módulo financeiro.

## Entregáveis
- `supabase/migrations/<timestamp>_criar_financeiro.sql` com todas as tabelas, RLS e índices.
- Bucket `comprovantes` criado e configurado no Supabase Storage (privado).

## Subtarefas
1.0.1 Criar tabela `categorias_financeiro` (id, nome, tipo, icone, ativo) com RLS.
1.0.2 Criar tabela `lancamentos` (id, tipo, categoria_id, valor em centavos, descricao, data, grupo_id, membro_id, data_vencimento, status, comprovante_url, criado_por, criado_em) com RLS.
1.0.3 Criar tabela `configuracoes_igreja` (id, chave_pix, cnpj, nome_igreja, updated_at) com RLS.
1.0.4 Aplicar RLS: `pastor`/`tesoureiro` — acesso total; `conferente` — apenas lançamentos do seu grupo; `membro` — apenas lançamentos vinculados a si.
1.0.5 Criar índices: `lancamentos(data, tipo)`, `lancamentos(grupo_id)`, `lancamentos(membro_id)`.
1.0.6 Criar bucket `comprovantes` (privado, máx 10 MB, mime: image/*, application/pdf) com políticas de storage.
1.0.7 Popular categorias padrão via seed (Dízimos, Ofertas, Doações, Aluguel, Água/Luz, Material).

## Critérios de Sucesso
- Migration executa sem erros em `supabase db reset`.
- RLS impede conferente de ler lançamentos de outro grupo.
- Bucket `comprovantes` existe e rejeita acesso público direto.

## Testes
- SQL: inserir lançamento como conferente de grupo A e verificar que query como conferente de grupo B retorna vazio.
- Storage: tentar GET direto na URL do bucket sem token → 403.
