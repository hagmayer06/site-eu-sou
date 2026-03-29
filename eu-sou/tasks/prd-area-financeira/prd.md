# PRD — Área Financeira

## Visão Geral

A Área Financeira oferece controle completo das movimentações financeiras da comunidade: entradas (dízimos, ofertas, contribuições por culto) e saídas (despesas, contas a pagar). Inclui dashboard, relatórios, histórico de contribuições por membro e integração com gateway de pagamento online.

O sistema possui **três níveis de acesso financeiro**, todos liberados pelo pastor:
- **`pastor`**: acessa todas as áreas do sistema — membros, grupos, financeiro e configurações.
- **`tesoureiro`**: acessa o módulo financeiro completo (lançamentos, dashboard, relatórios, declarações).
- **`conferente`**: papel vinculado ao grupo familiar — alimenta o sistema com os valores arrecadados nos cultos/reuniões do seu grupo.

**O acesso é 100% restrito a usuários autenticados com papel autorizado.**

## Objetivos

- Eliminar o controle financeiro manual em planilhas, centralizando tudo no sistema.
- Permitir que o tesoureiro lance entradas e saídas em menos de 2 minutos por operação.
- Fornecer ao pastor um dashboard financeiro atualizado em tempo real com saldo, totais por categoria e alertas de vencimento.
- Registrar o histórico de contribuições de cada membro para prestação de contas e transparência.
- Permitir que membros paguem dízimos e ofertas online via Pix, boleto ou cartão.

## Histórias de Usuário

**Tesoureiro Geral:**
- Como tesoureiro, quero lançar entradas e saídas, acessar o dashboard, gerar relatórios e emitir declarações de contribuição para gerir as finanças da comunidade.
- Como tesoureiro, quero receber avisos de contas próximas do vencimento para agir antes do prazo.
- Como tesoureiro, quero visualizar os lançamentos feitos pelos conferentes de cada grupo para consolidar os valores.
- Como tesoureiro, quero confirmar comprovantes de Pix enviados por membros e registrar as entradas.

**Conferente de Grupo:**
- Como conferente, quero lançar os valores arrecadados na reunião/culto do meu grupo (dízimos + ofertas) com data e observação para alimentar o sistema financeiro.
- Como conferente, quero ver apenas os lançamentos do meu próprio grupo, sem acesso às finanças gerais da comunidade.

**Pastor:**
- Como pastor, quero ter acesso total ao módulo financeiro (igual ao tesoureiro) além de todas as outras áreas do sistema para ter visibilidade completa da comunidade.
- Como pastor, quero liberar os papéis de tesoureiro e conferente para os membros adequados.

**Membro (contribuição online):**
- Como membro, quero pagar meu dízimo online via Pix ou cartão para contribuir sem precisar estar presente.
- Como membro, quero ver meu histórico de contribuições registradas no sistema para controle pessoal.

## Funcionalidades Principais

### 1. Plano de Contas

O que faz: Categorização de todas as entradas e saídas em um plano de contas configurável.

Por que é importante: Sem categorização, relatórios e dashboards não têm valor analítico.

Requisitos funcionais:
- RF-01: O sistema deve permitir criar categorias de entrada (ex: Dízimos, Ofertas, Doações, Eventos) e de saída (ex: Aluguel, Água/Luz, Material, Salários, Missões).
- RF-02: O admin deve conseguir criar, editar e desativar categorias sem excluir lançamentos vinculados.
- RF-03: Categorias devem ter nome, tipo (entrada/saída) e ícone opcional.

### 2. Lançamento de Entradas

O que faz: Registro de receitas da comunidade por culto ou por tipo de contribuição.

Por que é importante: É a fonte primária de dados financeiros da comunidade.

Requisitos funcionais:
- RF-04: O tesoureiro deve conseguir lançar uma entrada com: data, valor, categoria, descrição, culto de referência (opcional) e membro vinculado (opcional).
- RF-05: O sistema deve permitir lançamento de culto com campo para valor total de dízimos e valor total de ofertas separadamente.
- RF-06: O lançamento pode ser vinculado a um membro para compor o histórico individual de contribuições.
- RF-07: Contribuições em espécie podem ser lançadas tanto pelo `conferente` do grupo (com escopo restrito ao seu grupo) quanto pelo `tesoureiro` geral (com escopo total).
- RF-08: Entradas geradas por pagamentos online (gateway) devem ser importadas automaticamente como lançamentos confirmados.

### 3. Lançamento de Saídas / Contas a Pagar

O que faz: Registro de despesas com controle de vencimento e status de pagamento.

Por que é importante: Permite visão do fluxo de caixa real e previne atrasos em pagamentos.

