'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
// IMPORTANTE: Removemos o import do supabaseAdmin daqui para evitar o erro de chave!
import { atualizarSerieAction } from '@/app/admin/serie/actions';
import { supabase } from '@/lib/supabase'; // Usamos o cliente comum (anon) apenas para leitura inicial

interface SerieFormData {
  titulo: string;
  livro: string;
  descricao: string;
  mes: string;
  semana_1: string;
  semana_2: string;
  semana_3: string;
  semana_4: string;
  imagem_url: string;
}

export default function SerieForm() {
  const [serieId, setSerieId] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState<SerieFormData>({
    titulo: '', livro: '', descricao: '', mes: '',
    semana_1: '', semana_2: '', semana_3: '', semana_4: '', imagem_url: '',
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Busca inicial (pode ser feita com o supabase comum/anon)
  useEffect(() => {
    async function fetchSerie() {
      try {
        const { data, error } = await supabase.from('serie_do_mes').select('*').single();
        if (error) throw error;
        if (data) {
          setSerieId(data.id);
          setFormData({
            titulo: data.titulo || '', livro: data.livro || '', descricao: data.descricao || '',
            mes: data.mes || '', semana_1: data.semana_1 || '', semana_2: data.semana_2 || '',
            semana_3: data.semana_3 || '', semana_4: data.semana_4 || '', imagem_url: data.imagem_url || '',
          });
          setImagePreview(data.imagem_url);
        }
      } catch (err) {
        console.error("Erro ao carregar:", err);
      } finally {
        setLoadingInitial(false);
      }
    }
    fetchSerie();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!serieId) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      // Criamos um FormData para enviar arquivos e textos para o servidor
      const dataToSend = new FormData();
      dataToSend.append('id', serieId);
      dataToSend.append('titulo', formData.titulo);
      dataToSend.append('livro', formData.livro);
      dataToSend.append('descricao', formData.descricao);
      dataToSend.append('mes', formData.mes);
      dataToSend.append('semana_1', formData.semana_1);
      dataToSend.append('semana_2', formData.semana_2);
      dataToSend.append('semana_3', formData.semana_3);
      dataToSend.append('semana_4', formData.semana_4);
      dataToSend.append('imagem_url_atual', formData.imagem_url);
      
      if (imageFile) {
        dataToSend.append('imagem_nova', imageFile);
      }

      // CHAMADA DA SERVER ACTION (O segredo da segurança)
      const result = await atualizarSerieAction(dataToSend);

      if (!result.success) throw new Error(result.error);

      setFeedback({ type: 'success', message: 'Série atualizada com sucesso!' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao salvar.' });
    } finally {
      setIsSaving(false);
    }
  };

  const inputClasses = "w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all";
  const labelClasses = "block text-xs font-bold uppercase tracking-wider text-orange-500 mb-1.5";

  if (loadingInitial) return <div className="text-orange-500 animate-pulse text-center py-20 font-bold">CARREGANDO PAINEL...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {feedback && (
        <div className={`p-4 rounded-lg font-bold text-center animate-in fade-in zoom-in duration-300 ${feedback.type === 'success' ? 'bg-orange-500 text-black' : 'bg-red-600 text-white'}`}>
          {feedback.message}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className={labelClasses}>Mês de Referência</label>
          <input type="text" name="mes" value={formData.mes} onChange={handleInputChange} className={inputClasses} placeholder="Ex: MARÇO 2026" />
        </div>

        <div>
          <label className={labelClasses}>Título da Série</label>
          <input type="text" name="titulo" required value={formData.titulo} onChange={handleInputChange} className={inputClasses} />
        </div>
        
        <div>
          <label className={labelClasses}>Livro Base</label>
          <input type="text" name="livro" required value={formData.livro} onChange={handleInputChange} className={inputClasses} />
        </div>

        <div className="md:col-span-2">
          <label className={labelClasses}>Descrição</label>
          <textarea name="descricao" rows={3} value={formData.descricao} onChange={handleInputChange} className={inputClasses} />
        </div>
      </section>

      <section>
        <h3 className="text-white font-black text-sm uppercase mb-4 flex items-center gap-2">
          <span className="w-8 h-[2px] bg-orange-500 inline-block"></span> Cronograma
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
              <label className={labelClasses}>Semana 0{num}</label>
              <input
                type="text"
                name={`semana_${num}`}
                value={formData[`semana_${num}` as keyof SerieFormData] as string}
                onChange={handleInputChange}
                className="w-full bg-transparent border-b border-zinc-600 py-2 text-white focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-zinc-900 p-6 rounded-2xl border-2 border-dashed border-zinc-800">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 space-y-4">
            <label className={labelClasses}>Capa da Série</label>
            <input type="file" accept="image/*" onChange={handleImageChange} 
                   className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-orange-500 file:text-black hover:file:bg-orange-400 cursor-pointer" />
          </div>

          <div className="relative w-48 h-32 bg-black rounded-lg overflow-hidden border border-zinc-700 shadow-xl">
            {imagePreview ? (
              <img src={imagePreview} alt="Capa" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-700 text-[10px] uppercase">Sem imagem</div>
            )}
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-black font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] disabled:bg-zinc-700 disabled:text-zinc-500 shadow-[0_0_20px_rgba(249,115,22,0.2)]"
      >
        {isSaving ? 'Salvando Alterações...' : 'Atualizar Igreja Eu Sou'}
      </button>
    </form>
  );
}