'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Evento = {
  id: string
  titulo: string
  descricao: string
  data: string   // formato: 'YYYY-MM-DD'
  horario: string
  local: string
}

// ─── Mock (substitua por props reais na Etapa 2) ──────────────────────────────

const eventosMock: Evento[] = [
  {
    id: '1',
    titulo: 'Culto de Celebração',
    descricao: 'Domingo especial com louvor e adoração para toda a família.',
    data: '2025-03-30',
    horario: 'Domingo, 18h',
    local: 'Sede da Igreja',
  },
  {
    id: '2',
    titulo: 'Noite de Oração',
    descricao: 'Um momento para buscar a presença de Deus e interceder juntos.',
    data: '2025-04-05',
    horario: 'Sábado, 19h30',
    local: 'Sede da Igreja',
  },
  {
    id: '3',
    titulo: 'Conferência de Jovens',
    descricao: 'Dois dias de ministração, louvor e comunhão para a juventude.',
    data: '2025-04-12',
    horario: 'Sexta e Sábado',
    local: 'Sede da Igreja',
  },
  {
    id: '4',
    titulo: 'Batismo nas Águas',
    descricao: 'Celebre sua decisão de fé com a igreja. Inscrições abertas.',
    data: '2025-04-20',
    horario: 'Domingo, 10h',
    local: 'Sede da Igreja',
  },
]

// Imagens placeholder — troque pelos imports reais das suas fotos
const cardImages = [
  '/img/celbração.jpeg',
  '/img/oração.jpeg',
  '/img/teste3.jpeg',
  '/img/img-membro.jpeg',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatarData(dataStr: string) {
  const [, mes, dia] = dataStr.split('-')
  const meses = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
  return { dia, mes: meses[parseInt(mes) - 1] }
}

// ─── Card individual ──────────────────────────────────────────────────────────

function EventoCard({
  evento,
  imgSrc,
  index,
}: {
  evento: Evento
  imgSrc: string
  index: number
}) {
  const { dia, mes } = formatarData(evento.data)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative h-[420px] rounded-2xl overflow-hidden cursor-pointer border-2 border-[#ff6b00]"
    >
      {/* Imagem de fundo */}
      <img
        src={imgSrc}
        alt={evento.titulo}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Gradiente */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      {/* Badge de data */}
      <div className="absolute top-4 left-4 bg-[#ff6b00] rounded-lg px-3 py-2 text-center">
        <span className="font-bold text-2xl text-white leading-none block">
          {dia}
        </span>
        <span className="text-[10px] text-white/80 tracking-widest font-bold">
          {mes}
        </span>
      </div>

      {/* Conteúdo */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-xl font-black uppercase tracking-wide text-white mb-2 transition-colors duration-500 group-hover:text-[#ff6b00]">
          {evento.titulo}
        </h3>
        <p className="text-white/70 text-sm mb-4 line-clamp-2">
          {evento.descricao}
        </p>
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <Clock className="w-4 h-4" />
          <span>{evento.horario}</span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Seção principal ──────────────────────────────────────────────────────────

export default function Eventos({ eventos = eventosMock }: { eventos?: Evento[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    slidesToScroll: 1,
  })

  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!emblaApi) return
    setCurrent(emblaApi.selectedScrollSnap())
    emblaApi.on('select', () => setCurrent(emblaApi.selectedScrollSnap()))
  }, [emblaApi])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <section id="eventos" className="relative py-24 md:py-32 px-6 bg-black overflow-hidden">

      {/* ── Efeitos de fundo ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          {/* Linhas diagonais */}
          <line x1="0" y1="0" x2="40%" y2="100%" stroke="#ff6b00" strokeWidth="0.5" strokeOpacity="0.25" />
          <line x1="15%" y1="0" x2="55%" y2="100%" stroke="#ff6b00" strokeWidth="0.3" strokeOpacity="0.12" />
          <line x1="100%" y1="0" x2="60%" y2="100%" stroke="#ff6b00" strokeWidth="0.5" strokeOpacity="0.2" />
          <line x1="85%" y1="0" x2="45%" y2="100%" stroke="#ff6b00" strokeWidth="0.3" strokeOpacity="0.1" />
          {/* Linha horizontal topo */}
          <line x1="0" y1="0" x2="100%" y2="0" stroke="#ff6b00" strokeWidth="1" strokeOpacity="0.35" />
          {/* Linha horizontal base */}
          <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#ff6b00" strokeWidth="1" strokeOpacity="0.2" />
          {/* Linha horizontal meio — sutil */}
          <line x1="0" y1="50%" x2="30%" y2="50%" stroke="#ff6b00" strokeWidth="0.4" strokeOpacity="0.15" />
          <line x1="70%" y1="50%" x2="100%" y2="50%" stroke="#ff6b00" strokeWidth="0.4" strokeOpacity="0.15" />
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="text-[#ff6b00] tracking-[0.3em] text-xs font-bold mb-4 uppercase">
              Agenda
            </p>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white">
              Próximos{' '}
              <span className="text-[#ff6b00]">Eventos</span>
            </h2>
          </div>

          {/* Setas — visíveis só em telas md+ */}
          <div className="hidden md:flex gap-3">
            <button
              onClick={scrollPrev}
              aria-label="Anterior"
              className="w-12 h-12 rounded-full border border-[#ff6b00] flex items-center justify-center text-[#ff6b00] hover:bg-[#ff6b00] hover:text-white transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              aria-label="Próximo"
              className="w-12 h-12 rounded-full border border-[#ff6b00] flex items-center justify-center text-[#ff6b00] hover:bg-[#ff6b00] hover:text-white transition-all duration-300"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4">
            {eventos.map((evento, i) => (
              <div
                key={evento.id}
                className="pl-4 min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
              >
                <EventoCard
                  evento={evento}
                  imgSrc={cardImages[i % cardImages.length]}
                  index={i}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {eventos.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Ir para evento ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === i ? 'w-8 bg-[#ff6b00]' : 'w-2 bg-white/25'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  )
}