Requisitos funcionais:
- RF-08: O tesoureiro deve conseguir lançar uma saída com: descrição, categoria, valor, data de vencimento, status (pendente/pago/vencido) e comprovante (upload de arquivo).
- RF-09: O sistema deve atualizar automaticamente o status para "vencido" quando a data de vencimento passar sem pagamento.
- RF-10: O tesoureiro deve conseguir marcar uma conta como paga, informando a data real de pagamento.

### 4. Dashboard Financeiro

O que faz: Visão consolidada e em tempo real da situação financeira da comunidade.

Por que é importante: O pastor precisa de uma leitura rápida da saúde financeira sem precisar gerar relatórios.

Requisitos funcionais:
- RF-11: O dashboard deve exibir: saldo atual (total entradas − total saídas do mês), total de entradas do mês, total de saídas do mês e saldo acumulado.
- RF-12: O dashboard deve exibir um gráfico de barras com entradas vs. saídas dos últimos 6 meses.
- RF-13: O dashboard deve exibir um gráfico de pizza com distribuição de entradas por categoria.
- RF-14: O dashboard deve listar as 5 contas a vencer nos próximos 7 dias com destaque visual.
- RF-15: O dashboard deve exibir um resumo das contribuições recebidas online pendentes de confirmação.

### 5. Avisos de Vencimento

O que faz: Notifica o tesoureiro sobre contas próximas do vencimento.

Por que é importante: Evita inadimplência e multas por pagamento em atraso.

Requisitos funcionais:
- RF-16: O sistema deve exibir um banner/alerta no painel quando houver contas vencendo em até 3 dias.
- RF-17: O sistema deve enviar um e-mail de aviso ao tesoureiro 3 dias antes do vencimento de cada conta pendente.

### 6. Relatórios

O que faz: Geração de relatórios financeiros por período e por categoria.

Por que é importante: Transparência e prestação de contas nas assembleias da comunidade.

Requisitos funcionais:
- RF-18: O sistema deve gerar relatório de entradas por período (início e fim configuráveis), agrupado por categoria.
- RF-19: O sistema deve gerar relatório de saídas por período, agrupado por categoria.
- RF-20: O sistema deve gerar relatório de fluxo de caixa (entradas − saídas) por mês.
- RF-21: O sistema deve gerar relatório de contribuições por membro (histórico individual).
- RF-22: Todos os relatórios devem ser exportáveis em PDF e CSV.

### 7. Pagamento Online — Versão 1: Pix Estático

O que faz: Exibe a chave Pix da igreja para o membro copiar e realizar o pagamento manualmente no app do banco.

Por que é importante: Permite recebimento digital imediato sem custo de gateway. Simples de implementar como ponto de partida.

Requisitos funcionais:
- RF-23: O sistema deve exibir uma página de contribuição acessível por membros autenticados com a chave Pix da igreja (cópia com um clique) e instruções de pagamento.
- RF-24: O membro deve conseguir informar o tipo (dízimo/oferta), valor e enviar comprovante (upload de imagem) após o pagamento.
- RF-25: O tesoureiro deve conseguir visualizar os comprovantes enviados e confirmar o recebimento, gerando o lançamento de entrada automaticamente.

### 7b. Pagamento Online — Versão 2: Asaas (Segundo Momento)

O que faz: Integração com gateway Asaas para cobrança dinâmica com Pix QR Code, boleto e cartão — confirmação automática via webhook.

Por que é importante: Elimina a confirmação manual do tesoureiro e permite rastreamento automático por membro.

Requisitos funcionais (segundo momento):
- RF-26: O sistema deve integrar com o Asaas para geração de cobranças dinâmicas (Pix QR Code, boleto, cartão).
- RF-27: Ao confirmar o pagamento, o Asaas deve notificar via webhook e o lançamento deve ser registrado automaticamente vinculado ao membro.
- RF-28: O sistema deve exibir o comprovante de pagamento ao membro após a confirmação.

### 8. Histórico de Contribuições por Membro

O que faz: Exibe o histórico de contribuições registradas de um membro específico.

Por que é importante: Transparência pastoral e possibilidade de emissão de declaração de dízimos.

Requisitos funcionais:
- RF-29: O admin (`pastor` ou `tesoureiro`) deve conseguir acessar o histórico de contribuições de qualquer membro com filtro por período.
- RF-30: O membro deve conseguir ver seu próprio histórico de contribuições no seu painel pessoal.
- RF-31: O sistema deve permitir gerar e exportar uma declaração anual de contribuições de um membro em PDF contendo: nome do membro, CNPJ da igreja, período, total contribuído por categoria e assinatura do tesoureiro responsável.

## Experiência do Usuário

**Personas:**
- *Tesoureiro Marcos*: acessa o painel financeiro todo domingo após o culto. Lança o valor de dízimos e ofertas do culto em menos de 2 minutos. Na segunda, visualiza o dashboard e paga as contas vencendo na semana.
- *Pastor Roberto*: no final do mês acessa o relatório financeiro, exporta em PDF e apresenta na reunião de liderança.
- *Membro Ana*: acessa sua área logada, clica em "Contribuir", escolhe dízimo, informa o valor e paga via Pix com QR Code gerado na tela.

