import { redirect } from 'next/navigation'
import { getPerfilAtual } from '@/lib/auth'
import { getLancamentos, getCategorias, getConfiguracaoIgreja } from '@/lib/financeiroQueries'
import { RelatoriosClient } from './relatorios-client'

export const runtime = 'nodejs'

export default async function RelatoriosPage() {
  const perfil = await getPerfilAtual()
  if (!perfil) redirect('/entrar')

  // Verificar se é tesoureiro
  if (!perfil.papeis?.includes('tesoureiro')) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center py-12">
          <p className="text-red-400 font-bold">Acesso negado: apenas tesoureiros podem acessar esta página.</p>
        </div>
      </div>
    )
  }

  const [lancamentos, categorias, config] = await Promise.all([
    getLancamentos({}),
    getCategorias(),
    getConfiguracaoIgreja(),
  ])

  return (
    <RelatoriosClient
      lancamentos={lancamentos}
      categorias={categorias}
      config={config}
      perfilNome={perfil.nome}
    />
  )
}
