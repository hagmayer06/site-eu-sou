'use client'

import { motion } from 'framer-motion'
import { Building2 } from 'lucide-react'
import { DepartamentoRow } from '@/lib/departamentoQueries'

interface DepartamentoCardProps {
  departamento: DepartamentoRow
  index: number
  onSelect?: (imagemUrl: string | null) => void
}

export function DepartamentoCard({ departamento, index, onSelect }: DepartamentoCardProps) {
  const lideres = departamento.lideres
    ? departamento.lideres.split(',').map((l) => l.trim())
    : []

  const handleClick = () => {
    onSelect?.(departamento.imagem_url ?? null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={handleClick}
      className="group relative h-[180px] p-6 bg-black rounded-2xl cursor-pointer border border-zinc-800 hover:border-[#ff6b00] hover:bg-[#ff6b00]/5 transition-all duration-400 flex flex-col justify-end overflow-hidden"
    >
      {/* Miniatura da imagem no canto (se existir) */}
      {departamento.imagem_url && (
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
          <img
            src={departamento.imagem_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Ícone decorativo */}
      {!departamento.imagem_url && (
        <Building2 className="absolute top-4 right-4 w-12 h-12 text-[#ff6b00] group-hover:text-[#ff6b00]/60 transition-colors duration-500" />
      )}

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
  )
}