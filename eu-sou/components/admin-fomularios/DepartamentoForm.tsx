'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { type DepartamentoInsert, type DepartamentoRow } from '@/lib/departamentoQueries'
import { criarDepartamentoAction, editarDepartamentoAction } from '@/app/admin/departamentos/actions'
import { Loader2, X } from 'lucide-react'

interface DepartamentoFormProps {
  onSuccess: () => void;
  departamentoParaEditar?: DepartamentoRow | null;
  onCancelar?: () => void;
}

export default function DepartamentoForm({ onSuccess, departamentoParaEditar, onCancelar }: DepartamentoFormProps) {
  const estadoInicial: DepartamentoInsert = {
    nome: '',
    descricao: '',
    lideres: '',
    ativo: true,
  }

  const [formData, setFormData] = useState<DepartamentoInsert>(estadoInicial)
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

  useEffect(() => {
    if (departamentoParaEditar) {
      setFormData({
        nome: departamentoParaEditar.nome,
        descricao: departamentoParaEditar.descricao || '',
        lideres: departamentoParaEditar.lideres || '',
        ativo: departamentoParaEditar.ativo,
      })
    } else {
      setFormData(estadoInicial)
    }
  }, [departamentoParaEditar])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setMensagem(null)

    try {
      let resultado;

      if (departamentoParaEditar?.id) {
        resultado = await editarDepartamentoAction(departamentoParaEditar.id, formData)
      } else {
        resultado = await criarDepartamentoAction(formData)
      }

      if (resultado.erro) {
        setMensagem({ tipo: 'erro', texto: resultado.erro })
      } else {
        setFormData(estadoInicial)
        onSuccess()
        if (onCancelar) onCancelar()
      }
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro de segurança ao salvar.' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl relative">
      {departamentoParaEditar && (
        <button type="button" onClick={onCancelar} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X /></button>
      )}

      <h2 className="text-2xl font-black text-white uppercase mb-8 italic border-l-4 border-[#ff6b00] pl-4">
        {departamentoParaEditar ? 'Editar' : 'Novo'} <span className="text-[#ff6b00]">Departamento</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div className="space-y-4">
          <input required name="nome" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} placeholder="Nome do Departamento" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-[#ff6b00] outline-none text-sm font-bold" />
          
          <textarea
            name="descricao"
            value={formData.descricao || ''}
            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            placeholder="Descrição do Departamento (opcional)"
            className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-[#ff6b00] outline-none text-sm h-28 resize-none"
          />

          <input name="lideres" value={formData.lideres || ''} onChange={(e) => setFormData({...formData, lideres: e.target.value})} placeholder="Líderes (ex: João Silva, Maria Souza)" className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-[#ff6b00] outline-none text-sm" />
        </div>

        {mensagem && (
          <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest ${mensagem.tipo === 'sucesso' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {mensagem.texto}
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-[#ff6b00] hover:bg-[#e65a00] disabled:opacity-50 text-white font-black uppercase tracking-[0.2em] py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#ff6b00]/10"
        >
          {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : (departamentoParaEditar ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR DEPARTAMENTO')}
        </button>
      </form>
    </div>
  )
}
