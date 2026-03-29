# PRD — Área de Membros

## Visão Geral

A Área de Membros permite que qualquer pessoa se cadastre na comunidade Eu Sou e acesse um painel personalizado com suas informações, grupos e eventos. Pastores e líderes ganham uma visão centralizada da membresia. O objetivo é digitalizar o cadastro de membros, substituindo planilhas ou registros manuais, e criar uma identidade digital para cada participante da comunidade.

## Objetivos

- Permitir que 100% dos membros da comunidade tenham um cadastro digital acessível online.
- Reduzir o tempo de cadastro manual pelo pastor: qualquer visitante pode se cadastrar pelo site.
- Fornecer ao pastor uma listagem completa e pesquisável de membros com status e dados de contato.
- Estabelecer o sistema de papéis (membro, líder, pastor) que outras funcionalidades (grupos, finanças) dependem.

## Histórias de Usuário

**Visitante:**
- Como visitante, quero me cadastrar no site com meus dados pessoais para fazer parte da comunidade.
- Como visitante, quero fazer login com e-mail/senha, Google ou WhatsApp para acessar minha área.

**Membro:**
- Como membro, quero visualizar e editar meu perfil (foto, dados pessoais, endereço) para mantê-lo atualizado.
- Como membro, quero ver em qual grupo familiar estou cadastrado para saber meu líder e os horários de reunião.
- Como membro, quero ver os eventos que me inscrevi para não perder nenhum compromisso.

**Líder:**
- Como líder, quero ver a lista de membros do meu grupo com dados de contato para me comunicar com eles.

**Pastor/Admin:**
- Como pastor, quero listar todos os membros com busca por nome, telefone ou e-mail para encontrá-los rapidamente.
- Como pastor, quero ver o perfil completo de um membro, incluindo grupo e histórico de presença.
- Como pastor, quero ativar ou desativar um membro sem excluir seus dados.
- Como pastor, quero definir o papel de um usuário (membro, líder, pastor) para controlar o acesso.

## Funcionalidades Principais

### 1. Cadastro Público de Membros

O que faz: Formulário aberto no site para qualquer visitante se registrar na comunidade.

Por que é importante: Elimina o cadastro manual pelo pastor e permite que o próprio membro mantenha seus dados atualizados.

Requisitos funcionais:
- RF-01: O site deve oferecer uma página pública de cadastro com: nome completo, e-mail, telefone/WhatsApp, data de nascimento, endereço (CEP, rua, bairro, cidade), foto (opcional).
- RF-02: Ao concluir o cadastro, o sistema deve criar uma conta Supabase Auth vinculada ao perfil do membro.
- RF-03: O sistema deve enviar um e-mail de boas-vindas com confirmação após o cadastro.
- RF-04: Não é necessário aprovação do pastor para o cadastro ser concluído (cadastro aberto).

### 2. Autenticação de Membros

O que faz: Login via e-mail/senha, Google e WhatsApp (OTP via SMS/WhatsApp).

Por que é importante: Membros precisam de acesso seguro e conveniente à sua área pessoal.

Requisitos funcionais:
- RF-05: O sistema deve oferecer login via e-mail e senha.
- RF-06: O sistema deve oferecer login via conta Google (OAuth).
- RF-07: O sistema deve oferecer login via **Magic Link enviado por e-mail** (gratuito via Supabase Auth nativo — sem custo por mensagem). Login via WhatsApp/SMS OTP é fora de escopo desta versão por envolver custo por mensagem.
- RF-08: O sistema deve suportar recuperação de senha via e-mail.
- RF-09: A sessão do membro deve ser separada da sessão do painel admin (rotas distintas).

### 3. Painel do Membro (Área Logada)

O que faz: Área privada onde o membro visualiza e edita seu perfil e acompanha sua participação.

Por que é importante: Cria o senso de pertencimento digital e reduz consultas manuais ao pastor.

Requisitos funcionais:
- RF-10: O painel deve exibir: foto de perfil, nome, grupo familiar, próximas reuniões do grupo e próximos eventos inscritos.
- RF-11: O membro deve conseguir editar seus dados pessoais (exceto e-mail — requer confirmação) e foto de perfil.
- RF-12: O membro deve conseguir visualizar o histórico de eventos que participou.
- RF-13: O membro deve conseguir visualizar as informações do seu grupo familiar (nome, líder, horário de reunião).

### 4. Sistema de Papéis (RBAC)

O que faz: Define permissões por papel: membro, líder, pastor/admin.

Por que é importante: Outras funcionalidades (grupos, finanças) dependem de saber quem é líder e quem é pastor.

Requisitos funcionais:
- RF-14: O sistema deve suportar os seguintes papéis:

  | Papel | Acesso |
  |---|---|
  | `membro` | Painel pessoal, perfil, grupo e eventos próprios |
  | `lider` | Gerenciamento do seu grupo familiar |
  | `conferente` | Lançamentos financeiros do seu grupo familiar |
  | `tesoureiro` | Módulo financeiro completo |
  | `pastor` | Acesso total a todas as áreas do sistema |

