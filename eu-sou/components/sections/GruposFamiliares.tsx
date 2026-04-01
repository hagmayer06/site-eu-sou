"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Clock, Users, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="relative bg-black border border-orange-500/40 rounded-2xl overflow-hidden flex flex-col animate-pulse min-w-[280px] w-full">
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

function GrupoCard({ grupo }: { grupo: Grupo }) {
  try {
    const diaAbrev = grupo.dia_semana.split("-")[0];
    const horarioFormatado = grupo.horario.slice(0, 5);

    return (
      <div className="group relative bg-black border border-orange-500 rounded-2xl overflow-hidden hover:border-orange-400 hover:shadow-[0_0_24px_rgba(255,107,0,0.25)] transition-all duration-500 flex flex-col h-full">
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
      </div>
    );
  } catch (err) {
    console.error("❌ Erro ao renderizar card:", err);
    return null;
  }
}

// ─── Carrossel de grupos ──────────────────────────────────────────────────────

function CarrosselGrupos({ grupos }: { grupos: Grupo[] }) {
  const [atual, setAtual] = useState(0);
  const total = grupos.length;

  // Quantos cards mostrar por vez dependendo da largura
  // Usamos state para controlar via JS (mais confiável que só CSS para carrossel)
  const [porVez, setPorVez] = useState(4);

  useEffect(() => {
    function atualizar() {
      if (window.innerWidth < 640) setPorVez(1);
      else if (window.innerWidth < 1024) setPorVez(2);
      else setPorVez(4);
    }
    atualizar();
    window.addEventListener("resize", atualizar);
    return () => window.removeEventListener("resize", atualizar);
  }, []);

  const maxIndex = Math.max(0, total - porVez);

  function anterior() {
    setAtual((prev) => Math.max(0, prev - 1));
  }

  function proximo() {
    setAtual((prev) => Math.min(maxIndex, prev + 1));
  }

  const gruposVisiveis = grupos.slice(atual, atual + porVez);

  return (
    <div className="relative">
      {/* Cards */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={atual}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${porVez}, minmax(0, 1fr))` }}
          >
            {gruposVisiveis.map((grupo) => (
              <GrupoCard key={grupo.id} grupo={grupo} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={anterior}
          disabled={atual === 0}
          className="p-2 rounded-full border border-orange-500/40 text-orange-500 hover:bg-orange-500/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setAtual(i)}
              className={`rounded-full transition-all duration-300 ${
                i === atual
                  ? "w-6 h-2 bg-orange-500"
                  : "w-2 h-2 bg-orange-500/30 hover:bg-orange-500/60"
              }`}
            />
          ))}
        </div>

        <button
          onClick={proximo}
          disabled={atual === maxIndex}
          className="p-2 rounded-full border border-orange-500/40 text-orange-500 hover:bg-orange-500/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ─── Seção principal ──────────────────────────────────────────────────────────

export default function GruposFamiliares() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useIntersectionAnimation();

  useEffect(() => {
    async function buscar() {
      const data = await getGrupos();
      setGrupos(data);
      setLoading(false);
    }
    buscar();
  }, []);

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
        <div className="grid md:grid-cols-2 gap-8 items-end mb-16">
          <div data-animate style={{ opacity: 0, transform: "translateX(-30px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
            <p className="text-orange-500 text-xs font-bold tracking-[0.3em] uppercase mb-4">COMUNIDADE</p>
            <h2 className="font-black text-5xl md:text-7xl leading-none tracking-tight">
              <span className="text-white block">GRUPOS</span>
              <span className="text-orange-500 block">FAMILIARES</span>
            </h2>
          </div>
          <div data-animate style={{ opacity: 0, transform: "translateX(30px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
            <p className="text-white/50 text-lg md:text-right max-w-md md:ml-auto leading-relaxed">
              Encontre um grupo perto de você e faça parte de uma família que cresce junta na fé. Cada grupo é um lar espiritual.
            </p>
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
          <CarrosselGrupos grupos={grupos} />
        )}

        {/* Rodapé */}
        {!loading && (
          <div data-animate style={{ opacity: 0, transform: "translateY(20px)", transition: "opacity 0.5s ease, transform 0.5s ease" }} className="text-center mt-12">
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