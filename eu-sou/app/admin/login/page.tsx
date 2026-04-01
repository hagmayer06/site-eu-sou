'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        setError('E-mail ou senha incorretos.');
        setLoading(false);
      } else {
        console.log("Sucesso! Autenticado.");
        
        // Descobre para onde o usuário queria ir (padrão: /admin/eventos)
        const next = searchParams.get('next') || '/admin/eventos';
        
        // Segurança: Proteção contra Open Redirect (garante que é um link interno)
        const destination = next.startsWith('/') ? next : '/admin/eventos';

        // Pequeno delay para garantir que o cookie do Supabase seja processado
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push(destination);
      }
    } catch (err) {
      setError('Erro inesperado ao tentar logar.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 text-xs p-3 rounded-lg text-center font-bold animate-pulse">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase text-[#ff6b00] mb-2 tracking-widest">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#ff6b00] outline-none transition-all placeholder:text-zinc-700"
          placeholder="seu@email.com"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-[#ff6b00] mb-2 tracking-widest">Senha</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#ff6b00] outline-none transition-all placeholder:text-zinc-700"
          placeholder="••••••••"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-[#ff6b00] hover:bg-[#e65a00] text-white font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 shadow-[0_0_20px_rgba(255,107,0,0.1)] flex justify-center"
      >
        {loading ? 'AUTENTICANDO...' : 'ENTRAR NO PAINEL'}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
            Área <span className="text-[#ff6b00]">Restrita</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-2 font-medium italic">Igreja Eu Sou</p>
        </div>

        {/* 
          Cybersecurity & Framework Fundamento:
          O uso de useSearchParams() exige um Suspense Boundary para que o 
          build estático do Next.js não falhe ao tentar renderizar algo que 
          depende de dados exclusivos do navegador.
        */}
        <Suspense fallback={
          <div className="text-[#ff6b00] text-center font-bold animate-pulse text-xs tracking-widest uppercase">
            Carregando segurança...
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}