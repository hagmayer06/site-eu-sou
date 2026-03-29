import { getCategorias, getConfiguracaoIgreja } from '@/lib/financeiroQueries'

export default async function ContribuirPage() {
  const categorias = await getCategorias()
  const config = await getConfiguracaoIgreja()

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-black uppercase">Contribuir</h1>
      <p className="text-zinc-400">Use o PIX abaixo para contribuição:</p>
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
        <p className="text-sm text-zinc-300">{config?.nome_igreja ?? 'Igreja Eu Sou'}</p>
        <p className="text-lg font-black text-emerald-300">PIX: {config?.chave_pix ?? 'não configurado'}</p>
        <p className="text-xs text-zinc-500">CNPJ: {config?.cnpj ?? 'não configurado'}</p>
      </div>

      <h2 className="text-xl font-bold">Categorias disponíveis</h2>
      <ul className="list-disc pl-5 text-zinc-300">
        {categorias.map((c) => (
          <li key={c.id}>{c.nome} ({c.tipo})</li>
        ))}
      </ul>
    </div>
  )
}
