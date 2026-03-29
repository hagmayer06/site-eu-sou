# PRD — Grupos Familiares

## Visão Geral

A funcionalidade de Grupos Familiares permite que a comunidade Eu Sou organize seus membros em grupos de proximidade geográfica e relacional. Líderes gerenciam seus grupos (membros, local, agenda), e os membros recebem avisos e se conectam com seu grupo. O objetivo é fortalecer os vínculos comunitários e facilitar a comunicação entre os membros da comunidade.

## Objetivos

- Permitir que pastores e líderes criem e gerenciem grupos com 100% das informações essenciais (local, líder, membros)
- Permitir que qualquer visitante encontre um grupo próximo via mapa de geolocalização
- Reduzir o esforço manual de comunicação: líderes enviam avisos diretamente pelo sistema para o grupo via WhatsApp
- Garantir que 100% dos grupos criados estejam visíveis publicamente com localização no mapa

## Histórias de Usuário

**Pastor/Administrador:**
- Como pastor, quero criar e editar grupos com nome, descrição, local e líder responsável para organizar a comunidade geograficamente.
- Como pastor, quero visualizar todos os grupos e seus membros para ter visibilidade da membresia.
- Como pastor, quero desativar um grupo sem excluí-lo para preservar o histórico.

**Líder de Grupo:**
- Como líder, quero adicionar e remover membros do meu grupo para manter a lista atualizada.
- Como líder, quero criar uma agenda de reuniões recorrentes (dia, horário, local) para organizar os encontros.
- Como líder, quero enviar avisos ao meu grupo via WhatsApp para comunicar informações rapidamente.

**Membro / Visitante:**
- Como visitante, quero ver todos os grupos no mapa para encontrar o mais próximo de mim.
- Como visitante, quero ver os detalhes de um grupo (líder, local, horário de reunião) para decidir participar.

## Funcionalidades Principais

### 1. Gestão de Grupos (Admin)

O que faz: CRUD completo de grupos familiares pelo painel administrativo.

Por que é importante: É a base de toda a funcionalidade — sem criar grupos não existe nada mais.

Requisitos funcionais:
- RF-01: O sistema deve permitir criar um grupo com: nome, descrição, endereço completo, coordenadas geográficas (lat/lng), líder responsável, foto de capa e status (ativo/inativo).
- RF-02: O sistema deve permitir editar todos os campos de um grupo existente.
- RF-03: O sistema deve permitir desativar/ativar um grupo sem excluí-lo.
- RF-04: O sistema deve listar todos os grupos com filtros por status (ativo/inativo).

### 2. Gestão de Membros do Grupo

O que faz: O líder cadastra e remove membros do seu grupo.

Por que é importante: A lista de membros é necessária para comunicação e controle pastoral.

Requisitos funcionais:
- RF-05: O líder deve conseguir adicionar um membro ao grupo (por nome e telefone, vinculado ou não ao cadastro de membros).
- RF-06: O líder deve conseguir remover um membro do grupo.
- RF-07: O sistema deve exibir a lista de membros do grupo com nome, telefone e data de ingresso.
- RF-08: Um membro pode pertencer a somente um grupo familiar por vez.

### 3. Agenda de Reuniões

O que faz: O líder define os encontros regulares do grupo (dia da semana, horário, local).

Por que é importante: Membros e visitantes precisam saber quando e onde o grupo se reúne.

Requisitos funcionais:
- RF-09: O líder deve conseguir cadastrar reuniões com: dia da semana (recorrente), horário de início, horário de término e endereço do encontro.
- RF-10: O sistema deve exibir as próximas reuniões do grupo na página pública do grupo.
- RF-11: O líder deve conseguir cancelar ou editar uma reunião específica sem alterar a recorrência.

### 4. Canal de Avisos (WhatsApp)

O que faz: O líder envia avisos ao grupo, gerando um link de mensagem pré-formatado para o WhatsApp.

Por que é importante: O WhatsApp é o canal principal de comunicação da comunidade.

