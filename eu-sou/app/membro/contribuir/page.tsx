import { redirect } from 'next/navigation'
import { getPerfilAtual } from '@/lib/auth'
import { getConfiguracaoIgreja, getHistoricoMembro } from '@/lib/financeiroQueries'
import { ContribuirClient } from './contribuir-client'

export default async function ContribuirPage() {
  const perfil = await getPerfilAtual()
  if (!perfil) redirect('/entrar')

  const [config, historico] = await Promise.all([
    getConfiguracaoIgreja(),
    getHistoricoMembro(perfil.id),
  ])

  return (
    <ContribuirClient 
      config={config} 
      historico={historico}
      perfilNome={perfil.nome}
    />
  )
}
