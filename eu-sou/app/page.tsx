// app/page.tsx
import Hero from "@/components/sections/hero"
import ChamadoSection from "@/components/sections/Chamadosection"
import SerieDoMes from "@/components/sections/SerieDoMes"
import { getSerieDoMes } from "@/lib/queries"
import Eventos from "@/components/sections/Eventos"
import GruposFamiliares from "@/components/sections/GruposFamiliares"
import Footer from "@/components/sections/Footer"
import Localizacao from "@/components/sections/localização"
export default async function Home() {
  const serie = await getSerieDoMes()

  return (
    <main>
      <Hero />
      <ChamadoSection />
      <Localizacao />
      <Eventos />
       {serie && <SerieDoMes serie={serie} />}
      <GruposFamiliares />
      <Footer />

    </main>
  )
}