import { redirect } from 'next/navigation'
import { getPerfilAtual } from '@/lib/auth'
import { getComprovantesNaoConfirmados } from '@/lib/financeiroQueries'
import { ComprovantesClient } from './comprovantes-client'

export default async function ComprovantesPage() {
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

  const comprovantes = await getComprovantesNaoConfirmados()

  return (
    <ComprovantesClient 
      comprovantes={comprovantes}
      perfilNome={perfil.nome}
    />
  )
}
