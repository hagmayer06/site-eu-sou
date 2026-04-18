"use client";

import { motion } from "framer-motion";
import { Sun, Coffee, ChevronRight } from "lucide-react";
import Image from "next/image";

// Para usar uma foto real, importe assim:
// import Image from "next/image";
// import fotoCafe from "@/public/foto-cafe.jpg";
// E substitua o bloco placeholder pelo <Image src={fotoCafe} ... />

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65 },
  },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.75, delay: 0.15 },
  },
};

const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.75, delay: 0.3 },
  },
};

export default function CafeComPastor() {
  return (
    <section
      className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 py-20"
      style={{ backgroundColor: "#000000" }}
    >
      {/* Orange lines background */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 w-full h-full z-0"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f07228" stopOpacity="0" />
            <stop offset="40%" stopColor="#f07228" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#f07228" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f07228" stopOpacity="0" />
            <stop offset="60%" stopColor="#f07228" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f07228" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lg3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f07228" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#f07228" stopOpacity="0" />
            <stop offset="100%" stopColor="#f07228" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="lg4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f07228" stopOpacity="0" />
            <stop offset="30%" stopColor="#f07228" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#f07228" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#f07228" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Diagonal lines */}
        <line x1="-10%" y1="0%" x2="110%" y2="100%" stroke="url(#lg1)" strokeWidth="1" opacity="0.6" />
        <line x1="-10%" y1="10%" x2="110%" y2="110%" stroke="url(#lg2)" strokeWidth="0.5" opacity="0.5" />
        <line x1="0%" y1="-5%" x2="100%" y2="95%" stroke="url(#lg3)" strokeWidth="1.5" opacity="0.4" />
        <line x1="20%" y1="-10%" x2="120%" y2="90%" stroke="url(#lg1)" strokeWidth="0.5" opacity="0.35" />
        <line x1="-20%" y1="20%" x2="80%" y2="120%" stroke="url(#lg4)" strokeWidth="1" opacity="0.45" />

        {/* Horizontal accent lines */}
        <line x1="0" y1="22%" x2="100%" y2="22%" stroke="url(#lg2)" strokeWidth="0.5" opacity="0.3" />
        <line x1="0" y1="75%" x2="100%" y2="75%" stroke="url(#lg1)" strokeWidth="0.5" opacity="0.25" />

        {/* Top-right corner rays */}
        <line x1="100%" y1="0%" x2="55%" y2="60%" stroke="#f07228" strokeWidth="0.75" opacity="0.18" />
        <line x1="100%" y1="0%" x2="40%" y2="80%" stroke="#f07228" strokeWidth="0.5" opacity="0.12" />
        <line x1="85%" y1="0%" x2="100%" y2="55%" stroke="#f07228" strokeWidth="0.5" opacity="0.15" />

        {/* Bottom-left corner rays */}
        <line x1="0%" y1="100%" x2="45%" y2="30%" stroke="#f07228" strokeWidth="0.75" opacity="0.14" />
        <line x1="0%" y1="85%" x2="60%" y2="0%" stroke="#f07228" strokeWidth="0.5" opacity="0.1" />

        {/* Subtle glow dot top-right */}
        <radialGradient id="glow1" cx="85%" cy="10%" r="25%">
          <stop offset="0%" stopColor="#f07228" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#f07228" stopOpacity="0" />
        </radialGradient>
        <rect width="100%" height="100%" fill="url(#glow1)" />

        {/* Subtle glow dot bottom-left */}
        <radialGradient id="glow2" cx="15%" cy="90%" r="20%">
          <stop offset="0%" stopColor="#f07228" stopOpacity="0.09" />
          <stop offset="100%" stopColor="#f07228" stopOpacity="0" />
        </radialGradient>
        <rect width="100%" height="100%" fill="url(#glow2)" />
      </svg>

      {/* Grain texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* CONTENT */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-4">

        {/* Badge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          custom={0}
          className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase"
          style={{
            border: "1px solid rgba(240,114,40,0.5)",
            color: "#f07228",
            letterSpacing: "0.18em",
          }}
        >
          <Sun size={13} strokeWidth={2.5} />
          Acolhimento
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          custom={0.1}
          className="text-center font-black uppercase leading-none"
          style={{
            fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
            color: "#ffffff",
            letterSpacing: "-0.01em",
          }}
        >
          Café com o{" "}
          <span style={{ color: "#f07228" }}>Pastor</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          custom={0.2}
          className="text-center max-w-lg leading-relaxed"
          style={{ color: "#9e9286", fontSize: "0.92rem" }}
        >
          Um momento de conexão genuína. Aqui, cada nova pessoa é recebida com
          atenção e cuidado antes de iniciar sua jornada no discipulado.
        </motion.p>

        {/* GRID */}
        <div className="mt-10 w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

          {/* LEFT — Image card */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="relative"
          >
            {/* Glow behind */}
            <div
              aria-hidden
              className="absolute -inset-3 rounded-2xl"
              style={{
                background: "rgba(240,114,40,0.08)",
                filter: "blur(24px)",
              }}
            />

            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
              }}
            >
              {/* Photo placeholder — troque por <Image src={fotoCafe} ... /> */}
              <Image
                src="/img/pastorc.jpeg"
                alt="Café com o Pastor"
                width={600}
                height={280}
                className="w-full h-72 object-cover object-center"
              />

              {/* Footer */}
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{
                  backgroundColor: "#150d06",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div>
                  <p
                    className="font-bold uppercase"
                    style={{
                      color: "#f07228",
                      fontSize: "0.62rem",
                      letterSpacing: "0.2em",
                      marginBottom: "2px",
                    }}
                  >
                    Primeiro Passo
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem" }}>
                    Conhecer antes de caminhar.
                  </p>
                </div>

                <motion.button
                  aria-label="Agendar café"
                  whileHover={{ scale: 1.1, backgroundColor: "#d95f18" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: "42px",
                    height: "42px",
                    backgroundColor: "#f07228",
                    boxShadow: "0 4px 20px rgba(240,114,40,0.4)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Coffee size={18} color="white" strokeWidth={2} />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — Text */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-col gap-5"
          >
            <h2
              className="font-black uppercase leading-tight"
              style={{
                fontSize: "clamp(1.7rem, 3vw, 2.4rem)",
                color: "#ffffff",
                letterSpacing: "-0.01em",
              }}
            >
              Mais que uma{" "}
              <span style={{ color: "#f07228" }}>conversa</span>, uma
              <br />
              porta de entrada.
            </h2>

            <p className="leading-relaxed" style={{ color: "#9e9286", fontSize: "0.92rem" }}>
              Quando você chega à nossa igreja, queremos te conhecer de verdade.
              Os pastores reservam um tempo especial para sentar, tomar um café e
              ouvir sua história de onde você vem, o que busca e como podemos
              caminhar juntos.
            </p>

            <p className="leading-relaxed" style={{ color: "#9e9286", fontSize: "0.92rem" }}>
              Esse encontro é a porta de entrada para o{" "}
              <span
                style={{
                  color: "#ffffff",
                  fontWeight: 600,
                  textDecoration: "underline",
                  textDecorationColor: "rgba(240,114,40,0.5)",
                  textUnderlineOffset: "3px",
                }}
              >
                discipulado
              </span>
              , onde sua fé é cuidada de forma personalizada e profunda.
            </p>

            {/* CTA */}
            <div className="pt-2">
              <motion.a
                href="https://wa.me/5548998572297"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{
                  backgroundColor: "#f07228",
                  color: "#ffffff",
                  scale: 1.03,
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="inline-flex items-center gap-2 rounded-full font-bold uppercase"
                style={{
                  border: "2px solid #f07228",
                  color: "#f07228",
                  padding: "0.7rem 1.6rem",
                  fontSize: "0.78rem",
                  letterSpacing: "0.1em",
                  textDecoration: "none",
                  backgroundColor: "rgba(0,0,0,0)",
                }}
              >
                Agendar meu café
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <ChevronRight size={15} strokeWidth={2.5} />
                </motion.span>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}