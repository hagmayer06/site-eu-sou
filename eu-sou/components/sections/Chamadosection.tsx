"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { number: "500+", label: "MEMBROS" },
  { number: "12", label: "GRUPOS" },
  { number: "5", label: "ANOS" },
];

export default function ChamadoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="chamado"
      ref={sectionRef}
      className="relative bg-[#0f0f0f] py-20 md:py-28 2xl:py-44 px-6 overflow-hidden"
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
        <div
          className="absolute left-[-10%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)" }}
        />
        <div
          className="absolute right-[-5%] top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,107,0,0.05) 0%, transparent 70%)" }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-6xl 2xl:max-w-7xl mx-auto">

        {/* Label — centered with orange lines on each side */}
        <div
          className={`flex items-center gap-4 mb-10 2xl:mb-14 transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex-1 h-[1px] bg-[#ff6b00] opacity-60" />
          <p className="text-[#ff6b00] tracking-[0.35em] text-xs 2xl:text-sm font-semibold uppercase whitespace-nowrap">
            NOSSO CHAMADO
          </p>
          <div className="flex-1 h-[1px] bg-[#ff6b00] opacity-60" />
        </div>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-14 2xl:gap-24 items-center">
          {/* LEFT — photo */}
          <div
            className={`relative transition-all duration-700 delay-100 ${
              visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="w-full max-w-[112vw] mx-auto md:max-w-[620px] 2xl:max-w-[660px] rounded-sm overflow-hidden">
              <img
                src="/img/pastores.png"
                alt="Pastores"
                className="w-full h-auto object-contain"
              />
            </div>

            {/* mt-1 no mobile, mt-3 no md+ */}
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

          {/* RIGHT — text */}
          <div
            className={`transition-all duration-700 delay-200 ${
              visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <h2
              className="font-black leading-none tracking-tight text-white mb-6 uppercase"
              style={{ fontSize: "clamp(2.4rem, 5.5vw, 6rem)" }}
            >
              RESGATAR <br />
              <span className="text-[#ff6b00]">IDENTIDADES</span>
              <br />
              <span className="text-[#4a4a4a]">EM CRISTO</span>
            </h2>

            <div className="border-l-4 border-[#ff6b00] pl-4 mb-5">
              <p
                className="text-gray-400 italic leading-relaxed"
                style={{ fontSize: "clamp(0.8rem, 1.1vw, 1.1rem)" }}
              >
                "Fomos chamados para resgatar identidades em Cristo e formar
                discípulos que vivem e refletem Jesus."
              </p>
            </div>

            <p
              className="text-gray-400 leading-relaxed mb-10"
              style={{ fontSize: "clamp(0.8rem, 1.1vw, 1.1rem)" }}
            >
              Nossa missão é levar cada pessoa a um encontro genuíno com Deus,
              formando uma comunidade que vive o evangelho com autenticidade e
              transforma vidas pelo amor.
            </p>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#222]">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="transition-all duration-500"
                  style={{ transitionDelay: `${300 + i * 100}ms` }}
                >
                  <p
                    className="text-white font-black leading-none"
                    style={{ fontSize: "clamp(1.8rem, 3.5vw, 4rem)" }}
                  >
                    {stat.number}
                  </p>
                  <p
                    className="text-[#ff6b00] tracking-[0.2em] font-semibold mt-2 uppercase"
                    style={{ fontSize: "clamp(0.6rem, 0.8vw, 0.85rem)" }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}