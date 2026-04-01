'use client';

import { supabase } from '@/lib/supabase';
import SerieForm from '@/components/admin-fomularios/SerieForm';

export default function AdminSeriePage() {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-10 pt-28">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 border-l-4 border-orange-500 pl-6 flex justify-between items-center bg-zinc-900/50 p-6 rounded-r-xl border-y border-r border-zinc-800">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">
              Admin <span className="text-orange-500 italic">Série do Mês</span>
            </h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Acesso Restrito</p>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="group flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-5 py-2.5 rounded-full text-xs font-black transition-all border border-red-500/20"
          >
            <span>ENCERRAR SESSÃO</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </header>

        <main className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <SerieForm />
        </main>
      </div>
    </div>
  );
}