import { getCategorias, getConfiguracaoIgreja } from '@/lib/financeiroQueries'
import {
  adicionarCategoriaAction,
  editarCategoriaAction,
  desativarCategoriaAction,
  salvarConfiguracaoAction,
} from '../actions'

export default async function ConfiguracoesFinanceiroPage() {
  const categorias = await getCategorias()
  const config = await getConfiguracaoIgreja()

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">Configurações Financeiras</h1>
        <p className="text-zinc-500 mt-2">Plano de contas e dados bancários da igreja</p>

        <form action={salvarConfiguracaoAction} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 uppercase tracking-widest">Nome da igreja</label>
            <input name="nome_igreja" defaultValue={config?.nome_igreja ?? ''} className="w-full mt-1 p-3 rounded-lg bg-zinc-800 border border-zinc-700" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 uppercase tracking-widest">CNPJ</label>
            <input name="cnpj" defaultValue={config?.cnpj ?? ''} className="w-full mt-1 p-3 rounded-lg bg-zinc-800 border border-zinc-700" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 uppercase tracking-widest">Chave PIX</label>
            <input name="chave_pix" defaultValue={config?.chave_pix ?? ''} className="w-full mt-1 p-3 rounded-lg bg-zinc-800 border border-zinc-700" />
          </div>
          <div className="md:col-span-3">
            <button
              type="submit"
              className="mt-3 px-5 py-3 bg-[#ff6b00] text-black uppercase font-black rounded-lg"
            >
              Salvar configurações
            </button>
          </div>
        </form>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <h2 className="text-xl font-black uppercase tracking-tight text-white">Plano de contas</h2>
        <form action={adicionarCategoriaAction} className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input name="nome" placeholder="Nome da categoria" className="p-3 rounded-lg bg-zinc-800 border border-zinc-700" required />
          <input name="icone" placeholder="Ícone (opcional)" className="p-3 rounded-lg bg-zinc-800 border border-zinc-700" />
          <select name="tipo" className="p-3 rounded-lg bg-zinc-800 border border-zinc-700" defaultValue="entrada">
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
          <button type="submit" className="px-5 py-3 bg-emerald-500 text-black font-bold rounded-lg">Adicionar categoria</button>
        </form>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {['entrada', 'saida'].map((tipo) => (
            <div key={tipo} className="bg-zinc-800 p-4 rounded-xl border border-zinc-700">
              <h3 className="text-sm uppercase tracking-widest text-zinc-400 mb-2">{tipo === 'entrada' ? 'Entradas' : 'Saídas'}</h3>
              <ul className="space-y-2">
                {categorias.filter((c) => c.tipo === tipo).map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2 p-2 bg-zinc-900 rounded-lg border border-zinc-700">
                    <div>
                      <p className="font-bold">{c.nome}</p>
                      <p className="text-xs text-zinc-500">{c.icone ?? 'sem ícone'} | {c.ativo ? 'ativo' : 'inativo'}</p>
                    </div>
                    <div className="flex gap-2">
                      <form action={editarCategoriaAction} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="nome" value={c.nome} />
                        <input type="hidden" name="icone" value={c.icone ?? ''} />
                        <button type="submit" className="text-xs px-2 py-1 rounded bg-sky-500 hover:bg-sky-600">Editar</button>
                      </form>
                      <form action={desativarCategoriaAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" className="text-xs px-2 py-1 rounded bg-rose-500 hover:bg-rose-600">Desativar</button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
