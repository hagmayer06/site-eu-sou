'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Modo = 'senha' | 'magico' | 'google'

export default function EntrarPage() {
  const [modo, setModo] = useState<Modo>('senha')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [recuperando, setRecuperando] = useState(false)

  const router = useRouter()

  function resetEstado() {
    setErro(null)
    setSucesso(null)
  }

  function trocarModo(novo: Modo) {
    setModo(novo)
    resetEstado()
    setRecuperando(false)
  }

  async function handleSenha(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    resetEstado()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    })
    if (error) {
      setErro('E-mail ou senha incorretos.')
    } else {
      router.push('/membro')
    }
    setLoading(false)
  }

  async function handleRecuperar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    resetEstado()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/membro/alterar-senha`,
    })
    if (error) {
      setErro('Não foi possível enviar. Verifique o e-mail e tente novamente.')
    } else {
      setSucesso('Instruções enviadas! Verifique sua caixa de entrada.')
    }
    setLoading(false)
  }

  async function handleMagico(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    resetEstado()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setErro('Não foi possível enviar o link. Tente novamente.')
    } else {
      setSucesso('Link enviado! Verifique sua caixa de entrada.')
    }
    setLoading(false)
  }

  async function handleGoogle() {
    setLoading(true)
    resetEstado()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setErro('Erro ao conectar com o Google. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
          Área de <span className="text-[#ff6b00]">Membros</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-2 font-medium italic">Igreja Eu Sou</p>
      </div>

      {/* Seletor de modo */}
      <div className="flex gap-1 bg-black rounded-xl p-1 mb-6">
        {(['senha', 'magico', 'google'] as Modo[]).map((m) => (
          <button
            key={m}
            onClick={() => trocarModo(m)}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              modo === m
                ? 'bg-[#ff6b00] text-white shadow'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {m === 'senha' ? 'Senha' : m === 'magico' ? 'Link Mágico' : 'Google'}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {erro && (
        <div className="mb-4 bg-red-500/10 border border-red-500 text-red-400 text-xs p-3 rounded-lg text-center font-bold">
          {erro}
        </div>
      )}
      {sucesso && (
        <div className="mb-4 bg-green-500/10 border border-green-500 text-green-400 text-xs p-3 rounded-lg text-center font-bold">
          {sucesso}
        </div>
      )}

      {/* Modo: e-mail + senha */}
      {modo === 'senha' && !recuperando && (
        <form onSubmit={handleSenha} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#ff6b00] mb-2 tracking-widest">
              E-mail
            </label>
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
            <label className="block text-xs font-bold uppercase text-[#ff6b00] mb-2 tracking-widest">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#ff6b00] outline-none transition-all placeholder:text-zinc-700"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#ff6b00] hover:bg-[#e65a00] text-white font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 shadow-[0_0_20px_rgba(255,107,0,0.1)]"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <button
            type="button"
            onClick={() => { resetEstado(); setRecuperando(true) }}
            className="w-full text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors mt-2"
          >
            Esqueci minha senha
          </button>
        </form>
      )}

      {/* Modo: recuperar senha */}
      {modo === 'senha' && recuperando && (
        <form onSubmit={handleRecuperar} className="space-y-4">
          <p className="text-zinc-400 text-sm text-center mb-2">
            Informe seu e-mail e enviaremos um link para redefinir a senha.
          </p>
          <div>
            <label className="block text-xs font-bold uppercase text-[#ff6b00] mb-2 tracking-widest">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#ff6b00] outline-none transition-all placeholder:text-zinc-700"
              placeholder="seu@email.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#ff6b00] hover:bg-[#e65a00] text-white font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600"
          >
            {loading ? 'Enviando...' : 'Enviar instruções'}
          </button>
          <button
            type="button"
            onClick={() => { setRecuperando(false); resetEstado() }}
            className="w-full text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Voltar ao login
          </button>
        </form>
      )}

      {/* Modo: link mágico */}
      {modo === 'magico' && !sucesso && (
        <form onSubmit={handleMagico} className="space-y-4">
          <p className="text-zinc-400 text-sm text-center mb-2">
            Enviaremos um link de acesso para o seu e-mail. Sem senha necessária.
          </p>
          <div>
            <label className="block text-xs font-bold uppercase text-[#ff6b00] mb-2 tracking-widest">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#ff6b00] outline-none transition-all placeholder:text-zinc-700"
              placeholder="seu@email.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#ff6b00] hover:bg-[#e65a00] text-white font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600"
          >
            {loading ? 'Enviando...' : 'Enviar link mágico'}
          </button>
        </form>
      )}

      {/* Modo: Google */}
      {modo === 'google' && (
        <div className="space-y-4">
          <p className="text-zinc-400 text-sm text-center mb-4">
            Entre com sua conta Google de forma rápida e segura.
          </p>
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-4 bg-white hover:bg-zinc-100 text-black font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? 'Redirecionando...' : 'Continuar com Google'}
          </button>
        </div>
      )}

      {/* Rodapé */}
      <p className="text-center text-xs text-zinc-600 mt-8">
        Ainda não é membro?{' '}
        <Link href="/cadastro" className="text-[#ff6b00] hover:underline font-bold">
          Cadastre-se
        </Link>
      </p>
    </div>
  )
}
