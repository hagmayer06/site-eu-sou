'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import { getDepartamentos, DepartamentoRow } from '@/lib/departamentoQueries'
import { DepartamentoCard } from '@/components/ui/Deparatamentos'

const IMAGEM_PADRAO = '/img/pastores.png'

function Loader2({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

export default function ChamadoSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [departamentos, setDepartamentos] = useState<DepartamentoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(false)
  const [current, setCurrent] = useState(0)

  // ── Imagem dinâmica ──────────────────────────────────────────────────────
  const [imagemAtiva, setImagemAtiva] = useState<string>('')
  const [imagemFadindo, setImagemFadindo] = useState(false)
  const [departamentoAtivo, setDepartamentoAtivo] = useState<DepartamentoRow | null>(null)

  const trocarImagem = useCallback((novaUrl: string | null, departamento?: DepartamentoRow) => {
    if (!novaUrl && !departamento) return

    setImagemFadindo(true)
    setTimeout(() => {
      if (novaUrl) {
        setImagemAtiva(novaUrl)
      }
      if (departamento) {
        setDepartamentoAtivo(departamento)
      }
      setImagemFadindo(false)
    }, 300)
  }, [])

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    slidesToScroll: 1,
  })

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  // Busca departamentos e carrega o primeiro automaticamente
  useEffect(() => {
    async function carregar() {
      try {
        const dados = await getDepartamentos()
        setDepartamentos(dados)
        // Define o primeiro departamento como ativo automaticamente
        if (dados.length > 0) {
          const primeiro = dados[0]
          setDepartamentoAtivo(primeiro)
          setImagemAtiva(primeiro.imagem_url || '')
        }
      } catch (err) {
        console.error('Erro ao buscar departamentos:', err)
        setErro(true)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  // Sync dot indicator
  useEffect(() => {
    if (!emblaApi) return
    setCurrent(emblaApi.selectedScrollSnap())
    emblaApi.on('select', () => setCurrent(emblaApi.selectedScrollSnap()))
  }, [emblaApi])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <section
      id="chamado"
      ref={sectionRef}
      className="relative bg-black py-20 md:py-28 2xl:py-44 px-6 overflow-hidden"
    >
      {/* ── Background rings ── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <svg
          className="absolute w-full h-full opacity-[0.07]"
          viewBox="0 0 1400 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {[180, 300, 420, 540, 660].map((r, i) => (
            <circle key={`l-${i}`} cx="350" cy="450" r={r} fill="none" stroke="#ff6b00" strokeWidth="1.2" />
          ))}
          {[150, 270, 390, 510].map((r, i) => (
            <circle key={`r-${i}`} cx="1050" cy="450" r={r} fill="none" stroke="#ff6b00" strokeWidth="1" />
          ))}
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl 2xl:max-w-7xl mx-auto">

        {/* ── Label ── */}
        <div
          className={`flex items-center gap-4 mb-10 2xl:mb-14 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex-1 h-[1px] bg-[#ff6b00] opacity-60" />
          <p className="text-[#ff6b00] tracking-[0.35em] text-xs 2xl:text-sm font-semibold uppercase whitespace-nowrap">
            NOSSO CHAMADO
          </p>
          <div className="flex-1 h-[1px] bg-[#ff6b00] opacity-60" />
        </div>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-14 2xl:gap-24 items-start">

          {/* ── LEFT — imagem dinâmica ── */}
          <div
            className={`transition-all duration-700 delay-100 ${
              visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            {/* Nome do departamento */}
            <div className="mb-2">
              <p className="text-[#ff6b00] text-xs font-black uppercase tracking-widest">
                Departamento
              </p>
              <h3 className="text-white font-black text-2xl uppercase tracking-tight mb-1">
                {departamentoAtivo ? departamentoAtivo.nome : 'Carregando...'}
              </h3>
              {departamentoAtivo && departamentoAtivo.lideres && (
                <p className="text-[#ff6b00] text-lg font-semibold">
                  {departamentoAtivo.lideres}
                </p>
              )}
            </div>

            {/* Imagem */}
            {imagemAtiva && (
            <div className="-mt-2">
              <img
                key={imagemAtiva}
                src={imagemAtiva}
                alt={departamentoAtivo ? departamentoAtivo.nome : 'Departamento'}
                className={`w-full h-auto object-contain transition-opacity duration-300 ${
                  imagemFadindo ? 'opacity-0' : 'opacity-100'
                }`}
              />
            </div>
            )}
            </div>

          {/* ── RIGHT — texto + carrossel ── */}
          <div
            className={`transition-all duration-700 delay-200 ${
              visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <h2
              className="font-black leading-none tracking-tight text-white mb-6 uppercase"
              style={{ fontSize: 'clamp(2.4rem, 5.5vw, 6rem)' }}
            >
              RESGATANDO <br />
              <span className="text-[#ff6b00]">IDENTIDADES</span>
              <br />
              <span className="text-[#4a4a4a]">EM CRISTO</span>
            </h2>

            <div className="border-l-4 border-[#ff6b00] pl-4 mb-5">
              <p
                className="text-gray-400 italic leading-relaxed"
                style={{ fontSize: 'clamp(0.8rem, 1.1vw, 1.1rem)' }}
              >
                "Fomos chamados para resgatar identidades em Cristo e formar discípulos dEle"
              </p>
            </div>

            <p
              className="text-gray-400 leading-relaxed mb-8"
              style={{ fontSize: 'clamp(0.8rem, 1.1vw, 1.1rem)' }}
            >
              Nossa missão é despertar em cada pessoa a memória de quem ela realmente é — um filho amado pelo
              Pai e, a partir dessa identidade restaurada, formar discípulos que vivem, amam e multiplicam o
              evangelho como filhos que conhecem o seu coração.
            </p>

            {/* ── Carrossel de Departamentos ── */}
            <div className="border-t border-[#222] pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[#ff6b00] tracking-[0.3em] text-[10px] font-black uppercase">
                    Conheça nossa equipe:
                  </p>
                  <p className="text-zinc-500 text-[9px] tracking-widest uppercase mt-1">
                    Clique para saber mais
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={scrollPrev}
                    className="w-8 h-8 rounded-full border border-[#ff6b00]/40 flex items-center justify-center text-[#ff6b00] hover:bg-[#ff6b00] hover:text-white hover:border-[#ff6b00] transition-all active:scale-90"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={scrollNext}
                    className="w-8 h-8 rounded-full border border-[#ff6b00]/40 flex items-center justify-center text-[#ff6b00] hover:bg-[#ff6b00] hover:text-white hover:border-[#ff6b00] transition-all active:scale-90"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="h-[200px] flex items-center justify-center border border-dashed border-zinc-800 rounded-xl">
                  <Loader2 className="w-6 h-6 animate-spin text-[#ff6b00]" />
                </div>
              ) : erro ? (
                <div className="h-[200px] flex items-center justify-center bg-red-500/5 border border-red-500/20 rounded-xl">
                  <p className="text-red-500 font-bold uppercase tracking-widest text-xs">
                    Erro ao carregar departamentos
                  </p>
                </div>
              ) : departamentos.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
                    Nenhum departamento cadastrado
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex -ml-4">
                      {departamentos.map((dep, i) => (
                        <div
                          key={dep.id}
                          className="pl-4 min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%]"
                        >
                          <DepartamentoCard
                            departamento={dep}
                            index={i}
                            onSelect={(url) => trocarImagem(url, dep)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dots */}
                  <div className="flex gap-2 mt-4">
                    {departamentos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => emblaApi?.scrollTo(i)}
                        className={`h-1 rounded-full transition-all duration-500 ${
                          current === i ? 'w-8 bg-[#ff6b00]' : 'w-2 bg-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}