"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getGruposAdminAction, excluirGrupo } from "./actions";
import type { Grupo } from "@/lib/gruposQueries";
import GruposForm from "@/components/admin-fomularios/GruposForm";
import LoginPage from "../login/page";
import { Clock, MapPin, Pencil, Trash2, Plus, Users, LogOut, Loader2 } from "lucide-react";

export default function AdminGruposPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados da Lista de Grupos
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loadingLista, setLoadingLista] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState<Grupo | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [feedbackExclusao, setFeedbackExclusao] = useState<string | null>(null);

  // 1. Gestão de Sessão Reativa (Padrão de Segurança Identificado em Eventos)
  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) carregarGrupos();
      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_IN') carregarGrupos();
      if (_event === 'SIGNED_OUT') {
        setSession(null);
        setGrupos([]); 
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function carregarGrupos() {
    setLoadingLista(true);
    const data = await getGruposAdminAction();
    setGrupos(data);
    setLoadingLista(false);
  }

  async function handleExcluir(grupo: Grupo) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir "${grupo.nome || grupo.bairro}"? Esta ação não pode ser desfeita.`
    );
    if (!confirmar) return;

    setExcluindo(grupo.id);
    setFeedbackExclusao(null);

    const { erro } = await excluirGrupo(grupo.id);

    if (erro) {
      setFeedbackExclusao(`Erro ao excluir: ${erro}`);
    } else {
      await carregarGrupos();
    }

    setExcluindo(null);
  }

  function handleEditar(grupo: Grupo) {
    setGrupoEditando(grupo);
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleNovoGrupo() {
    setGrupoEditando(null);
    setMostrarForm(true);
  }

  function handleCancelar() {
    setGrupoEditando(null);
    setMostrarForm(false);
  }

  async function handleSucesso() {
    await carregarGrupos();
    if (grupoEditando) {
      setGrupoEditando(null);
      setMostrarForm(false);
    }
  }

  // 2. Tela de Loading Inicial (Branding Igreja Eu Sou)
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#ff6b00] animate-pulse font-black tracking-tighter text-xl uppercase">
          SISTEMA <span className="text-white uppercase font-black">Eu Sou</span>
        </div>
      </div>
    );
  }

  // 3. Se NÃO tem sessão, mostra LOGIN (Porteiro do Painel)
  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10 pt-28">
      <div className="max-w-6xl mx-auto">

        {/* Header Identitário de Grupos */}
        <header className="mb-10 border-l-4 border-[#ff6b00] pl-6 flex justify-between items-center bg-zinc-900/50 p-6 rounded-r-xl border-y border-r border-zinc-800">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">
              Admin <span className="text-[#ff6b00] italic">Grupos Familiares</span>
            </h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Gerenciamento da Comunidade</p>
          </div>

          <div className="flex items-center gap-4">
            {!mostrarForm && (
              <button
                onClick={handleNovoGrupo}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all active:scale-95 shadow-[0_0_15px_rgba(255,107,0,0.2)]"
              >
                <Plus className="w-4 h-4" />
                NOVO GRUPO
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
            {mostrarForm && (
              <div className="sticky top-28 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#ff6b00] mb-6 flex items-center gap-2">
                  <Pencil className="w-4 h-4" />
                  {grupoEditando ? "Editar Grupo" : "Novo Cadastro"}
                </h2>
                <GruposForm
                  grupoEditando={grupoEditando}
                  onSucesso={handleSucesso}
                  onCancelar={handleCancelar}
                />
              </div>
            )}
            {!mostrarForm && (
              <div className="sticky top-28 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl p-12 text-center">
                 <Users className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Selecione um grupo para editar ou crie um novo.</p>
              </div>
            )}
          </aside>

          {/* Coluna da Lista */}
          <main className="lg:col-span-7 bg-zinc-900 rounded-3xl border border-zinc-800 p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#ff6b00]" /> Grupos Cadastrados
              </h2>
              <span className="text-[10px] font-bold bg-zinc-800 px-2 py-1 rounded text-zinc-500">
                {grupos.length} GRUPO(S)
              </span>
            </div>

            {feedbackExclusao && (
              <div className="mb-6 rounded-xl px-4 py-3 text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 text-center animate-pulse">
                {feedbackExclusao}
              </div>
            )}

            {loadingLista ? (
              <div className="flex justify-center py-20 text-[#ff6b00]">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>
            ) : grupos.length === 0 ? (
              <div className="text-center py-20 text-zinc-600 font-bold uppercase text-[10px] tracking-[0.3em] border-2 border-dashed border-zinc-800 rounded-3xl">
                Nenhum grupo cadastrado
              </div>
            ) : (
              <div className="space-y-4">
                {grupos.map((grupo) => (
                  <div key={grupo.id} className={`bg-black/30 border border-zinc-800 p-5 rounded-2xl flex justify-between items-center hover:border-[#ff6b00]/30 transition-all group ${!grupo.ativo ? 'opacity-50' : ''}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black uppercase tracking-tight text-zinc-200 group-hover:text-[#ff6b00] transition-colors">
                          {grupo.nome || grupo.bairro}
                        </h3>
                        {!grupo.ativo && (
                          <span className="text-[8px] font-black bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 uppercase">Inativo</span>
                        )}
                      </div>
                      <p className="text-[#ff6b00]/70 text-[10px] font-bold uppercase">{grupo.lider}</p>
                      
                      <div className="flex flex-wrap gap-4 text-[10px] text-zinc-500 font-bold uppercase mt-2">
                         <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#ff6b00]" /> 
                            {grupo.dia_semana} · {grupo.horario.slice(0, 5)}
                         </span>
                         {grupo.endereco && (
                           <span className="flex items-center gap-1.5 border-l border-zinc-800 pl-4">
                              <MapPin className="w-3.5 h-3.5 text-[#ff6b00]" /> 
                              {grupo.endereco}
                           </span>
                         )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditar(grupo)}
                        className="p-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-[#ff6b00] hover:text-white transition-all shadow-lg"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleExcluir(grupo)}
                        disabled={excluindo === grupo.id}
                        className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/10 shadow-lg disabled:opacity-50"
                        title="Excluir"
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
  );
}
