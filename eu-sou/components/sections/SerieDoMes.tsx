"use client"

// components/sections/SerieDoMes.tsx

import { useEffect, useRef, useState } from "react"

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

  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const fade = (delay: number, extraY = 24) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : `translateY(${extraY}px)`,
    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
  })

  return (
    <section
      ref={sectionRef}
      className="w-full bg-zinc-950 px-4 md:px-10 py-14 flex flex-col items-center"
    >
      {/* ── Heading acima do card ── */}
      <div className="flex flex-col items-center mb-6 gap-1">
        <span
          className="text-[10px] font-semibold tracking-[0.35em] uppercase"
          style={{ color: ORANGE, ...fade(0) }}
        >
          SÉRIE DO MÊS
        </span>
        <h2
          className="text-3xl md:text-4xl font-black uppercase text-white tracking-tight"
          style={fade(100)}
        >
          TEMA DE <span style={{ color: ORANGE }}>{serie.mes.toUpperCase()}</span>
        </h2>
      </div>

      {/* ── Card ── */}
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden"
        style={{
          minHeight: "340px",
          border: `1px solid ${ORANGE}`,
          boxShadow: "0 0 40px 6px rgba(255,107,0,0.25), 0 20px 60px rgba(0,0,0,0.6)",
          ...fade(200, 40),
        }}
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
            <span
              className="text-[10px] font-bold tracking-[0.25em] uppercase"
              style={{ color: ORANGE, ...fade(350) }}
            >
              {serie.mes.toUpperCase()} 2026
            </span>

            {/* Título */}
            <h4
              className="font-black uppercase text-white leading-none tracking-tight"
              style={{ fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)", ...fade(450) }}
            >
              {serie.titulo.toUpperCase()}
            </h4>

            {/* Descrição */}
            <p
              className="text-white/65 text-xs md:text-sm leading-relaxed max-w-sm"
              style={fade(550)}
            >
              {serie.descricao}
            </p>

            {/* Pills das semanas */}
            {semanas.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {semanas.map((semana, i) => (
                  <button
                    key={i}
                    className="px-3 py-1.5 rounded-full text-[11px] font-medium text-white/80 bg-white/5 cursor-pointer hover:bg-[#ff6b00]/20 hover:text-white"
                    style={{
                      border: `1px solid ${ORANGE}`,
                      ...fade(650 + i * 80),
                    }}
                  >
                    {semana}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}