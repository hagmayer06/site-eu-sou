"use client";

import { useEffect, useState } from "react";
import { criarGrupo, editarGrupo } from "@/app/admin/grupos/actions";
import type { Grupo } from "@/lib/gruposQueries";

type GrupoFormData = {
  nome: string;
  lider: string;
  telefone: string;
  bairro: string;
  dia_semana: string;
  horario: string;
  endereco: string;
};

const DIAS_SEMANA = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

type Props = {
  grupoEditando?: Grupo | null;
  onSucesso: () => void;
  onCancelar?: () => void;
};

const camposVazios: GrupoFormData = {
  nome: "",
  lider: "",
  telefone: "",
  bairro: "",
  dia_semana: "",
  horario: "",
  endereco: "",
};

export default function GruposForm({ grupoEditando, onSucesso, onCancelar }: Props) {
  const [campos, setCampos] = useState<GrupoFormData>(camposVazios);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: "sucesso" | "erro"; mensagem: string } | null>(null);

  const modoEdicao = !!grupoEditando;

  // Quando receber um grupo para editar, preenche o formulário
  useEffect(() => {
    if (grupoEditando) {
      setCampos({
        nome: grupoEditando.nome ?? "",
        lider: grupoEditando.lider,
        telefone: grupoEditando.telefone ?? "",
        bairro: grupoEditando.bairro,
        dia_semana: grupoEditando.dia_semana,
        horario: grupoEditando.horario.slice(0, 5), // "19:30:00" → "19:30"
        endereco: grupoEditando.endereco ?? "",
      });
    } else {
      setCampos(camposVazios);
    }
    setFeedback(null);
  }, [grupoEditando]);

  function atualizar(campo: keyof GrupoFormData, valor: string) {
    setCampos((prev: GrupoFormData) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setFeedback(null);

    // Validação mínima
    if (!campos.lider || !campos.telefone || !campos.bairro || !campos.dia_semana || !campos.horario) {
      setFeedback({ tipo: "erro", mensagem: "Preencha todos os campos obrigatórios." });
      setSalvando(false);
      return;
    }

    const resultado = modoEdicao
      ? await editarGrupo(grupoEditando!.id, campos as any)
      : await criarGrupo(campos as any);

    if (resultado.erro) {
      setFeedback({ tipo: "erro", mensagem: resultado.erro });
    } else {
      setFeedback({
        tipo: "sucesso",
        mensagem: modoEdicao ? "Grupo atualizado com sucesso!" : "Grupo criado com sucesso!",
      });
      if (!modoEdicao) setCampos(camposVazios); // limpa só na criação
      onSucesso();
    }

    setSalvando(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Feedback */}
      {feedback && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            feedback.tipo === "sucesso"
              ? "bg-green-500/15 text-green-400 border border-green-500/30"
              : "bg-red-500/15 text-red-400 border border-red-500/30"
          }`}
        >
          {feedback.mensagem}
        </div>
      )}

      {/* Nome (opcional) */}
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
          Nome do grupo <span className="text-white/30 normal-case font-normal">(opcional)</span>
        </label>
        <input
          type="text"
          value={campos.nome || ""}
          onChange={(e) => atualizar("nome", e.target.value)}
          placeholder="ex: Grupo Família"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-orange-500/60 transition-colors"
        />
      </div>

      {/* Líder — obrigatório */}
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
          Líder <span className="text-orange-500">*</span>
        </label>
        <input
          type="text"
          value={campos.lider}
          onChange={(e) => atualizar("lider", e.target.value)}
          placeholder="Nome do líder"
          required
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-orange-500/60 transition-colors"
        />
      </div>

      {/* Telefone — obrigatório */}
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
          Telefone (WhatsApp) <span className="text-orange-500">*</span>
        </label>
        <input
          type="tel"
          value={campos.telefone}
          onChange={(e) => atualizar("telefone", e.target.value)}
          placeholder="ex: 5511999999999"
          required
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-orange-500/60 transition-colors"
        />
        <p className="text-[10px] text-white/30 mt-1 italic">
          Inclua o código do país e DDD (somente números).
        </p>
      </div>

      {/* Bairro — obrigatório */}
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
          Bairro <span className="text-orange-500">*</span>
        </label>
        <input
          type="text"
          value={campos.bairro}
          onChange={(e) => atualizar("bairro", e.target.value)}
          placeholder="ex: Centro"
          required
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-orange-500/60 transition-colors"
        />
      </div>

      {/* Dia e horário — lado a lado */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            Dia da semana <span className="text-orange-500">*</span>
          </label>
          <select
            value={campos.dia_semana}
            onChange={(e) => atualizar("dia_semana", e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/60 transition-colors appearance-none"
          >
            <option value="" disabled className="bg-zinc-900">
              Selecione
            </option>
            {DIAS_SEMANA.map((dia) => (
              <option key={dia} value={dia} className="bg-zinc-900">
                {dia}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
            Horário <span className="text-orange-500">*</span>
          </label>
          <input
            type="time"
            value={campos.horario}
            onChange={(e) => atualizar("horario", e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500/60 transition-colors"
          />
        </div>
      </div>

      {/* Endereço (opcional) */}
      <div>
        <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
          Endereço <span className="text-white/30 normal-case font-normal">(opcional)</span>
        </label>
        <input
          type="text"
          value={campos.endereco || ""}
          onChange={(e) => atualizar("endereco", e.target.value)}
          placeholder="ex: Rua das Flores, 123"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-orange-500/60 transition-colors"
        />
      </div>

      {/* Ações */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={salvando}
          className="flex-1 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-2.5 rounded-lg transition-colors"
        >
          {salvando ? "Salvando..." : modoEdicao ? "Salvar alterações" : "Criar grupo"}
        </button>

        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30 text-sm transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}