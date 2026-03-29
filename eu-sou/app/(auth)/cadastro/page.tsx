'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Etapa = 1 | 2

interface DadosEtapa1 {
  nome: string
  email: string
  senha: string
  confirmarSenha: string
}

interface DadosEtapa2 {
  telefone: string
  dataNascimento: string
}

export default function CadastroPage() {
  const [etapa, setEtapa] = useState<Etapa>(1)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [concluido, setConcluido] = useState(false)

  const [etapa1, setEtapa1] = useState<DadosEtapa1>({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  })

  const [etapa2, setEtapa2] = useState<DadosEtapa2>({
    telefone: '',
    dataNascimento: '',
  })

  function validarEtapa1(): string | null {
    if (!etapa1.nome.trim()) return 'Informe seu nome completo.'
    if (!etapa1.email.trim()) return 'Informe seu e-mail.'
    if (etapa1.senha.length < 6) return 'A senha deve ter pelo menos 6 caracteres.'
    if (etapa1.senha !== etapa1.confirmarSenha) return 'As senhas não coincidem.'
    return null
  }

  function avancarEtapa(e: React.FormEvent) {
    e.preventDefault()
    const erroValidacao = validarEtapa1()
    if (erroValidacao) {
      setErro(erroValidacao)
      return
    }
    setErro(null)
    setEtapa(2)
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro(null)

    const { error } = await supabase.auth.signUp({
      email: etapa1.email.trim(),
      password: etapa1.senha,
      options: {
        data: {
          full_name: etapa1.nome.trim(),
          telefone: etapa2.telefone.trim() || null,
          data_nascimento: etapa2.dataNascimento || null,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        setErro('Este e-mail já está cadastrado. Tente fazer login.')
      } else {
        setErro('Não foi possível criar a conta. Tente novamente.')
      }
      setLoading(false)
      return
    }

    setConcluido(true)
    setLoading(false)
  }

  if (concluido) {
    return (
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl text-center">
        <div className="w-16 h-16 bg-[#ff6b00]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#ff6b00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-3">
          Verifique seu <span className="text-[#ff6b00]">e-mail</span>
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed mb-6">
          Enviamos um link de confirmação para{' '}
          <span className="text-white font-bold">{etapa1.email}</span>.
          <br />
          Clique no link para ativar sua conta.
        </p>
        <Link
          href="/entrar"
          className="block w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold uppercase tracking-widest rounded-xl transition-all text-center"
        >
          Voltar ao login
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
      {/* Cabeçalho */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">
          Criar <span className="text-[#ff6b00]">Conta</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-1 font-medium italic">Igreja Eu Sou</p>
      </div>

      {/* Indicador de etapas */}
      <div className="flex items-center gap-2 mb-6">
        {([1, 2] as Etapa[]).map((n) => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                etapa === n
                  ? 'bg-[#ff6b00] text-white'
                  : etapa > n
                  ? 'bg-green-600 text-white'
                  : 'bg-zinc-800 text-zinc-600'
              }`}
            >
              {etapa > n ? '✓' : n}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${etapa >= n ? 'text-zinc-300' : 'text-zinc-700'}`}>
              {n === 1 ? 'Acesso' : 'Perfil'}
            </span>
            {n < 2 && <div className={`flex-1 h-px ${etapa > n ? 'bg-green-600' : 'bg-zinc-800'}`} />}
          </div>
        ))}
      </div>

      {/* Feedback de erro */}
      {erro && (
        <div className="mb-4 bg-red-500/10 border border-red-500 text-red-400 text-xs p-3 rounded-lg text-center font-bold">
          {erro}
        </div>
      )}

      {/* Etapa 1: Acesso */}
      {etapa === 1 && (
        <form onSubmit={avancarEtapa} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#ff6b00] mb-2 tracking-widest">
              Nome completo
            </label>
            <input
              type="text"
              value={etapa1.nome}
              onChange={(e) => setEtapa1({ ...etapa1, nome: e.target.value })}
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#ff6b00] outline-none transition-all placeholder:text-zinc-700"
              placeholder="Seu nome completo"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-[#ff6b00] mb-2 tracking-widest">
              E-mail
            </label>
            <input
              type="email"
              value={etapa1.email}
              onChange={(e) => setEtapa1({ ...etapa1, email: e.target.value })}
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
              value={etapa1.senha}
              onChange={(e) => setEtapa1({ ...etapa1, senha: e.target.value })}
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#ff6b00] outline-none transition-all placeholder:text-zinc-700"
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-[#ff6b00] mb-2 tracking-widest">
              Confirmar senha
            </label>
            <input
              type="password"
              value={etapa1.confirmarSenha}
              onChange={(e) => setEtapa1({ ...etapa1, confirmarSenha: e.target.value })}
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#ff6b00] outline-none transition-all placeholder:text-zinc-700"
              placeholder="Repita a senha"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-[#ff6b00] hover:bg-[#e65a00] text-white font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(255,107,0,0.1)]"
          >
            Próximo
          </button>
        </form>
      )}

      {/* Etapa 2: Perfil */}
      {etapa === 2 && (
        <form onSubmit={handleCadastro} className="space-y-4">
          <p className="text-zinc-500 text-xs text-center mb-2">
            Campos opcionais — você pode preencher depois.
          </p>
          <div>
            <label className="block text-xs font-bold uppercase text-[#ff6b00] mb-2 tracking-widest">
              Telefone
            </label>
            <input
              type="tel"
              value={etapa2.telefone}
              onChange={(e) => setEtapa2({ ...etapa2, telefone: e.target.value })}
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#ff6b00] outline-none transition-all placeholder:text-zinc-700"
              placeholder="(00) 00000-0000"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-[#ff6b00] mb-2 tracking-widest">
              Data de nascimento
            </label>
            <input
              type="date"
              value={etapa2.dataNascimento}
              onChange={(e) => setEtapa2({ ...etapa2, dataNascimento: e.target.value })}
              className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-[#ff6b00] outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#ff6b00] hover:bg-[#e65a00] text-white font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600 shadow-[0_0_20px_rgba(255,107,0,0.1)]"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
          <button
            type="button"
            onClick={() => { setEtapa(1); setErro(null) }}
            className="w-full text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Voltar
          </button>
        </form>
      )}

      {/* Rodapé */}
      <p className="text-center text-xs text-zinc-600 mt-8">
        Já tem conta?{' '}
        <Link href="/entrar" className="text-[#ff6b00] hover:underline font-bold">
          Entrar
        </Link>
      </p>
    </div>
  )
}
