"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, Gift, HandCoins, Copy, Check } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65 },
  },
};

const cards = [
  {
    icon: HandCoins,
    title: "Dízimo",
    description: "A entrega fiel de 10% como ato de adoração e confiança em Deus.",
  },
  {
    icon: Gift,
    title: "Oferta",
    description: "Uma expressão voluntária de gratidão e amor pela obra do Reino.",
    highlight: true,
  },
  {
    icon: Sparkles,
    title: "Doação",
    description: "Contribuições especiais para projetos sociais e missionários.",
  },
];

const PIX_KEY = "comuinidadecristaeusou3@gmail.com";

export default function Contribuicao() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <section
      className="relative w-full flex flex-col items-center justify-center overflow-hidden px-6 py-20 md:py-24"
      style={{ backgroundColor: "#000000" }}
    >
      {/* Background SVG - Mantido original */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 w-full h-full z-0"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="cg1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f07228" stopOpacity="0" />
            <stop offset="50%" stopColor="#f07228" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#f07228" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="cg2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f07228" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#f07228" stopOpacity="0" />
            <stop offset="100%" stopColor="#f07228" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <line x1="-10%" y1="0%" x2="110%" y2="100%" stroke="url(#cg1)" strokeWidth="1" opacity="0.55" />
        <line x1="0%" y1="-5%" x2="100%" y2="95%" stroke="url(#cg2)" strokeWidth="1.5" opacity="0.4" />
        <line x1="0" y1="30%" x2="100%" y2="30%" stroke="url(#cg1)" strokeWidth="0.5" opacity="0.2" />
        <line x1="0" y1="70%" x2="100%" y2="70%" stroke="url(#cg1)" strokeWidth="0.5" opacity="0.18" />
      </svg>

      {/* Grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-20 md:opacity-100"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-4">
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] md:text-xs font-bold uppercase"
          style={{
            border: "1px solid rgba(240,114,40,0.5)",
            color: "#f07228",
            letterSpacing: "0.18em",
          }}
        >
          <Heart size={12} strokeWidth={2.5} fill="#f07228" />
          Semeie no Reino
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="text-center font-black uppercase leading-[0.9] md:leading-none"
          style={{
            fontSize: "clamp(2.4rem, 8vw, 5.5rem)",
            color: "#ffffff",
            letterSpacing: "-0.01em",
          }}
        >
          Contribua <br className="md:hidden" />
          <span style={{ color: "#f07228" }}>Conosco</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="text-center max-w-lg leading-relaxed px-4 md:px-0"
          style={{ color: "#9e9286", fontSize: "0.92rem" }}
        >
          Mesmo que você congregue em outra igreja, sua contribuição é bem-vinda.
          Toda semente plantada aqui transforma vidas.
        </motion.p>

        {/* Cards */}
        <div className="mt-10 w-full grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                whileHover={{ y: -4 }}
                className="flex flex-col gap-4 p-6 rounded-3xl"
                style={{
                  backgroundColor: card.highlight ? "rgba(240,114,40,0.08)" : "rgba(255,255,255,0.04)",
                  border: card.highlight
                    ? "1px solid rgba(240,114,40,0.5)"
                    : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="flex items-center justify-center rounded-2xl"
                  style={{
                    width: "48px",
                    height: "48px",
                    backgroundColor: "rgba(240,114,40,0.1)",
                    border: "1px solid rgba(240,114,40,0.25)",
                  }}
                >
                  <Icon size={22} color="#f07228" strokeWidth={1.75} />
                </div>
                <p className="font-black uppercase text-white tracking-wider">
                  {card.title}
                </p>
                <p style={{ color: "#9e9286", fontSize: "0.85rem" }}>
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* PIX section corrigida */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="mt-8 w-full flex flex-col items-center gap-4"
        >
          <p
            className="font-bold uppercase tracking-widest"
            style={{ color: "#f07228", fontSize: "0.7rem", letterSpacing: "0.2em" }}
          >
            Chave Pix
          </p>

          <div
            className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md rounded-2xl p-4 sm:px-5 sm:py-4 overflow-hidden"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(240,114,40,0.3)",
            }}
          >
            <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none" className="shrink-0">
                <path
                  d="M7.2 14l4.4-4.4a3.1 3.1 0 014.4 0L20.8 14l-4.8 4.8a3.1 3.1 0 01-4.4 0L7.2 14z"
                  fill="#f07228"
                />
              </svg>
              <span
                className="flex-1 font-mono text-[0.8rem] md:text-[0.9rem] text-white truncate select-all"
              >
                {PIX_KEY}
              </span>
            </div>

            {/* Botão com min-width fixo para evitar quebrar a borda ao mudar o texto */}
            <motion.button
              onClick={handleCopy}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto min-w-[110px] flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 sm:py-2 font-bold text-[10px] md:text-xs uppercase transition-colors"
              style={{
                backgroundColor: copied ? "rgba(34,197,94,0.15)" : "rgba(240,114,40,0.15)",
                border: copied
                  ? "1px solid rgba(34,197,94,0.4)"
                  : "1px solid rgba(240,114,40,0.4)",
                color: copied ? "#4ade80" : "#f07228",
                cursor: "pointer",
              }}
            >
              {copied ? (
                <>
                  <Check size={14} strokeWidth={3} />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy size={14} strokeWidth={2.5} />
                  Copiar
                </>
              )}
            </motion.button>
          </div>

          <p className="text-center px-4" style={{ color: "#9e9286", fontSize: "0.78rem" }}>
            Sua contribuição é segura e chega direto ao ministério.
          </p>
        </motion.div>
      </div>
    </section>
  );
}