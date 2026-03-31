'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getSession } from '@/lib/auth'; // <--- BLINDAGEM
import { revalidatePath } from 'next/cache';

/**
 * Validação de Segurança Centralizada
 */
async function validarAcessoAdmin() {
  const user = await getSession();
  if (!user) {
    throw new Error('Acesso negado: Usuário não autenticado.');
  }
  return user;
}

export async function atualizarSerieAction(formData: FormData) {
  try {
    await validarAcessoAdmin(); // <--- BLINDAGEM OBRIGATÓRIA

    const id = formData.get('id') as string;
    const imagemFile = formData.get('imagem_nova') as File | null;
    let finalImageUrl = formData.get('imagem_url_atual') as string;

    // 1. Upload Seguro pelo Servidor
    if (imagemFile && imagemFile.size > 0) {
      const fileExt = imagemFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('series')
        .upload(fileName, imagemFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('series')
        .getPublicUrl(fileName);
      
      finalImageUrl = publicUrlData.publicUrl;
    }

    // 2. Atualização Blindada no Banco
    const { error: updateError } = await supabaseAdmin
      .from('serie_do_mes')
      .update({
        titulo: formData.get('titulo'),
        livro: formData.get('livro'),
        descricao: formData.get('descricao'),
        mes: formData.get('mes'),
        semana_1: formData.get('semana_1'),
        semana_2: formData.get('semana_2'),
        semana_3: formData.get('semana_3'),
        semana_4: formData.get('semana_4'),
        imagem_url: finalImageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) throw updateError;

    revalidatePath('/');
    
    return { success: true };
  } catch (error: any) {
    console.error("Tentativa de atualização não autorizada ou erro:", error.message);
    return { success: false, error: 'Ação não permitida.' };
  }
}
