'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getDepartamentosAdmin, type DepartamentoRow } from '@/lib/departamentoQueries'
import { excluirDepartamentoAction } from './actions'
import DepartamentoForm from '@/components/admin-fomularios/DepartamentoForm'
import LoginPage from '../login/page' 
import { Trash2, Edit3, Loader2, LogOut, Users, Plus, Building2 } from 'lucide-react'

export default function AdminDepartamentosPage() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Estados da Lista de Departamentos
  const [departamentos, setDepartamentos] = useState<DepartamentoRow[]>([])
  const [loadingLista, setLoadingLista] = useState(false)
  const [departamentoParaEditar, setDepartamentoParaEditar] = useState<DepartamentoRow | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)

  // 1. Gestão de Sessão Reativa
  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      if (session) carregarLista()
      setLoading(false)
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (_event === 'SIGNED_IN') carregarLista()
      if (_event === 'SIGNED_OUT') {
        setSession(null)
        setDepartamentos([]) 
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. Funções de Dados
  async function carregarLista() {
    setLoadingLista(true)
    const dados = await getDepartamentosAdmin()
    setDepartamentos(dados)
    setLoadingLista(false)
  }

  const handleExcluir = async (id: string, nome: string) => {
    if (confirm(`Deseja realmente excluir o departamento "${nome}"? Esta ação é permanente.`)) {
      try {
        const { erro } = await excluirDepartamentoAction(id)
        if (erro) {
          alert(erro)
        } else {
          setDepartamentos(prev => prev.filter(d => d.id !== id))
        }
      } catch (error) {
        alert("Erro de segurança ao tentar excluir.")
      }
    }
  }

  // 3. Tela de Loading Inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#ff6b00] animate-pulse font-black tracking-tighter text-xl uppercase">
          SISTEMA <span className="text-white uppercase font-black">Eu Sou</span>
        </div>
      </div>
    )
  }

  // 4. Se NÃO tem sessão, mostra LOGIN
  if (!session) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10 pt-28">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Identitário */}
        <header className="mb-10 border-l-4 border-[#ff6b00] pl-6 flex justify-between items-center bg-zinc-900/50 p-6 rounded-r-xl border-y border-r border-zinc-800">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">
              Admin <span className="text-[#ff6b00] italic">Departamentos</span>
            </h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Gerenciamento de Ministérios e Departamentos</p>
          </div>
          
          <div className="flex items-center gap-4">
             {!mostrarForm && (
               <button
                 onClick={() => setMostrarForm(true)}
                 className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all active:scale-95 shadow-[0_0_15px_rgba(255,107,0,0.2)]"
               >
                 <Plus className="w-4 h-4" />
                 NOVO DEPARTAMENTO
               </button>
             )}

            <button 
              onClick={() => supabase.auth.signOut()}
              className="group flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-5 py-2.5 rounded-full text-xs font-black transition-all border border-red-500/20"
            >
              <span>ENCERRAR SESSÃO</span>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Coluna do Formulário */}
          <aside className="lg:col-span-5">
            {mostrarForm ? (
              <div className="sticky top-28">
                <DepartamentoForm 
                  onSuccess={() => { carregarLista(); setMostrarForm(false); setDepartamentoParaEditar(null); }} 
                  departamentoParaEditar={departamentoParaEditar}
                  onCancelar={() => { setMostrarForm(false); setDepartamentoParaEditar(null); }}
                />
              </div>
            ) : (
              <div className="sticky top-28 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl p-12 text-center">
                 <Building2 className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Crie um novo departamento ou ministério.</p>
              </div>
            )}
          </aside>

          {/* Coluna da Lista */}
          <main className="lg:col-span-7 bg-zinc-900 rounded-3xl border border-zinc-800 p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#ff6b00]" /> Departamentos Cadastrados
              </h2>
              <span className="text-[10px] font-bold bg-zinc-800 px-2 py-1 rounded text-zinc-500">
                {departamentos.length} DEPARTAMENTO(S)
              </span>
            </div>

            {loadingLista ? (
              <div className="flex justify-center py-20 text-[#ff6b00]">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {departamentos.map((dept) => (
                  <div key={dept.id} className="bg-black/30 border border-zinc-800 p-5 rounded-2xl flex justify-between items-center hover:border-[#ff6b00]/30 transition-all group">
                    <div className="space-y-1">
                      <h3 className="font-black uppercase tracking-tight text-zinc-200 group-hover:text-[#ff6b00] transition-colors">
                        {dept.nome}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-[10px] text-zinc-500 font-bold uppercase">
                         {dept.lideres && (
                           <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-[#ff6b00]" /> 
                              {dept.lideres}
                           </span>
                         )}
                         <span className="flex items-center gap-1.5 border-l border-zinc-800 pl-4">
                            <span className={`w-2 h-2 rounded-full ${dept.ativo ? 'bg-green-500' : 'bg-red-500'}`} />
                            {dept.ativo ? 'ATIVO' : 'INATIVO'}
                         </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setDepartamentoParaEditar(dept); setMostrarForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="p-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-[#ff6b00] hover:text-white transition-all shadow-lg"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleExcluir(dept.id, dept.nome)}
                        className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/10 shadow-lg"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
