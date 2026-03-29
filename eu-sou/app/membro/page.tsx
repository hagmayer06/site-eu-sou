import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getPerfilAtual } from '@/lib/auth'
import { User, Phone, MapPin, Calendar, Users } from 'lucide-react'

export default async function MembroPage() {
  const perfil = await getPerfilAtual()

  if (!perfil) redirect('/entrar')

  const iniciais = perfil.nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  const camposCompletos = [
    perfil.telefone,
    perfil.data_nascimento,
    perfil.cidade,
  ].filter(Boolean).length

  const progresso = Math.round((camposCompletos / 3) * 100)

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      {/* Boas-vindas */}
      <div>
        <h1 className="text-2xl font-black text-white">
          Olá, <span className="text-[#ff6b00]">{perfil.nome.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Bem-vindo à sua área de membro.</p>
      </div>

      {/* Card perfil */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-5">
        {perfil.foto_url ? (
          <img
            src={perfil.foto_url}
            alt={perfil.nome}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#ff6b00]"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#ff6b00]/10 border-2 border-[#ff6b00]/30 flex items-center justify-center">
            <span className="text-[#ff6b00] text-xl font-black">{iniciais}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold truncate">{perfil.nome}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {perfil.papeis.map((papel) => (
              <span
                key={papel}
                className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/20"
              >
                {papel}
              </span>
            ))}
          </div>
        </div>
        <Link
          href="/membro/perfil"
          className="shrink-0 text-xs font-bold text-zinc-500 hover:text-[#ff6b00] transition-colors"
        >
          Editar →
        </Link>
      </div>

      {/* Completude do perfil */}
      {progresso < 100 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-white">Completar perfil</p>
            <span className="text-xs font-bold text-[#ff6b00]">{progresso}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#ff6b00] rounded-full transition-all"
              style={{ width: `${progresso}%` }}
            />
          </div>
          <p className="text-xs text-zinc-600 mt-2">
            Adicione telefone, data de nascimento e cidade para completar seu perfil.
          </p>
          <Link
            href="/membro/perfil"
            className="inline-block mt-3 text-xs font-bold text-[#ff6b00] hover:underline"
          >
            Completar agora →
          </Link>
        </div>
      )}

      {/* Informações rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard
          icon={<Phone size={16} />}
          label="Telefone"
          value={perfil.telefone ?? '—'}
          vazio={!perfil.telefone}
        />
        <InfoCard
          icon={<Calendar size={16} />}
          label="Nascimento"
          value={
            perfil.data_nascimento
              ? new Date(perfil.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR')
              : '—'
          }
          vazio={!perfil.data_nascimento}
        />
        <InfoCard
          icon={<MapPin size={16} />}
          label="Cidade"
          value={
            perfil.cidade
              ? `${perfil.cidade}${perfil.uf ? ` — ${perfil.uf}` : ''}`
              : '—'
          }
          vazio={!perfil.cidade}
        />
        <InfoCard
          icon={<Users size={16} />}
          label="Grupo"
          value={perfil.grupo_id ? 'Atribuído' : 'Sem grupo'}
          vazio={!perfil.grupo_id}
        />
      </div>
    </div>
  )
}

function InfoCard({
  icon,
  label,
  value,
  vazio,
}: {
  icon: React.ReactNode
  label: string
  value: string
  vazio: boolean
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
      <span className={vazio ? 'text-zinc-700' : 'text-[#ff6b00]'}>{icon}</span>
      <div>
        <p className="text-xs text-zinc-600 font-bold uppercase tracking-wider">{label}</p>
        <p className={`text-sm font-bold mt-0.5 ${vazio ? 'text-zinc-700' : 'text-white'}`}>
          {value}
        </p>
      </div>
    </div>
  )
}
