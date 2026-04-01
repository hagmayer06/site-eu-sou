"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Clock, Users, ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { getGrupos, type Grupo } from "@/lib/gruposQueries";

// ─── Animação de entrada ──────────────────────────────────────────────────────

function useIntersectionAnimation(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.querySelectorAll<HTMLElement>("[data-animate]").forEach((child, i) => {
            child.style.transitionDelay = `${i * 100}ms`;
            child.classList.add("animate-in");
          });
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function GrupoCardSkeleton() {
  return (
    <div className="relative bg-black border border-orange-500/40 rounded-2xl overflow-hidden flex flex-col animate-pulse w-full">
      <div className="p-6 flex flex-col flex-1 gap-4">
        <div className="h-6 w-20 rounded-full bg-orange-500/10" />
        <div className="h-5 w-3/4 rounded bg-white/10" />
        <div className="h-4 w-1/2 rounded bg-white/10" />
        <div className="mt-auto space-y-3">
          <div className="h-9 w-full rounded-lg bg-orange-500/10" />
          <div className="h-4 w-full rounded bg-white/10" />
          <div className="h-4 w-2/3 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

function GrupoCard({ grupo, index }: { grupo: Grupo; index: number }) {
  try {
    const diaAbrev = grupo.dia_semana.split("-")[0];
    const horarioFormatado = grupo.horario.slice(0, 5);

    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="group relative bg-black border border-orange-500 rounded-2xl overflow-hidden hover:border-orange-400 hover:shadow-[0_0_24px_rgba(255,107,0,0.25)] transition-all duration-500 flex flex-col h-full"
      >
        <div className="p-6 flex flex-col flex-1">
          <span className="inline-flex items-center self-start px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 text-xs font-semibold tracking-widest uppercase mb-4">
            {diaAbrev}
          </span>
          <h3 className="text-xl font-bold text-white mb-1 leading-tight">
            {grupo.nome || grupo.bairro}
          </h3>
          <p className="text-orange-400/80 text-sm mb-6">{grupo.lider}</p>

          <div className="mt-auto space-y-3">
            <div className="flex items-center gap-3 bg-orange-500/10 rounded-lg px-3 py-2">
              <Clock className="w-4 h-4 text-orange-400 shrink-0" />
              <span className="text-orange-300 text-sm font-semibold">
                {grupo.dia_semana} · {horarioFormatado}
              </span>
            </div>
            {grupo.endereco && (
              <div className="flex items-start gap-3 text-white/50 text-sm">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span>{grupo.endereco}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-white/50 text-sm">
              <Users className="w-4 h-4 text-orange-500 shrink-0" />
              <span>{grupo.bairro}</span>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-orange-400 text-xs font-bold tracking-widest uppercase opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <span>PARTICIPAR</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </motion.div>
    );
  } catch (err) {
    console.error("❌ Erro ao renderizar card:", err);
    return null;
  }
}

// ─── Seção principal ──────────────────────────────────────────────────────────

export default function GruposFamiliares() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useIntersectionAnimation();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    slidesToScroll: 1,
  });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function buscar() {
      const data = await getGrupos();
      setGrupos(data);
      setLoading(false);
    }
    buscar();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    setCurrent(emblaApi.selectedScrollSnap());
    emblaApi.on("select", () => setCurrent(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section id="grupos" className="relative py-24 md:py-32 overflow-hidden bg-black">
      {/* Linhas laranjas decorativas */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <line x1="0" y1="18%" x2="100%" y2="72%" stroke="#ff6b00" strokeWidth="1" strokeOpacity="0.18" />
        <line x1="0" y1="85%" x2="60%" y2="0" stroke="#ff6b00" strokeWidth="0.8" strokeOpacity="0.10" />
        <line x1="0" y1="12%" x2="100%" y2="12%" stroke="#ff6b00" strokeWidth="0.8" strokeOpacity="0.12" />
        <line x1="0" y1="90%" x2="100%" y2="90%" stroke="#ff6b00" strokeWidth="0.8" strokeOpacity="0.10" />
        <line x1="8%" y1="0" x2="8%" y2="100%" stroke="#ff6b00" strokeWidth="0.8" strokeOpacity="0.08" />
        <line x1="92%" y1="0" x2="92%" y2="100%" stroke="#ff6b00" strokeWidth="0.8" strokeOpacity="0.08" />
      </svg>

      <div ref={sectionRef} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div data-animate style={{ opacity: 0, transform: "translateX(-30px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
              <p className="text-orange-500 text-xs font-bold tracking-[0.3em] uppercase mb-4">COMUNIDADE</p>
              <h2 className="font-black text-5xl md:text-7xl leading-none tracking-tight">
                <span className="text-white block">GRUPOS</span>
                <span className="text-orange-500 block">FAMILIARES</span>
              </h2>
            </div>
          </div>

          {/* Setas — visíveis só no desktop */}
          <div className="hidden md:flex gap-3">
            <button
              onClick={scrollPrev}
              className="w-14 h-14 rounded-full border-2 border-orange-500 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white transition-all active:scale-90"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onClick={scrollNext}
              className="w-14 h-14 rounded-full border-2 border-orange-500 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white transition-all active:scale-90"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Carrossel */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <GrupoCardSkeleton key={i} />)}
          </div>
        ) : grupos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/30 text-lg">Nenhum grupo ativo no momento.</p>
            <p className="text-white/20 text-sm mt-2">Em breve novos grupos estarão disponíveis.</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex -ml-4">
                {grupos.map((grupo, i) => (
                  <div
                    key={grupo.id}
                    className="pl-4 min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%]"
                  >
                    <GrupoCard grupo={grupo} index={i} />
                  </div>
                ))}
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-10">
              {grupos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    current === i ? "w-10 bg-orange-500" : "w-2.5 bg-orange-500/20"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Rodapé */}
        {!loading && (
          <div data-animate style={{ opacity: 0, transform: "translateY(20px)", transition: "opacity 0.5s ease, transform 0.5s ease" }} className="text-center mt-10">
            <p className="text-white/40 text-sm">
              Não encontrou um grupo perto de você?{" "}
              <a href="#contato" className="text-orange-400 hover:underline font-medium">Entre em contato</a>{" "}
              e ajudaremos você a encontrar o seu lugar.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        [data-animate].animate-in {
          opacity: 1 !important;
          transform: none !important;
        }
      `}</style>
    </section>
  );
}