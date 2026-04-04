import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[#111111] text-white">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent" />

      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand / Church Identity */}
          <div className="lg:col-span-1">
            <div className="mb-5 flex items-center gap-3">
              {/* Cross icon */}
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                <span className="absolute h-10 w-[3px] rounded-full bg-[#ff6b00]" />
                <span className="absolute h-[3px] w-7 -translate-y-1 rounded-full bg-[#ff6b00]" />
              </div>
              <span className="font-['Georgia',serif] text-2xl font-bold tracking-wide text-white">
                Eu Sou
              </span>
            </div>
            <p className="mb-7 text-sm leading-relaxed text-gray-400">
              Um lugar de fé, amor e transformação. Venha fazer parte da nossa
              família e crescer junto em comunidade.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {[
                {
                  label: "Instagram",
                  href: "#",
                  svg: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="4.5" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                    </svg>
                  ),
                },
                {
                  label: "Facebook",
                  href: "#",
                  svg: (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  ),
                },
                {
                  label: "YouTube",
                  href: "#",
                  svg: (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#111111" />
                    </svg>
                  ),
                },
                {
                  label: "WhatsApp",
                  href: "#",
                  svg: (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                    </svg>
                  ),
                },
              ].map(({ label, href, svg }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-gray-400 transition-all duration-200 hover:border-[#ff6b00] hover:bg-[#ff6b00]/10 hover:text-[#ff6b00]"
                >
                  {svg}
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff6b00]">
              Navegação
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Início", href: "/" },
                { label: "Sobre Nós", href: "/sobre" },
                { label: "Ministérios", href: "/ministerios" },
                { label: "Agenda", href: "/agenda" },
                { label: "Sermões", href: "/sermoes" },
                { label: "Blog", href: "/blog" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="group flex items-center gap-2 text-sm text-gray-400 transition-colors duration-200 hover:text-[#ff6b00]"
                  >
                    <span className="h-px w-0 bg-[#ff6b00] transition-all duration-200 group-hover:w-3" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Times */}
          <div>
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff6b00]">
              Cultos
            </h3>
            <ul className="space-y-5">
              {[
                { day: "Domingo", time: "09h00 e 19h00", desc: "Culto de Celebração" },
                { day: "Quarta-feira", time: "19h30", desc: "Culto de Oração" },
              ].map(({ day, time, desc }) => (
                <li key={day} className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-white">{day}</span>
                  <span className="text-xs text-[#ff6b00]">{time}</span>
                  <span className="text-xs text-gray-500">{desc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff6b00]">
              Contato
            </h3>
            <ul className="space-y-5">
              {[
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 shrink-0 text-[#ff6b00]">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  ),
                  text: "Rua das Flores, 123\nSão José, SC — 88100-000",
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 shrink-0 text-[#ff6b00]">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  ),
                  text: "(48) 9 9999-0000",
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 shrink-0 text-[#ff6b00]">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  ),
                  text: "contato@igrejav.com.br",
                },
              ].map(({ icon, text }, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5">{icon}</span>
                  <span className="whitespace-pre-line text-sm text-gray-400">{text}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              href="/contato"
              className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#ff6b00] px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-[#ff6b00] transition-all duration-200 hover:bg-[#ff6b00] hover:text-white"
            >
              Fale Conosco
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Divider + Verse */}
        <div className="mt-14 mb-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/5" />
          <p className="text-center text-xs italic text-gray-600">
            &ldquo;Porque Deus amou o mundo de tal maneira...&rdquo; — João 3:16
          </p>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 text-xs text-gray-600 sm:flex-row">
          <p>© {new Date().getFullYear()} Igreja Viva. Todos os direitos reservados.</p>

          <div className="flex gap-6">
            <Link href="/privacidade" className="transition-colors hover:text-[#ff6b00]">
              Política de Privacidade
            </Link>
            <Link href="/termos" className="transition-colors hover:text-[#ff6b00]">
              Termos de Uso
            </Link>
          </div>

          {/* Developer credit */}
          <p className="flex items-center gap-1.5">
            Desenvolvido por{" "}
            <Link
              href="https://hagtech.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold tracking-wide text-gray-500 transition-colors hover:text-[#ff6b00]"
            >
              hag<span className="text-[#ff6b00]">tech</span>
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;