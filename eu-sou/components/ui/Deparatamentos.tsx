'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, X, Building2 } from 'lucide-react'
import { DepartamentoRow } from '@/lib/departamentoQueries'

export function DepartamentoCard({
  departamento,
  index,
}: {
  departamento: DepartamentoRow
  index: number
}) {
  const [aberto, setAberto] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const lideres = departamento.lideres
    ? departamento.lideres.split(',').map((l) => l.trim())
    : []

  const modalContent = (
    <AnimatePresence>
      {aberto && (
        <div style={{ position: "fixed", zIndex: 99999, inset: 0 }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAberto(false)}
            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
          />

          {/* Painel no centro da tela */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0 flex items-center justify-center px-4 pointer-events-none"
          >
            <div className="relative w-full max-w-md bg-black border-2 border-[#ff6b00] rounded-3xl p-8 pt-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] pointer-events-auto">
              {/* Botão fechar */}
              <button
                onClick={() => setAberto(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 hover:bg-[#ff6b00] hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Conteúdo */}
              <div className="relative z-10 mt-2">
                <p className="text-[#ff6b00] text-[10px] font-black uppercase tracking-widest mb-1">
                  Departamento
                </p>
                <h3 className="text-white font-black uppercase text-2xl tracking-tight leading-none mb-6">
                  {departamento.nome}
                </h3>

                {departamento.descricao ? (
                  <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                    {departamento.descricao}
                  </p>
                ) : (
                  <p className="text-zinc-600 italic text-sm mb-8">
                    Sem descrição disponível.
                  </p>
                )}

                {lideres.length > 0 && (
                  <div className="border-t border-zinc-800 pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-zinc-500" />
                      <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                        Liderança
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {lideres.map((lider, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold"
                        >
                          {lider}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      {/* ── Card Minimalista ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={() => setAberto(true)}
        className="group relative h-[180px] p-6 bg-black rounded-2xl cursor-pointer border border-zinc-800 hover:border-[#ff6b00] hover:bg-[#ff6b00]/5 transition-all duration-400 flex flex-col justify-end overflow-hidden"
      >
        {/* Ícone decorativo de fundo */}
        <Building2 className="absolute top-4 right-4 w-12 h-12 text-[#ff6b00] group-hover:text-[#ff6b00]/60 transition-colors duration-500" />

        <div className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
          <p className="inline-flex items-center self-start px-2 py-1 rounded bg-[#ff6b00]/10 text-[#ff6b00] text-[10px] font-black tracking-widest uppercase mb-3">
            DEPARTAMENTO
          </p>
          <h3 className="text-white font-black uppercase tracking-tight text-xl leading-tight group-hover:text-[#ff6b00] transition-colors duration-300 line-clamp-2 mb-3">
            {departamento.nome}
          </h3>
          
          {lideres.length > 0 && (
            <div className="pt-3 border-t border-zinc-700">
              <p className="text-zinc-400 text-[9px] font-black tracking-widest uppercase mb-2">
                Líderes
              </p>
              <div className="flex flex-wrap gap-1">
                {lideres.map((lider, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-[#ff6b00]/20 text-[#ff6b00] text-[10px] font-semibold line-clamp-1"
                  >
                    {lider}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Renderiza o modal via Portal (document.body) direto para não ser preso pelo Carousel (transform: translate3d) */}
      {mounted && createPortal(modalContent, document.body)}
    </>
  )
}
