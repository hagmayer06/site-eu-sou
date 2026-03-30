import { getPerfilAtual } from '@/lib/auth'
import { redirect } from 'next/navigation'
import NovoGrupoClient from './novo-grupo-client'

export default async function NovoGrupoPage() {
  const perfil = await getPerfilAtual()

  if (!perfil) {
    redirect('/entrar')
  }

  const papeis: string[] = perfil?.papeis ?? []
  if (!papeis.includes('pastor') && !papeis.includes('lider')) {
    redirect('/membro')
  }

  return <NovoGrupoClient />
}
