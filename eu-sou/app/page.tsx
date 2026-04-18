// app/page.tsx
import Hero from "@/components/sections/hero"
import ChamadoSection from "@/components/sections/Chamadosection"
import SerieDoMes from "@/components/sections/SerieDoMes"
import { getSerieDoMes } from "@/lib/queries"
import Eventos from "@/components/sections/Eventos"
import CafeComPastor from "@/components/sections/CafeComPastor"
import Footer from "@/components/sections/Footer"
import Localizacao from "@/components/sections/localização"
import Contribuicao from "@/components/sections/Contribuição"
export default async function Home() {
  const serie = await getSerieDoMes()

  return (
    <main>
      <Hero />
      <ChamadoSection />
      <Localizacao />
      <Eventos />
       {serie && <SerieDoMes serie={serie} />}
      <CafeComPastor />
      <Contribuicao />
      <Footer />

    </main>
  )
}