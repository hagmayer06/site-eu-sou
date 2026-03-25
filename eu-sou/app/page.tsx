// app/page.tsx
import Hero from "@/components/sections/hero"
import ChamadoSection from "@/components/sections/Chamadosection"
import SerieDoMes from "@/components/sections/SerieDoMes"
import { getSerieDoMes } from "@/lib/queries"

export default async function Home() {
  const serie = await getSerieDoMes()

  return (
    <main>
      <Hero />
      <ChamadoSection />
      {serie && <SerieDoMes serie={serie} />}
    </main>
  )
}