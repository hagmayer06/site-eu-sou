import { getDashboardData } from '@/lib/financeiroQueries'

export default async function FinanceiroDashboardPage() {
  const dashboard = await getDashboardData(7)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-black uppercase">Dashboard Financeiro</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-xs uppercase tracking-widest text-zinc-400">Saldo atual</p>
          <p className="text-3xl font-black text-white">R$ {(dashboard.saldoAtual / 100).toFixed(2)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-xs uppercase tracking-widest text-zinc-400">Entradas mês</p>
          <p className="text-3xl font-black text-emerald-400">R$ {(dashboard.totalEntradaMes / 100).toFixed(2)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <p className="text-xs uppercase tracking-widest text-zinc-400">Saídas mês</p>
          <p className="text-3xl font-black text-rose-400">R$ {(dashboard.totalSaidaMes / 100).toFixed(2)}</p>
        </div>
      </div>

      <section className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <h2 className="text-lg font-black">Vencimentos próximos (7 dias)</h2>
        {dashboard.vencimentosProximos.length === 0 ? (
          <p className="text-zinc-400">Nenhum vencimento próximo</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {dashboard.vencimentosProximos.map((l) => (
              <li key={l.id} className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                <p className="font-bold">{l.descricao}</p>
                <p className="text-xs text-zinc-400">Valor: R$ {(l.valor / 100).toFixed(2)} | Vence em {new Date(l.data_vencimento!).toLocaleDateString('pt-BR')}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
