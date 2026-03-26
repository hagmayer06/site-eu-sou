"use client"

// components/sections/SerieDoMes.tsx

import { motion, easeOut } from "framer-motion"

type SerieDoMes = {
  titulo: string
  livro: string
  descricao: string
  imagem_url: string
  mes: string        // ex: "MARÇO"
  semana_1: string
  semana_2: string
  semana_3: string
  semana_4: string
}

export default function SerieDoMes({ serie }: { serie: SerieDoMes }) {
  const ORANGE = "#ff6b00"
  const semanas = [serie.semana_1, serie.semana_2, serie.semana_3, serie.semana_4].filter(Boolean)

  // Função auxiliar para gerar as propriedades do framer-motion com base no delay
  const fadeUp = (delayMs: number, extraY = 24) => ({
    initial: { opacity: 0, y: extraY },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.7, delay: delayMs / 1000, ease: easeOut }
  })

  return (
    <section
      className="relative w-full bg-[#ff6b00] px-4 md:px-10 py-14 flex flex-col items-center overflow-hidden"
    >
      {/* ── Background: circular black rings ── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-0">
        <svg
          className="absolute w-full h-full opacity-20"
          viewBox="0 0 1400 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {[180, 300, 420, 540, 660].map((r, i) => (
            <circle key={`l-${i}`} cx="350" cy="450" r={r} fill="none" stroke="black" strokeWidth="1.2" />
          ))}
          {[150, 270, 390, 510].map((r, i) => (
            <circle key={`r-${i}`} cx="1050" cy="450" r={r} fill="none" stroke="black" strokeWidth="1" />
          ))}
        </svg>
      </div>

      {/* ── Content Wrapper ── */}
      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* ── Heading acima do card ── */}
        <div className="flex flex-col items-center mb-6 gap-1">
          <motion.span
            className="text-[10px] font-semibold tracking-[0.35em] uppercase text-black"
            {...fadeUp(0)}
          >
            SÉRIE DO MÊS
          </motion.span>
          <motion.h2
            className="text-3xl md:text-4xl font-black uppercase text-white tracking-tight"
            {...fadeUp(100)}
          >
            TEMA DE <span className="text-black">{serie.mes.toUpperCase()}</span>
          </motion.h2>
        </div>

        {/* ── Card ── */}
        <motion.div
          className="relative w-full max-w-4xl rounded-2xl overflow-hidden border-[3px] border-black"
          style={{ minHeight: "340px" }}
          {...fadeUp(200, 40)}
        >
          {/* Imagem de fundo */}
          <img
            src={serie.imagem_url || "/placeholder.jpg"}
            alt={serie.titulo}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* Degradê esquerda → transparente */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, #18181b 35%, #18181b99 60%, transparent 100%)",
            }}
          />

          {/* Conteúdo */}
          <div
            className="relative z-10 flex flex-col justify-between h-full p-6 md:p-8"
            style={{ minHeight: "340px" }}
          >
            <div />

            <div className="flex flex-col gap-2">
              {/* Mês + ano */}
              <motion.span
                className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#ff6b00]"
                {...fadeUp(350)}
              >
                {serie.mes.toUpperCase()} 2026
              </motion.span>

              {/* Título */}
              <motion.h4
                className="font-black uppercase text-white leading-none tracking-tight"
                style={{ fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)" }}
                {...fadeUp(450)}
              >
                {serie.titulo.toUpperCase()}
              </motion.h4>

              {/* Descrição */}
              <motion.p
                className="text-white/65 text-xs md:text-sm leading-relaxed max-w-sm"
                {...fadeUp(550)}
              >
                {serie.descricao}
              </motion.p>

              {/* Pills das semanas */}
              {semanas.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {semanas.map((semana, i) => (
                    <motion.button
                      key={i}
                      className="px-3 py-1.5 rounded-full text-[11px] font-medium text-white/80 bg-black/20 cursor-pointer hover:bg-black/50 hover:text-white border border-[#ff6b00]"
                      {...fadeUp(650 + i * 80)}
                    >
                      {semana}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}