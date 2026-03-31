"use client";

import { useEffect, useState } from "react";
import { getGruposAdminAction, excluirGrupo } from "./actions";
import type { Grupo } from "@/lib/gruposQueries";
import GruposForm from "@/components/admin-fomularios/GruposForm";
import { Clock, MapPin, Pencil, Trash2, Plus, Users } from "lucide-react";

export default function AdminGruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [grupoEditando, setGrupoEditando] = useState<Grupo | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [feedbackExclusao, setFeedbackExclusao] = useState<string | null>(null);

  async function carregarGrupos() {
    const data = await getGruposAdminAction();
    setGrupos(data);
    setLoading(false);
  }

  useEffect(() => {
    carregarGrupos();
  }, []);

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
    // Fecha o form apenas na edição; na criação mantém aberto para criar mais
    if (grupoEditando) {
      setGrupoEditando(null);
      setMostrarForm(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Header da página */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-orange-500 text-xs font-bold tracking-[0.3em] uppercase mb-1">
              PAINEL ADMIN
            </p>
            <h1 className="text-3xl font-black">Grupos Familiares</h1>
          </div>

          {!mostrarForm && (
            <button
              onClick={handleNovoGrupo}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo grupo
            </button>
          )}
        </div>

        {/* Formulário (criação ou edição) */}
        {mostrarForm && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-bold mb-5">
              {grupoEditando ? `Editando: ${grupoEditando.nome || grupoEditando.bairro}` : "Novo grupo"}
            </h2>
            <GruposForm
              grupoEditando={grupoEditando}
              onSucesso={handleSucesso}
              onCancelar={handleCancelar}
            />
          </div>
        )}

        {/* Feedback de exclusão */}
        {feedbackExclusao && (
          <div className="mb-6 rounded-lg px-4 py-3 text-sm font-medium bg-red-500/15 text-red-400 border border-red-500/30">
            {feedbackExclusao}
          </div>
        )}

        {/* Lista de grupos */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : grupos.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Nenhum grupo cadastrado ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {grupos.map((grupo) => (
              <div
                key={grupo.id}
                className={`flex items-center gap-4 bg-white/5 border rounded-2xl px-5 py-4 transition-colors ${
                  !grupo.ativo ? "border-white/5 opacity-50" : "border-white/10"
                }`}
              >
                {/* Badge do dia */}
                <span className="hidden sm:inline-flex items-center self-start mt-0.5 px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 text-xs font-bold tracking-wider uppercase whitespace-nowrap">
                  {grupo.dia_semana.split("-")[0]}
                </span>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-white">
                      {grupo.nome || grupo.bairro}
                    </h3>
                    {!grupo.ativo && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/40">
                        inativo
                      </span>
                    )}
                  </div>
                  <p className="text-orange-400/70 text-sm">{grupo.lider}</p>

                  <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1.5 text-white/40 text-xs">
                      <Clock className="w-3 h-3" />
                      {grupo.dia_semana} · {grupo.horario.slice(0, 5)}
                    </span>
                    {grupo.endereco && (
                      <span className="flex items-center gap-1.5 text-white/40 text-xs">
                        <MapPin className="w-3 h-3" />
                        {grupo.endereco}
                      </span>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleEditar(grupo)}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleExcluir(grupo)}
                    disabled={excluindo === grupo.id}
                    className="p-2 rounded-lg hover:bg-red-500/15 text-white/40 hover:text-red-400 disabled:opacity-50 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contagem */}
        {!loading && grupos.length > 0 && (
          <p className="text-white/20 text-xs text-center mt-6">
            {grupos.filter((g) => g.ativo).length} grupo(s) ativo(s) de {grupos.length} total
          </p>
        )}
      </div>
    </div>
  );
}