- RF-15: Somente o `pastor` pode atribuir ou revogar qualquer papel de outro usuário.
- RF-16: Um usuário pode acumular papéis (ex: `lider` + `conferente` no mesmo grupo). O `conferente` pode ser qualquer membro designado pelo pastor — não precisa ser o líder do grupo.
- RF-17: Todo novo cadastro recebe o papel `membro` por padrão, sem acesso ao painel admin.
- RF-18: O `pastor` deve conseguir visualizar e editar o(s) papel(éis) de qualquer membro na tela de gestão de membros.

### 5. Gestão de Membros (Admin)

O que faz: O pastor visualiza, busca, edita e gerencia todos os membros pelo painel admin.

Por que é importante: Substitui o controle manual de membros em planilhas.

Requisitos funcionais:
- RF-19: O painel admin deve listar todos os membros com: nome, telefone, grupo, papel e status (ativo/inativo).
- RF-20: O admin deve conseguir buscar membros por nome, e-mail ou telefone.
- RF-21: O admin deve conseguir filtrar membros por grupo, papel e status.
- RF-22: O admin deve conseguir editar o perfil completo de qualquer membro.
- RF-23: O admin deve conseguir ativar ou desativar um membro (sem excluir).
- RF-24: O admin deve conseguir exportar a lista de membros em CSV.

## Experiência do Usuário

**Personas:**
- *Visitante Ana*: acessa o site pela primeira vez, vê o botão "Faça parte" na navegação, preenche o formulário de cadastro em menos de 3 minutos, recebe e-mail de boas-vindas e já pode fazer login.
- *Membro Carlos*: faz login pelo Google, acessa seu painel e vê que está no grupo "Setor Norte", com reunião toda quinta às 19h. Atualiza seu telefone e foto.
- *Pastor Roberto*: acessa o admin, busca "Ana" na lista de membros, vincula-a ao grupo correto e atribui o papel `lider`. Depois designa "Carlos" como `conferente` do mesmo grupo e "Marcos" como `tesoureiro`.

**Fluxo principal de cadastro:**
1. Visitante clica em "Fazer parte" na navbar.
2. Preenche formulário (nome, e-mail, telefone, data nascimento, endereço).
3. Escolhe senha ou continua com Google/WhatsApp.
4. Recebe e-mail de confirmação.
5. É redirecionado ao painel do membro.

**Considerações de UI/UX:**
- Formulário de cadastro dividido em etapas (wizard) para não assustar o usuário.
- Busca de CEP automática para preencher endereço.
- Foto de perfil com crop/redimensionamento direto no browser.
- Painel do membro com design clean e mobile-first.

**Acessibilidade:**
- Formulários com labels visíveis e mensagens de erro descritivas.
- Fluxo de login acessível por teclado.
- Contraste AA em todos os elementos interativos.

## Restrições Técnicas de Alto Nível

- Autenticação via **Supabase Auth** (já presente no projeto) com provedores: e-mail/senha, Google OAuth e Magic Link por e-mail — todos **sem custo adicional**.
- Login via SMS/WhatsApp OTP **fora desta versão** por envolver custo por mensagem (Twilio ou similar).
- Os dados de membros devem ser armazenados no Supabase com **Row Level Security (RLS)** ativado: membros só acessam seus próprios dados; pastores acessam tudo.
- LGPD: o membro deve poder solicitar exclusão completa dos seus dados.
- Fotos de perfil armazenadas no Supabase Storage (bucket privado — acesso via URL assinada).

## Fora de Escopo

- Chat entre membros.
- Histórico de dízimos e contribuições no painel do membro (pertence ao PRD Financeiro).
- Inscrição em grupos pelo próprio membro via self-service (o líder faz o cadastro — definido no PRD de Grupos).
- Gamificação ou pontos de engajamento.
- App mobile nativo.
- Integração com redes sociais além de Google.

## Decisões Registradas

- **Login:** e-mail/senha, Google OAuth e Magic Link por e-mail — todos gratuitos via Supabase Auth. Login via WhatsApp OTP fora desta versão (tem custo). ✅
- **Papéis:** `membro`, `lider`, `conferente`, `tesoureiro`, `pastor`. O pastor é o único que atribui/revoga papéis. Papéis são acumuláveis. ✅
- **Pastor:** tem acesso total a todas as áreas (financeiro, membros, grupos, configurações). ✅

## Questões em Aberto

- QA-01: O membro pode se inscrever em eventos pelo painel? Requer integração com o módulo de Eventos.
- QA-02: Haverá separação visual entre área pública e área logada do membro (rota `/membro` ou subdomínio)?
- QA-03: Membros menores de 18 anos requerem tratamento especial (LGPD — dados de crianças)?

## Restrições — Não fazer em hipótese alguma

- Nunca expor dados pessoais de membros (CPF, endereço, telefone) em rotas públicas sem autenticação.
- Nunca permitir que um membro acesse ou edite dados de outro membro.
- Nunca excluir um membro que seja líder de grupo ativo sem primeiro reatribuir o grupo.
- Nunca armazenar senhas em texto claro — delegar inteiramente ao Supabase Auth.
