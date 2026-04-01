import { supabaseAdmin } from "./supabaseAdmin";
import type { Grupo } from "./gruposQueries";

export type GrupoInput = {
  nome?: string;
  lider: string;
  telefone: string;
  bairro: string;
  dia_semana: string;
  horario: string;
  endereco?: string;
};

/**
 * Busca TODOS os grupos (ativos e inativos) para o painel admin.
 * Usa supabaseAdmin (service role key) — NUNCA importe isso em componentes
 * que rodam no browser.
 */
export async function getGruposAdmin(): Promise<Grupo[]> {
  const { data, error } = await supabaseAdmin
    .from("pequenos_grupos")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("Erro ao buscar grupos (admin):", error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Cria um novo grupo.
 */
export async function criarGrupo(input: GrupoInput): Promise<{ erro?: string }> {
  const { error } = await supabaseAdmin
    .from("pequenos_grupos")
    .insert([input]);

  if (error) {
    console.error("Erro ao criar grupo:", error.message);
    return { erro: error.message };
  }

  return {};
}

/**
 * Edita um grupo existente pelo id.
 * Aceita Partial<GrupoInput> — mande apenas os campos que mudaram.
 */
export async function editarGrupo(
  id: string,
  campos: Partial<GrupoInput>
): Promise<{ erro?: string }> {
  const { error } = await supabaseAdmin
    .from("pequenos_grupos")
    .update(campos)
    .eq("id", id);

  if (error) {
    console.error("Erro ao editar grupo:", error.message);
    return { erro: error.message };
  }

  return {};
}

/**
 * Exclui um grupo pelo id.
 * Para exclusão suave, use editarGrupo(id, { ativo: false }) em vez disso.
 */
export async function excluirGrupo(id: string): Promise<{ erro?: string }> {
  const { error } = await supabaseAdmin
    .from("pequenos_grupos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir grupo:", error.message);
    return { erro: error.message };
  }

  return {};
}