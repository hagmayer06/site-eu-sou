import { supabase } from "./supabase";

export type Grupo = {
  id: string;
  nome: string | null;
  lider: string;
  telefone: string | null;
  bairro: string;
  dia_semana: string;
  horario: string;
  endereco: string | null;
  ativo: boolean;
  criado_em: string;
};

export type GrupoInput = Omit<Grupo, 'id' | 'criado_em'>

/**
 * Busca grupos ativos para exibição pública no site.
 * Cybersecurity: Esta query é pública e deve ser protegida por RLS no Supabase.
 */
export async function getGrupos() {
  try {
    const { data, error } = await supabase
      .from('pequenos_grupos')
      .select('*')
      .eq('ativo', true) // Segurança: Mostrar apenas os ativos publicamente
      .order('dia_semana', { ascending: true })

    if (error) {
      console.error('❌ Erro ao buscar grupos:', error.message)
      return []
    }

    return data as Grupo[]
  } catch (err) {
    console.error('❌ Erro na query de grupos:', err)
    return []
  }
}
