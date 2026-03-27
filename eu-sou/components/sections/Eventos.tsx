'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Clock, MapPin } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import { getEventos, EventoRow } from '@/lib/eventosQueries'

// Imagens de segurança (caso o evento não tenha imagem anexada)
const fallbackImages = [
  '/img/celbração.jpeg',
  '/img/oração.jpeg',
  '/img/teste3.jpeg',
  '/img/img-membro.jpeg',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatarData(dataStr: string) {
  if (!dataStr) return { dia: '00', mes: '---' }
  const [, mes, dia] = dataStr.split('-')
  const meses = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
  return { dia, mes: meses[parseInt(mes, 10) - 1] }
}

// ─── Card individual ──────────────────────────────────────────────────────────

function EventoCard({
  evento,
  index,
}: {
  evento: EventoRow
  index: number
}) {
  const { dia, mes } = formatarData(evento.data)

  // LÓGICA DE IMAGEM: Prioriza a do banco, senão usa uma do array de fallback pelo índice
  const imagemExibicao = evento.imagem_url || fallbackImages[index % fallbackImages.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative h-[420px] rounded-2xl overflow-hidden cursor-pointer border-2 border-[#ff6b00]"
    >
      <img
        src={imagemExibicao}
        alt={evento.titulo}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      
      {/* Overlay Escuro para leitura */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-90 group-hover:via-black/50 transition-all duration-500" />

      {/* Badge de Data */}
      <div className="absolute top-4 left-4 bg-[#ff6b00] rounded-lg px-3 py-2 text-center shadow-lg z-20">
        <span className="font-bold text-2xl text-white leading-none block">
          {dia}
        </span>
        <span className="text-[10px] text-white/80 tracking-widest font-black uppercase">
          {mes}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
        <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2 transition-colors duration-500 group-hover:text-[#ff6b00]">
          {evento.titulo}
        </h3>
        
        {evento.descricao && (
          <p className="text-white/70 text-sm mb-4 line-clamp-2 font-medium">
            {evento.descricao}
          </p>
        )}
        
        <div className="flex flex-col gap-1.5 text-white/50 text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#ff6b00]" />
            <span>{evento.horario || 'Horário a definir'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#ff6b00]" />
            <span>{evento.local || 'Sede da Igreja'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Seção principal ──────────────────────────────────────────────────────────

export default function Eventos() {
  const [eventos, setEventos] = useState<EventoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(false)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: eventos.length > 3, // Só faz loop se tiver muitos itens
    slidesToScroll: 1,
  })
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    async function carregarEventos() {
      try {
        const dados = await getEventos()
        setEventos(dados)
      } catch (err) {
        console.error("Erro Supabase:", err)
        setErro(true)
      } finally {
        setLoading(false)
      }
    }
    carregarEventos()
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    setCurrent(emblaApi.selectedScrollSnap())
    emblaApi.on('select', () => setCurrent(emblaApi.selectedScrollSnap()))
  }, [emblaApi])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <section id="eventos" className="relative py-24 md:py-32 px-6 bg-black overflow-hidden">
      {/* ── Efeitos de fundo (MANTIDOS) ── */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="0" x2="100%" y2="100%" stroke="#ff6b00" strokeWidth="0.5" />
          <line x1="100%" y1="0" x2="0%" y2="100%" stroke="#ff6b00" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <header className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[#ff6b00] tracking-[0.4em] text-[10px] font-black mb-2 uppercase">
              Próximos Encontros
            </p>
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">
              Agenda <span className="text-[#ff6b00] italic">Eu Sou</span>
            </h2>
          </div>

          <div className="hidden md:flex gap-3">
            <button onClick={scrollPrev} className="w-14 h-14 rounded-full border-2 border-[#ff6b00] flex items-center justify-center text-[#ff6b00] hover:bg-[#ff6b00] hover:text-white transition-all active:scale-90">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button onClick={scrollNext} className="w-14 h-14 rounded-full border-2 border-[#ff6b00] flex items-center justify-center text-[#ff6b00] hover:bg-[#ff6b00] hover:text-white transition-all active:scale-90">
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </header>
        
        {loading ? (
          <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-3xl">
            <Loader2 className="w-8 h-8 animate-spin text-[#ff6b00]" />
          </div>
        ) : erro ? (
          <div className="h-[400px] flex items-center justify-center bg-red-500/5 border border-red-500/20 rounded-3xl">
             <p className="text-red-500 font-bold uppercase tracking-widest text-xs">Erro ao sincronizar agenda</p>
          </div>
        ) : eventos.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center bg-zinc-900/50 border border-zinc-800 rounded-3xl">
             <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Nenhum evento agendado</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex -ml-6">
                {eventos.map((evento, i) => (
                  <div key={evento.id} className="pl-6 min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
                    <EventoCard evento={evento} index={i} />
                  </div>
                ))}
              </div>
            </div>

            {/* Dots indicadores */}
            <div className="flex justify-center gap-2 mt-12">
              {eventos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    current === i ? 'w-12 bg-[#ff6b00]' : 'w-3 bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

// Pequeno Helper para o ícone de Loading (caso queira adicionar ao import)
function Loader2({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  )
}