**Fluxo de pagamento online (Versão 1 — Pix estático):**
1. Membro loga na sua área.
2. Acessa "Contribuir".
3. Seleciona tipo (dízimo/oferta) e informa o valor.
4. Copia a chave Pix da igreja exibida na tela.
5. Paga pelo app do banco.
6. Faz upload do comprovante no sistema.
7. Tesoureiro confirma e lança a entrada.

**Fluxo de pagamento online (Versão 2 — Asaas, segundo momento):**
1. Membro seleciona tipo e valor.
2. Sistema gera QR Code dinâmico via Asaas.
3. Membro paga pelo app do banco.
4. Webhook confirma → lançamento automático criado.
5. Membro vê confirmação na tela.

**Considerações de UI/UX:**
- Dashboard com cards de KPI em destaque e gráficos claros e legíveis.
- Formulários de lançamento simples, com valores monetários formatados automaticamente (R$ 1.500,00).
- Tabelas de lançamentos com paginação e filtros por data e categoria.
- Mobile-first: tesoureiro pode lançar pelo celular durante/após o culto.

## Restrições Técnicas de Alto Nível

- **Acesso restrito:** todas as rotas da área financeira devem exigir autenticação com papel autorizado. Nenhuma rota financeira é pública.
- **Hierarquia de papéis financeiros:**
  - `pastor`: acesso total ao sistema inteiro (financeiro + membros + grupos + configurações).
  - `tesoureiro`: acesso completo ao módulo financeiro; sem acesso a membros, grupos ou configurações.
  - `conferente`: acesso restrito a lançamentos do seu próprio grupo familiar; sem acesso a dashboard geral, relatórios ou finanças de outros grupos.
- **Atribuição de papéis:** somente o `pastor` pode atribuir ou revogar qualquer papel no sistema.
- **Versão 1 — Pix estático:** a chave Pix da igreja é exibida para o membro copiar e pagar manualmente. O tesoureiro confirma o recebimento lançando manualmente no sistema.
- **Versão 2 (segundo momento) — Asaas:** integração com gateway Asaas para geração de cobranças dinâmicas (Pix QR Code, boleto, cartão) com confirmação automática via webhook.
- Webhooks do Asaas (quando implementado) devem ser processados por rotas de API seguras no Next.js (validação de assinatura do webhook).
- Dados financeiros devem ter RLS no Supabase: apenas usuários com papel `pastor` ou `tesoureiro` leem e escrevem.
- Relatórios em PDF gerados server-side (ex: biblioteca `@react-pdf/renderer` ou similar).
- LGPD: histórico de contribuições vinculado a membros é dado pessoal — deve ser incluído na solicitação de exclusão de dados.

## Fora de Escopo

- Contabilidade fiscal, emissão de notas fiscais ou integração com sistemas contábeis externos.
- Folha de pagamento de funcionários ou voluntários.
- Controle de patrimônio (imóveis, equipamentos).
- Conciliação bancária automática via Open Finance.
- Integração com Asaas para pagamentos dinâmicos (Pix QR Code, boleto, cartão) — segundo momento.
- Integração com outros gateways além do Asaas.
- Acesso de membros comuns ao dashboard financeiro geral da comunidade.

## Decisões Registradas

- **Papéis:** `pastor` (acesso total ao sistema), `tesoureiro` (financeiro completo), `conferente` (lançamentos do seu grupo apenas). ✅
- **Atribuição de papéis:** somente o pastor libera acessos. ✅
- **Declaração anual:** inclui CNPJ da igreja. ✅
- **Pix versão 1:** estático (chave da igreja) com upload de comprovante pelo membro e confirmação manual pelo tesoureiro. ✅
- **Pix versão 2:** dinâmico via Asaas — segundo momento. ✅

## Questões em Aberto

- **Conferente:** qualquer membro pode ser designado como conferente de um grupo — não precisa ser o líder. ✅
- **Contribuições em espécie:** podem ser lançadas tanto pelo `conferente` do grupo quanto pelo `tesoureiro` geral. ✅

## Restrições — Não fazer em hipótese alguma

- Nunca permitir acesso a qualquer tela ou dado financeiro sem autenticação válida com papel autorizado.
- Nunca expor chaves de API do gateway (Asaas) no frontend — todas as chamadas devem ser server-side.
- Nunca exibir o histórico financeiro de um membro para outro membro.
- Nunca excluir lançamentos financeiros confirmados — apenas estornar com novo lançamento contrário (auditoria).
- Nunca processar webhooks do gateway sem validar a assinatura da requisição.
