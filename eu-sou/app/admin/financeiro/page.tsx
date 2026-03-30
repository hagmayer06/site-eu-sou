import Link from 'next/link'
import { getDashboardData, formatarReais } from '@/lib/financeiroQueries'
import { getPerfilAtual } from '@/lib/auth'
import DashboardCharts from '@/components/financeiro/DashboardCharts'

function CardKPI({
  label,
  valor,
  cor,
}: {
  label: string
  valor: number
  cor?: string
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
      <p className="text-xs uppercase tracking-widest text-zinc-400">{label}</p>
      <p className={`text-2xl font-black mt-1 ${cor ?? 'text-white'}`}>
        {formatarReais(valor)}
      </p>
    </div>
  )
}

export default async function FinanceiroDashboardPage() {
  const perfil = await getPerfilAtual()
  const papeis = perfil?.papeis ?? []
  const eConferente =
    papeis.includes('conferente') &&
    !papeis.includes('pastor') &&
    !papeis.includes('tesoureiro')
  const grupo_id = eConferente ? (perfil?.grupo_id ?? undefined) : undefined

  const dashboard = await getDashboardData(7, grupo_id)

  const hoje = new Date()
  const top5 = dashboard.vencimentosProximos.slice(0, 5)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-black uppercase">Dashboard Financeiro</h1>
        {eConferente && (
          <span className="text-xs text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full">
            Apenas seu grupo
          </span>
        )}
      </div>

      {/* Badge comprovantes pendentes */}
      {dashboard.comprovantesNaoConfirmados > 0 && (
        <Link
          href="/admin/financeiro/comprovantes"
          className="flex items-center gap-3 bg-amber-950 border border-amber-800 px-4 py-3 rounded-xl hover:bg-amber-900 transition-colors"
        >
          <span className="bg-amber-400 text-black text-xs font-black px-2 py-0.5 rounded-full min-w-[1.5rem] text-center">
            {dashboard.comprovantesNaoConfirmados}
          </span>
          <span className="text-amber-200 text-sm">
            comprovante
            {dashboard.comprovantesNaoConfirmados > 1 ? 's' : ''} aguardando confirmação
          </span>
        </Link>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CardKPI
          label="Saldo do Mês"
          valor={dashboard.saldoAtual}
          cor={dashboard.saldoAtual >= 0 ? 'text-white' : 'text-rose-400'}
        />
        <CardKPI
          label="Total Entradas"
          valor={dashboard.totalEntradaMes}
          cor="text-emerald-400"
        />
        <CardKPI
          label="Total Saídas"
          valor={dashboard.totalSaidaMes}
          cor="text-rose-400"
        />
        <CardKPI
          label="Saldo Acumulado"
          valor={dashboard.saldoAcumulado}
          cor={dashboard.saldoAcumulado >= 0 ? 'text-white' : 'text-rose-400'}
        />
      </div>

      {/* Gráficos */}
      <DashboardCharts
        ultimosSeisMeses={dashboard.ultimosSeisMeses}
        entradasPorCategoria={dashboard.entradasPorCategoria}
      />

      {/* Vencimentos próximos */}
      <section className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <h2 className="text-base font-black uppercase tracking-wide mb-3">
          Vencimentos próximos (7 dias)
        </h2>
        {top5.length === 0 ? (
          <p className="text-zinc-400 text-sm">Nenhum vencimento próximo</p>
        ) : (
          <ul className="space-y-2">
            {top5.map((l) => {
              const dataVenc = new Date(l.data_vencimento! + 'T00:00:00')
              const vencido = dataVenc < hoje
              const diasRestantes = Math.ceil(
                (dataVenc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
              )

              const borderCor = vencido ? 'border-rose-800' : 'border-amber-800'
              const bgCor = vencido ? 'bg-rose-950/50' : 'bg-amber-950/50'
              const badgeCor = vencido
                ? 'bg-rose-600 text-white'
                : 'bg-amber-400 text-black'
              const badgeLabel = vencido ? 'Vencido' : `${diasRestantes}d`

              return (
                <li
                  key={l.id}
                  className={`p-3 rounded-lg border ${borderCor} ${bgCor}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-sm truncate">{l.descricao}</p>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-full shrink-0 ${badgeCor}`}
                    >
                      {badgeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {formatarReais(l.valor)} · vence em{' '}
                    {dataVenc.toLocaleDateString('pt-BR')}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
