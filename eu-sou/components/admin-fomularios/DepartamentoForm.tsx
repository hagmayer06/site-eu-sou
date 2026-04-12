'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { type DepartamentoInsert, type DepartamentoRow } from '@/lib/departamentoQueries'
import { criarDepartamentoAction, editarDepartamentoAction } from '@/app/admin/departamentos/actions'
import { Building2, Loader2, X, ImageIcon, Upload, Users } from 'lucide-react'

interface DepartamentoFormProps {
  departamento?: DepartamentoRow
  index?: number
  onSelect?: (imagemUrl: string | null) => void
  onSuccess?: () => void
  departamentoParaEditar?: DepartamentoRow | null
  onCancelar?: () => void
}

export default function DepartamentoForm({ onSuccess, departamentoParaEditar, onCancelar }: DepartamentoFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const estadoInicial: DepartamentoInsert = {
    nome: '',
    descricao: '',
    lideres: '',
    imagem_url: '',
    ativo: true,
  }

  const [formData, setFormData] = useState<DepartamentoInsert>(estadoInicial)
  const [enviando, setEnviando] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

  useEffect(() => {
    if (departamentoParaEditar) {
      setFormData({
        nome: departamentoParaEditar.nome,
        descricao: departamentoParaEditar.descricao || '',
        lideres: departamentoParaEditar.lideres || '',
        imagem_url: departamentoParaEditar.imagem_url || '',
        ativo: departamentoParaEditar.ativo,
      })
    } else {
      setFormData(estadoInicial)
    }
  }, [departamentoParaEditar])

  // --- FUNÇÃO DE UPLOAD DE IMAGEM ---
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = `banners/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('eventos-imagens')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('eventos-imagens')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, imagem_url: publicUrl }))
      setMensagem({ tipo: 'sucesso', texto: 'Imagem carregada!' })

    } catch (error) {
      console.error(error)
      setMensagem({ tipo: 'erro', texto: 'Erro no upload da imagem.' })
    } finally {
      setUploading(false)
    }
  }

  // --- SUBMIT DO FORMULÁRIO ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setEnviando(true)
      setMensagem(null)

      if (departamentoParaEditar) {
        // Editar
        await editarDepartamentoAction(departamentoParaEditar.id, formData)
        setMensagem({ tipo: 'sucesso', texto: 'Departamento atualizado!' })
      } else {
        // Criar
        await criarDepartamentoAction(formData)
        setMensagem({ tipo: 'sucesso', texto: 'Departamento criado!' })
      }

      setTimeout(() => {
        onSuccess?.()
      }, 1000)
    } catch (error: any) {
      console.error(error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao salvar.' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-black rounded-3xl border border-zinc-800 p-8 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-800">
        <div>
          <p className="text-[#ff6b00] text-xs font-black uppercase tracking-widest mb-1">
            {departamentoParaEditar ? 'Editar' : 'Novo'}
          </p>
          <h3 className="text-white font-black text-xl uppercase tracking-tight">
            Departamento
          </h3>
        </div>
        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:bg-[#ff6b00] hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Mensagem */}
      {mensagem && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-semibold ${
          mensagem.tipo === 'sucesso'
            ? 'bg-green-900/30 text-green-400 border border-green-800'
            : 'bg-red-900/30 text-red-400 border border-red-800'
        }`}>
          {mensagem.texto}
        </div>
      )}

      {/* Upload de Imagem */}
      <div className="mb-6">
        <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
          Imagem do Departamento
        </label>
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            accept="image/*"
            className="hidden"
            disabled={uploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed border-zinc-700 rounded-2xl p-6 text-center hover:border-[#ff6b00] hover:bg-[#ff6b00]/5 transition-all disabled:opacity-50"
          >
            <div className="flex flex-col items-center gap-2">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-[#ff6b00] animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-[#ff6b00]" />
              )}
              <span className="text-sm text-zinc-400">
                {uploading ? 'Carregando...' : 'Clique para enviar imagem'}
              </span>
            </div>
          </button>
        </div>
        {formData.imagem_url && (
          <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden border border-zinc-700">
            <img
              src={formData.imagem_url}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Nome */}
      <div className="mb-6">
        <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
          Nome do Departamento
        </label>
        <input
          type="text"
          value={formData.nome}
          onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
          placeholder="Ex: Ministério de Jovens"
          required
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-[#ff6b00] focus:outline-none transition-colors"
        />
      </div>

      {/* Descrição */}
      <div className="mb-6">
        <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
          Descrição
        </label>
        <textarea
          value={formData.descricao || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
          placeholder="Descreva o propósito do departamento..."
          rows={4}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-[#ff6b00] focus:outline-none transition-colors resize-none"
        />
      </div>

      {/* Líderes */}
      <div className="mb-6">
        <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
          Líderes (separados por vírgula)
        </label>
        <input
          type="text"
          value={formData.lideres || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, lideres: e.target.value }))}
          placeholder="Ex: João Silva, Maria Souza"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-[#ff6b00] focus:outline-none transition-colors"
        />
      </div>

      {/* Status */}
      <div className="mb-8">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.ativo}
            onChange={(e) => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
            className="w-4 h-4 rounded border-zinc-700 text-[#ff6b00] focus:ring-[#ff6b00]"
          />
          <span className="text-sm text-zinc-400 font-semibold">Departamento ativo</span>
        </label>
      </div>

      {/* Botões */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={enviando}
          className="flex-1 bg-[#ff6b00] hover:bg-[#ff6b00]/90 text-black font-black uppercase text-sm tracking-widest py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {enviando && <Loader2 className="w-4 h-4 animate-spin" />}
          {departamentoParaEditar ? 'Atualizar' : 'Criar'}
        </button>
        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-black uppercase text-sm tracking-widest py-3 rounded-xl transition-all border border-zinc-800"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}