Requisitos funcionais:
- RF-12: O líder deve conseguir redigir um aviso com texto livre e enviar para o grupo.
- RF-13: O sistema deve gerar um link WhatsApp (`wa.me/?text=...`) com o aviso pré-formatado usando o **número de telefone/WhatsApp cadastrado no perfil do membro** (o mesmo campo de contato principal).
- RF-14: O histórico de avisos enviados deve ser registrado com data, autor e conteúdo.

### 5. Página Pública de Grupos (Site)

O que faz: Exibe a listagem de grupos ativos com mapa interativo para visitantes.

Por que é importante: Permite que qualquer pessoa encontre um grupo próximo sem precisar entrar em contato.

Requisitos funcionais:
- RF-15: O site deve exibir uma seção pública com todos os grupos ativos.
- RF-16: Cada card de grupo deve mostrar: nome, foto, líder, bairro/cidade e horário de reunião.
- RF-17: O sistema deve exibir os grupos em um mapa com marcadores clicáveis usando **OpenStreetMap + Leaflet.js** (sem custo).
- RF-18: Ao clicar em um marcador ou card, o visitante deve ver os detalhes completos do grupo.

## Experiência do Usuário

**Personas:**
- *Pastor João*: acessa o painel admin para criar grupos e designar líderes. Fluxo: login → admin/grupos → Novo Grupo → preenche formulário com endereço → sistema geocodifica automaticamente → salva.
- *Líder Maria*: acessa o painel com seu login para gerenciar seu grupo. Fluxo: login → meu grupo → adicionar membros / criar reunião / enviar aviso.
- *Visitante Pedro*: acessa o site para encontrar um grupo. Fluxo: página inicial → seção Grupos → visualiza mapa → clica no marcador mais próximo → vê detalhes → contata líder.

**Considerações de UI/UX:**
- O mapa deve funcionar no mobile com gestos de toque.
- O formulário de grupo deve ter campo de busca de endereço com autocompletar.
- A lista de membros do grupo deve ser simples e rápida de editar.
- Avisos via WhatsApp devem ter prévia do texto antes de enviar.

**Acessibilidade:**
- Marcadores do mapa devem ter texto alternativo e ser navegáveis por teclado.
- Contraste mínimo AA em todos os cards.

## Restrições Técnicas de Alto Nível

- Integração com **OpenStreetMap + Nominatim** (gratuito, sem chave de API paga) para geocodificação de endereços e exibição do mapa via Leaflet.js.
- Integração com WhatsApp via links `wa.me` (não API oficial — sem custo de API).
- O painel de líderes deve ser protegido por autenticação (Supabase Auth existente).
- Dados de endereço e localização de membros devem ser tratados com cuidado (LGPD): não exibir endereço individual de membros publicamente.
- Performance: o mapa deve carregar com até 100 grupos sem degradação perceptível.

## Fora de Escopo

- Chat em tempo real entre membros do grupo (mensageria própria).
- Integração com API oficial do WhatsApp Business (segundo momento).
- Inscrição de membros no grupo via self-service pelo site (depende do PRD de Área de Membros).
- Pagamentos ou controle financeiro do grupo.
- Transmissão ao vivo nos grupos.
- Notificações push / e-mail para reuniões.

## Decisões Registradas

- **Mapa:** OpenStreetMap + Leaflet.js (gratuito, sem dependência de chave de API paga). ✅
- **Login de líderes:** O pastor libera o acesso de cada líder pelo painel admin (atribuição do papel). ✅
- **WhatsApp:** integração via links `wa.me` (sem custo de API). ✅
- **Número para avisos:** é o mesmo número de telefone/WhatsApp cadastrado no perfil do membro. ✅

## Questões em Aberto

- QA-01: Grupos terão subgrupos ou hierarquia (ex: célula dentro de um grupo maior)?

## Restrições — Não fazer em hipótese alguma

- Nunca exibir publicamente o endereço residencial completo de membros individuais.
- Nunca permitir acesso ao painel de gestão de grupos sem autenticação.
- Nunca excluir um grupo com membros vinculados sem confirmação explícita e transferência ou remoção dos membros.
