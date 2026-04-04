'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import { getDepartamentos, DepartamentoRow } from '@/lib/departamentoQueries'
import { DepartamentoCard } from '@/components/ui/Deparatamentos'

function Loader2({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    slidesToScroll: 1,
  })

  // Intersection Observer para animações
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  // Busca departamentos
  useEffect(() => {
    async function carregar() {
      try {
        const dados = await getDepartamentos()
        setDepartamentos(dados)
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
      {/* ── Background: circular orange rings ── */}
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

          {/* ── LEFT — foto + texto ── */}
          <div
            className={`transition-all duration-700 delay-100 ${
              visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            <div className="w-full max-w-[112vw] mx-auto md:max-w-[620px] 2xl:max-w-[660px] rounded-sm overflow-hidden">
              <img
                src="/img/pastores.png"
                alt="Pastores"
                className="w-full h-auto object-contain"
              />
            </div>

            <div className="mt-1 md:mt-3 max-w-[92vw] mx-auto md:max-w-[420px] 2xl:max-w-[520px]">
              <div className="w-16 2xl:w-20 h-[3px] bg-[#ff6b00]" />
              <div className="mt-1 md:mt-2">
                <p className="text-[#ff6b00] tracking-[0.25em] text-[10px] 2xl:text-xs font-semibold uppercase">
                  PASTORES
                </p>
                <p className="text-white text-sm 2xl:text-base font-bold uppercase tracking-widest mt-0.5 md:mt-1">
                  IGREJA EU SOU
                </p>
              </div>
            </div>
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
              RESGATAR <br />
              <span className="text-[#ff6b00]">IDENTIDADES</span>
              <br />
              <span className="text-[#4a4a4a]">EM CRISTO</span>
            </h2>

            <div className="border-l-4 border-[#ff6b00] pl-4 mb-5">
              <p
                className="text-gray-400 italic leading-relaxed"
                style={{ fontSize: 'clamp(0.8rem, 1.1vw, 1.1rem)' }}
              >
                "Fomos chamados para resgatar identidades em Cristo e formar
                discípulos que vivem e refletem Jesus."
              </p>
            </div>

            <p
              className="text-gray-400 leading-relaxed mb-8"
              style={{ fontSize: 'clamp(0.8rem, 1.1vw, 1.1rem)' }}
            >
              Nossa missão é levar cada pessoa a um encontro genuíno com Deus,
              formando uma comunidade que vive o evangelho com autenticidade e
              transforma vidas pelo amor.
            </p>

            {/* ── Carrossel de Departamentos ── */}
            <div className="border-t border-[#222] pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[#ff6b00] tracking-[0.3em] text-[10px] font-black uppercase">
                  Departamentos
                </p>
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
                          <DepartamentoCard departamento={dep} index={i} />
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