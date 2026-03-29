'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera } from 'lucide-react'
import { fetchCep, updatePerfil } from '@/lib/membrosQueries'
import type { PerfilRow } from '@/lib/database.types'

interface Props {
  perfil: PerfilRow
}

export default function PerfilForm({ perfil }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoArquivo, setFotoArquivo] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)
  const [fotoUrlSegura, setFotoUrlSegura] = useState<string | null>(null)

  const [form, setForm] = useState({
    nome: perfil.nome,
    telefone: perfil.telefone ?? '',
    data_nascimento: perfil.data_nascimento ?? '',
    cep: perfil.cep ?? '',
    rua: perfil.rua ?? '',
    bairro: perfil.bairro ?? '',
    cidade: perfil.cidade ?? '',
    uf: perfil.uf ?? '',
  })

  useEffect(() => {
    const fetchFotoSegura = async () => {
      if (!perfil.foto_url) return
      try {
        const params = new URLSearchParams({ path: perfil.foto_url })
        const resp = await fetch(`/api/avatares?${params.toString()}`)
        const json = await resp.json()
        if (resp.ok && json.signedUrl) {
          setFotoUrlSegura(json.signedUrl)
        }
      } catch (err) {
        console.warn('Erro ao buscar URL assinada', err)
      }
    }

    fetchFotoSegura()
  }, [perfil.foto_url])

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSucesso(false)
    setErro(null)
  }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setErro('A foto deve ter menos de 5 MB.')
      return
    }
    setFotoArquivo(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) {
      setErro('O nome é obrigatório.')
      return
    }
    setLoading(true)
    setErro(null)

    let fotoUrl = perfil.foto_url

    if (fotoArquivo) {
      const doUpload = new FormData()
      doUpload.set('userId', perfil.id)
      doUpload.set('file', fotoArquivo)

      const response = await fetch('/api/avatares', {
        method: 'POST',
        body: doUpload,
      })

      if (!response.ok) {
        const text = await response.text()
        setErro('Erro ao enviar a foto. ' + text)
        setLoading(false)
        return
      }

      const data = await response.json()
      fotoUrl = data.path
      setFotoUrlSegura(data.signedUrl)
    }

    try {
      await updatePerfil(perfil.id, {
        nome: form.nome.trim(),
        telefone: form.telefone.trim() || null,
        data_nascimento: form.data_nascimento || null,
        cep: form.cep.trim() || null,
        rua: form.rua.trim() || null,
        bairro: form.bairro.trim() || null,
        cidade: form.cidade.trim() || null,
        uf: form.uf.trim() || null,
        foto_url: fotoUrl,
      })
      setSucesso(true)
      router.refresh()
    } catch {
      setErro('Não foi possível salvar. Tente novamente.')
    }
    setLoading(false)
  }

  const iniciais = perfil.nome
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Foto */}
      <div className="flex items-center gap-5">
        <div className="relative">
          {fotoPreview || fotoUrlSegura ? (
            <img
              src={fotoPreview ?? fotoUrlSegura!}
              alt="Foto de perfil"
              className="w-20 h-20 rounded-full object-cover border-2 border-[#ff6b00]"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#ff6b00]/10 border-2 border-[#ff6b00]/30 flex items-center justify-center">
              <span className="text-[#ff6b00] text-2xl font-black">{iniciais}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#ff6b00] rounded-full flex items-center justify-center hover:bg-[#e65a00] transition-colors"
          >
            <Camera size={13} className="text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFotoChange}
          />
        </div>
        <div>
          <p className="text-white font-bold text-sm">{perfil.nome}</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-[#ff6b00] hover:underline mt-0.5"
          >
            Trocar foto
          </button>
          <p className="text-zinc-600 text-xs mt-0.5">JPG, PNG ou WebP · máx. 5 MB</p>
        </div>
      </div>

      {/* Feedback */}
      {erro && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 text-xs p-3 rounded-lg font-bold">
          {erro}
        </div>
      )}
      {sucesso && (
        <div className="bg-green-500/10 border border-green-500 text-green-400 text-xs p-3 rounded-lg font-bold">
          Perfil atualizado com sucesso!
        </div>
      )}

      {/* Dados pessoais */}
      <Secao titulo="Dados pessoais">
        <Campo label="Nome completo" obrigatorio>
          <input
            type="text"
            value={form.nome}
            onChange={(e) => set('nome', e.target.value)}
            className={inputCls}
            placeholder="Seu nome completo"
            required
          />
        </Campo>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="Telefone">
            <input
              type="tel"
              value={form.telefone}
              onChange={(e) => set('telefone', e.target.value)}
              className={inputCls}
              placeholder="(00) 00000-0000"
            />
          </Campo>
          <Campo label="Data de nascimento">
            <input
              type="date"
              value={form.data_nascimento}
              onChange={(e) => set('data_nascimento', e.target.value)}
              className={inputCls}
            />
          </Campo>
        </div>
      </Secao>

      {/* Endereço */}
      <Secao titulo="Endereço">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Campo label="CEP">
              <input
                type="text"
                value={form.cep}
                onChange={(e) => set('cep', e.target.value)}
                onBlur={async () => {
                  try {
                    const endereco = await fetchCep(form.cep)
                    set('rua', endereco.logradouro)
                    set('bairro', endereco.bairro)
                    set('cidade', endereco.localidade)
                    set('uf', endereco.uf)
                    setErro(null)
                  } catch (err: any) {
                    console.warn('ViaCEP', err)
                    setErro(err?.message ?? 'CEP inválido')
                  }
                }}
                className={inputCls}
                placeholder="00000-000"
                maxLength={9}
              />
            </Campo>
          </div>
          <Campo label="UF">
            <input
              type="text"
              value={form.uf}
              onChange={(e) => set('uf', e.target.value.toUpperCase())}
              className={inputCls}
              placeholder="SP"
              maxLength={2}
            />
          </Campo>
        </div>
        <Campo label="Rua">
          <input
            type="text"
            value={form.rua}
            onChange={(e) => set('rua', e.target.value)}
            className={inputCls}
            placeholder="Nome da rua"
          />
        </Campo>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Campo label="Bairro">
            <input
              type="text"
              value={form.bairro}
              onChange={(e) => set('bairro', e.target.value)}
              className={inputCls}
              placeholder="Bairro"
            />
          </Campo>
          <Campo label="Cidade">
            <input
              type="text"
              value={form.cidade}
              onChange={(e) => set('cidade', e.target.value)}
              className={inputCls}
              placeholder="Cidade"
            />
          </Campo>
        </div>
      </Secao>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-[#ff6b00] hover:bg-[#e65a00] text-white font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 shadow-[0_0_20px_rgba(255,107,0,0.1)]"
      >
        {loading ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  )
}

const inputCls =
  'w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#ff6b00] outline-none transition-all placeholder:text-zinc-700 text-sm'

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">
        {titulo}
      </p>
      {children}
    </div>
  )
}

function Campo({
  label,
  obrigatorio,
  children,
}: {
  label: string
  obrigatorio?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase text-[#ff6b00] mb-1.5 tracking-widest">
        {label}
        {obrigatorio && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
