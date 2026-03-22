"use client";

export default function Hero() {
  return (
    <section className="relative w-full h-[70vh] sm:h-[85vh] md:h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/img/img-fundo.jpg')" }}
      />

      {/* Película escura */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Conteúdo centralizado */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">

        {/* Wrapper da logo + botão ancorado */}
        <div className="relative w-[85vw] sm:w-[70vw] md:w-[60vw] lg:w-[55vw] xl:w-[50vw] 2xl:w-[42vw] max-w-[1100px]">

          {/* Logo */}
          <img
            src="/img/logo-eu-sou.png"
            alt="Eu Sou"
            className="w-full h-auto object-contain"
          />

        </div>
      </div>
    </section>
  );
}