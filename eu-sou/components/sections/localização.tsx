"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { MapPin, Clock, Navigation } from "lucide-react";
import { getLocalizacaoLocale } from "@/lib/locales/localizacao";

const CONFIG = {
  LANGUAGE: "pt", // "pt" | "en" | "es"
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay },
  }),
};

const fadeUp = (delay = 0) => ({
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, amount: 0.2 },
  variants: fadeUpVariants,
  custom: delay,
});

export default function Localizacao() {
  const locale = getLocalizacaoLocale(CONFIG.LANGUAGE);
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(locale.endereco.completo)}&output=embed&z=16`;

  return (
    <section
      id="localizacao"
      className="relative overflow-hidden bg-[#ff6b00] py-10 md:py-14"
    >
      {/* ── Linhas pretas decorativas ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <line x1="0" y1="0" x2="100%" y2="100%" stroke="black" strokeWidth="1.2" strokeOpacity="0.08" />
        <line x1="100%" y1="0" x2="0" y2="100%" stroke="black" strokeWidth="1" strokeOpacity="0.06" />
        <line x1="0" y1="33%" x2="100%" y2="33%" stroke="black" strokeWidth="0.8" strokeOpacity="0.07" />
        <line x1="0" y1="66%" x2="100%" y2="66%" stroke="black" strokeWidth="0.8" strokeOpacity="0.07" />
        <line x1="25%" y1="0" x2="25%" y2="100%" stroke="black" strokeWidth="0.8" strokeOpacity="0.06" />
        <line x1="75%" y1="0" x2="75%" y2="100%" stroke="black" strokeWidth="0.8" strokeOpacity="0.06" />
        {/* Círculos decorativos */}
        <circle cx="90%" cy="50%" r="200" fill="none" stroke="black" strokeWidth="1" strokeOpacity="0.06" />
        <circle cx="90%" cy="50%" r="320" fill="none" stroke="black" strokeWidth="0.8" strokeOpacity="0.04" />
        <circle cx="10%" cy="50%" r="150" fill="none" stroke="black" strokeWidth="1" strokeOpacity="0.05" />
      </svg>

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* ── Header ── */}
        <div className="mb-12">
          <motion.p
            {...fadeUp(0)}
            className="text-black/60 text-xs font-black tracking-[0.35em] uppercase mb-3"
          >
            {locale.labels.venhaVisitar}
          </motion.p>
          <motion.h2
            {...fadeUp(0.1)}
            className="font-black text-5xl md:text-7xl leading-none tracking-tight text-black uppercase"
          >
            {locale.labels.ondeEstamos.split(" ")[0]} <span className="text-white">{locale.labels.ondeEstamos.split(" ")[1]}</span>
          </motion.h2>
        </div>

        {/* ── Layout: info + mapa ── */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch">

          {/* ── Coluna esquerda: informações ── */}
          <motion.div {...fadeUp(0.15)} className="flex flex-col gap-6">

            {/* Endereço */}
            <div className="bg-black rounded-2xl p-6 border border-black/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#ff6b00] flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-black" />
                </div>
                <div>
                  <p className="text-[#ff6b00] text-xs font-black tracking-widest uppercase mb-1">
                    {locale.labels.endereco}
                  </p>
                  <p className="text-white font-bold text-lg leading-tight">
                    {locale.endereco.rua}
                  </p>
                  <p className="text-white/50 text-sm mt-0.5">{locale.endereco.cidade}</p>
                </div>
              </div>
            </div>

            {/* Horários dos cultos */}
            <div className="bg-black rounded-2xl p-6 border border-black/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#ff6b00] flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-black" />
                </div>
                <p className="text-[#ff6b00] text-xs font-black tracking-widest uppercase">
                  {locale.labels.horariosDosCultos}
                </p>
              </div>

              <div className="space-y-3">
                {locale.cultos.map((culto, i) => (
                  <motion.div
                    key={i}
                    {...fadeUp(0.2 + i * 0.08)}
                    className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
                  >
                    <span className="text-white font-semibold text-sm">
                      {culto.dia}
                    </span>
                    <span className="bg-[#ff6b00] text-black font-black text-sm px-3 py-1 rounded-full">
                      {culto.horario}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Botão Google Maps */}
            <motion.a
              {...fadeUp(0.35)}
              href={`https://maps.google.com/?q=${encodeURIComponent(locale.endereco.completo)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-black hover:bg-black/80 text-white font-black text-sm tracking-widest uppercase py-4 rounded-2xl transition-all duration-300 border-2 border-black group"
            >
              <Navigation className="w-5 h-5 text-[#ff6b00] group-hover:translate-x-1 transition-transform duration-300" />
              {locale.labels.comoChegar}
            </motion.a>
          </motion.div>

          {/* ── Coluna direita: mapa ── */}
          <motion.div
            {...fadeUp(0.25)}
            className="rounded-2xl overflow-hidden border-4 border-black shadow-[8px_8px_0px_black] min-h-[360px]"
          >
            <iframe
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "360px", display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={locale.accessibility.mapTitle}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}