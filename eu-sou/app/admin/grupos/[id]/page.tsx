import { getPerfilAtual } from '@/lib/auth'
import { getGrupoById } from '@/lib/gruposQueries'
import { redirect } from 'next/navigation'
import EditarGrupoClient from './editar-grupo-client'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditarGrupoPage({ params }: PageProps) {
  const { id } = await params
  const perfil = await getPerfilAtual()

  if (!perfil) {
    redirect('/entrar')
  }

  const papeis: string[] = perfil?.papeis ?? []
  if (!papeis.includes('pastor') && !papeis.includes('lider')) {
    redirect('/membro')
  }

  // Fetch grupo to verify access
  const grupo = await getGrupoById(id)

  if (!grupo) {
    redirect('/admin/grupos')
  }

  // Check access: pastor can edit all, lider can edit own
  const ehPastor = papeis.includes('pastor')
  const ehLider = papeis.includes('lider') && grupo.lider_id === perfil.id

  if (!ehPastor && !ehLider) {
    redirect('/admin/grupos')
  }

  return <EditarGrupoClient grupo={grupo} />
}
