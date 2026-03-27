'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { criarEvento, editarEvento, EventoInsert, EventoRow } from '@/lib/eventosQueries'
import { Calendar, Clock, MapPin, AlignLeft, Type, Loader2, X, ImageIcon, Upload } from 'lucide-react'

interface EventoFormProps {
  onSuccess: () => void;
  eventoParaEditar?: EventoRow | null;
  onCancelar?: () => void;
}

export default function EventoForm({ onSuccess, eventoParaEditar, onCancelar }: EventoFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const estadoInicial: EventoInsert = {
    titulo: '',
    descricao: '',
    data: '',
    horario: '',
    local: '',
    imagem_url: '', // <-- Inicializa vazio
    ativo: true,
  }

  const [formData, setFormData] = useState<EventoInsert>(estadoInicial)
  const [enviando, setEnviando] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

  useEffect(() => {
    if (eventoParaEditar) {
      setFormData({
        titulo: eventoParaEditar.titulo,
        descricao: eventoParaEditar.descricao || '',
        data: eventoParaEditar.data,
        horario: eventoParaEditar.horario || '',
        local: eventoParaEditar.local || '',
        imagem_url: eventoParaEditar.imagem_url || '',
        ativo: eventoParaEditar.ativo,
      })
    } else {
      setFormData(estadoInicial)
    }
  }, [eventoParaEditar])

  // --- FUNÇÃO DE UPLOAD DE IMAGEM ---
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}` // Nome aleatório para evitar conflito
      const filePath = `banners/${fileName}`

      // 1. Sobe para o Storage
      const { error: uploadError } = await supabase.storage
        .from('eventos-imagens')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Pega a URL Pública
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    try {
      if (eventoParaEditar?.id) {
        await editarEvento(eventoParaEditar.id, formData)
      } else {
        await criarEvento(formData)
      }
      setFormData(estadoInicial)
      onSuccess()
      if (onCancelar) onCancelar()
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar evento.' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl relative">
      {eventoParaEditar && (
        <button onClick={onCancelar} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X /></button>
      )}

      <h2 className="text-2xl font-black text-white uppercase mb-8 italic border-l-4 border-[#ff6b00] pl-4">
        {eventoParaEditar ? 'Editar' : 'Novo'} <span className="text-[#ff6b00]">Evento</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* ÁREA DE UPLOAD DE IMAGEM */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
            <ImageIcon className="w-3 h-3" /> Banner do Evento
          </label>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative h-40 w-full bg-black border-2 border-dashed border-zinc-800 rounded-2xl overflow-hidden cursor-pointer hover:border-[#ff6b00]/50 transition-all flex flex-col items-center justify-center gap-3"
          >
            {formData.imagem_url ? (
              <>
                <img src={formData.imagem_url} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt="Preview" />
                <div className="relative z-10 bg-black/60 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                  Trocar Imagem
                </div>
              </>
            ) : (
              <>
                {uploading ? <Loader2 className="w-6 h-6 animate-spin text-[#ff6b00]" /> : <Upload className="w-6 h-6 text-zinc-600 group-hover:text-[#ff6b00]" />}
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400">Clique para anexar foto</span>
              </>
            )}
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
          </div>
        </div>

        {/* INPUTS DE TEXTO (Título, Data, etc - Mantendo o estilo) */}
        <div className="space-y-4">
          <input required name="titulo" value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} placeholder="Título do Evento" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-[#ff6b00] outline-none text-sm font-bold" />
          
          <div className="grid grid-cols-2 gap-4">
            <input type="date" name="data" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-[#ff6b00] outline-none text-sm [color-scheme:dark]" />
            <input name="horario" value={formData.horario || ''} onChange={(e) => setFormData({...formData, horario: e.target.value})} placeholder="Horário (ex: 19:30)" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-[#ff6b00] outline-none text-sm" />
          </div>
          
          <input name="local" value={formData.local || ''} onChange={(e) => setFormData({...formData, local: e.target.value})} placeholder="Local do Evento" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-[#ff6b00] outline-none text-sm" />
        </div>

        {mensagem && (
          <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest ${mensagem.tipo === 'sucesso' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {mensagem.texto}
          </div>
        )}

        <button
          type="submit"
          disabled={enviando || uploading}
          className="w-full bg-[#ff6b00] hover:bg-[#e65a00] disabled:opacity-50 text-white font-black uppercase tracking-[0.2em] py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#ff6b00]/10"
        >
          {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : (eventoParaEditar ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR EVENTO')}
        </button>
      </form>
    </div>
  )
}