// lib/queries.ts
import { supabase } from "./supabase"

export async function getSerieDoMes() {
  const { data, error } = await supabase
    .from("serie_do_mes")
    .select("*")
    .single()

  if (error) {
    console.error("Erro ao buscar série do mês:", error)
    return null
  }

  return data
}