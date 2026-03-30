import { getPerfilAtual } from '@/lib/auth'
import { getGrupos } from '@/lib/gruposQueries'
import { redirect } from 'next/navigation'
import GruposClient from './grupos-client'

export const dynamic = 'force-dynamic'

export default async function GruposPage() {
  const perfil = await getPerfilAtual()

  // Verificar autenticação
  if (!perfil) {
    redirect('/entrar')
  }

  // Verificar autorização
  const papeis: string[] = perfil?.papeis ?? []
  const temAcesso = papeis.includes('pastor') || papeis.includes('lider')

  if (!temAcesso) {
    redirect('/membro')
  }

  // Buscar grupos (pastor vê todos, lider vê apenas seu)
  let grupos = await getGrupos()
  if (papeis.includes('lider') && !papeis.includes('pastor')) {
    grupos = grupos.filter((g) => g.lider_id === perfil.id)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
          Grupos <span className="text-[#ff6b00]">Familiares</span>
        </h1>
        <p className="text-zinc-500 text-xs mt-1">Gerencie as congregações de pequena escala da comunidade.</p>
      </div>

      <GruposClient gruposIniciais={grupos} perfilId={perfil.id} ehPastor={papeis.includes('pastor')} />
    </div>
  )
}