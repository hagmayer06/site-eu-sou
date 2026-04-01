"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

// ─── Versículo ────────────────────────────────────────────────────────────────

const VERSICULO = {
  texto: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
  referencia: "João 3:16",
};

// ─── Configuração ─────────────────────────────────────────────────────────────

const VISIVEIS = 3;
const INTERVALO = 5000;
const BUCKET = "versiculo";

// ─── Carrossel ────────────────────────────────────────────────────────────────

function Carrossel({ imagens }: { imagens: string[] }) {
  const [inicio, setInicio] = useState(0);
  const total = imagens.length;

  useEffect(() => {
    if (total < 2) return;
    const timer = setInterval(() => {
      setInicio((prev) => (prev + 1) % total);
    }, INTERVALO);
    return () => clearInterval(timer);
  }, [total]);

  if (total === 0) return null;

  const indices = Array.from({ length: Math.min(VISIVEIS, total) }, (_, i) => (inicio + i) % total);

  return (
    <div className="flex items-end justify-center gap-2 md:gap-4">
      <AnimatePresence mode="popLayout">
        {indices.map((idx, pos) => {
          const isCentro = pos === 1;
          const url = imagens[idx];

          return (
            <motion.div
              key={url}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.85 }}
              animate={{ opacity: 1, x: 0, scale: isCentro ? 1 : 0.82 }}
              exit={{ opacity: 0, x: -60, scale: 0.85 }}
              transition={{ duration: 2.0, ease: [0.32, 0.72, 0, 1] }}
              className={`relative overflow-hidden rounded-xl flex-shrink-0 ${
                isCentro
                  ? "w-28 md:w-56 h-44 md:h-80 z-10 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
                  : "w-24 md:w-44 h-36 md:h-64 z-0"
              }`}
              style={{
                border: isCentro ? "2px solid black" : "1px solid black",
              }}
            >
              <img
                src={url}
                alt={`Imagem ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {!isCentro && <div className="absolute inset-0 bg-black/40" />}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function CarrosselSkeleton() {
  return (
    <div className="flex items-end justify-center gap-2 md:gap-4">
      {[0.82, 1, 0.82].map((scale, i) => (
        <div
          key={i}
          className="rounded-xl bg-black/20 animate-pulse flex-shrink-0"
          style={{
            width: scale === 1 ? "7rem" : "6rem",
            height: scale === 1 ? "11rem" : "9rem",
            transform: `scale(${scale})`,
            transformOrigin: "bottom center",
          }}
        />
      ))}
    </div>
  );
}

// ─── Seção principal ──────────────────────────────────────────────────────────

export default function Versiculo() {
  const [imagens, setImagens] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function buscarImagens() {
      const { data, error } = await supabase.storage.from(BUCKET).list("", {
        sortBy: { column: "name", order: "asc" },
      });

      if (error) {
        console.error("Erro ao buscar imagens do storage:", error.message);
        setLoading(false);
        return;
      }

      const urls = (data ?? [])
        .filter((f) => f.name !== ".emptyFolderPlaceholder")
        .map((arquivo) => {
          const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(arquivo.name);
          return urlData.publicUrl;
        });

      setImagens(urls);
      setLoading(false);
    }

    buscarImagens();
  }, []);

  return (
    <section className="relative overflow-hidden bg-orange-500 py-16 md:py-20">

      {/* Linhas pretas decorativas */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <line x1="0" y1="0" x2="100%" y2="100%" stroke="black" strokeWidth="1" strokeOpacity="0.08" />
        <line x1="100%" y1="0" x2="0" y2="100%" stroke="black" strokeWidth="1" strokeOpacity="0.06" />
        <line x1="0" y1="25%" x2="100%" y2="25%" stroke="black" strokeWidth="0.8" strokeOpacity="0.07" />
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="black" strokeWidth="0.8" strokeOpacity="0.07" />
        <line x1="0" y1="75%" x2="100%" y2="75%" stroke="black" strokeWidth="0.8" strokeOpacity="0.07" />
        <line x1="20%" y1="0" x2="20%" y2="100%" stroke="black" strokeWidth="0.8" strokeOpacity="0.06" />
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="black" strokeWidth="0.8" strokeOpacity="0.06" />
        <line x1="80%" y1="0" x2="80%" y2="100%" stroke="black" strokeWidth="0.8" strokeOpacity="0.06" />
      </svg>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/*
          Mobile:  coluna (versículo em cima, carrossel embaixo)
          Desktop: linha (versículo à esquerda, carrossel à direita)
        */}
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

          {/* Versículo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 max-w-md w-full text-center md:text-left"
          >
            <span className="block text-black/20 font-black text-8xl leading-none -mb-4 select-none">
              "
            </span>
            <p className="text-black font-bold text-xl md:text-2xl leading-snug">
              {VERSICULO.texto}
            </p>
            <div className="mt-5 flex items-center justify-center md:justify-start gap-3">
              <div className="h-px w-8 bg-black/40" />
              <span className="text-black/70 font-bold text-sm tracking-widest uppercase">
                {VERSICULO.referencia}
              </span>
            </div>
          </motion.div>

          {/* Carrossel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="flex-1 w-full flex justify-center md:justify-end"
          >
            {loading ? <CarrosselSkeleton /> : <Carrossel imagens={imagens} />}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
