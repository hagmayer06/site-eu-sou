'use client'

import { useState, useEffect, useRef } from 'react'
import { GrupoRow } from '@/lib/database.types'
import { Upload, Loader2, X, MapPin } from 'lucide-react'

interface GrupoFormProps {
  grupo?: GrupoRow | null
  onSubmit: (formData: FormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export default function GrupoForm({ grupo, onSubmit, onCancel, isLoading = false }: GrupoFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    endereco: '',
    latitude: '',
    longitude: '',
    telefone: '',
    email: '',
    imagem_url: '',
    ativo: true,
  })

  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [geocodifying, setGeocodifying] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (grupo) {
      setFormData({
        nome: grupo.nome || '',
        descricao: grupo.descricao || '',
        endereco: grupo.endereco || '',
        latitude: grupo.latitude?.toString() || '',
        longitude: grupo.longitude?.toString() || '',
        telefone: grupo.telefone || '',
        email: grupo.email || '',
        imagem_url: grupo.imagem_url || '',
        ativo: grupo.ativo ?? true,
      })
      if (grupo.imagem_url) {
        setImagePreview(grupo.imagem_url)
      }
    }
  }, [grupo])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file) return

      // Create local preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      setMensagem({ tipo: 'sucesso', texto: 'Imagem selecionada. Será enviada ao salvar.' })
    } catch (error) {
      console.error(error)
      setMensagem({ tipo: 'erro', texto: 'Erro ao processar imagem.' })
    } finally {
      setUploading(false)
    }
  }

  const handleGeocodify = async () => {
    if (!formData.endereco.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Digite um endereço antes de geocodificar.' })
      return
    }

    setGeocodifying(true)
    try {
      // Nominatim API call será feito no Server Action (Task 4.0)
      // Por enquanto, apenas avisa que será processado
      setMensagem({
        tipo: 'sucesso',
        texto: 'O endereço será geocodificado ao salvar o grupo.',
      })
    } finally {
      setGeocodifying(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório'
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório'
    if (!formData.endereco.trim()) newErrors.endereco = 'Endereço é obrigatório'

    // Simple email validation
    if (formData.email && !formData.email.includes('@')) {
      newErrors.email = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setMensagem({ tipo: 'erro', texto: 'Verifique os campos obrigatórios' })
      return
    }

    if (!fileInputRef.current?.files?.[0] && !imagePreview) {
      setMensagem({ tipo: 'erro', texto: 'Selecione uma imagem para o grupo' })
      return
    }

    try {
      const fd = new FormData()
      fd.set('nome', formData.nome)
      fd.set('descricao', formData.descricao)
      fd.set('endereco', formData.endereco)
      fd.set('telefone', formData.telefone)
      fd.set('email', formData.email)
      fd.set('ativo', formData.ativo.toString())

      if (grupo?.id) {
        fd.set('id', grupo.id)
      }

      if (fileInputRef.current?.files?.[0]) {
        fd.set('imagem', fileInputRef.current.files[0])
      }

      await onSubmit(fd)
      setMensagem({ tipo: 'sucesso', texto: 'Grupo salvo com sucesso!' })
    } catch (error) {
      console.error(error)
      setMensagem({
        tipo: 'erro',
        texto: error instanceof Error ? error.message : 'Erro ao salvar grupo',
      })
    }
  }

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-white uppercase border-l-4 border-[#ff6b00] pl-4">
          {grupo ? 'Editar' : 'Novo'} <span className="text-[#ff6b00]">Grupo</span>
        </h2>
        {grupo && onCancel && (
          <button
            onClick={onCancel}
            className="text-zinc-500 hover:text-white transition-colors"
            type="button"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* IMAGE UPLOAD */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
            Imagem do Grupo
          </label>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-64 w-full bg-black border-2 border-dashed border-zinc-800 rounded-2xl overflow-hidden cursor-pointer hover:border-[#ff6b00]/50 transition-all flex flex-col items-center justify-center gap-3"
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                />
                <div className="relative z-10 bg-black/60 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                  Trocar Imagem
                </div>
              </>
            ) : (
              <>
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#ff6b00]" />
                ) : (
                  <Upload className="w-6 h-6 text-zinc-600 group-hover:text-[#ff6b00]" />
                )}
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400">
                  Clique para anexar foto
                </span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
          </div>
        </div>

        {/* TEXT INPUTS */}
        <div className="space-y-4">
          {/* NOME */}
          <div>
            <input
              required
              name="nome"
              value={formData.nome}
              onChange={(e) => {
                setFormData({ ...formData, nome: e.target.value })
                if (errors.nome) setErrors({ ...errors, nome: '' })
              }}
              placeholder="Nome do Grupo"
              className={`w-full bg-black border rounded-xl px-4 py-3 text-white focus:border-[#ff6b00] outline-none text-sm font-semibold transition-colors ${
                errors.nome ? 'border-red-500' : 'border-zinc-800'
              }`}
            />
            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
          </div>

          {/* DESCRICAO */}
          <div>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descrição do grupo (opcional)"
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-[#ff6b00] outline-none text-sm font-semibold transition-colors resize-none h-20"
            />
          </div>

          {/* EMAIL */}
          <div>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                if (errors.email) setErrors({ ...errors, email: '' })
              }}
              placeholder="Email do grupo"
              className={`w-full bg-black border rounded-xl px-4 py-3 text-white focus:border-[#ff6b00] outline-none text-sm font-semibold transition-colors ${
                errors.email ? 'border-red-500' : 'border-zinc-800'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* TELEFONE */}
          <input
            type="tel"
            name="telefone"
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            placeholder="Telefone (opcional)"
            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-[#ff6b00] outline-none text-sm font-semibold transition-colors"
          />

          {/* ENDERECO + GEOCIFY */}
          <div>
            <div className="flex gap-2">
              <input
                required
                name="endereco"
                value={formData.endereco}
                onChange={(e) => {
                  setFormData({ ...formData, endereco: e.target.value })
                  if (errors.endereco) setErrors({ ...errors, endereco: '' })
                }}
                placeholder="Endereço completo"
                className={`flex-1 bg-black border rounded-xl px-4 py-3 text-white focus:border-[#ff6b00] outline-none text-sm font-semibold transition-colors ${
                  errors.endereco ? 'border-red-500' : 'border-zinc-800'
                }`}
              />
              <button
                type="button"
                onClick={handleGeocodify}
                disabled={geocodifying || !formData.endereco.trim()}
                className="flex items-center gap-2 px-4 py-3 bg-[#ff6b00] hover:bg-[#e65a00] disabled:opacity-50 text-white text-sm font-black uppercase rounded-xl transition-all"
              >
                {geocodifying ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                <span className="hidden sm:inline">Geocodificar</span>
              </button>
            </div>
            {errors.endereco && <p className="text-red-500 text-xs mt-1">{errors.endereco}</p>}
          </div>

          {/* LATITUDE + LONGITUDE (read-only) */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="0.00000001"
              name="latitude"
              value={formData.latitude}
              readOnly
              placeholder="Latitude"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed text-sm"
            />
            <input
              type="number"
              step="0.00000001"
              name="longitude"
              value={formData.longitude}
              readOnly
              placeholder="Longitude"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed text-sm"
            />
          </div>

          {/* ATIVO TOGGLE */}
          <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-xl">
            <input
              type="checkbox"
              id="ativo"
              checked={formData.ativo}
              onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
              className="w-4 h-4 rounded border-zinc-600 text-[#ff6b00] focus:ring-[#ff6b00]"
            />
            <label htmlFor="ativo" className="text-sm font-semibold text-white cursor-pointer flex-1">
              Grupo ativo
            </label>
          </div>
        </div>

        {/* MENSAGENS */}
        {mensagem && (
          <div
            className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest ${
              mensagem.tipo === 'sucesso'
                ? 'bg-green-500/10 text-green-500'
                : 'bg-red-500/10 text-red-500'
            }`}
          >
            {mensagem.texto}
          </div>
        )}

        {/* BUTTONS */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading || uploading || geocodifying}
            className="flex-1 bg-[#ff6b00] hover:bg-[#e65a00] disabled:opacity-50 text-white font-black uppercase tracking-[0.2em] py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#ff6b00]/10"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {grupo ? 'SALVAR ALTERAÇÕES' : 'CRIAR GRUPO'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase tracking-[0.2em] py-4 rounded-xl transition-all"
            >
              CANCELAR
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
