// @ts-nocheck — Deno global types não disponíveis no contexto TypeScript do projeto
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ---------------------------------------------------------------------------
// Tipos locais (espelham database.types.ts — sem importação cross-runtime)
// ---------------------------------------------------------------------------
type LancamentoPendente = {
  id: string
  descricao: string
  valor: number       // centavos
  data_vencimento: string
  grupo_id: string | null
}

type Tesoureiro = {
  id: string
  nome: string
  email: string
}

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------
function formatarReais(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function dataParaFmt(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

// ---------------------------------------------------------------------------
// Envio de e-mail via Resend (mesma infra de SMTP do Supabase Auth)
// Requer variável de ambiente: RESEND_API_KEY
// ---------------------------------------------------------------------------
async function enviarEmail(para: string, nome: string, lancamentos: LancamentoPendente[]): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) throw new Error('RESEND_API_KEY não configurada')

  const emailFrom = Deno.env.get('EMAIL_FROM') ?? 'noreply@igrejaeusou.com.br'

  const itens = lancamentos
    .map(
      (l) =>
        `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #3f3f46">${l.descricao}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #3f3f46;text-align:right">${formatarReais(l.valor)}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #3f3f46;text-align:center">${dataParaFmt(l.data_vencimento)}</td>
        </tr>`
    )
    .join('')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Aviso de Vencimento</title></head>
<body style="font-family:sans-serif;background:#09090b;color:#fafafa;padding:32px">
  <h2 style="margin-bottom:8px">⚠️ Aviso de Vencimento</h2>
  <p style="color:#a1a1aa;margin-top:0">Olá, ${nome}. As contas abaixo vencem em 3 dias:</p>
  <table style="width:100%;border-collapse:collapse;margin-top:16px;background:#18181b;border-radius:8px;overflow:hidden">
    <thead>
      <tr style="background:#27272a;color:#a1a1aa;font-size:12px;text-transform:uppercase">
        <th style="padding:8px 12px;text-align:left">Descrição</th>
        <th style="padding:8px 12px;text-align:right">Valor</th>
        <th style="padding:8px 12px;text-align:center">Vencimento</th>
      </tr>
    </thead>
    <tbody>${itens}</tbody>
  </table>
  <p style="margin-top:24px;font-size:12px;color:#71717a">
    Acesse <a href="${Deno.env.get('NEXT_PUBLIC_SITE_URL') ?? '#'}/admin/financeiro" style="color:#10b981">o painel financeiro</a> para detalhes.
  </p>
</body>
</html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: emailFrom,
      to: para,
      subject: `⚠️ ${lancamentos.length} conta(s) vencem em 3 dias`,
      html,
    }),
  })

  if (!res.ok) {
    const corpo = await res.text()
    throw new Error(`Resend API erro ${res.status}: ${corpo}`)
  }
}

// ---------------------------------------------------------------------------
// Handler principal
// ---------------------------------------------------------------------------
Deno.serve(async (_req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Data de referência: hoje + 3 dias
    const dataRef = new Date()
    dataRef.setDate(dataRef.getDate() + 3)
    const dataRefStr = dataRef.toISOString().slice(0, 10)

    // Busca lançamentos pendentes que vencem daqui a 3 dias
    const { data: lancamentos, error: errLanc } = await supabase
      .from('lancamentos')
      .select('id, descricao, valor, data_vencimento, grupo_id')
      .eq('status', 'pendente')
      .eq('data_vencimento', dataRefStr)

    if (errLanc) throw errLanc

    if (!lancamentos || lancamentos.length === 0) {
      console.log(`[avisos-vencimento] Nenhum vencimento para ${dataRefStr}`)
      return new Response(JSON.stringify({ ok: true, enviados: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Busca tesoureiros ativos
    const { data: perfis, error: errPerfis } = await supabase
      .from('perfis')
      .select('id, nome')
      .contains('papeis', ['tesoureiro'])
      .eq('ativo', true)

    if (errPerfis) throw errPerfis
    if (!perfis || perfis.length === 0) {
      console.warn('[avisos-vencimento] Nenhum tesoureiro encontrado')
      return new Response(JSON.stringify({ ok: true, enviados: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Busca e-mails dos tesoureiros via Auth Admin
    const tesoureiroIds = perfis.map((p: { id: string }) => p.id)
    const { data: authUsers, error: errAuth } = await supabase.auth.admin.listUsers({
      perPage: 100,
    })
    if (errAuth) throw errAuth

    const tesoureiros: Tesoureiro[] = (authUsers?.users ?? [])
      .filter((u) => tesoureiroIds.includes(u.id) && u.email)
      .map((u) => ({
        id: u.id,
        email: u.email!,
        nome: perfis.find((p: { id: string }) => p.id === u.id)?.nome ?? 'Tesoureiro',
      }))

    if (tesoureiros.length === 0) {
      console.warn('[avisos-vencimento] Tesoureiros sem e-mail cadastrado')
      return new Response(JSON.stringify({ ok: true, enviados: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Envia e-mail para cada tesoureiro; falhas individuais não interrompem os demais
    let enviados = 0
    for (const tesoureiro of tesoureiros) {
      try {
        await enviarEmail(tesoureiro.email, tesoureiro.nome, lancamentos as LancamentoPendente[])
        enviados++
        console.log(`[avisos-vencimento] E-mail enviado para ${tesoureiro.email}`)
      } catch (err) {
        console.error(`[avisos-vencimento] Falha ao enviar para ${tesoureiro.email}:`, err)
      }
    }

    return new Response(
      JSON.stringify({ ok: true, lancamentos: lancamentos.length, enviados }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('[avisos-vencimento] Erro fatal:', err)
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
