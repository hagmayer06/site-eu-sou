import { redirect } from 'next/navigation'
import { getPerfilAtual } from '@/lib/auth'
import PerfilForm from '@/components/membros/PerfilForm'

export default async function PerfilPage() {
  const perfil = await getPerfilAtual()

  if (!perfil) redirect('/entrar')

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
          Meu <span className="text-[#ff6b00]">Perfil</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Mantenha seus dados sempre atualizados.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <PerfilForm perfil={perfil} />
      </div>
    </div>
  )
}
